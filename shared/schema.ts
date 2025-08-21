import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  nameBg: text("name_bg").notNull(),
  nameEn: text("name_en"),
  descriptionBg: text("description_bg").notNull(),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  imageUrl: text("image_url"),
  barberId: integer("barber_id").references(() => barbers.id), // NULL means available for all barbers
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  nameBg: text("name_bg").notNull(),
  nameEn: text("name_en"),
  descriptionBg: text("description_bg").notNull(),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  inStock: boolean("in_stock").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  barberId: integer("barber_id").references(() => barbers.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  notes: text("notes"),
  status: text("status").default("confirmed"), // confirmed, completed, cancelled
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Loyalty Program Tables
export const loyaltyCustomers = pgTable("loyalty_customers", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  totalPoints: integer("total_points").default(0),
  spentPoints: integer("spent_points").default(0),
  tier: text("tier").default("Bronze"), // Bronze, Silver, Gold, VIP
  joinedAt: timestamp("joined_at").defaultNow(),
  lastVisit: timestamp("last_visit"),
});

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => loyaltyCustomers.id).notNull(),
  points: integer("points").notNull(), // positive for earned, negative for spent
  type: text("type").notNull(), // "earned", "spent", "bonus", "expired"
  reason: text("reason").notNull(),
  referenceId: integer("reference_id"), // booking_id or order_id
  referenceType: text("reference_type"), // "booking", "product_purchase", "manual"
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  rewardType: text("reward_type").notNull(), // "discount", "free_service", "product"
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }), // discount amount or product value
  minTier: text("min_tier").default("Bronze"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewardRedemptions = pgTable("reward_redemptions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => loyaltyCustomers.id).notNull(),
  rewardId: integer("reward_id").references(() => loyaltyRewards.id).notNull(),
  pointsSpent: integer("points_spent").notNull(),
  status: text("status").default("active"), // active, used, expired
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SMS Notifications table
export const smsNotifications = pgTable("sms_notifications", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending, sent, failed
  twilioSid: text("twilio_sid"), // Twilio message SID for tracking
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  notificationType: text("notification_type").notNull(), // reminder, confirmation, cancellation
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const barbersRelations = relations(barbers, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  barber: one(barbers, {
    fields: [bookings.barberId],
    references: [barbers.id],
  }),
  smsNotifications: many(smsNotifications),
}));

export const smsNotificationsRelations = relations(smsNotifications, ({ one }) => ({
  booking: one(bookings, {
    fields: [smsNotifications.bookingId],
    references: [bookings.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Loyalty Relations
export const loyaltyCustomersRelations = relations(loyaltyCustomers, ({ many }) => ({
  pointTransactions: many(pointTransactions),
  rewardRedemptions: many(rewardRedemptions),
}));

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  customer: one(loyaltyCustomers, {
    fields: [pointTransactions.customerId],
    references: [loyaltyCustomers.id],
  }),
}));

export const loyaltyRewardsRelations = relations(loyaltyRewards, ({ many }) => ({
  redemptions: many(rewardRedemptions),
}));

export const rewardRedemptionsRelations = relations(rewardRedemptions, ({ one }) => ({
  customer: one(loyaltyCustomers, {
    fields: [rewardRedemptions.customerId],
    references: [loyaltyCustomers.id],
  }),
  reward: one(loyaltyRewards, {
    fields: [rewardRedemptions.rewardId],
    references: [loyaltyRewards.id],
  }),
}));

// Barber clients table - individual client database for each barber
export const barberClients = pgTable("barber_clients", {
  id: serial("id").primaryKey(),
  barberId: integer("barber_id").references(() => barbers.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  notes: text("notes"), // Personal notes about the client
  lastVisit: timestamp("last_visit"),
  totalVisits: integer("total_visits").default(0),
  preferredServices: text("preferred_services"), // JSON array of preferred service IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Visit history for barber clients
export const clientVisits = pgTable("client_visits", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => barberClients.id).notNull(),
  barberId: integer("barber_id").references(() => barbers.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  visitDate: timestamp("visit_date").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  notes: text("notes"),
  rating: integer("rating"), // 1-5 star rating
  createdAt: timestamp("created_at").defaultNow(),
});

// Barber client relations
export const barberClientsRelations = relations(barberClients, ({ one, many }) => ({
  barber: one(barbers, {
    fields: [barberClients.barberId],
    references: [barbers.id],
  }),
  visits: many(clientVisits),
}));

export const clientVisitsRelations = relations(clientVisits, ({ one }) => ({
  client: one(barberClients, {
    fields: [clientVisits.clientId],
    references: [barberClients.id],
  }),
  barber: one(barbers, {
    fields: [clientVisits.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields: [clientVisits.serviceId],
    references: [services.id],
  }),
}));

// Update barbers relations to include clients
export const barbersRelationsUpdated = relations(barbers, ({ many }) => ({
  bookings: many(bookings),
  clients: many(barberClients),
  services: many(services),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertBarberSchema = createInsertSchema(barbers).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
  reminderSent: true,
  reminderSentAt: true,
}).extend({
  appointmentDate: z.string().transform((str) => new Date(str)),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertLoyaltyCustomerSchema = createInsertSchema(loyaltyCustomers).omit({
  id: true,
  totalPoints: true,
  spentPoints: true,
  tier: true,
  joinedAt: true,
  lastVisit: true,
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertLoyaltyRewardSchema = createInsertSchema(loyaltyRewards).omit({
  id: true,
  createdAt: true,
});

export const insertRewardRedemptionSchema = createInsertSchema(rewardRedemptions).omit({
  id: true,
  createdAt: true,
});

export const insertSmsNotificationSchema = createInsertSchema(smsNotifications).omit({
  id: true,
  createdAt: true,
  status: true,
  twilioSid: true,
  sentAt: true,
  errorMessage: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Barber = typeof barbers.$inferSelect;
export type InsertBarber = z.infer<typeof insertBarberSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type LoyaltyCustomer = typeof loyaltyCustomers.$inferSelect;
export type InsertLoyaltyCustomer = z.infer<typeof insertLoyaltyCustomerSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;
export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = z.infer<typeof insertLoyaltyRewardSchema>;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = z.infer<typeof insertRewardRedemptionSchema>;
export type SmsNotification = typeof smsNotifications.$inferSelect;
export type InsertSmsNotification = z.infer<typeof insertSmsNotificationSchema>;

// New barber client types
export type BarberClient = typeof barberClients.$inferSelect;
export type InsertBarberClient = typeof barberClients.$inferInsert;
export type ClientVisit = typeof clientVisits.$inferSelect;
export type InsertClientVisit = typeof clientVisits.$inferInsert;

// Insert schemas for barber clients
export const insertBarberClientSchema = createInsertSchema(barberClients).omit({
  id: true,
  totalVisits: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientVisitSchema = createInsertSchema(clientVisits).omit({
  id: true,
  createdAt: true,
});

export type InsertBarberClientType = z.infer<typeof insertBarberClientSchema>;
export type InsertClientVisitType = z.infer<typeof insertClientVisitSchema>;
