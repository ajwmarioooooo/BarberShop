import { 
  users, services, products, barbers, bookings, cartItems,
  loyaltyCustomers, pointTransactions, loyaltyRewards, rewardRedemptions,
  type User, type InsertUser, type Service, type InsertService,
  type Product, type InsertProduct, type Barber, type InsertBarber,
  type Booking, type InsertBooking, type CartItem, type InsertCartItem,
  type LoyaltyCustomer, type InsertLoyaltyCustomer,
  type PointTransaction, type InsertPointTransaction,
  type LoyaltyReward, type InsertLoyaltyReward,
  type RewardRedemption, type InsertRewardRedemption
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getServicesByBarber(barberId: number): Promise<Service[]>;
  createService(insertService: InsertService): Promise<Service>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  createProduct(insertProduct: InsertProduct): Promise<Product>;
  
  // Barber methods
  getBarbers(): Promise<Barber[]>;
  createBarber(insertBarber: InsertBarber): Promise<Barber>;
  
  // Booking methods
  createBooking(insertBooking: InsertBooking): Promise<Booking>;
  getAvailability(date: Date, barberId: number): Promise<string[]>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(insertCartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  
  // Loyalty Program methods
  getLoyaltyCustomerByPhone(phone: string): Promise<LoyaltyCustomer | undefined>;
  createLoyaltyCustomer(insertCustomer: InsertLoyaltyCustomer): Promise<LoyaltyCustomer>;
  updateLoyaltyCustomer(id: number, updates: Partial<LoyaltyCustomer>): Promise<LoyaltyCustomer>;
  addPointTransaction(insertTransaction: InsertPointTransaction): Promise<PointTransaction>;
  getPointTransactions(customerId: number, limit?: number): Promise<PointTransaction[]>;
  getLoyaltyRewards(): Promise<LoyaltyReward[]>;
  createLoyaltyReward(insertReward: InsertLoyaltyReward): Promise<LoyaltyReward>;
  redeemReward(insertRedemption: InsertRewardRedemption): Promise<RewardRedemption>;
  getCustomerRedemptions(customerId: number): Promise<RewardRedemption[]>;
  getAllLoyaltyCustomers(): Promise<LoyaltyCustomer[]>;
  getCompletedBookings(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true));
  }

  async getServicesByBarber(barberId: number): Promise<Service[]> {
    return await db.select().from(services).where(
      and(eq(services.isActive, true), eq(services.barberId, barberId))
    );
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.inStock, true));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  // Barber methods
  async getBarbers(): Promise<Barber[]> {
    return await db.select().from(barbers).where(eq(barbers.isActive, true));
  }

  async createBarber(insertBarber: InsertBarber): Promise<Barber> {
    const [barber] = await db
      .insert(barbers)
      .values(insertBarber)
      .returning();
    return barber;
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async getAvailability(date: Date, barberId: number): Promise<string[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.barberId, barberId),
          gte(bookings.appointmentDate, startOfDay),
          lte(bookings.appointmentDate, endOfDay)
        )
      );

    const allSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    const bookedSlots = existingBookings.map(booking => {
      const time = booking.appointmentDate.toTimeString().slice(0, 5);
      return time;
    });

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  // Loyalty Program methods
  async getLoyaltyCustomerByPhone(phone: string): Promise<LoyaltyCustomer | undefined> {
    const [customer] = await db.select().from(loyaltyCustomers).where(eq(loyaltyCustomers.phone, phone));
    return customer || undefined;
  }

  async createLoyaltyCustomer(insertCustomer: InsertLoyaltyCustomer): Promise<LoyaltyCustomer> {
    const [customer] = await db
      .insert(loyaltyCustomers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateLoyaltyCustomer(id: number, updates: Partial<LoyaltyCustomer>): Promise<LoyaltyCustomer> {
    const [customer] = await db
      .update(loyaltyCustomers)
      .set({ ...updates, lastVisit: new Date() })
      .where(eq(loyaltyCustomers.id, id))
      .returning();
    return customer;
  }

  async addPointTransaction(insertTransaction: InsertPointTransaction): Promise<PointTransaction> {
    const [transaction] = await db
      .insert(pointTransactions)
      .values(insertTransaction)
      .returning();

    // Update customer total points
    const customer = await db.select().from(loyaltyCustomers).where(eq(loyaltyCustomers.id, insertTransaction.customerId));
    if (customer[0]) {
      const newTotal = (customer[0].totalPoints || 0) + insertTransaction.points;
      const newSpent = insertTransaction.points < 0 ? (customer[0].spentPoints || 0) + Math.abs(insertTransaction.points) : customer[0].spentPoints;
      
      // Update tier based on total points
      let tier = "Bronze";
      if (newTotal >= 1000) tier = "VIP";
      else if (newTotal >= 500) tier = "Gold";
      else if (newTotal >= 200) tier = "Silver";

      await db
        .update(loyaltyCustomers)
        .set({ 
          totalPoints: newTotal,
          spentPoints: newSpent,
          tier,
          lastVisit: new Date()
        })
        .where(eq(loyaltyCustomers.id, insertTransaction.customerId));
    }

    return transaction;
  }

  async getPointTransactions(customerId: number, limit: number = 10): Promise<PointTransaction[]> {
    return await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.customerId, customerId))
      .orderBy(pointTransactions.createdAt)
      .limit(limit);
  }

  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    return await db.select().from(loyaltyRewards).where(eq(loyaltyRewards.isActive, true));
  }

  async createLoyaltyReward(insertReward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const [reward] = await db
      .insert(loyaltyRewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async redeemReward(insertRedemption: InsertRewardRedemption): Promise<RewardRedemption> {
    const [redemption] = await db
      .insert(rewardRedemptions)
      .values(insertRedemption)
      .returning();
    return redemption;
  }

  async getCustomerRedemptions(customerId: number): Promise<RewardRedemption[]> {
    return await db
      .select()
      .from(rewardRedemptions)
      .where(eq(rewardRedemptions.customerId, customerId))
      .orderBy(rewardRedemptions.createdAt);
  }

  async getAllLoyaltyCustomers(): Promise<LoyaltyCustomer[]> {
    return await db
      .select()
      .from(loyaltyCustomers)
      .orderBy(loyaltyCustomers.totalPoints);
  }

  async getCompletedBookings(): Promise<any[]> {
    const completedBookings = await db
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
      .where(eq(bookings.status, 'completed'))
      .orderBy(bookings.appointmentDate);
    
    return completedBookings;
  }
}

export const storage = new DatabaseStorage();