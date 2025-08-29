import { 
  User, 
  InsertUser,
  TradingAccount, 
  InsertTradingAccount,
  Trade, 
  InsertTrade, 
  AIAnalysis, 
  InsertAIAnalysis, 
  PortfolioSnapshot, 
  InsertPortfolioSnapshot,
  TraderProfile,
  InsertTraderProfile,
  Follow,
  InsertFollow,
  TradeCopy,
  InsertTradeCopy,
  ResetToken,
  InsertResetToken
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, avg, sum, max, min, or, asc, ne } from "drizzle-orm";
import * as schema from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Trading Account methods
  getTradingAccounts(userId: string): Promise<TradingAccount[]>;
  getTradingAccount(id: string): Promise<TradingAccount | undefined>;
  createTradingAccount(account: InsertTradingAccount): Promise<TradingAccount>;
  updateTradingAccount(id: string, updates: Partial<TradingAccount>): Promise<TradingAccount | undefined>;
  deleteTradingAccount(id: string): Promise<boolean>;
  
  // Trade methods
  getTrades(userId?: string, accountId?: string): Promise<Trade[]>;
  getTrade(id: string): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined>;
  deleteTrade(id: string): Promise<boolean>;
  
  // AI Analysis methods
  getAIAnalyses(userId?: string, accountId?: string): Promise<AIAnalysis[]>;
  getAIAnalysis(id: string): Promise<AIAnalysis | undefined>;
  getAIAnalysesByTradeId(tradeId: string): Promise<AIAnalysis[]>;
  createAIAnalysis(analysis: InsertAIAnalysis): Promise<AIAnalysis>;
  
  // Portfolio methods
  getPortfolioSnapshots(userId?: string, accountId?: string): Promise<PortfolioSnapshot[]>;
  getLatestPortfolioSnapshot(userId?: string, accountId?: string): Promise<PortfolioSnapshot | undefined>;
  createPortfolioSnapshot(snapshot: InsertPortfolioSnapshot): Promise<PortfolioSnapshot>;
  
  // Social trading methods
  getTraderProfile(userId: string): Promise<TraderProfile | undefined>;
  getPublicTraderProfiles(limit?: number): Promise<TraderProfile[]>;
  createTraderProfile(profile: InsertTraderProfile): Promise<TraderProfile>;
  updateTraderProfile(userId: string, updates: Partial<TraderProfile>): Promise<TraderProfile | undefined>;
  
  // Follow methods
  getFollowing(userId: string): Promise<Follow[]>;
  getFollowers(userId: string): Promise<Follow[]>;
  follow(followData: InsertFollow): Promise<Follow>;
  unfollow(followerId: string, followingId: string): Promise<boolean>;
  
  // Trade copy methods
  getTradeCopies(userId: string, type: "from" | "to"): Promise<TradeCopy[]>;
  createTradeCopy(copy: InsertTradeCopy): Promise<TradeCopy>;
  updateTradeCopy(id: string, updates: Partial<TradeCopy>): Promise<TradeCopy | undefined>;

  // Auth helpers
  createResetToken(token: InsertResetToken): Promise<ResetToken>;
  getResetToken(token: string): Promise<ResetToken | undefined>;
  markResetTokenUsed(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(schema.users)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(schema.users.id, id))
      .returning();
    return user || undefined;
  }

  // Trading Account methods
  async getTradingAccounts(userId: string): Promise<TradingAccount[]> {
    return await db
      .select()
      .from(schema.tradingAccounts)
      .where(eq(schema.tradingAccounts.userId, userId))
      .orderBy(desc(schema.tradingAccounts.createdAt));
  }

  async getTradingAccount(id: string): Promise<TradingAccount | undefined> {
    const [account] = await db
      .select()
      .from(schema.tradingAccounts)
      .where(eq(schema.tradingAccounts.id, id));
    return account || undefined;
  }

  async createTradingAccount(insertAccount: InsertTradingAccount): Promise<TradingAccount> {
    const [account] = await db
      .insert(schema.tradingAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateTradingAccount(id: string, updates: Partial<TradingAccount>): Promise<TradingAccount | undefined> {
    const [account] = await db
      .update(schema.tradingAccounts)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(schema.tradingAccounts.id, id))
      .returning();
    return account || undefined;
  }

  async deleteTradingAccount(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.tradingAccounts)
      .where(eq(schema.tradingAccounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Trade methods
  async getTrades(userId?: string, accountId?: string): Promise<Trade[]> {
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(schema.trades.userId, userId));
    }
    if (accountId) {
      conditions.push(eq(schema.trades.accountId, accountId));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(schema.trades)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(schema.trades.entryDate));
    }
    
    return await db
      .select()
      .from(schema.trades)
      .orderBy(desc(schema.trades.entryDate));
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    const [trade] = await db
      .select()
      .from(schema.trades)
      .where(eq(schema.trades.id, id));
    return trade || undefined;
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const [trade] = await db
      .insert(schema.trades)
      .values(insertTrade)
      .returning();
    return trade;
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined> {
    const [trade] = await db
      .update(schema.trades)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(schema.trades.id, id))
      .returning();
    return trade || undefined;
  }

  async deleteTrade(id: string): Promise<boolean> {
    const result = await db
      .delete(schema.trades)
      .where(eq(schema.trades.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // AI Analysis methods
  async getAIAnalyses(userId?: string, accountId?: string): Promise<AIAnalysis[]> {
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(schema.aiAnalyses.userId, userId));
    }
    if (accountId) {
      conditions.push(eq(schema.aiAnalyses.accountId, accountId));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(schema.aiAnalyses)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(schema.aiAnalyses.createdAt));
    }
    
    return await db
      .select()
      .from(schema.aiAnalyses)
      .orderBy(desc(schema.aiAnalyses.createdAt));
  }

  async getAIAnalysis(id: string): Promise<AIAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(schema.aiAnalyses)
      .where(eq(schema.aiAnalyses.id, id));
    return analysis || undefined;
  }

  async getAIAnalysesByTradeId(tradeId: string): Promise<AIAnalysis[]> {
    return await db
      .select()
      .from(schema.aiAnalyses)
      .where(eq(schema.aiAnalyses.tradeId, tradeId))
      .orderBy(desc(schema.aiAnalyses.createdAt));
  }

  async createAIAnalysis(insertAnalysis: InsertAIAnalysis): Promise<AIAnalysis> {
    const [analysis] = await db
      .insert(schema.aiAnalyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  // Portfolio methods
  async getPortfolioSnapshots(userId?: string, accountId?: string): Promise<PortfolioSnapshot[]> {
    if (userId && accountId) {
      return await db
        .select()
        .from(schema.portfolioSnapshots)
        .where(and(
          eq(schema.portfolioSnapshots.userId, userId),
          eq(schema.portfolioSnapshots.accountId, accountId)
        ))
        .orderBy(desc(schema.portfolioSnapshots.date));
    } else if (userId) {
      return await db
        .select()
        .from(schema.portfolioSnapshots)
        .where(eq(schema.portfolioSnapshots.userId, userId))
        .orderBy(desc(schema.portfolioSnapshots.date));
    } else if (accountId) {
      return await db
        .select()
        .from(schema.portfolioSnapshots)
        .where(eq(schema.portfolioSnapshots.accountId, accountId))
        .orderBy(desc(schema.portfolioSnapshots.date));
    }
    
    return await db
      .select()
      .from(schema.portfolioSnapshots)
      .orderBy(desc(schema.portfolioSnapshots.date));
  }

  async getLatestPortfolioSnapshot(userId?: string, accountId?: string): Promise<PortfolioSnapshot | undefined> {
    const snapshots = await this.getPortfolioSnapshots(userId, accountId);
    return snapshots[0];
  }

  async createPortfolioSnapshot(insertSnapshot: InsertPortfolioSnapshot): Promise<PortfolioSnapshot> {
    const [snapshot] = await db
      .insert(schema.portfolioSnapshots)
      .values(insertSnapshot)
      .returning();
    return snapshot;
  }

  // Social trading methods
  async getTraderProfile(userId: string): Promise<TraderProfile | undefined> {
    const [profile] = await db
      .select()
      .from(schema.traderProfiles)
      .where(eq(schema.traderProfiles.userId, userId));
    return profile || undefined;
  }

  async getPublicTraderProfiles(limit: number = 20): Promise<TraderProfile[]> {
    return await db
      .select()
      .from(schema.traderProfiles)
      .where(eq(schema.traderProfiles.isPublic, true))
      .orderBy(desc(schema.traderProfiles.rating))
      .limit(limit);
  }

  async createTraderProfile(insertProfile: InsertTraderProfile): Promise<TraderProfile> {
    const [profile] = await db
      .insert(schema.traderProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateTraderProfile(userId: string, updates: Partial<TraderProfile>): Promise<TraderProfile | undefined> {
    const [profile] = await db
      .update(schema.traderProfiles)
      .set({ ...updates, updatedAt: sql`NOW()` })
      .where(eq(schema.traderProfiles.userId, userId))
      .returning();
    return profile || undefined;
  }

  // Follow methods
  async getFollowing(userId: string): Promise<Follow[]> {
    return await db
      .select()
      .from(schema.follows)
      .where(and(
        eq(schema.follows.followerId, userId),
        eq(schema.follows.isActive, true)
      ))
      .orderBy(desc(schema.follows.createdAt));
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    return await db
      .select()
      .from(schema.follows)
      .where(and(
        eq(schema.follows.followingId, userId),
        eq(schema.follows.isActive, true)
      ))
      .orderBy(desc(schema.follows.createdAt));
  }

  async follow(insertFollow: InsertFollow): Promise<Follow> {
    // First check if already following
    const [existing] = await db
      .select()
      .from(schema.follows)
      .where(and(
        eq(schema.follows.followerId, insertFollow.followerId),
        eq(schema.follows.followingId, insertFollow.followingId)
      ));

    if (existing) {
      // Reactivate if exists
      const [follow] = await db
        .update(schema.follows)
        .set({ isActive: true })
        .where(eq(schema.follows.id, existing.id))
        .returning();
      return follow;
    }

    const [follow] = await db
      .insert(schema.follows)
      .values(insertFollow)
      .returning();
    return follow;
  }

  async unfollow(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .update(schema.follows)
      .set({ isActive: false })
      .where(and(
        eq(schema.follows.followerId, followerId),
        eq(schema.follows.followingId, followingId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  // Trade copy methods
  async getTradeCopies(userId: string, type: "from" | "to"): Promise<TradeCopy[]> {
    const field = type === "from" ? schema.tradeCopies.fromUserId : schema.tradeCopies.toUserId;
    
    return await db
      .select()
      .from(schema.tradeCopies)
      .where(eq(field, userId))
      .orderBy(desc(schema.tradeCopies.createdAt));
  }

  async createTradeCopy(insertCopy: InsertTradeCopy): Promise<TradeCopy> {
    const [copy] = await db
      .insert(schema.tradeCopies)
      .values(insertCopy)
      .returning();
    return copy;
  }

  async updateTradeCopy(id: string, updates: Partial<TradeCopy>): Promise<TradeCopy | undefined> {
    const [copy] = await db
      .update(schema.tradeCopies)
      .set(updates)
      .where(eq(schema.tradeCopies.id, id))
      .returning();
    return copy || undefined;
  }

  // Auth helpers
  async createResetToken(insertToken: InsertResetToken): Promise<ResetToken> {
    const [row] = await db.insert(schema.resetTokens).values(insertToken).returning();
    return row;
  }

  async getResetToken(token: string): Promise<ResetToken | undefined> {
    const [row] = await db.select().from(schema.resetTokens).where(eq(schema.resetTokens.token, token));
    return row || undefined;
  }

  async markResetTokenUsed(id: string): Promise<void> {
    await db.update(schema.resetTokens).set({ used: true }).where(eq(schema.resetTokens.id, id));
  }

  // Portfolio calculation methods
  async calculatePortfolioMetrics(userId: string, accountId?: string): Promise<any> {
    const trades = await this.getTrades(userId, accountId);
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== null);
    
    if (closedTrades.length === 0) {
      return {
        totalValue: 10000, // Default starting value
        totalPnl: 0,
        totalTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        expectancy: 0
      };
    }

    const pnls = closedTrades.map(t => Number(t.pnl));
    const winningTrades = pnls.filter(p => p > 0);
    const losingTrades = pnls.filter(p => p < 0);
    
    const totalPnl = pnls.reduce((sum, pnl) => sum + pnl, 0);
    const winRate = (winningTrades.length / closedTrades.length) * 100;
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, p) => sum + p, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, p) => sum + p, 0) / losingTrades.length) : 0;
    const profitFactor = avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : 0;
    const largestWin = Math.max(...pnls);
    const largestLoss = Math.min(...pnls);
    
    // Calculate drawdown
    let runningSum = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    pnls.forEach(pnl => {
      runningSum += pnl;
      if (runningSum > peak) {
        peak = runningSum;
      }
      const drawdown = peak - runningSum;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
    
    return {
      totalValue: 10000 + totalPnl,
      totalPnl,
      totalTrades: closedTrades.length,
      winRate: Number(winRate.toFixed(2)),
      avgWin: Number(avgWin.toFixed(2)),
      avgLoss: Number(avgLoss.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
      largestWin: Number(largestWin.toFixed(2)),
      largestLoss: Number(largestLoss.toFixed(2)),
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      sharpeRatio: 0, // Would need daily returns to calculate properly
      expectancy: Number(expectancy.toFixed(2))
    };
  }
}

export const storage = new DatabaseStorage();