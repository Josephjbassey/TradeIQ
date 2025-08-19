import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy' or 'sell'
  quantity: integer("quantity").notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 10, scale: 2 }),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }),
  takeProfit: decimal("take_profit", { precision: 10, scale: 2 }),
  strategy: text("strategy"),
  notes: text("notes"),
  pnl: decimal("pnl", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("open"), // 'open' or 'closed'
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  exitDate: timestamp("exit_date"),
});

export const aiAnalyses = pgTable("ai_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").references(() => trades.id),
  analysisType: text("analysis_type").notNull(), // 'trade_review', 'pattern_recognition', 'risk_assessment'
  insights: jsonb("insights").notNull(),
  recommendations: text("recommendations"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  totalPnl: decimal("total_pnl", { precision: 12, scale: 2 }).notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }),
  totalTrades: integer("total_trades").notNull().default(0),
  avgProfit: decimal("avg_profit", { precision: 10, scale: 2 }),
  sharpeRatio: decimal("sharpe_ratio", { precision: 5, scale: 2 }),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }),
  profitFactor: decimal("profit_factor", { precision: 5, scale: 2 }),
  riskPerTrade: decimal("risk_per_trade", { precision: 5, scale: 2 }),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  pnl: true,
  entryDate: true,
  exitDate: true,
});

export const insertAIAnalysisSchema = createInsertSchema(aiAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots).omit({
  id: true,
  date: true,
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type AIAnalysis = typeof aiAnalyses.$inferSelect;
export type InsertAIAnalysis = z.infer<typeof insertAIAnalysisSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
