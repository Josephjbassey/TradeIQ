import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and profiles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatar: text("avatar"),
  // Optional password hash for local auth (pbkdf2 or bcrypt). Not required in demo.
  passwordHash: text("password_hash"),
  timeZone: text("time_zone").default("UTC"),
  currency: text("currency").default("USD"),
  tradingExperience: text("trading_experience"), // "beginner" | "intermediate" | "advanced"
  riskTolerance: text("risk_tolerance"), // "conservative" | "moderate" | "aggressive"
  tradingGoals: text("trading_goals").array(),
  preferences: jsonb("preferences"), // UI preferences, notifications, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Trading accounts for multi-account support
export const tradingAccounts = pgTable("trading_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  broker: text("broker").notNull(),
  accountType: text("account_type").notNull(), // "live" | "demo" | "paper"
  accountNumber: text("account_number"),
  initialBalance: decimal("initial_balance", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  isActive: boolean("is_active").default(true),
  apiKey: text("api_key"), // For broker integrations
  apiSecret: text("api_secret"), // Encrypted
  connectionStatus: text("connection_status").default("disconnected"), // "connected" | "disconnected" | "error"
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enhanced trades table with multi-account support
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => tradingAccounts.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // "buy" | "sell" | "long" | "short"
  quantity: decimal("quantity", { precision: 15, scale: 6 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 4 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 10, scale: 4 }),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  exitDate: timestamp("exit_date"),
  status: text("status").notNull().default("open"), // "open" | "closed" | "cancelled"
  strategy: text("strategy"), // Trading strategy used
  setup: text("setup"), // Market setup/pattern
  timeframe: text("timeframe"), // "1m" | "5m" | "15m" | "1h" | "4h" | "1d"
  pnl: decimal("pnl", { precision: 12, scale: 2 }),
  pnlPercent: decimal("pnl_percent", { precision: 8, scale: 4 }),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  slippage: decimal("slippage", { precision: 8, scale: 4 }),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 4 }),
  takeProfit: decimal("take_profit", { precision: 10, scale: 4 }),
  riskAmount: decimal("risk_amount", { precision: 10, scale: 2 }),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 5, scale: 2 }),
  holdingPeriod: integer("holding_period"), // in minutes
  tags: text("tags").array(),
  notes: text("notes"),
  screenshots: text("screenshots").array(), // URLs to chart screenshots
  isImported: boolean("is_imported").default(false),
  importSource: text("import_source"), // "mt4" | "mt5" | "tradingview" | "csv" | "api"
  externalId: text("external_id"), // ID from external platform
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Trade executions for partial fills and detailed execution tracking
export const tradeExecutions = pgTable("trade_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "entry" | "exit" | "partial"
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 6 }).notNull(),
  executedAt: timestamp("executed_at").notNull(),
  orderId: text("order_id"),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Enhanced AI analyses
export const aiAnalyses = pgTable("ai_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tradeId: varchar("trade_id").references(() => trades.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").references(() => tradingAccounts.id, { onDelete: "cascade" }),
  analysisType: text("analysis_type").notNull(), // "trade" | "portfolio" | "strategy" | "risk" | "performance"
  title: text("title").notNull(),
  insights: jsonb("insights").notNull(),
  recommendations: text("recommendations"),
  score: integer("score"), // 1-10 rating
  categories: text("categories").array(), // ["risk", "timing", "strategy", "psychology"]
  metrics: jsonb("metrics"), // Key performance metrics analyzed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Password reset tokens
export const resetTokens = pgTable("reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Portfolio snapshots with multi-account support
export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").references(() => tradingAccounts.id, { onDelete: "set null" }),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  totalPnl: decimal("total_pnl", { precision: 12, scale: 2 }).notNull(),
  totalTrades: integer("total_trades").notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }),
  avgWin: decimal("avg_win", { precision: 10, scale: 2 }),
  avgLoss: decimal("avg_loss", { precision: 10, scale: 2 }),
  largestWin: decimal("largest_win", { precision: 10, scale: 2 }),
  largestLoss: decimal("largest_loss", { precision: 10, scale: 2 }),
  profitFactor: decimal("profit_factor", { precision: 5, scale: 2 }),
  sharpeRatio: decimal("sharpe_ratio", { precision: 5, scale: 4 }),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }),
  maxDrawdownDuration: integer("max_drawdown_duration"), // days
  calmarRatio: decimal("calmar_ratio", { precision: 5, scale: 4 }),
  kelly: decimal("kelly", { precision: 5, scale: 4 }), // Kelly criterion
  expectancy: decimal("expectancy", { precision: 10, scale: 4 }),
  avgRiskReward: decimal("avg_risk_reward", { precision: 5, scale: 2 }),
  tradingDays: integer("trading_days"),
  avgTradesPerDay: decimal("avg_trades_per_day", { precision: 5, scale: 2 }),
  bestDay: decimal("best_day", { precision: 10, scale: 2 }),
  worstDay: decimal("worst_day", { precision: 10, scale: 2 }),
  consistency: decimal("consistency", { precision: 5, scale: 2 }), // % of profitable days
  date: timestamp("date").notNull().defaultNow(),
});

