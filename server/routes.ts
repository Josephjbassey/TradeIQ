import express, { Request, Response } from "express";
import { storage } from "./storage";
import { insertTradeSchema, insertTradingAccountSchema, insertUserSchema, insertAIAnalysisSchema, insertPortfolioSnapshotSchema, insertTraderProfileSchema, insertFollowSchema, insertTradeCopySchema } from "@shared/schema";
import OpenAI from "openai";
import { generateTradingTips, analyzeIndividualTrade, analyzePortfolio } from "./services/ai";
import { getSection, setSection, getPage, setPage } from "./cms";
import { resetPasswordTemplate, paymentReceiptTemplate } from "./services/email-templates";
import { createCheckoutSession } from "./services/payments";

const router = express.Router();

// Helper: map OpenAI portfolio result to our analysis record shape expected by UI
function mapPortfolioResultToAnalysis(result: any) {
  return {
    title: "Portfolio Performance Review",
    insights: {
      overallPerformance: result.overallPerformance || result.performance || "",
      riskAlerts: result.riskAlerts || [],
      improvementAreas: result.improvementAreas || [],
      keyInsights: result.keyInsights || [],
      tradingPatterns: result.tradingPatterns || [],
    },
    // Join improvement areas into a single recommendations string as a quick summary
    recommendations: Array.isArray(result.improvementAreas)
      ? result.improvementAreas.join("\n")
      : (result.recommendations || ""),
    // Derive a 1-10 score from confidence if available
    score: typeof result.confidence === "number" ? Math.max(1, Math.round(result.confidence * 10)) : undefined,
    categories: ["performance", "risk", "diversification"],
    metrics: {},
  };
}

// Helper: mock fallback mapped to UI
function mockAnalysis(analysisType: "trade" | "portfolio" | "strategy") {
  if (analysisType === "portfolio") {
    return {
      title: "Portfolio Performance Review",
      insights: {
        overallPerformance: "Strong monthly performance with consistent growth",
        riskAlerts: ["Watch exposure during high volatility", "Limit position concentration >20%"],
        improvementAreas: ["Tighten stops on news-heavy days", "Add hedges during drawdowns"],
        keyInsights: ["Win rate improving", "Profit factor above 2"],
        tradingPatterns: ["Trend-following bias", "Avoids midday trades"],
      },
      recommendations: "Maintain current strategy but add defensive positions during volatility spikes.",
      score: Math.floor(Math.random() * 2) + 8,
      categories: ["performance", "risk", "diversification"],
      metrics: { sharpeRatio: 1.8, maxDrawdown: 0.12, winRate: 0.68, profitFactor: 2.1 },
    };
  }
  if (analysisType === "strategy") {
    return {
      title: "Trading Strategy Assessment",
      insights: {
        consistency: "Good consistency across regimes",
        edge: "Clear statistical edge in backtests",
        execution: "Disciplined execution with low slippage",
        adaptation: "Adapts to changing volatility",
      },
      recommendations: "Introduce volatility-based position sizing.",
      score: Math.floor(Math.random() * 2) + 8,
      categories: ["strategy", "execution", "consistency"],
      metrics: { informationRatio: 1.2 },
    };
  }
  // trade
  return {
    title: "Trade Performance Analysis",
    insights: {
      strengths: ["Good entry timing", "Proper risk management"],
      weaknesses: ["Exit could be improved", "Position size too large"],
      patternRecognition: "Bullish breakout identified",
      riskAssessment: "Risk kept within plan",
    },
    recommendations: "Reduce position size by ~20% and use tighter stops.",
    score: Math.floor(Math.random() * 3) + 7,
    categories: ["timing", "risk", "strategy"],
    metrics: { riskRewardRatio: 2.5, winProbability: 0.75 },
  };
}

