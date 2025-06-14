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
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donationContributions = pgTable("donation_contributions", {
  id: serial("id").primaryKey(),
  donationId: integer("donation_id").references(() => donations.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 6 }).notNull(),
  transactionHash: varchar("transaction_hash", { length: 66 }),
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
});

export const insertRaffleSchema = createInsertSchema(raffles).pick({
  categoryId: true,
  title: true,
  description: true,
  prizeValue: true,
  ticketPrice: true,
  maxTickets: true,
  endDate: true,
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
