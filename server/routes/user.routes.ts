import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

const router = Router();

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

export default router;
