export function resetPasswordTemplate(name: string, link: string) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6">
    <h2>Reset your password</h2>
    <p>Hi ${name || "there"},</p>
    <p>We received a request to reset your password. Click the button below to proceed. This link expires in 30 minutes.</p>
    <p style="margin:24px 0"><a href="${link}" style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;border-radius:8px;text-decoration:none">Reset Password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

export function paymentReceiptTemplate(amount: string) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6">
    <h2>Payment confirmed</h2>
    <p>Thank you! We received your payment of <b>${amount}</b>.</p>
  </div>`;
}
