import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertTradingAccountSchema } from "@shared/schema";

const router = Router();

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

export default router;