// Helper: build an analysis object using OpenAI when configured, else mock
async function buildAIAnalysis(analysisType: "trade" | "portfolio" | "strategy", data: any) {
  const useOpenAI = !!process.env.OPENAI_API_KEY;
  if (!useOpenAI) return mockAnalysis(analysisType);

  try {
    if (analysisType === "trade") {
      // Map trade to service input
      const t = data;
      const result = await analyzeIndividualTrade({
        symbol: t.symbol,
        side: (t.side as "buy" | "sell") || "buy",
        quantity: Number(t.quantity),
        entryPrice: Number(t.entryPrice),
        exitPrice: t.exitPrice ? Number(t.exitPrice) : undefined,
        stopLoss: t.stopLoss ? Number(t.stopLoss) : undefined,
        takeProfit: t.takeProfit ? Number(t.takeProfit) : undefined,
        strategy: t.strategy || undefined,
        notes: t.notes || undefined,
        pnl: t.pnl ? Number(t.pnl) : undefined,
      });
      return {
        title: "Trade Performance Analysis",
        insights: {
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          riskAssessment: result.riskAssessment,
          patternRecognition: result.patternRecognition,
        },
        recommendations: Array.isArray(result.recommendations) ? result.recommendations.join("\n") : "",
        score: Math.max(1, Math.round((result.overallScore || 50) / 10)),
        categories: ["timing", "risk", "strategy"],
        metrics: { confidence: result.confidence },
      };
    }

    if (analysisType === "portfolio") {
      // data should contain { userId, accountId } or { trades, metrics }
      const { userId, accountId } = data;
      const trades = await storage.getTrades(userId, accountId);
      const metrics = await (storage as any).calculatePortfolioMetrics(userId, accountId);
      const totalTrades = trades.length;
      const totalPnl = trades.reduce((sum, tr: any) => sum + Number(tr.pnl || 0), 0);
      const winRate = metrics?.winRatePercent ? Number(metrics.winRatePercent) : (totalTrades ? (trades.filter((t: any) => Number(t.pnl || 0) > 0).length / totalTrades) * 100 : 0);
      const avgProfit = totalTrades ? totalPnl / totalTrades : 0;
      const recentTrades = trades.slice(-5).map((tr: any) => ({
        symbol: tr.symbol,
        side: (tr.side as "buy" | "sell") || "buy",
        quantity: Number(tr.quantity),
        entryPrice: Number(tr.entryPrice),
        exitPrice: tr.exitPrice ? Number(tr.exitPrice) : undefined,
        stopLoss: tr.stopLoss ? Number(tr.stopLoss) : undefined,
        takeProfit: tr.takeProfit ? Number(tr.takeProfit) : undefined,
        strategy: tr.strategy || undefined,
        notes: tr.notes || undefined,
        pnl: tr.pnl ? Number(tr.pnl) : undefined,
      }));
      const result = await analyzePortfolio({ totalPnl, winRate, totalTrades, avgProfit, recentTrades });
      return mapPortfolioResultToAnalysis(result);
    }

    // strategy -> simple mock or reuse portfolio mapping
    return mockAnalysis("strategy");
  } catch (e) {
    console.warn("OpenAI analysis failed, falling back to mock:", (e as Error).message);
    return mockAnalysis(analysisType);
  }
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

// Me routes (demo)
router.get("/api/users/me", async (_req: Request, res: Response) => {
  try {
    const demoId = process.env.DEMO_USER_ID || "demo-user-123";
    let user = await storage.getUser(demoId);
    if (!user) {
      user = await storage.createUser({
        email: "demo@tradeiq.local",
        firstName: "Demo",
        lastName: "User",
        avatar: null,
        timeZone: "UTC",
        currency: "USD",
        tradingExperience: "beginner",
        riskTolerance: "moderate",
        tradingGoals: [],
        preferences: {},
      } as any);
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/api/users/me", async (req: Request, res: Response) => {
  try {
    const demoId = process.env.DEMO_USER_ID || "demo-user-123";
    const user = await storage.updateUser(demoId, req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
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
    
    // Calculate P&L if trade is closed (apply after create to satisfy schema types)
    let computed: { pnl: string; pnlPercent: string } | null = null;
    if (tradeData.status === "closed" && tradeData.exitPrice) {
      const entryValue = Number(tradeData.entryPrice) * Number(tradeData.quantity);
      const exitValue = Number(tradeData.exitPrice) * Number(tradeData.quantity);
      const pnl = tradeData.side === "buy" ? exitValue - entryValue : entryValue - exitValue;
      const pnlPercent = (pnl / entryValue) * 100;
      computed = { pnl: pnl.toString(), pnlPercent: pnlPercent.toString() };
    }

    let trade = await storage.createTrade(tradeData);
    if (computed) {
      const updated = await storage.updateTrade(trade.id, { ...computed });
      if (updated) trade = updated;
    }
    
  // Generate AI analysis for closed trades
    if (trade.status === "closed") {
      try {
    const analysis = await buildAIAnalysis("trade", trade);
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
      analysisData = await buildAIAnalysis("trade", trade);
    } else if (type === "portfolio" && userId) {
      analysisData = await buildAIAnalysis("portfolio", { userId, accountId });
    } else if (type === "strategy" && userId) {
      analysisData = await buildAIAnalysis("strategy", { userId, accountId });
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

// Aliases for client expectations
router.get("/api/analyses", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || "demo-user-123";
    const accountId = (req.query.accountId as string) || undefined;
    const analyses = await storage.getAIAnalyses(userId, accountId);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
});

router.post("/api/analyses/portfolio", async (req: Request, res: Response) => {
  try {
    const userId = (req.body?.userId as string) || "demo-user-123";
    const accountId = (req.body?.accountId as string) || undefined;
    const analysisData = await buildAIAnalysis("portfolio", { userId, accountId });
    const analysis = await storage.createAIAnalysis({
      userId,
      accountId: accountId || null,
      tradeId: null,
      analysisType: "portfolio",
      title: analysisData.title,
      insights: analysisData.insights,
      recommendations: analysisData.recommendations,
      score: analysisData.score,
      categories: analysisData.categories,
      metrics: analysisData.metrics,
    } as any);
    res.status(201).json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate portfolio analysis" });
  }
});

router.get("/api/tips", async (req: Request, res: Response) => {
  try {
    const levelParam = (req.query.level as string) || "beginner";
    const level = ["beginner", "intermediate", "advanced"].includes(levelParam)
      ? (levelParam as any)
      : "beginner";
    // Fallback to static tips if no API key configured
    let tips: string[];
    if (process.env.OPENAI_API_KEY) {
      tips = await generateTradingTips(level);
    } else {
      tips = [
        "Define your risk per trade and stick to it",
        "Journal every trade with entry/exit rationale",
        "Trade only your plan; avoid impulsive entries",
        "Review and refine your strategy weekly",
        "Use alerts instead of staring at charts",
      ];
    }
    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate tips" });
  }
});

// Portfolio routes
router.get("/api/portfolio-snapshots", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const accountId = req.query.accountId as string;
    const snapshots = await storage.getPortfolioSnapshots(userId, accountId);
    // Map to minimal time series for the chart
    const series = snapshots
      .sort((a, b) => new Date(a.date as any).getTime() - new Date(b.date as any).getTime())
      .map((s) => ({
        date: new Date(s.date as any).toLocaleDateString(),
        value: Number(s.totalValue as any),
      }));
    res.json(series);
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

// Current portfolio metrics (stable endpoint used by dashboard)
router.get("/api/portfolio/current", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || "demo-user-123";
    const accountId = req.query.accountId as string | undefined;
    const metrics = await (storage as any).calculatePortfolioMetrics(userId, accountId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch portfolio metrics" });
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

// Test route to simulate slow service and client redirect to /504
router.get("/api/test/slow", async (_req: Request, res: Response) => {
  // Intentionally delay beyond typical client timeout (example only)
  setTimeout(() => res.json({ ok: true, delayed: true }), 35_000);
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
  // Auth: password reset request/confirm (email stubs)
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = await storage.getUserByEmail(email);
    if (!user) return res.json({ ok: true }); // do not leak existence
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await storage.createResetToken({ userId: user.id, token, expiresAt, used: false } as any);
    const link = `${process.env.APP_URL || "http://localhost:5000"}/reset?token=${token}`;
  const { sendEmail } = await import("./services/email");
  await sendEmail({ to: email, subject: "Reset your password", html: resetPasswordTemplate(user.firstName || "", link) });
    return res.json({ ok: true });
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ error: "Invalid payload" });
    const row = await storage.getResetToken(token);
    if (!row || row.used || new Date(row.expiresAt as any).getTime() < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }
    // Hash password (placeholder: not secure for prod; replace with bcrypt)
    const hash = `pbkdf2$${Buffer.from(newPassword).toString("base64")}`;
    await storage.updateUser(row.userId, { passwordHash: hash } as any);
    await storage.markResetTokenUsed(row.id);
    return res.json({ ok: true });
  });

  // Payment webhooks and email confirmation (stub)
  app.post("/api/payments/checkout", async (req: Request, res: Response) => {
    try {
      const { planId, email, successUrl, cancelUrl } = req.body || {};
      if (!planId) return res.status(400).json({ error: "planId is required" });
      const { url } = await createCheckoutSession({ planId, customerEmail: email, successUrl, cancelUrl });
      res.json({ url });
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Failed to create checkout session" });
    }
  });
  app.post("/api/payments/webhook", async (req: Request, res: Response) => {
    // Verify signature (Stripe), parse event, update subscription, and send email
    const { email, amount } = (req.body || {}) as any; // placeholder
    try {
      const { sendEmail } = await import("./services/email");
      if (email) {
        await sendEmail({ to: email, subject: "Payment confirmed", html: paymentReceiptTemplate(`$${amount || ""}`) });
      }
    } catch {}
    res.json({ received: true });
  });
  // CMS endpoints
  app.get("/api/cms/:section", (req: Request, res: Response) => {
    const section = req.params.section;
    const data = getSection(section);
    if (!data) return res.status(404).json({ error: "Section not found" });
    res.json(data);
  });

  // Basic admin setter (protected via ADMIN_TOKEN header)
  app.put("/api/cms/:section", (req: Request, res: Response) => {
    const token = req.header("x-admin-token");
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) {
      return res.status(500).json({ error: "ADMIN_TOKEN is not configured on the server" });
    }
    if (!token || token !== expected) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const section = req.params.section;
    const updated = setSection(section, req.body);
    res.json(updated);
  });

  // CMS pages endpoints
  app.get("/api/cms/pages/:slug", (req: Request, res: Response) => {
    const page = getPage(req.params.slug);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  });

  app.put("/api/cms/pages/:slug", (req: Request, res: Response) => {
    const token = req.header("x-admin-token");
    const expected = process.env.ADMIN_TOKEN;
    if (!expected) return res.status(500).json({ error: "ADMIN_TOKEN is not configured on the server" });
    if (!token || token !== expected) return res.status(401).json({ error: "Unauthorized" });
    const updated = setPage(req.params.slug, req.body);
    res.json(updated);
  });
  return app;
}