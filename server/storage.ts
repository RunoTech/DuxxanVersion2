import {
  users,
  raffles,
  donations,
  tickets,
  donationContributions,
  userRatings,
  categories,
  countries,

  follows,
  userDevices,
  userPhotos,
  channels,
  channelSubscriptions,
  upcomingRaffles,
  upcomingRaffleInterests,
  type User,
  type InsertUser,
  type UserDevice,
  type InsertUserDevice,
  type UserPhoto,
  type InsertUserPhoto,
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
  type Channel,
  type InsertChannel,
  type ChannelSubscription,
  type InsertChannelSubscription,
  type UpcomingRaffle,
  type InsertUpcomingRaffle,
  type UpcomingRaffleInterest,
  type InsertUpcomingRaffleInterest,
  type Country,
  type ChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, gt, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  getUserStats(userId: number): Promise<{
    totalRaffles: number;
    totalDonations: number;
    totalSpent: string;
    totalWon: string;
  }>;
  
  // User Devices
  createUserDevice(device: InsertUserDevice & { userId: number }): Promise<UserDevice>;
  getUserDevices(userId: number): Promise<UserDevice[]>;
  updateUserDeviceLastLogin(deviceId: number): Promise<void>;
  
  // User Photos
  createUserPhoto(photo: InsertUserPhoto & { userId: number }): Promise<UserPhoto>;
  getUserPhotos(userId: number, photoType?: string): Promise<UserPhoto[]>;
  deleteUserPhoto(photoId: number, userId: number): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  
  // Countries
  getCountries(): Promise<Country[]>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  createCountry(country: Omit<Country, 'id'>): Promise<Country>;
  
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
  getDonations(limit?: number, offset?: number, filter?: string): Promise<(Donation & { creator: User })[]>;
  getDonationById(id: number): Promise<(Donation & { creator: User }) | undefined>;
  createDonation(donation: InsertDonation & { creatorId: number }): Promise<Donation>;
  updateDonation(id: number, updates: Partial<Donation>): Promise<Donation>;
  getActiveDonations(): Promise<(Donation & { creator: User })[]>;
  getDonationsByCreator(creatorId: number): Promise<Donation[]>;
  getDonationsByOrganizationType(orgType: string): Promise<(Donation & { creator: User })[]>;
  processStartupFeePayment(donationId: number, transactionHash: string): Promise<void>;
  getDonationStats(): Promise<{
    totalDonations: number;
    totalCommissionCollected: string;
    organizationDonations: number;
    individualDonations: number;
  }>;
  
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
  private async withErrorHandling<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation failed [${operationName}]:`, error);
      throw new Error(`Database operation failed: ${operationName}`);
    }
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return this.withErrorHandling(async () => {
      const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
      return user || undefined;
    }, 'getUserByWalletAddress');
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

  async getPendingApprovals(): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(eq(users.accountStatus, 'pending_approval'))
      .orderBy(users.accountSubmittedAt);
  }

  async approveAccount(walletAddress: string): Promise<User> {
    const [user] = await db.update(users)
      .set({
        accountStatus: 'active',
        accountApprovedAt: new Date(),
        accountRejectedAt: null,
        rejectionReason: null
      })
      .where(eq(users.walletAddress, walletAddress))
      .returning();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async rejectAccount(walletAddress: string, reason: string): Promise<User> {
    const [user] = await db.update(users)
      .set({
        accountStatus: 'rejected',
        accountRejectedAt: new Date(),
        rejectionReason: reason,
        // Kurumsal hesap bilgilerini temizle
        organizationType: 'individual',
        organizationName: null
      })
      .where(eq(users.walletAddress, walletAddress))
      .returning();
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.withErrorHandling(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    }, 'getUser');
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.withErrorHandling(async () => {
      const result = await db.delete(users).where(eq(users.id, id));
      return result.rowCount > 0;
    }, 'deleteUser');
  }

  async getUserStats(userId: number): Promise<{
    totalRaffles: number;
    totalDonations: number;
    totalSpent: string;
    totalWon: string;
  }> {
    return this.withErrorHandling(async () => {
      // Get raffle statistics
      const raffleStats = await db.select({
        count: sql<number>`count(*)::int`,
        totalSpent: sql<string>`coalesce(sum(${tickets.totalAmount}), '0')`
      }).from(tickets).where(eq(tickets.userId, userId));

      // Get donation statistics  
      const donationStats = await db.select({
        count: sql<number>`count(*)::int`,
        totalDonated: sql<string>`coalesce(sum(${donationContributions.amount}), '0')`
      }).from(donationContributions).where(eq(donationContributions.userId, userId));

      // Get won raffles (this would need a winners table in a real implementation)
      const totalWon = "0"; // Placeholder until winners tracking is implemented

      return {
        totalRaffles: raffleStats[0]?.count || 0,
        totalDonations: donationStats[0]?.count || 0,
        totalSpent: raffleStats[0]?.totalSpent || "0",
        totalWon
      };
    }, 'getUserStats');
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries).where(eq(countries.isActive, true)).orderBy(asc(countries.name));
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.code, code));
    return country || undefined;
  }

  async createCountry(country: Omit<Country, 'id'>): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
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

  async getDonations(limit = 20, offset = 0, filter?: string): Promise<(Donation & { creator: User })[]> {
    const result = await db
      .select({
        donation: donations,
        creator: users,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
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
    // Get user info to determine commission rate and startup fee
    const [user] = await db.select().from(users).where(eq(users.id, donation.creatorId));
    
    let commissionRate = "10.00"; // Default 10% for individuals
    let startupFee = "0";
    
    if (user && user.organizationType !== "individual") {
      commissionRate = "2.00"; // 2% for organizations
      if (donation.isUnlimited) {
        startupFee = "100.000000"; // 100 USDT startup fee for unlimited donations
      }
    }
    
    const donationData = {
      creatorId: donation.creatorId,
      title: donation.title,
      description: donation.description,
      goalAmount: donation.goalAmount,
      endDate: donation.endDate ? new Date(donation.endDate) : null,
      isUnlimited: donation.isUnlimited || false,
      category: donation.category || "general",
      country: donation.country || null,
      commissionRate,
      startupFee,
    };
    
    const [newDonation] = await db.insert(donations).values(donationData).returning();
    return newDonation;
  }

  async updateDonation(id: number, updates: Partial<Donation>): Promise<Donation> {
    const [donation] = await db.update(donations).set(updates).where(eq(donations.id, id)).returning();
    return donation;
  }

  async getActiveDonations(): Promise<(Donation & { creator: User })[]> {
    return await this.getDonations(100, 0);
  }

  async getDonationsByCreator(creatorId: number): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.creatorId, creatorId));
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
    // Get all chat messages for this raffle
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.raffleId, raffleId))
      .orderBy(asc(chatMessages.createdAt));

    // Get sender and receiver info separately
    const enrichedMessages = [];
    for (const message of messages) {
      const [sender] = await db.select().from(users).where(eq(users.id, message.senderId));
      const [receiver] = await db.select().from(users).where(eq(users.id, message.receiverId));
      
      enrichedMessages.push({
        ...message,
        sender,
        receiver
      });
    }
    
    return enrichedMessages;
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

  async getDonationsByOrganizationType(orgType: string): Promise<(Donation & { creator: User })[]> {
    const results = await db
      .select({
        donation: donations,
        creator: users,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(and(
        eq(donations.isActive, true),
        eq(users.organizationType, orgType)
      ))
      .orderBy(desc(donations.createdAt));
    
    return results.map(result => ({
      ...result.donation,
      creator: result.creator
    }));
  }

  async processStartupFeePayment(donationId: number, transactionHash: string): Promise<void> {
    await db
      .update(donations)
      .set({ startupFeePaid: true })
      .where(eq(donations.id, donationId));
  }

  async getDonationStats(): Promise<{
    totalDonations: number;
    totalCommissionCollected: string;
    organizationDonations: number;
    individualDonations: number;
  }> {
    const [totalStats] = await db
      .select({
        totalDonations: sql<number>`count(*)`,
        totalCommissionCollected: sql<string>`sum(${donations.totalCommissionCollected})`,
      })
      .from(donations)
      .where(eq(donations.isActive, true));

    const [orgStats] = await db
      .select({
        organizationDonations: sql<number>`count(*)`,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(and(
        eq(donations.isActive, true),
        sql`${users.organizationType} != 'individual'`
      ));

    const [indivStats] = await db
      .select({
        individualDonations: sql<number>`count(*)`,
      })
      .from(donations)
      .innerJoin(users, eq(donations.creatorId, users.id))
      .where(and(
        eq(donations.isActive, true),
        eq(users.organizationType, "individual")
      ));

    return {
      totalDonations: totalStats.totalDonations || 0,
      totalCommissionCollected: totalStats.totalCommissionCollected || "0",
      organizationDonations: orgStats.organizationDonations || 0,
      individualDonations: indivStats.individualDonations || 0,
    };
  }

  // User Device methods
  async createUserDevice(device: InsertUserDevice & { userId: number }): Promise<UserDevice> {
    return this.withErrorHandling(async () => {
      const [newDevice] = await db
        .insert(userDevices)
        .values({
          ...device,
          deviceFingerprint: device.deviceFingerprint || 'unknown'
        })
        .returning();
      return newDevice;
    }, 'createUserDevice');
  }

  async getUserDevices(userId: number): Promise<UserDevice[]> {
    return await db
      .select()
      .from(userDevices)
      .where(eq(userDevices.userId, userId))
      .orderBy(desc(userDevices.lastLoginAt));
  }

  async updateUserDeviceLastLogin(deviceId: number): Promise<void> {
    await db
      .update(userDevices)
      .set({ lastLoginAt: new Date() })
      .where(eq(userDevices.id, deviceId));
  }

  // User Photo methods
  async createUserPhoto(photo: InsertUserPhoto & { userId: number }): Promise<UserPhoto> {
    const [newPhoto] = await db
      .insert(userPhotos)
      .values(photo)
      .returning();
    return newPhoto;
  }

  async getUserPhotos(userId: number, photoType?: string): Promise<UserPhoto[]> {
    let whereConditions = and(
      eq(userPhotos.userId, userId),
      eq(userPhotos.isActive, true)
    );

    if (photoType) {
      whereConditions = and(
        eq(userPhotos.userId, userId),
        eq(userPhotos.photoType, photoType),
        eq(userPhotos.isActive, true)
      );
    }

    return await db
      .select()
      .from(userPhotos)
      .where(whereConditions)
      .orderBy(desc(userPhotos.uploadedAt));
  }

  async deleteUserPhoto(photoId: number, userId: number): Promise<void> {
    await db
      .update(userPhotos)
      .set({ isActive: false })
      .where(and(
        eq(userPhotos.id, photoId),
        eq(userPhotos.userId, userId)
      ));
  }

  // Community Channel Methods
  async createChannel(channelData: InsertChannel & { creatorId: number }): Promise<Channel> {
    const [channel] = await db.insert(channels).values(channelData).returning();
    return channel;
  }

  async getChannels(): Promise<Channel[]> {
    return await db.select({
      id: channels.id,
      name: channels.name,
      description: channels.description,
      categoryId: channels.categoryId,
      creatorId: channels.creatorId,
      subscriberCount: channels.subscriberCount,
      isActive: channels.isActive,
      createdAt: channels.createdAt,
      isDemo: channels.isDemo,
      demoContent: channels.demoContent,
      totalPrizeAmount: channels.totalPrizeAmount,
      activeRaffleCount: channels.activeRaffleCount,
      creator: users.username,
      creatorWalletAddress: users.walletAddress,
      categoryName: categories.name
    }).from(channels)
    .leftJoin(users, eq(channels.creatorId, users.id))
    .leftJoin(categories, eq(channels.categoryId, categories.id))
    .where(eq(channels.isActive, true));
  }

  async getChannelById(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async updateChannel(channelId: number, updateData: Partial<InsertChannel>): Promise<Channel | undefined> {
    const [updatedChannel] = await db.update(channels)
      .set(updateData)
      .where(eq(channels.id, channelId))
      .returning();
    return updatedChannel;
  }

  async isChannelCreator(channelId: number, userId: number): Promise<boolean> {
    const [channel] = await db.select({ creatorId: channels.creatorId })
      .from(channels)
      .where(eq(channels.id, channelId));
    return channel?.creatorId === userId;
  }

  async updateChannelSubscriberCount(channelId: number, count: number): Promise<void> {
    await db.update(channels).set({ subscriberCount: count }).where(eq(channels.id, channelId));
  }

  async getChannelSubscriptionCount(channelId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(channelSubscriptions)
        .where(eq(channelSubscriptions.channelId, channelId));
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting channel subscription count:', error);
      return 0;
    }
  }

  async getUpcomingRafflesByChannel(channelId: number) {
    try {
      const result = await db.select()
        .from(upcomingRaffles)
        .where(eq(upcomingRaffles.channelId, channelId))
        .orderBy(upcomingRaffles.startDate);
      return result;
    } catch (error) {
      console.error('Error getting upcoming raffles by channel:', error);
      return [];
    }
  }

  // Channel Subscription Methods
  async subscribeToChannel(userId: number, channelId: number): Promise<ChannelSubscription> {
    const [subscription] = await db.insert(channelSubscriptions).values({ userId, channelId }).returning();
    
    // Update subscriber count
    const subscriberCount = await db.select({ count: sql`count(*)` }).from(channelSubscriptions).where(eq(channelSubscriptions.channelId, channelId));
    await this.updateChannelSubscriberCount(channelId, Number(subscriberCount[0].count));
    
    return subscription;
  }

  async unsubscribeFromChannel(userId: number, channelId: number): Promise<void> {
    await db.delete(channelSubscriptions).where(
      and(eq(channelSubscriptions.userId, userId), eq(channelSubscriptions.channelId, channelId))
    );
    
    // Update subscriber count
    const subscriberCount = await db.select({ count: sql`count(*)` }).from(channelSubscriptions).where(eq(channelSubscriptions.channelId, channelId));
    await this.updateChannelSubscriberCount(channelId, Number(subscriberCount[0].count));
  }

  async getUserChannelSubscriptions(userId: number): Promise<ChannelSubscription[]> {
    return await db.select().from(channelSubscriptions).where(eq(channelSubscriptions.userId, userId));
  }

  async isUserSubscribedToChannel(userId: number, channelId: number): Promise<boolean> {
    const [subscription] = await db.select().from(channelSubscriptions).where(
      and(eq(channelSubscriptions.userId, userId), eq(channelSubscriptions.channelId, channelId))
    );
    return !!subscription;
  }

  // Upcoming Raffle Methods
  async createUpcomingRaffle(raffleData: InsertUpcomingRaffle & { creatorId: number }): Promise<UpcomingRaffle> {
    const [raffle] = await db.insert(upcomingRaffles).values(raffleData).returning();
    return raffle;
  }

  async getUpcomingRaffles(): Promise<UpcomingRaffle[]> {
    return await db.select().from(upcomingRaffles).where(eq(upcomingRaffles.isActive, true));
  }

  async getUpcomingRaffleById(id: number): Promise<UpcomingRaffle | undefined> {
    const [raffle] = await db.select().from(upcomingRaffles).where(eq(upcomingRaffles.id, id));
    return raffle;
  }

  async updateUpcomingRaffleInterestCount(raffleId: number, count: number): Promise<void> {
    await db.update(upcomingRaffles).set({ interestedCount: count }).where(eq(upcomingRaffles.id, raffleId));
  }

  // Upcoming Raffle Interest Methods
  async addUpcomingRaffleInterest(userId: number, upcomingRaffleId: number): Promise<UpcomingRaffleInterest> {
    const [interest] = await db.insert(upcomingRaffleInterests).values({ userId, upcomingRaffleId }).returning();
    
    // Update interest count
    const interestCount = await db.select({ count: sql`count(*)` }).from(upcomingRaffleInterests).where(eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId));
    await this.updateUpcomingRaffleInterestCount(upcomingRaffleId, Number(interestCount[0].count));
    
    return interest;
  }

  async removeUpcomingRaffleInterest(userId: number, upcomingRaffleId: number): Promise<void> {
    await db.delete(upcomingRaffleInterests).where(
      and(eq(upcomingRaffleInterests.userId, userId), eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId))
    );
    
    // Update interest count
    const interestCount = await db.select({ count: sql`count(*)` }).from(upcomingRaffleInterests).where(eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId));
    await this.updateUpcomingRaffleInterestCount(upcomingRaffleId, Number(interestCount[0].count));
  }

  async isUserInterestedInUpcomingRaffle(userId: number, upcomingRaffleId: number): Promise<boolean> {
    const [interest] = await db.select().from(upcomingRaffleInterests).where(
      and(eq(upcomingRaffleInterests.userId, userId), eq(upcomingRaffleInterests.upcomingRaffleId, upcomingRaffleId))
    );
    return !!interest;
  }
}

export const storage = new DatabaseStorage();
