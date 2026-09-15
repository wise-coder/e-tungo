import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { readState, writeState, deleteState } from "./auth-store";
import { getUserById } from "./db";
import type { User } from "./types";

export const SESSION_COOKIE = "e_tungo_session";
export const SESSION_TTL = 12 * 60 * 60 * 1000;
export const IDLE_TTL = 30 * 60 * 1000;
export type Account = {
  profile: User; passwordHash: string | null; credentialVersion: string;
  reset?: { hash: string; expiresAt: number };
};
type Session = { email: string; credentialVersion: string; expiresAt: number; lastSeen: number };
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");
export const accountKey = (email: string) => `account:${digest(email)}`;
export const validToken = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") throw new AuthError(400, "Enter a valid email address.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError(400, "Enter a valid email address.");
  return email;
}
export function isAdminUser(id: string) {
  const configured = process.env.ADMIN_USER_ID?.trim();
  return Boolean(configured) && id === configured;
}
export class AuthError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function appOrigin(request?: Request) {
  const value = process.env.APP_ORIGIN?.trim();
  // Only a local development request can supply an implicit origin. Never use
  // arbitrary Host/forwarded headers as the production CSRF or recovery origin.
  if (!value && process.env.NODE_ENV !== "production" && request) {
    const local = new URL(request.url);
    if (["localhost", "127.0.0.1", "[::1]"].includes(local.hostname) && ["http:", "https:"].includes(local.protocol)) return local.origin;
  }
  try {
    if (!value) throw new Error();
    const url = new URL(value);
    const localHttp = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) && url.protocol === "http:";
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash || (url.protocol !== "https:" && !localHttp)) throw new Error();
    return url.origin;
  } catch {
    throw new AuthError(503, "Application origin is not configured correctly.");
  }
}
export function checkOrigin(request: Request) {
  if (request.headers.get("origin") !== appOrigin(request) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AuthError(403, "Invalid request origin.");
  }
}
export async function jsonBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new AuthError(415, "JSON required.");
  // Read incrementally so an untrusted Content-Length cannot bypass the limit.
  const reader = request.body?.getReader();
  if (!reader) throw new AuthError(400, "Request body required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2_000_000) { await reader.cancel(); throw new AuthError(413, "Request too large."); }
    chunks.push(value);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch { throw new AuthError(400, "Invalid JSON."); }
}
export function cookieToken(request: Request) {
  return request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
}
export async function sessionIdentity(token?: string) {
  if (!validToken(token)) return null;
  const key = `session:${digest(token)}`;
  const stored = await readState<Session>(key);
  if (!stored) return null;
  const session = stored.value;
  const now = Date.now();
  if (session.expiresAt <= now || session.lastSeen + IDLE_TTL <= now) return null;
  const account = await readState<Account>(accountKey(session.email));
  if (!account?.value.passwordHash || account.value.credentialVersion !== session.credentialVersion) return null;
  const user = await getUserById(account.value.profile.id);
  if (!user) return null;
  // Never upsert here: a concurrent logout must not resurrect a session.
  await writeState(key, { ...session, lastSeen: now }, stored.version, session.expiresAt);
  return { user, admin: isAdminUser(user.id) };
}
export async function requireUser(request: Request) {
  const identity = await sessionIdentity(cookieToken(request));
  if (!identity) throw new AuthError(401, "Sign in required.");
  return identity.user;
}
export async function startSession(account: Account, request: Request, response: NextResponse) {
  await endSession(request);
  const token = newToken();
  const now = Date.now();
  await writeState(`session:${digest(token)}`, { email: account.profile.email, credentialVersion: account.credentialVersion, expiresAt: now + SESSION_TTL, lastSeen: now }, null, now + SESSION_TTL);
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(SESSION_TTL / 1000, request));
}
export function cookieOptions(maxAge: number, request?: Request) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production" || appOrigin(request).startsWith("https:"), sameSite: "lax" as const, path: "/", maxAge };
}
export async function endSession(request: Request) {
  const token = cookieToken(request);
  if (validToken(token)) await deleteState(`session:${digest(token)}`);
}
export async function rateLimit(key: string, limit: number, windowMs = 15 * 60 * 1000) {
  const bucket = Math.floor(Date.now() / windowMs);
  const id = `rate:${digest(key)}:${bucket}`;
  for (let attempt = 0; attempt < 20; attempt++) {
    const current = await readState<{ count: number }>(id);
    if ((current?.value.count ?? 0) >= limit) throw new AuthError(429, "Too many attempts. Try again later.");
    if (await writeState(id, { count: (current?.value.count ?? 0) + 1 }, current?.version ?? null, (bucket + 2) * windowMs)) return;
  }
  throw new AuthError(429, "Too many attempts. Try again later.");
}
export async function limitRequest(request: Request, action: string) {
  // Only trust an IP header when the deployment proxy overwrites it.
  const header = process.env.AUTH_TRUSTED_IP_HEADER;
  const address = header ? request.headers.get(header)?.trim().slice(0, 128) || "unknown" : "shared";
  await rateLimit(`${action}:source:${address}`, 30);
}
export function authRoute(handler: (request: Request) => Promise<NextResponse>) {
  return async (request: Request) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) checkOrigin(request);
      const response = await handler(request);
      response.headers.set("Cache-Control", "no-store");
      return response;
    } catch (error) {
      const status = error instanceof AuthError ? error.status : 500;
      if (!(error instanceof AuthError)) {
        const failure = error as { name?: string; code?: string | number } | null;
        console.error("Authentication API failure", {
          path: new URL(request.url).pathname,
          name: failure?.name ?? "UnknownError",
          code: failure?.code ?? null,
          database: process.env.MONGODB_URI?.trim() ? "mongodb" : "sqlite",
        });
      }
      return NextResponse.json({ error: error instanceof AuthError ? error.message : "Unable to complete the request." }, {
        status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "900" } : {}) },
      });
    }
  };
}
