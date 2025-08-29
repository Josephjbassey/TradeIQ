import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

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

export default router;
