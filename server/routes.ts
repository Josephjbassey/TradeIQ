import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTradeSchema, insertAIAnalysisSchema, insertPortfolioSnapshotSchema } from "@shared/schema";
import { analyzeIndividualTrade, analyzePortfolio, generateTradingTips } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Trade routes
  app.get("/api/trades", async (req, res) => {
    try {
      const trades = await storage.getTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.get("/api/trades/:id", async (req, res) => {
    try {
      const trade = await storage.getTrade(req.params.id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trade" });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      const validatedData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(validatedData);
      
      // Calculate P&L if exitPrice is provided
      if (validatedData.exitPrice) {
        const pnl = validatedData.side === 'buy' 
          ? (Number(validatedData.exitPrice) - Number(validatedData.entryPrice)) * validatedData.quantity
          : (Number(validatedData.entryPrice) - Number(validatedData.exitPrice)) * validatedData.quantity;
        
        await storage.updateTrade(trade.id, { 
          pnl: pnl.toString(),
          status: 'closed',
          exitDate: new Date()
        });
      }
      
      res.json(trade);
    } catch (error) {
      res.status(400).json({ message: "Invalid trade data", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch("/api/trades/:id", async (req, res) => {
    try {
      const updates = req.body;
      
      // Calculate P&L if exitPrice is being updated
      if (updates.exitPrice) {
        const trade = await storage.getTrade(req.params.id);
        if (trade) {
          const pnl = trade.side === 'buy' 
            ? (Number(updates.exitPrice) - Number(trade.entryPrice)) * trade.quantity
            : (Number(trade.entryPrice) - Number(updates.exitPrice)) * trade.quantity;
          
          updates.pnl = pnl.toString();
          updates.status = 'closed';
          updates.exitDate = new Date();
        }
      }
      
      const updatedTrade = await storage.updateTrade(req.params.id, updates);
      if (!updatedTrade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json(updatedTrade);
    } catch (error) {
      res.status(400).json({ message: "Failed to update trade" });
    }
  });

  app.delete("/api/trades/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTrade(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json({ message: "Trade deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trade" });
    }
  });

  // AI Analysis routes
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAIAnalyses();
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analyses" });
    }
  });

  app.get("/api/analyses/trade/:tradeId", async (req, res) => {
    try {
      const analyses = await storage.getAIAnalysesByTradeId(req.params.tradeId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trade analyses" });
    }
  });

  app.post("/api/analyses/trade/:tradeId", async (req, res) => {
    try {
      const trade = await storage.getTrade(req.params.tradeId);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      const analysisResult = await analyzeIndividualTrade({
        symbol: trade.symbol,
        side: trade.side as 'buy' | 'sell',
        quantity: trade.quantity,
        entryPrice: Number(trade.entryPrice),
        exitPrice: trade.exitPrice ? Number(trade.exitPrice) : undefined,
        stopLoss: trade.stopLoss ? Number(trade.stopLoss) : undefined,
        takeProfit: trade.takeProfit ? Number(trade.takeProfit) : undefined,
        strategy: trade.strategy || undefined,
        notes: trade.notes || undefined,
        pnl: trade.pnl ? Number(trade.pnl) : undefined,
      });

      const analysis = await storage.createAIAnalysis({
        tradeId: req.params.tradeId,
        analysisType: 'trade_review',
        insights: analysisResult as any,
        recommendations: analysisResult.recommendations.join('\n'),
        confidence: analysisResult.confidence.toString(),
      });

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze trade", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/analyses/portfolio", async (req, res) => {
    try {
      const trades = await storage.getTrades();
      const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl);
      
      if (closedTrades.length === 0) {
        return res.status(400).json({ message: "No closed trades available for analysis" });
      }

      const totalPnl = closedTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
      const winningTrades = closedTrades.filter(t => Number(t.pnl || 0) > 0);
      const winRate = (winningTrades.length / closedTrades.length) * 100;
      const avgProfit = winningTrades.length > 0 
        ? winningTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0) / winningTrades.length 
        : 0;

      const recentTrades = closedTrades.slice(0, 5).map(trade => ({
        symbol: trade.symbol,
        side: trade.side as 'buy' | 'sell',
        quantity: trade.quantity,
        entryPrice: Number(trade.entryPrice),
        exitPrice: trade.exitPrice ? Number(trade.exitPrice) : undefined,
        stopLoss: trade.stopLoss ? Number(trade.stopLoss) : undefined,
        takeProfit: trade.takeProfit ? Number(trade.takeProfit) : undefined,
        strategy: trade.strategy || undefined,
        notes: trade.notes || undefined,
        pnl: trade.pnl ? Number(trade.pnl) : undefined,
      }));

      const analysisResult = await analyzePortfolio({
        totalPnl,
        winRate,
        totalTrades: closedTrades.length,
        avgProfit,
        recentTrades,
      });

      const analysis = await storage.createAIAnalysis({
        tradeId: null,
        analysisType: 'portfolio_analysis',
        insights: analysisResult as any,
        recommendations: [
          ...analysisResult.keyInsights,
          ...analysisResult.improvementAreas,
        ].join('\n'),
        confidence: analysisResult.confidence.toString(),
      });

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze portfolio", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Portfolio snapshot routes
  app.get("/api/portfolio/snapshots", async (req, res) => {
    try {
      const snapshots = await storage.getPortfolioSnapshots();
      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio snapshots" });
    }
  });

  app.get("/api/portfolio/current", async (req, res) => {
    try {
      const trades = await storage.getTrades();
      const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl);
      
      if (closedTrades.length === 0) {
        return res.json({
          totalValue: 10000, // Starting value
          totalPnl: 0,
          winRate: 0,
          totalTrades: 0,
          avgProfit: 0,
          sharpeRatio: null,
          maxDrawdown: null,
          profitFactor: null,
          riskPerTrade: null,
        });
      }

      const totalPnl = closedTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
      const winningTrades = closedTrades.filter(t => Number(t.pnl || 0) > 0);
      const losingTrades = closedTrades.filter(t => Number(t.pnl || 0) < 0);
      const winRate = (winningTrades.length / closedTrades.length) * 100;
      const avgProfit = winningTrades.length > 0 
        ? winningTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0) / winningTrades.length 
        : 0;

      // Calculate additional metrics
      const totalWins = winningTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
      const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0));
      const profitFactor = totalLosses > 0 ? totalWins / totalLosses : null;

      const currentMetrics = {
        totalValue: 10000 + totalPnl, // Assuming starting value of $10,000
        totalPnl,
        winRate,
        totalTrades: closedTrades.length,
        avgProfit,
        sharpeRatio: null, // Would need historical data to calculate properly
        maxDrawdown: null, // Would need historical data to calculate properly
        profitFactor,
        riskPerTrade: 2.0, // Mock value - would calculate based on position sizes
      };

      res.json(currentMetrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate current portfolio metrics" });
    }
  });

  app.post("/api/portfolio/snapshots", async (req, res) => {
    try {
      const validatedData = insertPortfolioSnapshotSchema.parse(req.body);
      const snapshot = await storage.createPortfolioSnapshot(validatedData);
      res.json(snapshot);
    } catch (error) {
      res.status(400).json({ message: "Invalid portfolio snapshot data" });
    }
  });

  // Trading tips route
  app.get("/api/tips", async (req, res) => {
    try {
      const level = (req.query.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner';
      const tips = await generateTradingTips(level);
      res.json({ tips });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate trading tips", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
