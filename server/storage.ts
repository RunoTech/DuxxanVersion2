import {
  users,
  raffles,
  donations,
  tickets,
  donationContributions,
  userRatings,
  categories,
  chatMessages,
  follows,
  type User,
  type InsertUser,
  type Raffle,
  type InsertRaffle,
  type Donation,
  type InsertDonation,
  type Ticket,
  type InsertTicket,
  type DonationContribution,
  type InsertDonationContribution,
  type UserRating,
  type InsertUserRating,
  type Category,
  type ChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, gt, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Raffles
  getRaffles(limit?: number, offset?: number): Promise<(Raffle & { creator: User; category: Category })[]>;
  getRaffleById(id: number): Promise<(Raffle & { creator: User; category: Category }) | undefined>;
  createRaffle(raffle: InsertRaffle & { creatorId: number }): Promise<Raffle>;
  updateRaffle(id: number, updates: Partial<Raffle>): Promise<Raffle>;
  getRafflesByCreator(creatorId: number): Promise<Raffle[]>;
  getActiveRaffles(): Promise<(Raffle & { creator: User; category: Category })[]>;
  
  // Tickets
  createTicket(ticket: InsertTicket & { userId: number }): Promise<Ticket>;
  getTicketsByRaffle(raffleId: number): Promise<(Ticket & { user: User })[]>;
  getTicketsByUser(userId: number): Promise<(Ticket & { raffle: Raffle })[]>;
  
  // Donations
  getDonations(limit?: number, offset?: number): Promise<(Donation & { creator: User })[]>;
  getDonationById(id: number): Promise<(Donation & { creator: User }) | undefined>;
  createDonation(donation: InsertDonation & { creatorId: number }): Promise<Donation>;
  updateDonation(id: number, updates: Partial<Donation>): Promise<Donation>;
  getActiveDonations(): Promise<(Donation & { creator: User })[]>;
  
  // Donation Contributions
  createDonationContribution(contribution: InsertDonationContribution & { userId: number }): Promise<DonationContribution>;
  getDonationContributions(donationId: number): Promise<(DonationContribution & { user: User })[]>;
  
  // User Ratings
  createUserRating(rating: InsertUserRating & { raterId: number }): Promise<UserRating>;
  getUserRatings(userId: number): Promise<UserRating[]>;
  
  // Chat Messages
  getChatMessages(raffleId: number): Promise<(ChatMessage & { sender: User; receiver: User })[]>;
  createChatMessage(message: { raffleId: number; senderId: number; receiverId: number; message: string }): Promise<ChatMessage>;
  
  // Platform Stats
  getPlatformStats(): Promise<{
    totalRaffles: number;
    totalPrizePool: string;
    totalDonations: string;
    activeUsers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getRaffles(limit = 20, offset = 0): Promise<(Raffle & { creator: User; category: Category })[]> {
    return await db
      .select()
      .from(raffles)
      .innerJoin(users, eq(raffles.creatorId, users.id))
      .innerJoin(categories, eq(raffles.categoryId, categories.id))
      .where(eq(raffles.isActive, true))
      .orderBy(desc(raffles.createdAt))
      .limit(limit)
      .offset(offset)
      .then(rows => rows.map(row => ({ ...row.raffles, creator: row.users, category: row.categories })));
  }

  async getRaffleById(id: number): Promise<(Raffle & { creator: User; category: Category }) | undefined> {
    const [result] = await db
      .select()
      .from(raffles)
      .innerJoin(users, eq(raffles.creatorId, users.id))
      .innerJoin(categories, eq(raffles.categoryId, categories.id))
      .where(eq(raffles.id, id));
    
    return result ? { ...result.raffles, creator: result.users, category: result.categories } : undefined;
  }

  async createRaffle(raffle: InsertRaffle & { creatorId: number }): Promise<Raffle> {
    const [newRaffle] = await db.insert(raffles).values(raffle).returning();
    return newRaffle;
  }

  async updateRaffle(id: number, updates: Partial<Raffle>): Promise<Raffle> {
    const [raffle] = await db.update(raffles).set(updates).where(eq(raffles.id, id)).returning();
    return raffle;
  }

  async getRafflesByCreator(creatorId: number): Promise<Raffle[]> {
    return await db.select().from(raffles).where(eq(raffles.creatorId, creatorId)).orderBy(desc(raffles.createdAt));
  }

  async getActiveRaffles(): Promise<(Raffle & { creator: User; category: Category })[]> {
    return await db
      .select()
      .from(raffles)
      .innerJoin(users, eq(raffles.creatorId, users.id))
      .innerJoin(categories, eq(raffles.categoryId, categories.id))
      .where(and(eq(raffles.isActive, true), gt(raffles.endDate, new Date())))
      .orderBy(desc(raffles.createdAt))
      .then(rows => rows.map(row => ({ ...row.raffles, creator: row.users, category: row.categories })));
  }

  async createTicket(ticket: InsertTicket & { userId: number }): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values(ticket).returning();
    
    // Update raffle tickets sold count
    await db
      .update(raffles)
      .set({ ticketsSold: sql`${raffles.ticketsSold} + ${ticket.quantity}` })
      .where(eq(raffles.id, ticket.raffleId));
    
    return newTicket;
  }

  async getTicketsByRaffle(raffleId: number): Promise<(Ticket & { user: User })[]> {
    return await db
      .select()
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.raffleId, raffleId))
      .orderBy(desc(tickets.createdAt))
      .then(rows => rows.map(row => ({ ...row.tickets, user: row.users })));
  }

  async getTicketsByUser(userId: number): Promise<(Ticket & { raffle: Raffle })[]> {
    return await db
      .select()
      .from(tickets)
      .innerJoin(raffles, eq(tickets.raffleId, raffles.id))
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt))
      .then(rows => rows.map(row => ({ ...row.tickets, raffle: row.raffles })));
  }

  async getDonations(limit = 20, offset = 0): Promise<(Donation & { creator: User })[]> {
    const result = await db
      .select({
        donation: donations,
        creator: users,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(eq(donations.isActive, true))
      .orderBy(desc(donations.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result.map(row => ({ ...row.donation, creator: row.creator }));
  }

  async getDonationById(id: number): Promise<(Donation & { creator: User }) | undefined> {
    const [result] = await db
      .select({
        donation: donations,
        creator: users,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(eq(donations.id, id));
    
    return result ? { ...result.donation, creator: result.creator } : undefined;
  }

  async createDonation(donation: InsertDonation & { creatorId: number }): Promise<Donation> {
    const [newDonation] = await db.insert(donations).values(donation).returning();
    return newDonation;
  }

  async updateDonation(id: number, updates: Partial<Donation>): Promise<Donation> {
    const [donation] = await db.update(donations).set(updates).where(eq(donations.id, id)).returning();
    return donation;
  }

  async getActiveDonations(): Promise<(Donation & { creator: User })[]> {
    // Simple approach - get all donations and manually join with users
    const donationResults = await db.select().from(donations).where(eq(donations.isActive, true));
    const userResults = await db.select().from(users);
    
    // Create a map for faster lookup
    const userMap = new Map(userResults.map(user => [user.id, user]));
    
    // Combine donations with their creators and filter by end date
    const activeDonations = donationResults
      .filter(donation => new Date(donation.endDate) > new Date())
      .map(donation => ({
        ...donation,
        creator: userMap.get(donation.creatorId)!
      }))
      .filter(donation => donation.creator)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    return activeDonations;
  }

  async createDonationContribution(contribution: InsertDonationContribution & { userId: number }): Promise<DonationContribution> {
    const [newContribution] = await db.insert(donationContributions).values(contribution).returning();
    
    // Update donation current amount and donor count
    await db
      .update(donations)
      .set({
        currentAmount: sql`${donations.currentAmount} + ${contribution.amount}`,
        donorCount: sql`${donations.donorCount} + 1`,
      })
      .where(eq(donations.id, contribution.donationId));
    
    return newContribution;
  }

  async getDonationContributions(donationId: number): Promise<(DonationContribution & { user: User })[]> {
    return await db
      .select()
      .from(donationContributions)
      .innerJoin(users, eq(donationContributions.userId, users.id))
      .where(eq(donationContributions.donationId, donationId))
      .orderBy(desc(donationContributions.createdAt))
      .then(rows => rows.map(row => ({ ...row.donation_contributions, user: row.users })));
  }

  async createUserRating(rating: InsertUserRating & { raterId: number }): Promise<UserRating> {
    const [newRating] = await db.insert(userRatings).values(rating).returning();
    
    // Update user's average rating
    const ratings = await db.select().from(userRatings).where(eq(userRatings.ratedId, rating.ratedId));
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await db
      .update(users)
      .set({
        rating: avgRating.toFixed(1),
        ratingCount: ratings.length,
      })
      .where(eq(users.id, rating.ratedId));
    
    return newRating;
  }

  async getUserRatings(userId: number): Promise<UserRating[]> {
    return await db.select().from(userRatings).where(eq(userRatings.ratedId, userId));
  }

  async getChatMessages(raffleId: number): Promise<(ChatMessage & { sender: User; receiver: User })[]> {
    return await db
      .select()
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .innerJoin(users, eq(chatMessages.receiverId, users.id))
      .where(eq(chatMessages.raffleId, raffleId))
      .orderBy(asc(chatMessages.createdAt))
      .then(rows => rows.map(row => ({ 
        ...row.chat_messages, 
        sender: row.users, 
        receiver: row.users 
      })));
  }

  async createChatMessage(message: { raffleId: number; senderId: number; receiverId: number; message: string }): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getPlatformStats(): Promise<{
    totalRaffles: number;
    totalPrizePool: string;
    totalDonations: string;
    activeUsers: number;
  }> {
    const [raffleStats] = await db
      .select({
        count: sql<number>`count(*)`,
        totalPrizePool: sql<string>`sum(${raffles.prizeValue})`,
      })
      .from(raffles)
      .where(eq(raffles.isActive, true));

    const [donationStats] = await db
      .select({
        totalDonations: sql<string>`sum(${donations.currentAmount})`,
      })
      .from(donations)
      .where(eq(donations.isActive, true));

    const [userStats] = await db
      .select({
        activeUsers: sql<number>`count(*)`,
      })
      .from(users)
      .where(eq(users.isActive, true));

    return {
      totalRaffles: raffleStats.count || 0,
      totalPrizePool: raffleStats.totalPrizePool || "0",
      totalDonations: donationStats.totalDonations || "0",
      activeUsers: userStats.activeUsers || 0,
    };
  }
}

export const storage = new DatabaseStorage();
