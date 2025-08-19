import express, { Request, Response } from "express";
import { storage } from "./storage";
import { insertTradeSchema, insertTradingAccountSchema, insertUserSchema, insertAIAnalysisSchema, insertPortfolioSnapshotSchema, insertTraderProfileSchema, insertFollowSchema, insertTradeCopySchema } from "@shared/schema";
import OpenAI from "openai";

const router = express.Router();

// Mock OpenAI instance for demo - In production, use real API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "demo-key"
});

// Helper function for OpenAI analysis (mock for demo)
async function generateAIAnalysis(analysisType: string, data: any) {
  // In production, make actual OpenAI API call
  // For demo, return structured mock analysis
  const mockAnalyses = {
    trade: {
      title: "Trade Performance Analysis",
      insights: {
        strengths: ["Good entry timing", "Proper risk management"],
        weaknesses: ["Exit could be improved", "Position size too large"],
        pattern: "Bullish breakout pattern identified",
        psychology: "Shows patience in trade execution"
      },
      recommendations: "Consider reducing position size by 20% and setting tighter stop losses.",
      score: Math.floor(Math.random() * 3) + 7, // 7-10
      categories: ["timing", "risk", "strategy"],
      metrics: {
        riskRewardRatio: 2.5,
        winProbability: 0.75,
        marketCondition: "trending"
      }
    },
    portfolio: {
      title: "Portfolio Performance Review",
      insights: {
        performance: "Strong monthly performance with consistent growth",
        diversification: "Good sector diversification, low correlation risk",
        riskMetrics: "Drawdowns well controlled within acceptable limits",
        trends: "Improving win rate and profit factor over time"
      },
      recommendations: "Maintain current strategy but consider adding defensive positions during high volatility periods.",
      score: Math.floor(Math.random() * 2) + 8, // 8-10
      categories: ["performance", "risk", "diversification"],
      metrics: {
        sharpeRatio: 1.8,
        maxDrawdown: 0.12,
        winRate: 0.68,
        profitFactor: 2.1
      }
    },
    strategy: {
      title: "Trading Strategy Assessment",
      insights: {
        consistency: "Strategy shows good consistency across different market conditions",
        edge: "Clear statistical edge demonstrated in backtest results",
        execution: "Good execution discipline with minimal slippage",
        adaptation: "Strategy adapts well to changing market regimes"
      },
      recommendations: "Consider implementing dynamic position sizing based on volatility.",
      score: Math.floor(Math.random() * 2) + 8, // 8-10
      categories: ["strategy", "execution", "consistency"],
      metrics: {
        consistency: 0.85,
        marketBeta: 0.6,
        informationRatio: 1.2
      }
    }
  };

  return mockAnalyses[analysisType as keyof typeof mockAnalyses] || mockAnalyses.trade;
}

// User routes
router.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/api/users", async (req: Request, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Invalid user data", details: error });
  }
});

router.patch("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await storage.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Trading Accounts routes
router.get("/api/trading-accounts", async (req: Request, res: Response) => {
  try {
    // In production, get userId from authentication middleware
    const userId = req.query.userId as string || "demo-user-123";
    const accounts = await storage.getTradingAccounts(userId);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trading accounts" });
  }
});

router.get("/api/trading-accounts/:id", async (req: Request, res: Response) => {
  try {
    const account = await storage.getTradingAccount(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Trading account not found" });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trading account" });
  }
});

router.post("/api/trading-accounts", async (req: Request, res: Response) => {
  try {
    const accountData = insertTradingAccountSchema.parse(req.body);
    const account = await storage.createTradingAccount(accountData);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: "Invalid account data", details: error });
  }
});

router.patch("/api/trading-accounts/:id", async (req: Request, res: Response) => {
  try {
    const account = await storage.updateTradingAccount(req.params.id, req.body);
    if (!account) {
      return res.status(404).json({ error: "Trading account not found" });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to update trading account" });
  }
});

router.delete("/api/trading-accounts/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteTradingAccount(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Trading account not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete trading account" });
  }
});

