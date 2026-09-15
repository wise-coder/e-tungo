import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getUserByEmail, getUserById, upsertUser } from "./db";
import { readState, writeState } from "./auth-store";
import { hashPassword, validPassword, verifyPassword } from "./password";
import { normalizeRwandaMobile } from "./phone";
import { requireMailConfiguration, queuePasswordResetEmail } from "./auth-mail";
import {
  Account, accountKey, AuthError, authRoute, cookieOptions, cookieToken, digest, endSession,
  isAdminUser, jsonBody, limitRequest, newToken, normalizeEmail, rateLimit, SESSION_COOKIE,
  sessionIdentity, startSession, validToken,
} from "./auth";

// Accounts created before profiles were persisted at signup are repaired only
// after their stored password has been checked. Never claim a different user ID.
async function materializeProfile(account: Account) {
  const current = await getUserById(account.profile.id);
  if (current) {
    if (current.email.trim().toLowerCase() !== account.profile.email) throw new AuthError(401, "Invalid email or password.");
    return current;
  }
  const existing = await getUserByEmail(account.profile.email);
  if (existing && existing.id !== account.profile.id) throw new AuthError(401, "Invalid email or password.");
  return upsertUser(account.profile);
}

const generic = () => NextResponse.json({ message: "If the account is eligible, an email with instructions will arrive shortly." });
const invalidLink = () => new AuthError(400, "This link is invalid or expired. Request a new one.");
export const register = authRoute(async request => {
  await limitRequest(request, "register");
  const body = await jsonBody(request);
  const email = normalizeEmail(body.email);
  await rateLimit(`register:email:${email}`, 3);
  if (!validPassword(body.password)) throw new AuthError(400, "Use a password with 15–128 characters.");
  if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 100 ||
      typeof body.district !== "string" || !body.district.trim() || body.district.length > 100) {
    throw new AuthError(400, "Name and district are required (maximum 100 characters each).");
  }
  const phone = normalizeRwandaMobile(body.phone);
  if (!phone) throw new AuthError(400, "Enter a valid Rwanda mobile number (07XXXXXXXX or +2507XXXXXXXX).");
  const passwordHash = await hashPassword(body.password);
  const key = accountKey(email);
  if (await readState<Account>(key) || await getUserByEmail(email)) throw new AuthError(409, "Unable to create this account. Sign in or use password recovery.");
  const account: Account = {
    profile: { id: randomUUID(), email, name: body.name.trim(), phone, district: body.district.trim(), userType: "farmer", phoneVerified: false, createdAt: new Date().toISOString() },
    passwordHash, credentialVersion: newToken(),
  };
  if (!await writeState(key, account, null)) throw new AuthError(409, "Unable to create this account. Sign in or use password recovery.");
  const user = await materializeProfile(account);
  const response = NextResponse.json({ user, admin: isAdminUser(user.id) }, { status: 201 });
  await startSession(account, request, response);
  return response;
});

export const login = authRoute(async request => {
  // Both admin and normal login use the same limiter and credential checks.
  await limitRequest(request, "login");
  const body = await jsonBody(request);
  const email = normalizeEmail(body.email);
  await rateLimit(`login:email:${email}`, 5);
  const stored = await readState<Account>(accountKey(email));
  const matches = await verifyPassword(body.password, stored?.value.passwordHash);
  if (!matches || !stored) throw new AuthError(401, "Invalid email or password.");
  const user = await materializeProfile(stored.value);
  const response = NextResponse.json({ user, admin: isAdminUser(user.id) });
  await startSession(stored.value, request, response);
  return response;
});

export const me = authRoute(async request => {
  const identity = await sessionIdentity(cookieToken(request));
  return NextResponse.json(identity ?? { user: null, admin: false });
});
export const logout = authRoute(async request => {
  await endSession(request);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(0, request));
  response.cookies.set("e_tungo_admin_session", "", cookieOptions(0, request));
  return response;
});

export const forgotPassword = authRoute(async request => {
  await limitRequest(request, "reset-email");
  const email = normalizeEmail((await jsonBody(request)).email);
  await rateLimit(`reset-email:${email}`, 3);
  requireMailConfiguration();
  const key = accountKey(email);
  const stored = await readState<Account>(key);
  // Legacy profiles have no credentials. Only mailbox recovery can enroll them.
  const legacy = stored ? null : await getUserByEmail(email);
  if (!stored && !legacy) return generic();
  const account: Account = stored?.value ?? { profile: { ...legacy!, email, phoneVerified: false }, passwordHash: null, credentialVersion: newToken() };
  const token = newToken();
  const next = { ...account, reset: { hash: digest(token), expiresAt: Date.now() + 30 * 60 * 1000 } };
  if (await writeState(key, next, stored?.version ?? null)) queuePasswordResetEmail(email, token);
  return generic();
});

export const resetPassword = authRoute(async request => {
  await limitRequest(request, "reset");
  const body = await jsonBody(request);
  const email = normalizeEmail(body.email);
  await rateLimit(`reset:${email}`, 5);
  if (!validToken(body.token)) throw invalidLink();
  if (!validPassword(body.password)) throw new AuthError(400, "Use a password with 15–128 characters.");
  const key = accountKey(email);
  const stored = await readState<Account>(key);
  if (!stored?.value.reset || stored.value.reset.expiresAt <= Date.now() || stored.value.reset.hash !== digest(body.token)) throw invalidLink();
  const next = { ...stored.value, passwordHash: await hashPassword(body.password), reset: undefined, credentialVersion: newToken() };
  // Hashing takes time. Check expiry again immediately before atomic consumption.
  if (stored.value.reset.expiresAt <= Date.now() || !await writeState(key, next, stored.version)) throw invalidLink();
  const profile = await getUserById(next.profile.id);
  if (!profile) await upsertUser(next.profile);
  else if (!stored.value.passwordHash) await upsertUser({ ...profile, phoneVerified: false });
  const response = NextResponse.json({ message: "Password changed. Sign in with your new password." });
  await endSession(request);
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(0, request));
  return response;
});