// Trade copying and social features
export const tradeCopies = pgTable("trade_copies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  toUserId: varchar("to_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromAccountId: varchar("from_account_id").notNull().references(() => tradingAccounts.id, { onDelete: "cascade" }),
  toAccountId: varchar("to_account_id").notNull().references(() => tradingAccounts.id, { onDelete: "cascade" }),
  originalTradeId: varchar("original_trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  copiedTradeId: varchar("copied_trade_id").references(() => trades.id, { onDelete: "set null" }),
  copyRatio: decimal("copy_ratio", { precision: 5, scale: 4 }).default("1"), // Position size multiplier
  status: text("status").notNull(), // "pending" | "executed" | "failed" | "cancelled"
  delay: integer("delay"), // milliseconds delay
  maxRisk: decimal("max_risk", { precision: 5, scale: 2 }), // max % of account to risk
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Following system for traders
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true),
  copySettings: jsonb("copy_settings"), // Auto-copy configuration
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Public trader profiles for social trading
export const traderProfiles = pgTable("trader_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPublic: boolean("is_public").default(false),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  tradingStyle: text("trading_style"),
  specialties: text("specialties").array(),
  verified: boolean("verified").default(false),
  copierCount: integer("copier_count").default(0),
  totalCopiedTrades: integer("total_copied_trades").default(0),
  publicStats: jsonb("public_stats"), // Aggregated performance stats
  monthlyPnl: decimal("monthly_pnl", { precision: 10, scale: 2 }),
  monthlyReturnPercent: decimal("monthly_return_percent", { precision: 5, scale: 2 }),
  maxDrawdownPercent: decimal("max_drawdown_percent", { precision: 5, scale: 2 }),
  winRatePercent: decimal("win_rate_percent", { precision: 5, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  riskScore: integer("risk_score"), // 1-10 scale
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tradingAccounts: many(tradingAccounts),
  trades: many(trades),
  aiAnalyses: many(aiAnalyses),
  portfolioSnapshots: many(portfolioSnapshots),
  traderProfile: many(traderProfiles),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  copyFrom: many(tradeCopies, { relationName: "copyFrom" }),
  copyTo: many(tradeCopies, { relationName: "copyTo" }),
}));

export const tradingAccountsRelations = relations(tradingAccounts, ({ one, many }) => ({
  user: one(users, { fields: [tradingAccounts.userId], references: [users.id] }),
  trades: many(trades),
  portfolioSnapshots: many(portfolioSnapshots),
}));

export const tradesRelations = relations(trades, ({ one, many }) => ({
  user: one(users, { fields: [trades.userId], references: [users.id] }),
  account: one(tradingAccounts, { fields: [trades.accountId], references: [tradingAccounts.id] }),
  executions: many(tradeExecutions),
  analyses: many(aiAnalyses),
  copies: many(tradeCopies),
}));

export const tradeExecutionsRelations = relations(tradeExecutions, ({ one }) => ({
  trade: one(trades, { fields: [tradeExecutions.tradeId], references: [trades.id] }),
}));

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  user: one(users, { fields: [aiAnalyses.userId], references: [users.id] }),
  trade: one(trades, { fields: [aiAnalyses.tradeId], references: [trades.id] }),
  account: one(tradingAccounts, { fields: [aiAnalyses.accountId], references: [tradingAccounts.id] }),
}));

export const portfolioSnapshotsRelations = relations(portfolioSnapshots, ({ one }) => ({
  user: one(users, { fields: [portfolioSnapshots.userId], references: [users.id] }),
  account: one(tradingAccounts, { fields: [portfolioSnapshots.accountId], references: [tradingAccounts.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTradingAccountSchema = createInsertSchema(tradingAccounts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTradeSchema = createInsertSchema(trades).omit({ 
  id: true, 
  pnl: true,
  pnlPercent: true,
  holdingPeriod: true,
  entryDate: true,
  exitDate: true,
  createdAt: true, 
  updatedAt: true 
});

export const insertTradeExecutionSchema = createInsertSchema(tradeExecutions).omit({ 
  id: true, 
  createdAt: true 
});

export const insertAIAnalysisSchema = createInsertSchema(aiAnalyses).omit({ 
  id: true, 
  createdAt: true 
});

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots).omit({ 
  id: true,
  date: true
});

export const insertResetTokenSchema = createInsertSchema(resetTokens).omit({
  id: true,
  createdAt: true
});

export const insertTradeCopySchema = createInsertSchema(tradeCopies).omit({ 
  id: true, 
  createdAt: true 
});

export const insertFollowSchema = createInsertSchema(follows).omit({ 
  id: true, 
  createdAt: true 
});

export const insertTraderProfileSchema = createInsertSchema(traderProfiles).omit({ 
  id: true, 
  updatedAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type TradeExecution = typeof tradeExecutions.$inferSelect;
export type InsertTradeExecution = z.infer<typeof insertTradeExecutionSchema>;
export type AIAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAIAnalysis = z.infer<typeof insertAIAnalysisSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
export type TradeCopy = typeof tradeCopies.$inferSelect;
export type InsertTradeCopy = z.infer<typeof insertTradeCopySchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type TraderProfile = typeof traderProfiles.$inferSelect;
export type InsertTraderProfile = z.infer<typeof insertTraderProfileSchema>;
export type ResetToken = typeof resetTokens.$inferSelect;
export type InsertResetToken = z.infer<typeof insertResetTokenSchema>;