// Trade routes
router.get("/api/trades", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const accountId = req.query.accountId as string;
    const trades = await storage.getTrades(userId, accountId);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

router.get("/api/trades/:id", async (req: Request, res: Response) => {
  try {
    const trade = await storage.getTrade(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trade" });
  }
});

router.post("/api/trades", async (req: Request, res: Response) => {
  try {
    const tradeData = insertTradeSchema.parse(req.body);
    
    // Calculate P&L if trade is closed
    if (tradeData.status === "closed" && tradeData.exitPrice) {
      const entryValue = Number(tradeData.entryPrice) * Number(tradeData.quantity);
      const exitValue = Number(tradeData.exitPrice) * Number(tradeData.quantity);
      const pnl = tradeData.side === "buy" ? exitValue - entryValue : entryValue - exitValue;
      const pnlPercent = (pnl / entryValue) * 100;
      
      tradeData.pnl = pnl.toString();
      tradeData.pnlPercent = pnlPercent.toString();
    }

    const trade = await storage.createTrade(tradeData);
    
    // Generate AI analysis for closed trades
    if (trade.status === "closed") {
      try {
        const analysis = await generateAIAnalysis("trade", trade);
        await storage.createAIAnalysis({
          userId: trade.userId,
          tradeId: trade.id,
          accountId: trade.accountId,
          analysisType: "trade",
          title: analysis.title,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          score: analysis.score,
          categories: analysis.categories,
          metrics: analysis.metrics
        });
      } catch (analysisError) {
        console.error("Failed to generate AI analysis:", analysisError);
      }
    }
    
    res.status(201).json(trade);
  } catch (error) {
    res.status(400).json({ error: "Invalid trade data", details: error });
  }
});

router.patch("/api/trades/:id", async (req: Request, res: Response) => {
  try {
    // Calculate P&L if updating to closed status
    if (req.body.status === "closed" && req.body.exitPrice) {
      const existingTrade = await storage.getTrade(req.params.id);
      if (existingTrade) {
        const entryValue = Number(existingTrade.entryPrice) * Number(existingTrade.quantity);
        const exitValue = Number(req.body.exitPrice) * Number(existingTrade.quantity);
        const pnl = existingTrade.side === "buy" ? exitValue - entryValue : entryValue - exitValue;
        const pnlPercent = (pnl / entryValue) * 100;
        
        req.body.pnl = pnl.toString();
        req.body.pnlPercent = pnlPercent.toString();
        req.body.exitDate = new Date();
      }
    }
    
    const trade = await storage.updateTrade(req.params.id, req.body);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: "Failed to update trade" });
  }
});

router.delete("/api/trades/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteTrade(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete trade" });
  }
});

// AI Analysis routes
router.get("/api/ai-analyses", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const accountId = req.query.accountId as string;
    const analyses = await storage.getAIAnalyses(userId, accountId);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI analyses" });
  }
});

router.get("/api/trades/:tradeId/analyses", async (req: Request, res: Response) => {
  try {
    const analyses = await storage.getAIAnalysesByTradeId(req.params.tradeId);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trade analyses" });
  }
});

router.post("/api/ai-analyses", async (req: Request, res: Response) => {
  try {
    const analysisData = insertAIAnalysisSchema.parse(req.body);
    const analysis = await storage.createAIAnalysis(analysisData);
    res.status(201).json(analysis);
  } catch (error) {
    res.status(400).json({ error: "Invalid analysis data", details: error });
  }
});

// Generate AI analysis endpoint
router.post("/api/ai-analyses/generate", async (req: Request, res: Response) => {
  try {
    const { type, userId, accountId, tradeId } = req.body;
    
    let analysisData: any;
    if (type === "trade" && tradeId) {
      const trade = await storage.getTrade(tradeId);
      analysisData = await generateAIAnalysis("trade", trade);
    } else if (type === "portfolio" && userId) {
      const trades = await storage.getTrades(userId, accountId);
      analysisData = await generateAIAnalysis("portfolio", trades);
    } else if (type === "strategy" && userId) {
      const trades = await storage.getTrades(userId, accountId);
      analysisData = await generateAIAnalysis("strategy", trades);
    } else {
      return res.status(400).json({ error: "Invalid analysis request" });
    }
    
    const analysis = await storage.createAIAnalysis({
      userId,
      tradeId: tradeId || null,
      accountId: accountId || null,
      analysisType: type,
      title: analysisData.title,
      insights: analysisData.insights,
      recommendations: analysisData.recommendations,
      score: analysisData.score,
      categories: analysisData.categories,
      metrics: analysisData.metrics
    });
    
    res.status(201).json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate AI analysis", details: error });
  }
});

// Portfolio routes
router.get("/api/portfolio-snapshots", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const accountId = req.query.accountId as string;
    const snapshots = await storage.getPortfolioSnapshots(userId, accountId);
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolio snapshots" });
  }
});

router.get("/api/portfolio-snapshots/latest", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const accountId = req.query.accountId as string;
    const snapshot = await storage.getLatestPortfolioSnapshot(userId, accountId);
    if (!snapshot) {
      // Generate portfolio metrics if no snapshot exists
      const metrics = await (storage as any).calculatePortfolioMetrics(userId, accountId);
      return res.json(metrics);
    }
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest portfolio snapshot" });
  }
});

router.post("/api/portfolio-snapshots", async (req: Request, res: Response) => {
  try {
    const snapshotData = insertPortfolioSnapshotSchema.parse(req.body);
    const snapshot = await storage.createPortfolioSnapshot(snapshotData);
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(400).json({ error: "Invalid snapshot data", details: error });
  }
});

