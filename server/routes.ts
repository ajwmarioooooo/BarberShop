import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SmsService } from "./smsService";
import {
  sendBookingConfirmationEmail,
  sendOwnerNotificationEmail,
} from "./emailService";
import { db } from "./db";
import { eq, and, gte, lte, lt, sql, ne, desc } from "drizzle-orm";
import {
  insertBookingSchema,
  insertCartItemSchema,
  insertLoyaltyCustomerSchema,
  insertPointTransactionSchema,
  insertRewardRedemptionSchema,
  bookings,
  services,
  barbers,
  smsNotifications,
  barberClients,
  clientVisits,
  pointTransactions,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const { barberId } = req.query;
      const services = barberId
        ? await storage.getServicesByBarber(parseInt(barberId as string))
        : await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Barbers routes
  app.get("/api/barbers", async (req, res) => {
    try {
      const barbers = await storage.getBarbers();
      res.json(barbers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch barbers" });
    }
  });

  // Get booked time slots for a specific date and barber
  app.get("/api/bookings/booked-slots", async (req, res) => {
    try {
      const { date, barberId } = req.query;

      if (!date || !barberId) {
        return res
          .status(400)
          .json({ message: "Date and barberId are required" });
      }

      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      const bookedSlots = await db
        .select({ appointmentDate: bookings.appointmentDate })
        .from(bookings)
        .where(
          and(
            eq(bookings.barberId, parseInt(barberId as string)),
            gte(bookings.appointmentDate, startOfDay),
            lte(bookings.appointmentDate, endOfDay),
            ne(bookings.status, "cancelled"),
          ),
        );

      const bookedTimes = bookedSlots.map((slot) => {
        const time = new Date(slot.appointmentDate);
        return time.toTimeString().slice(0, 5); // Format as HH:MM
      });

      res.json(bookedTimes);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      res.status(500).json({ message: "Failed to fetch booked slots" });
    }
  });

  // Bookings routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);

      // Validate that appointment date is not in the past
      const appointmentDate = new Date(bookingData.appointmentDate);
      const now = new Date();

      if (appointmentDate <= now) {
        return res.status(400).json({
          message: "Не можете да правите резервация за минала дата или час",
        });
      }

      // Check for existing booking at the same time with the same barber
      const existingBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.barberId, bookingData.barberId),
            eq(bookings.appointmentDate, appointmentDate),
            ne(bookings.status, "cancelled"),
          ),
        );

      if (existingBookings.length > 0) {
        return res.status(400).json({
          message: "Вече има резервация за този час с този бръснар",
        });
      }

      // Auto-register customer in loyalty program if not already registered
      try {
        const existingCustomer = await storage.getLoyaltyCustomerByPhone(
          bookingData.customerPhone,
        );
        if (!existingCustomer) {
          console.log(
            `Auto-registering new loyalty customer: ${bookingData.customerName} (${bookingData.customerPhone})`,
          );
          await storage.createLoyaltyCustomer({
            phone: bookingData.customerPhone,
            name: bookingData.customerName,
            email: bookingData.customerEmail || "",
          });
          console.log(
            `Successfully auto-registered loyalty customer: ${bookingData.customerName}`,
          );
        } else {
          console.log(
            `Loyalty customer already exists: ${existingCustomer.name} (${bookingData.customerPhone})`,
          );
        }
      } catch (loyaltyError) {
        console.log("Failed to auto-register loyalty customer:", loyaltyError);
        // Don't fail the booking if loyalty registration fails
      }

      const booking = await storage.createBooking(bookingData);

      // Send SMS and Email notifications to both customer and owner
      try {
        // Get service and barber details for email
        const [services, barbers] = await Promise.all([
          storage.getServices(),
          storage.getBarbers(),
        ]);

        const service = services.find((s) => s.id === bookingData.serviceId);
        const barber = barbers.find((b) => b.id === bookingData.barberId);

        if (service && barber) {
          // Send email notifications
          const emailPromises = [
            sendBookingConfirmationEmail({
              customerName: bookingData.customerName,
              customerEmail: bookingData.customerEmail,
              serviceName: service.nameBg,
              servicePrice: service.price,
              barberName: barber.name,
              appointmentDate: bookingData.appointmentDate,
              notes: bookingData.notes || undefined,
            }),
            sendOwnerNotificationEmail({
              customerName: bookingData.customerName,
              customerEmail: bookingData.customerEmail,
              serviceName: service.nameBg,
              servicePrice: service.price,
              barberName: barber.name,
              appointmentDate: bookingData.appointmentDate,
              notes: bookingData.notes || undefined,
            }),
          ];

          // Send SMS notifications
          const smsPromises = [
            SmsService.sendBookingConfirmation(booking.id),
            SmsService.sendOwnerNotification(booking.id),
          ];

          // Send all notifications in parallel
          await Promise.all([...emailPromises, ...smsPromises]);
        }
      } catch (notificationError) {
        console.error("Failed to send notifications:", notificationError);
        // Don't fail the booking if notifications fail
      }

      // Note: Points will be awarded only when admin marks booking as "completed"

      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid booking data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  app.get("/api/bookings/availability", async (req, res) => {
    try {
      const { date, barberId } = req.query;
      if (!date || !barberId) {
        return res
          .status(400)
          .json({ message: "Date and barber ID are required" });
      }

      const availability = await storage.getAvailability(
        new Date(date as string),
        parseInt(barberId as string),
      );
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Cart routes
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid cart item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add item to cart" });
      }
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.removeFromCart(parseInt(id));
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Loyalty Program routes
  app.get("/api/loyalty/customer/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const customer = await storage.getLoyaltyCustomerByPhone(phone);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/loyalty/customer", async (req, res) => {
    try {
      const customerData = insertLoyaltyCustomerSchema.parse(req.body);
      const customer = await storage.createLoyaltyCustomer(customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  app.post("/api/loyalty/points", async (req, res) => {
    try {
      const transactionData = insertPointTransactionSchema.parse(req.body);
      const transaction = await storage.addPointTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add point transaction" });
      }
    }
  });

  app.get("/api/loyalty/transactions/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { limit } = req.query;
      const transactions = await storage.getPointTransactions(
        parseInt(customerId),
        limit ? parseInt(limit as string) : undefined,
      );
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/loyalty/rewards", async (req, res) => {
    try {
      const rewards = await storage.getLoyaltyRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.post("/api/loyalty/redeem", async (req, res) => {
    try {
      const redemptionData = insertRewardRedemptionSchema.parse(req.body);
      const redemption = await storage.redeemReward(redemptionData);

      // Also add negative point transaction for the redemption
      await storage.addPointTransaction({
        customerId: redemptionData.customerId,
        points: -redemptionData.pointsSpent,
        type: "spent",
        reason: `Redeemed reward: ${redemption.id}`,
        referenceId: redemption.id,
        referenceType: "reward_redemption",
      });

      res.json(redemption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid redemption data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to redeem reward" });
      }
    }
  });

  app.get("/api/loyalty/redemptions/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const redemptions = await storage.getCustomerRedemptions(
        parseInt(customerId),
      );
      res.json(redemptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch redemptions" });
    }
  });

  // Admin SMS routes for testing (can be secured with authentication in production)
  app.post("/api/admin/sms/test-reminder", async (req, res) => {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      const success = await SmsService.sendAppointmentReminder(
        parseInt(bookingId),
      );
      if (success) {
        res.json({ message: "SMS reminder sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send SMS reminder" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error sending SMS reminder" });
    }
  });

  app.post("/api/admin/sms/process-reminders", async (req, res) => {
    try {
      await SmsService.processReminderNotifications();
      res.json({ message: "Reminder notifications processed successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error processing reminder notifications" });
    }
  });

  // Owner routes - completed bookings and customer points
  app.get("/api/owner/completed-bookings", async (req, res) => {
    try {
      const bookings = await storage.getCompletedBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching completed bookings:", error);
      res.status(500).json({ message: "Failed to fetch completed bookings" });
    }
  });

  app.get("/api/owner/customer-points", async (req, res) => {
    try {
      const customers = await storage.getAllLoyaltyCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customer points:", error);
      res.status(500).json({ message: "Failed to fetch customer points" });
    }
  });

  // Barber-specific bookings endpoint
  app.get("/api/owner/barber-bookings", async (req, res) => {
    try {
      const { barberId, startDate, endDate } = req.query;

      if (!barberId) {
        return res.status(400).json({ message: "Barber ID is required" });
      }

      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate
        ? new Date(endDate as string)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const barberBookings = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          customerEmail: bookings.customerEmail,
          appointmentDate: bookings.appointmentDate,
          notes: bookings.notes,
          status: bookings.status,
          serviceName: services.nameBg,
          servicePrice: services.price,
          serviceDuration: services.duration,
          barberName: barbers.name,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(barbers, eq(bookings.barberId, barbers.id))
        .where(
          and(
            eq(bookings.barberId, parseInt(barberId as string)),
            gte(bookings.appointmentDate, start),
            lte(bookings.appointmentDate, end),
          ),
        )
        .orderBy(bookings.appointmentDate);

      res.json(barberBookings);
    } catch (error) {
      console.error("Failed to fetch barber bookings:", error);
      res.status(500).json({ message: "Failed to fetch barber bookings" });
    }
  });

  // Bulk operations endpoint
  app.post("/api/owner/bulk-operations", async (req, res) => {
    try {
      const { bookingIds, action, status } = req.body;

      if (
        !bookingIds ||
        !Array.isArray(bookingIds) ||
        bookingIds.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Booking IDs array is required" });
      }

      if (action === "update_status" && !status) {
        return res
          .status(400)
          .json({ message: "Status is required for update_status action" });
      }

      if (action === "delete") {
        // Delete SMS notifications first to avoid foreign key constraints
        await db
          .delete(smsNotifications)
          .where(sql`${smsNotifications.bookingId} = ANY(${bookingIds})`);

        // Delete bookings
        const deletedBookings = await db
          .delete(bookings)
          .where(sql`${bookings.id} = ANY(${bookingIds})`)
          .returning();

        res.json({ success: true, deletedCount: deletedBookings.length });
      } else if (action === "update_status") {
        const updatedBookings = await db
          .update(bookings)
          .set({ status })
          .where(sql`${bookings.id} = ANY(${bookingIds})`)
          .returning();

        res.json({ success: true, updatedCount: updatedBookings.length });
      } else {
        res.status(400).json({ message: "Invalid action" });
      }
    } catch (error) {
      console.error("Failed to perform bulk operation:", error);
      res.status(500).json({ message: "Failed to perform bulk operation" });
    }
  });

  // Owner Calendar and Management Routes
  app.get("/api/owner/calendar", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const bookingsQuery = db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          customerEmail: bookings.customerEmail,
          appointmentDate: bookings.appointmentDate,
          notes: bookings.notes,
          status: bookings.status,
          serviceName: services.nameBg,
          servicePrice: services.price,
          serviceDuration: services.duration,
          barberName: barbers.name,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(barbers, eq(bookings.barberId, barbers.id))
        .orderBy(bookings.appointmentDate);

      let calendarBookings;
      if (startDate && endDate) {
        calendarBookings = await bookingsQuery.where(
          and(
            gte(bookings.appointmentDate, new Date(startDate as string)),
            lte(bookings.appointmentDate, new Date(endDate as string)),
          ),
        );
      } else {
        // Default to next 30 days
        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        calendarBookings = await bookingsQuery.where(
          and(
            gte(bookings.appointmentDate, today),
            lte(bookings.appointmentDate, thirtyDaysFromNow),
          ),
        );
      }

      res.json(calendarBookings);
    } catch (error) {
      console.error("Failed to fetch calendar bookings:", error);
      res.status(500).json({ message: "Failed to fetch calendar bookings" });
    }
  });

  app.get("/api/owner/bookings/today", async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
      );

      const todayBookings = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          appointmentDate: bookings.appointmentDate,
          notes: bookings.notes,
          status: bookings.status,
          serviceName: services.nameBg,
          servicePrice: services.price,
          serviceDuration: services.duration,
          barberName: barbers.name,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(barbers, eq(bookings.barberId, barbers.id))
        .where(
          and(
            gte(bookings.appointmentDate, startOfDay),
            lte(bookings.appointmentDate, endOfDay),
          ),
        )
        .orderBy(bookings.appointmentDate);

      res.json(todayBookings);
    } catch (error) {
      console.error("Failed to fetch today's bookings:", error);
      res.status(500).json({ message: "Failed to fetch today's bookings" });
    }
  });

  app.patch("/api/owner/bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!["confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updateData: any = { status };
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const [updatedBooking] = await db
        .update(bookings)
        .set(updateData)
        .where(eq(bookings.id, parseInt(id)))
        .returning();

      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Remove loyalty points when booking is cancelled by barber/braider
      if (status === "cancelled") {
        try {
          console.log(
            `Processing loyalty points removal for cancelled booking ID: ${updatedBooking.id}, phone: ${updatedBooking.customerPhone}`,
          );
          const customer = await storage.getLoyaltyCustomerByPhone(
            updatedBooking.customerPhone,
          );
          console.log(`Found loyalty customer:`, customer);

          if (customer) {
            // Check if points were already awarded for this booking
            const existingTransaction = await db
              .select()
              .from(pointTransactions)
              .where(
                and(
                  eq(pointTransactions.customerId, customer.id),
                  eq(pointTransactions.referenceId, updatedBooking.id),
                  eq(pointTransactions.referenceType, "booking"),
                  eq(pointTransactions.type, "earned"),
                ),
              )
              .limit(1);

            if (existingTransaction.length > 0) {
              const pointsToRemove = existingTransaction[0].points;

              // Add a deduction transaction
              await storage.addPointTransaction({
                customerId: customer.id,
                points: pointsToRemove,
                type: "spent",
                reason: `Отменена резервация: ${existingTransaction[0].reason?.replace("Резервация за услуга:", "")}`,
                referenceId: updatedBooking.id,
                referenceType: "cancellation",
              });

              console.log(
                `SUCCESS: Removed ${pointsToRemove} points from customer ${customer.name} for cancelled booking`,
              );
            } else {
              console.log(
                `No points transaction found for booking ID: ${updatedBooking.id}`,
              );
            }
          } else {
            console.log(
              `ERROR: No loyalty customer found for phone: ${updatedBooking.customerPhone}`,
            );
          }
        } catch (loyaltyError) {
          console.log("Failed to remove loyalty points:", loyaltyError);
          // Don't fail the status update if loyalty points fail
        }
      }

      // Update barber client visits when booking is completed
      if (status === "completed") {
        try {
          console.log(
            `Updating client visits for booking ID: ${updatedBooking.id}, barberId: ${updatedBooking.barberId}, phone: ${updatedBooking.customerPhone}`,
          );

          // Find the client in barber's client database
          const existingClient = await db
            .select()
            .from(barberClients)
            .where(
              and(
                eq(barberClients.barberId, updatedBooking.barberId),
                eq(barberClients.phone, updatedBooking.customerPhone),
              ),
            )
            .limit(1);

          if (existingClient.length > 0) {
            // Update existing client with +1 visit and last visit date
            await db
              .update(barberClients)
              .set({
                totalVisits: sql`${barberClients.totalVisits} + 1`,
                lastVisit: new Date(),
              })
              .where(eq(barberClients.id, existingClient[0].id));

            console.log(
              `SUCCESS: Updated client visits for ${updatedBooking.customerName} (+1 visit)`,
            );
          } else {
            // If client doesn't exist, create them with 1 visit
            await db.insert(barberClients).values({
              barberId: updatedBooking.barberId,
              name: updatedBooking.customerName,
              phone: updatedBooking.customerPhone,
              email: updatedBooking.customerEmail,
              notes: `Автоматично добавен при завършване на резервация #${updatedBooking.id}`,
              totalVisits: 1,
              lastVisit: new Date(),
            });

            console.log(
              `SUCCESS: Created new client ${updatedBooking.customerName} with 1 visit`,
            );
          }
        } catch (clientError) {
          console.log("Failed to update client visits:", clientError);
        }
      }

      res.json(updatedBooking);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  app.delete("/api/owner/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const bookingId = parseInt(id);

      // First delete any SMS notifications related to this booking
      await db
        .delete(smsNotifications)
        .where(eq(smsNotifications.bookingId, bookingId));

      // Then delete the booking
      const [deletedBooking] = await db
        .delete(bookings)
        .where(eq(bookings.id, bookingId))
        .returning();

      if (!deletedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({
        message: "Booking deleted successfully",
        booking: deletedBooking,
      });
    } catch (error) {
      console.error("Failed to delete booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  app.get("/api/owner/dashboard/stats", async (req, res) => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get various statistics
      const [todayCount] = await db
        .select({ count: sql`COUNT(*)` })
        .from(bookings)
        .where(
          and(
            gte(
              bookings.appointmentDate,
              new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            ),
            lt(
              bookings.appointmentDate,
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + 1,
              ),
            ),
          ),
        );

      const [weekCount] = await db
        .select({ count: sql`COUNT(*)` })
        .from(bookings)
        .where(gte(bookings.appointmentDate, startOfWeek));

      const [monthCount] = await db
        .select({ count: sql`COUNT(*)` })
        .from(bookings)
        .where(gte(bookings.appointmentDate, startOfMonth));

      const [monthRevenue] = await db
        .select({ total: sql`SUM(CAST(${services.price} AS DECIMAL))` })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .where(
          and(
            gte(bookings.appointmentDate, startOfMonth),
            eq(bookings.status, "completed"),
          ),
        );

      res.json({
        today: parseInt(todayCount.count as string) || 0,
        thisWeek: parseInt(weekCount.count as string) || 0,
        thisMonth: parseInt(monthCount.count as string) || 0,
        monthRevenue: parseFloat(monthRevenue.total as string) || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin routes for completed bookings and customer points
  app.get("/api/owner/completed-bookings", async (req, res) => {
    try {
      const completedBookings = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          appointmentDate: bookings.appointmentDate,
          serviceName: services.nameBg,
          servicePrice: services.price,
          barberName: barbers.name,
          completedAt: bookings.createdAt,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(barbers, eq(bookings.barberId, barbers.id))
        .where(eq(bookings.status, "completed"))
        .orderBy(sql`${bookings.appointmentDate} DESC`);

      res.json(completedBookings);
    } catch (error) {
      console.error("Failed to fetch completed bookings:", error);
      res.status(500).json({ message: "Failed to fetch completed bookings" });
    }
  });

  app.get("/api/owner/customer-points", async (req, res) => {
    try {
      const customerPoints = await storage.getAllLoyaltyCustomers();
      res.json(customerPoints);
    } catch (error) {
      console.error("Failed to fetch customer points:", error);
      res.status(500).json({ message: "Failed to fetch customer points" });
    }
  });

  // Barber Client Management Routes
  app.get("/api/barbers/:barberId/clients", async (req, res) => {
    try {
      const barberId = parseInt(req.params.barberId);

      const clients = await db
        .select({
          id: barberClients.id,
          name: barberClients.name,
          phone: barberClients.phone,
          email: barberClients.email,
          notes: barberClients.notes,
          lastVisit: barberClients.lastVisit,
          totalVisits: barberClients.totalVisits,
          preferredServices: barberClients.preferredServices,
          createdAt: barberClients.createdAt,
        })
        .from(barberClients)
        .where(eq(barberClients.barberId, barberId))
        .orderBy(desc(barberClients.lastVisit));

      res.json(clients);
    } catch (error) {
      console.error("Failed to fetch barber clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/barbers/:barberId/clients", async (req, res) => {
    try {
      const barberId = parseInt(req.params.barberId);
      const clientData = req.body;

      // Check if client already exists for this barber
      const existingClient = await db
        .select()
        .from(barberClients)
        .where(
          and(
            eq(barberClients.barberId, barberId),
            eq(barberClients.phone, clientData.phone),
          ),
        )
        .limit(1);

      if (existingClient.length > 0) {
        return res.status(400).json({
          message:
            "Client with this phone number already exists for this barber",
        });
      }

      const [client] = await db
        .insert(barberClients)
        .values({
          barberId,
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email,
          notes: clientData.notes,
          preferredServices: clientData.preferredServices,
        })
        .returning();

      res.json(client);
    } catch (error) {
      console.error("Failed to create client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Enhanced booking endpoint to auto-add to barber's client database
  app.post("/api/bookings/enhanced", async (req, res) => {
    try {
      const bookingData = req.body;

      // Validate that appointment date is not in the past
      const appointmentDate = new Date(bookingData.appointmentDate);
      const now = new Date();

      if (appointmentDate <= now) {
        return res.status(400).json({
          message: "Не можете да правите резервация за минала дата или час",
        });
      }

      // Create the booking first
      const [booking] = await db
        .insert(bookings)
        .values({
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          customerEmail: bookingData.customerEmail,
          serviceId: bookingData.serviceId,
          barberId: bookingData.barberId,
          appointmentDate: new Date(bookingData.appointmentDate),
          notes: bookingData.notes,
        })
        .returning();

      // Award loyalty points immediately upon booking creation
      try {
        console.log(
          `Processing loyalty points for new booking ID: ${booking.id}, phone: ${booking.customerPhone}`,
        );
        const customer = await storage.getLoyaltyCustomerByPhone(
          booking.customerPhone,
        );
        console.log(`Found loyalty customer:`, customer);

        if (customer) {
          // Get service details to calculate points
          const services = await storage.getServices();
          const service = services.find((s) => s.id === booking.serviceId);
          console.log(`Found service:`, service);

          if (service) {
            const points = Math.floor(parseFloat(service.price));
            console.log(
              `Calculating points: ${service.price} -> ${points} points`,
            );

            await storage.addPointTransaction({
              customerId: customer.id,
              points: points,
              type: "earned",
              reason: `Резервация за услуга: ${service.nameBg}`,
              referenceId: booking.id,
              referenceType: "booking",
            });
            console.log(
              `SUCCESS: Awarded ${points} points to customer ${customer.name} for new booking`,
            );
          } else {
            console.log(
              `ERROR: Service not found for serviceId: ${booking.serviceId}`,
            );
          }
        } else {
          console.log(
            `ERROR: No loyalty customer found for phone: ${booking.customerPhone}`,
          );
        }
      } catch (loyaltyError) {
        console.log(
          "Failed to award loyalty points for new booking:",
          loyaltyError,
        );
        // Don't fail the booking creation if loyalty points fail
      }

      // Check if client already exists in barber's database
      const existingClient = await db
        .select()
        .from(barberClients)
        .where(
          and(
            eq(barberClients.barberId, bookingData.barberId),
            eq(barberClients.phone, bookingData.customerPhone),
          ),
        )
        .limit(1);

      // If client doesn't exist, add them to barber's client database
      if (existingClient.length === 0) {
        await db.insert(barberClients).values({
          barberId: bookingData.barberId,
          name: bookingData.customerName,
          phone: bookingData.customerPhone,
          email: bookingData.customerEmail,
          notes: `Автоматично добавен от резервация #${booking.id}`,
          totalVisits: 0,
        });
      }

      res.json(booking);
    } catch (error) {
      console.error("Failed to create enhanced booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
