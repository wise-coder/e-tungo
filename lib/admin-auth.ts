import { createHmac, timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE_NAME } from "./admin-session";

export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim() ||
  "tungatechnologies@gmail.com").toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || "2008@kbxKBX";
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET?.trim() || "e-tungo-admin-session-secret";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

type AdminSessionPayload = {
  email: string;
  exp: number;
};

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", ADMIN_SESSION_SECRET).update(payload).digest("base64url");
}

export function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export function isValidAdminPassword(password: string) {
  return password === ADMIN_PASSWORD;
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
  };
  const payloadString = encode(JSON.stringify(payload));
  return `${payloadString}.${sign(payloadString)}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return null;

  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;

  const expected = sign(payloadPart);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decode(payloadPart)) as AdminSessionPayload;
    if (!payload.email || payload.email !== ADMIN_EMAIL) return null;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminEmailFromCookies(cookies: { get(name: string): { value?: string } | undefined }) {
  const session = verifyAdminSessionToken(cookies.get(ADMIN_COOKIE_NAME)?.value);
  return session?.email ?? null;
}