// Social Trading routes
router.get("/api/social/top-traders", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const profiles = await storage.getPublicTraderProfiles(limit);
    
    // Mock data for demo - In production, fetch from database
    const mockTopTraders = [
      {
        id: "1",
        userId: "trader-1",
        displayName: "Alex Chen",
        bio: "Professional day trader specializing in tech stocks and crypto",
        tradingStyle: "Day Trading",
        specialties: ["Tech Stocks", "Crypto", "Options"],
        verified: true,
        copierCount: 1247,
        totalCopiedTrades: 3420,
        monthlyPnl: 45600,
        monthlyReturnPercent: 18.5,
        maxDrawdownPercent: 8.2,
        winRatePercent: 72,
        rating: 4.8,
        riskScore: 6,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      },
      {
        id: "2",
        userId: "trader-2",
        displayName: "Sarah Johnson",
        bio: "Conservative swing trader with 10 years experience",
        tradingStyle: "Swing Trading",
        specialties: ["Blue Chips", "Dividends", "ETFs"],
        verified: true,
        copierCount: 892,
        totalCopiedTrades: 1560,
        monthlyPnl: 23400,
        monthlyReturnPercent: 12.3,
        maxDrawdownPercent: 4.1,
        winRatePercent: 68,
        rating: 4.6,
        riskScore: 3,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
      },
      {
        id: "3",
        userId: "trader-3",
        displayName: "Mike Rodriguez",
        bio: "Forex specialist trading major currency pairs",
        tradingStyle: "Scalping",
        specialties: ["Forex", "Commodities", "Futures"],
        verified: false,
        copierCount: 634,
        totalCopiedTrades: 2890,
        monthlyPnl: 38900,
        monthlyReturnPercent: 22.1,
        maxDrawdownPercent: 12.5,
        winRatePercent: 58,
        rating: 4.2,
        riskScore: 8,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
      }
    ];
    
    res.json(mockTopTraders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top traders" });
  }
});

router.get("/api/social/following", async (req: Request, res: Response) => {
  try {
    // In production, get userId from authentication
    const userId = "demo-user-123";
    const following = await storage.getFollowing(userId);
    
    // Mock data for demo
    const mockFollowing = [
      {
        id: "1",
        userId: "trader-1",
        displayName: "Alex Chen",
        tradingStyle: "Day Trading",
        verified: true,
        monthlyPnl: 45600,
        monthlyReturnPercent: 18.5,
        rating: 4.8,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      }
    ];
    
    res.json(mockFollowing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch following traders" });
  }
});

router.get("/api/social/live-signals", async (req: Request, res: Response) => {
  try {
    // Mock live signals for demo
    const mockSignals = [
      {
        id: "signal-1",
        symbol: "AAPL",
        side: "buy",
        entryPrice: 180.50,
        currentPrice: 182.30,
        pnl: 450,
        pnlPercent: 1.0,
        trader: {
          displayName: "Alex Chen",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        },
        createdAt: new Date().toISOString()
      },
      {
        id: "signal-2",
        symbol: "TSLA",
        side: "sell",
        entryPrice: 245.20,
        currentPrice: 242.80,
        pnl: 720,
        pnlPercent: 0.98,
        trader: {
          displayName: "Sarah Johnson",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        },
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    res.json(mockSignals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch live signals" });
  }
});

router.post("/api/social/follow/:userId", async (req: Request, res: Response) => {
  try {
    const followerId = "demo-user-123"; // In production, get from auth
    const followingId = req.params.userId;
    
    const follow = await storage.follow({
      followerId,
      followingId,
      isActive: true
    });
    
    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ error: "Failed to follow trader" });
  }
});

router.delete("/api/social/follow/:userId", async (req: Request, res: Response) => {
  try {
    const followerId = "demo-user-123"; // In production, get from auth
    const followingId = req.params.userId;
    
    const success = await storage.unfollow(followerId, followingId);
    if (!success) {
      return res.status(404).json({ error: "Follow relationship not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to unfollow trader" });
  }
});

router.post("/api/social/copy-trade/:signalId", async (req: Request, res: Response) => {
  try {
    // Mock trade copying - In production, implement actual copying logic
    const signalId = req.params.signalId;
    const userId = "demo-user-123";
    
    // Create a mock copied trade
    const copiedTrade = {
      id: `copy-${signalId}-${Date.now()}`,
      originalSignalId: signalId,
      status: "executed",
      copiedAt: new Date().toISOString()
    };
    
    res.status(201).json(copiedTrade);
  } catch (error) {
    res.status(500).json({ error: "Failed to copy trade" });
  }
});

// Trader Profile routes
router.get("/api/trader-profile/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await storage.getTraderProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: "Trader profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trader profile" });
  }
});

router.post("/api/trader-profile", async (req: Request, res: Response) => {
  try {
    const profileData = insertTraderProfileSchema.parse(req.body);
    const profile = await storage.createTraderProfile(profileData);
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: "Invalid profile data", details: error });
  }
});

router.patch("/api/trader-profile/:userId", async (req: Request, res: Response) => {
  try {
    const profile = await storage.updateTraderProfile(req.params.userId, req.body);
    if (!profile) {
      return res.status(404).json({ error: "Trader profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update trader profile" });
  }
});

export function registerRoutes(app: express.Application) {
  app.use(router);
  return app;
}