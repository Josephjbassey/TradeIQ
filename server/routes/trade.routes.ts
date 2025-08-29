import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertTradeSchema } from "@shared/schema";
import { buildAIAnalysis } from "./helpers";

const router = Router();

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

export default router;
