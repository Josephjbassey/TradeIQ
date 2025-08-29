import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { resetPasswordTemplate } from "../services/email-templates";

const router = Router();

// Auth: password reset request/confirm (email stubs)
router.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });
  const user = await storage.getUserByEmail(email);
  if (!user) return res.json({ ok: true }); // do not leak existence
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
  await storage.createResetToken({ userId: user.id, token, expiresAt, used: false } as any);
  const link = `${process.env.APP_URL || "http://localhost:5000"}/reset?token=${token}`;
  const { sendEmail } = await import("../services/email");
  await sendEmail({ to: email, subject: "Reset your password", html: resetPasswordTemplate(user.firstName || "", link) });
  return res.json({ ok: true });
});

router.post("/api/auth/reset-password", async (req: Request, res: Response) => {
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

export default router;
