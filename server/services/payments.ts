export type CheckoutInput = {
  planId: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
};

function getPriceId(planId: string): string | undefined {
  const map: Record<string, string | undefined> = {
    free: process.env.STRIPE_PRICE_FREE,
    pro: process.env.STRIPE_PRICE_PRO,
    team: process.env.STRIPE_PRICE_TEAM,
  };
  return map[planId];
}

export async function createCheckoutSession(input: CheckoutInput): Promise<{ url: string }> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY not configured");
  const priceId = getPriceId(input.planId);
  if (!priceId) throw new Error(`No price ID configured for plan '${input.planId}'`);

  // Dynamic import to avoid bundling cost if unused
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("stripe");
  const stripe = new mod.default(secret, { apiVersion: "2024-06-20" });

  const success_url = input.successUrl || process.env.CHECKOUT_SUCCESS_URL || `${process.env.APP_URL || "http://localhost:5000"}/dashboard`;
  const cancel_url = input.cancelUrl || process.env.CHECKOUT_CANCEL_URL || `${process.env.APP_URL || "http://localhost:5000"}/pricing`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url,
    cancel_url,
    customer_email: input.customerEmail,
    allow_promotion_codes: true,
  });
  if (!session.url) throw new Error("Failed to create checkout session");
  return { url: session.url };
}
