import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  profession: varchar("profession", { length: 100 }),
  bio: text("bio"),
  profileImage: text("profile_image"),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  ratingCount: integer("rating_count").default(0),
  // New organization fields
  organizationType: varchar("organization_type", { length: 20 }).default("individual"), // individual, foundation, association, official
  organizationName: varchar("organization_name", { length: 200 }),
  verificationUrl: text("verification_url"),
  isVerified: boolean("is_verified").default(false),
  country: varchar("country", { length: 3 }), // ISO country code
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
});

export const raffles = pgTable("raffles", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  prizeValue: decimal("prize_value", { precision: 10, scale: 6 }).notNull(),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 6 }).notNull(),
  maxTickets: integer("max_tickets").notNull(),
  ticketsSold: integer("tickets_sold").default(0),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  winnerId: integer("winner_id").references(() => users.id),
  isApprovedByCreator: boolean("is_approved_by_creator").default(false),
  isApprovedByWinner: boolean("is_approved_by_winner").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id").references(() => raffles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 6 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 66 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  goalAmount: decimal("goal_amount", { precision: 10, scale: 6 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 6 }).default("0"),
  donorCount: integer("donor_count").default(0),
  endDate: timestamp("end_date"), // Now nullable for unlimited donations
  isActive: boolean("is_active").default(true),
  // New donation system fields
  isUnlimited: boolean("is_unlimited").default(false),
  commissionRate: decimal("commission_rate", { precision: 3, scale: 2 }).default("10.0"), // 10% for individual, 2% for organizations
  startupFee: decimal("startup_fee", { precision: 10, scale: 6 }).default("0"), // 100 USDT for unlimited
  startupFeePaid: boolean("startup_fee_paid").default(false),
  totalCommissionCollected: decimal("total_commission_collected", { precision: 10, scale: 6 }).default("0"),
  category: varchar("category", { length: 50 }).default("general"), // health, education, disaster, etc.
  country: varchar("country", { length: 3 }), // For flag display
  createdAt: timestamp("created_at").defaultNow(),
});

export const donationContributions = pgTable("donation_contributions", {
  id: serial("id").primaryKey(),
  donationId: integer("donation_id").references(() => donations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 6 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 6 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 6 }).notNull(), // amount - commission
  transactionHash: varchar("transaction_hash", { length: 66 }),
  blockNumber: integer("block_number"),
  donorCountry: varchar("donor_country", { length: 3 }), // For live chart display
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  raterId: integer("rater_id").references(() => users.id).notNull(),
  ratedId: integer("rated_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id").references(() => raffles.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  rafflesCreated: many(raffles, { relationName: "raffles_creator" }),
  rafflesWon: many(raffles, { relationName: "raffles_winner" }),
  tickets: many(tickets),
  donationsCreated: many(donations),
  donationContributions: many(donationContributions),
  ratingsGiven: many(userRatings, { relationName: "ratings_rater" }),
  ratingsReceived: many(userRatings, { relationName: "ratings_rated" }),
  sentMessages: many(chatMessages, { relationName: "messages_sender" }),
  receivedMessages: many(chatMessages, { relationName: "messages_receiver" }),
  following: many(follows, { relationName: "follows_follower" }),
  followers: many(follows, { relationName: "follows_following" }),
}));

export const rafflesRelations = relations(raffles, ({ one, many }) => ({
  creator: one(users, {
    fields: [raffles.creatorId],
    references: [users.id],
    relationName: "raffles_creator",
  }),
  winner: one(users, {
    fields: [raffles.winnerId],
    references: [users.id],
    relationName: "raffles_winner",
  }),
  category: one(categories, {
    fields: [raffles.categoryId],
    references: [categories.id],
  }),
  tickets: many(tickets),
  chatMessages: many(chatMessages),
}));

export const donationsRelations = relations(donations, ({ one, many }) => ({
  creator: one(users, {
    fields: [donations.creatorId],
    references: [users.id],
  }),
  contributions: many(donationContributions),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  username: true,
  name: true,
  profession: true,
  bio: true,
  profileImage: true,
}).extend({
  walletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format")
    .min(42, "Wallet address must be 42 characters")
    .max(42, "Wallet address must be 42 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscore and dash"),
  name: z.string().max(100, "Name must be less than 100 characters").optional(),
  profession: z.string().max(100, "Profession must be less than 100 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const insertRaffleSchema = createInsertSchema(raffles).pick({
  categoryId: true,
  title: true,
  description: true,
  prizeValue: true,
  ticketPrice: true,
  maxTickets: true,
  endDate: true,
}).extend({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s\-_.!?()&]+$/, "Title contains invalid characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  prizeValue: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Prize value must be a valid number with up to 2 decimal places")
    .refine(val => parseFloat(val) > 0 && parseFloat(val) <= 10000000, "Prize value must be between $1 and $10,000,000"),
  ticketPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Ticket price must be a valid number with up to 2 decimal places")
    .refine(val => parseFloat(val) >= 0.01 && parseFloat(val) <= 100000, "Ticket price must be between $0.01 and $100,000"),
  maxTickets: z.number()
    .int("Max tickets must be a whole number")
    .min(1, "Must have at least 1 ticket")
    .max(1000000, "Cannot exceed 1,000,000 tickets"),
  categoryId: z.number()
    .int("Category ID must be a whole number")
    .min(1, "Invalid category selected"),
});

export const insertDonationSchema = createInsertSchema(donations).pick({
  title: true,
  description: true,
  goalAmount: true,
  endDate: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  raffleId: true,
  quantity: true,
  totalAmount: true,
  transactionHash: true,
});

export const insertDonationContributionSchema = createInsertSchema(donationContributions).pick({
  donationId: true,
  amount: true,
  transactionHash: true,
});

export const insertUserRatingSchema = createInsertSchema(userRatings).pick({
  ratedId: true,
  rating: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Raffle = typeof raffles.$inferSelect;
export type InsertRaffle = z.infer<typeof insertRaffleSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type DonationContribution = typeof donationContributions.$inferSelect;
export type InsertDonationContribution = z.infer<typeof insertDonationContributionSchema>;
export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;
export type Category = typeof categories.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
