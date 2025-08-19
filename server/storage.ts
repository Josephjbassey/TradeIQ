import { type Trade, type InsertTrade, type AIAnalysis, type InsertAIAnalysis, type PortfolioSnapshot, type InsertPortfolioSnapshot } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Trade methods
  getTrades(): Promise<Trade[]>;
  getTrade(id: string): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined>;
  deleteTrade(id: string): Promise<boolean>;
  
  // AI Analysis methods
  getAIAnalyses(): Promise<AIAnalysis[]>;
  getAIAnalysis(id: string): Promise<AIAnalysis | undefined>;
  getAIAnalysesByTradeId(tradeId: string): Promise<AIAnalysis[]>;
  createAIAnalysis(analysis: InsertAIAnalysis): Promise<AIAnalysis>;
  
  // Portfolio methods
  getPortfolioSnapshots(): Promise<PortfolioSnapshot[]>;
  getLatestPortfolioSnapshot(): Promise<PortfolioSnapshot | undefined>;
  createPortfolioSnapshot(snapshot: InsertPortfolioSnapshot): Promise<PortfolioSnapshot>;
}

export class MemStorage implements IStorage {
  private trades: Map<string, Trade> = new Map();
  private aiAnalyses: Map<string, AIAnalysis> = new Map();
  private portfolioSnapshots: Map<string, PortfolioSnapshot> = new Map();

  // Trade methods
  async getTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values()).sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = {
      ...insertTrade,
      id,
      pnl: null,
      entryDate: new Date(),
      exitDate: null,
      status: insertTrade.status || "open",
    };
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined> {
    const trade = this.trades.get(id);
    if (!trade) return undefined;

    const updatedTrade = { ...trade, ...updates };
    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }

  async deleteTrade(id: string): Promise<boolean> {
    return this.trades.delete(id);
  }

  // AI Analysis methods
  async getAIAnalyses(): Promise<AIAnalysis[]> {
    return Array.from(this.aiAnalyses.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAIAnalysis(id: string): Promise<AIAnalysis | undefined> {
    return this.aiAnalyses.get(id);
  }

  async getAIAnalysesByTradeId(tradeId: string): Promise<AIAnalysis[]> {
    return Array.from(this.aiAnalyses.values())
      .filter(analysis => analysis.tradeId === tradeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAIAnalysis(insertAnalysis: InsertAIAnalysis): Promise<AIAnalysis> {
    const id = randomUUID();
    const analysis: AIAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
      tradeId: insertAnalysis.tradeId || null,
    };
    this.aiAnalyses.set(id, analysis);
    return analysis;
  }

  // Portfolio methods
  async getPortfolioSnapshots(): Promise<PortfolioSnapshot[]> {
    return Array.from(this.portfolioSnapshots.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getLatestPortfolioSnapshot(): Promise<PortfolioSnapshot | undefined> {
    const snapshots = await this.getPortfolioSnapshots();
    return snapshots[0];
  }

  async createPortfolioSnapshot(insertSnapshot: InsertPortfolioSnapshot): Promise<PortfolioSnapshot> {
    const id = randomUUID();
    const snapshot: PortfolioSnapshot = {
      ...insertSnapshot,
      id,
      date: new Date(),
      totalTrades: insertSnapshot.totalTrades || 0,
      winRate: insertSnapshot.winRate || null,
      avgProfit: insertSnapshot.avgProfit || null,
      sharpeRatio: insertSnapshot.sharpeRatio || null,
      maxDrawdown: insertSnapshot.maxDrawdown || null,
      profitFactor: insertSnapshot.profitFactor || null,
      riskPerTrade: insertSnapshot.riskPerTrade || null,
    };
    this.portfolioSnapshots.set(id, snapshot);
    return snapshot;
  }
}

export const storage = new MemStorage();
