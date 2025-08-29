import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertAIAnalysisSchema } from "@shared/schema";
import { buildAIAnalysis } from "./helpers";
import { generateTradingTips } from "../services/ai";

const router = Router();

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

export default router;
