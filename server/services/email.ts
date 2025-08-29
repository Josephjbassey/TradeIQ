export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ ok: boolean }>{
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || "noreply@tradeiq.local";
  if (!apiKey) {
    console.log(`[email:fallback] to=${to} subject=${subject}`);
    return { ok: true };
  }

  // Dynamic import to avoid hard dependency if not used
  const mod: any = await import("resend").catch(() => null);
  if (!mod) {
    console.warn("Resend SDK not installed, falling back to console log");
    console.log(`[email:fallback] to=${to} subject=${subject}`);
    return { ok: true };
  }

  const resend = new mod.Resend(apiKey);
  await resend.emails.send({ from, to, subject, html });
  return { ok: true };
}
