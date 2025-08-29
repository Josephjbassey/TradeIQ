import { Router, Request, Response } from "express";
import { paymentReceiptTemplate } from "../services/email-templates";
import { createCheckoutSession } from "../services/payments";

const router = Router();

// Payment webhooks and email confirmation (stub)
router.post("/api/payments/checkout", async (req: Request, res: Response) => {
  try {
    const { planId, email, successUrl, cancelUrl } = req.body || {};
    if (!planId) return res.status(400).json({ error: "planId is required" });
    const { url } = await createCheckoutSession({ planId, customerEmail: email, successUrl, cancelUrl });
    res.json({ url });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Failed to create checkout session" });
  }
});
router.post("/api/payments/webhook", async (req: Request, res: Response) => {
  // Verify signature (Stripe), parse event, update subscription, and send email
  const { email, amount } = (req.body || {}) as any; // placeholder
  try {
    const { sendEmail } = await import("../services/email");
    if (email) {
      await sendEmail({ to: email, subject: "Payment confirmed", html: paymentReceiptTemplate(`$${amount || ""}`) });
    }
  } catch {}
  res.json({ received: true });
});

export default router;
