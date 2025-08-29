import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertPortfolioSnapshotSchema } from "@shared/schema";

const router = Router();

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

export default router;
