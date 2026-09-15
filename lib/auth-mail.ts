import "server-only";
import { after } from "next/server";
import { appOrigin, AuthError } from "./auth";

export function requireMailConfiguration() {
  appOrigin();
  if (!process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM) throw new AuthError(503, "Email delivery is not configured.");
}
export function queuePasswordResetEmail(email: string, token: string) {
  requireMailConfiguration();
  // Send after the generic response, so provider latency cannot reveal whether
  // an account exists. Next keeps this task alive on supported deployments.
  after(async () => {
    try { await sendPasswordResetEmail(email, token); }
    catch { console.error("Authentication email delivery failed; check the mail provider."); }
  });
}
async function sendPasswordResetEmail(email: string, token: string) {
  requireMailConfiguration();
  const url = new URL("/reset-password", appOrigin());
  // Fragments keep bearer tokens out of server access logs and Referer headers.
  url.hash = new URLSearchParams({ token, email }).toString();
  const action = "Reset your password";
  const lifetime = "30 minutes";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.AUTH_EMAIL_FROM, to: [email], subject: `${action} — e-tungo`,
      text: `${action}: ${url.toString()}\n\nThis link expires in ${lifetime} and can only be used once. If you did not request it, ignore this email.` }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new AuthError(503, "Email delivery is temporarily unavailable.");
}
