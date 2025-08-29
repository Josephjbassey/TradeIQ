import { Router, Request, Response } from "express";

const router = Router();

// Test route to simulate slow service and client redirect to /504
router.get("/api/test/slow", async (_req: Request, res: Response) => {
  // Intentionally delay beyond typical client timeout (example only)
  setTimeout(() => res.json({ ok: true, delayed: true }), 35_000);
});

export default router;
