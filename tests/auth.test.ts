import assert from "node:assert/strict";
import { after, beforeEach, mock, test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Isolated storage; never load .env.local or touch the project's database.
const directory = mkdtempSync(path.join(os.tmpdir(), "e-tungo-auth-test-"));
process.env.SQLITE_PATH = path.join(directory, "test.sqlite");
process.env.MONGODB_URI = "";
process.env.APP_ORIGIN = "https://market.example";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_USER_ID = "";
process.env.RESEND_API_KEY = "test-key-not-a-real-secret";
process.env.AUTH_EMAIL_FROM = "test@example.com";
process.env.AUTH_TRUSTED_IP_HEADER = "";

import * as handlers from "../lib/auth-handlers";
import { accountKey, Account, digest, IDLE_TTL, newToken, rateLimit, SESSION_TTL, sessionIdentity } from "../lib/auth";
import { readState, writeState } from "../lib/auth-store";
import { hashPassword, verifyPassword } from "../lib/password";
import { ensureLocalDb, getUserById, upsertUser } from "../lib/db";
import { safeRedirect } from "../lib/auth-client";
import { GET as userGet, PUT as userPut } from "../app/api/users/route";
import { GET as publicUserGet } from "../app/api/users/[id]/route";
import { POST as listingPost } from "../app/api/listings/route";
import { PATCH as listingPatch, DELETE as listingDelete } from "../app/api/listings/[id]/route";
import { POST as wantedPost } from "../app/api/wanted/route";
import { PATCH as wantedPatch, DELETE as wantedDelete } from "../app/api/wanted/[id]/route";
import { POST as adminLogin } from "../app/api/admin/login/route";
import { POST as adminBoost } from "../app/api/admin/listings/[id]/boost/route";

const password = "correct horse battery staple";
const emails: Array<{ to: string[]; text: string }> = [];
const originalFetch = globalThis.fetch;
// Exercise the post-response mail task synchronously in these handler tests.
const nextServer = require("next/server") as typeof import("next/server");
const mailTasks: Promise<void>[] = [];
mock.method(nextServer, "after", (task: () => Promise<void>) => { mailTasks.push(task()); });
globalThis.fetch = (async (_url: unknown, init: RequestInit) => {
  assert.equal(_url, "https://api.resend.com/emails");
  emails.push(JSON.parse(String(init.body)));
  return new Response('{"id":"test-mail"}', { status: 200 });
}) as typeof fetch;

function request(route: string, body?: unknown, cookie?: string, method = "POST", origin = process.env.APP_ORIGIN) {
  return new Request(`https://market.example${route}`, {
    method, headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const params = (id: string) => ({ params: Promise.resolve({ id }) });
function mailToken() {
  const match = emails.at(-1)!.text.match(/https:\/\/\S+/)![0];
  return new URLSearchParams(new URL(match).hash.slice(1)).get("token")!;
}
async function enroll(email = "member@example.com") {
  const signup = await handlers.register(request("/api/auth/register", { email, name: "Member", phone: "078 123 4567", district: "Kigali", password }));
  assert.equal(signup.status, 201, await signup.clone().text());
  return { cookie: signup.headers.get("set-cookie")!.split(";")[0], body: await signup.json(), response: signup };
}
async function signIn(email = "member@example.com", value = password) {
  const response = await handlers.login(request("/api/auth/login", { email, password: value }));
  assert.equal(response.status, 200, await response.clone().text());
  return { cookie: response.headers.get("set-cookie")!.split(";")[0], body: await response.json(), response };
}
beforeEach(() => {
  const db = ensureLocalDb();
  db.exec("CREATE TABLE IF NOT EXISTS auth_state (id TEXT PRIMARY KEY, version INTEGER NOT NULL, json TEXT NOT NULL, expiresAt INTEGER)");
  db.exec("DELETE FROM auth_state; DELETE FROM users; DELETE FROM listings; DELETE FROM wanted_requests;");
  emails.length = 0;
  process.env.ADMIN_USER_ID = "";
});
after(async () => {
  await Promise.all(mailTasks);
  mock.restoreAll();
  globalThis.fetch = originalFetch;
  globalThis.__eTungoDb?.close();
  globalThis.__eTungoDb = undefined;
  rmSync(directory, { recursive: true, force: true });
});

test("password hashes are salted scrypt; plaintext and wrong passwords are rejected", async () => {
  const a = await hashPassword(password), b = await hashPassword(password);
  assert.notEqual(a, b); assert.ok(!a.includes(password));
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword("wrong", a), false);
  assert.equal(await verifyPassword(password, password), false);
  assert.equal(await verifyPassword(password, undefined), false);
  await assert.rejects(hashPassword("short"));
});
test("registration creates a profile and session immediately without email verification", async () => {
  const email = "member@example.com";
  const result = await handlers.register(request("/register", { email: " MEMBER@example.com ", name: "Member", phone: "078 123 4567", district: "Kigali", password }));
  assert.equal(result.status, 201);
  const body = await result.json();
  assert.equal(body.user.email, email);
  assert.equal(body.user.phone, "+250781234567");
  assert.equal(body.admin, false);
  assert.ok(!JSON.stringify(body).includes("passwordHash"));
  assert.ok(!JSON.stringify(body).includes("token"));
  assert.equal(emails.length, 0);
  assert.equal((await getUserById(body.user.id))!.email, email);
  const signupCookie = result.headers.get("set-cookie")!;
  assert.equal((await sessionIdentity(signupCookie.split(";")[0].split("=")[1]))!.user.id, body.user.id);
  const stored = (await readState<Account>(accountKey(email)))!;
  assert.equal(await verifyPassword(password, stored.value.passwordHash), true);
  const loggedIn = await signIn();
  const cookie = loggedIn.response.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /Secure/i); assert.match(cookie, /SameSite=lax/i); assert.match(cookie, /Max-Age=43200/i);
  assert.ok(!JSON.stringify(loggedIn.body).includes("passwordHash"));
});
test("signup requires a mobile number usable by call and WhatsApp", async () => {
  const missing = await handlers.register(request("/register", { email: "missing-phone@example.com", name: "Member", district: "Kigali", password }));
  assert.equal(missing.status, 400);
  const invalid = await handlers.register(request("/register", { email: "bad-phone@example.com", name: "Member", phone: "123", district: "Kigali", password }));
  assert.equal(invalid.status, 400);
  assert.equal(await readState<Account>(accountKey("missing-phone@example.com")), null);
});

test("previously unverified accounts can sign in and materialize their profile using their password", async () => {
  const email = "pending@example.com";
  const profile = { id: "pending-user", email, name: "Pending", district: "Kigali", userType: "farmer" as const, phoneVerified: false, createdAt: new Date().toISOString() };
  await writeState(accountKey(email), {
    profile, passwordHash: await hashPassword(password), credentialVersion: newToken(),
    emailVerified: false, verification: { hash: digest(newToken()), expiresAt: Date.now() - 1 },
  }, null);
  assert.equal((await handlers.login(request("/login", { email, password: "wrong" }))).status, 401);
  assert.equal(await getUserById(profile.id), null);
  const loggedIn = await signIn(email);
  assert.equal(loggedIn.body.user.id, profile.id);
  assert.equal((await sessionIdentity(loggedIn.cookie.split("=")[1]))!.user.id, profile.id);
  assert.equal(emails.length, 0);
});
test("sessions reject forged cookies, expire server-side, rotate on login, and revoke on logout", async () => {
  const first = await enroll();
  assert.equal(await sessionIdentity(newToken()), null);
  assert.equal(await sessionIdentity("forged.payload.signature"), null);
  const token = first.cookie.split("=")[1];
  const key = `session:${digest(token)}`;
  const original = (await readState<Record<string, unknown>>(key))!;
  await writeState(key, { ...original.value, lastSeen: Date.now() - IDLE_TTL }, original.version);
  assert.equal(await sessionIdentity(token), null);
  let stored = (await readState<Record<string, unknown>>(key))!;
  await writeState(key, { ...original.value, expiresAt: Date.now() - 1 }, stored.version);
  assert.equal(await sessionIdentity(token), null);
  stored = (await readState<Record<string, unknown>>(key))!;
  await writeState(key, { ...original.value, expiresAt: Date.now() + SESSION_TTL }, stored.version);
  const rotation = await handlers.login(request("/login", { email: "member@example.com", password }, first.cookie));
  assert.equal(rotation.status, 200);
  assert.equal(await sessionIdentity(token), null);
  const cookie = rotation.headers.get("set-cookie")!.split(";")[0];
  assert.equal((await handlers.logout(request("/logout", undefined, cookie))).status, 200);
  assert.equal(await sessionIdentity(cookie.split("=")[1]), null);
});
test("password recovery expires, consumes atomically, and invalidates every existing session", async () => {
  const first = await enroll();
  const second = await signIn();
  const email = "member@example.com";
  const recovery = await handlers.forgotPassword(request("/forgot", { email }));
  const unknown = await handlers.forgotPassword(request("/forgot", { email: "missing@example.com" }));
  assert.deepEqual(await recovery.json(), await unknown.json());
  const token = mailToken();
  let stored = (await readState<Account>(accountKey(email)))!;
  assert.equal(stored.value.reset!.hash, digest(token));
  assert.ok(stored.value.reset!.expiresAt <= Date.now() + 30 * 60 * 1000);
  await writeState(accountKey(email), { ...stored.value, reset: { hash: digest(token), expiresAt: Date.now() - 1 } }, stored.version);
  assert.equal((await handlers.resetPassword(request("/reset", { email, token, password }))).status, 400);
  stored = (await readState<Account>(accountKey(email)))!;
  await writeState(accountKey(email), { ...stored.value, reset: { hash: digest(token), expiresAt: Date.now() + 10000 } }, stored.version);
  const newPassword = "a completely different password";
  const responses = await Promise.all([1, 2].map(() => handlers.resetPassword(request("/reset", { email, token, password: newPassword }))));
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 400]);
  assert.equal(await sessionIdentity(first.cookie.split("=")[1]), null);
  assert.equal(await sessionIdentity(second.cookie.split("=")[1]), null);
  assert.equal((await handlers.login(request("/login", { email, password }))).status, 401);
  await signIn(email, newPassword);
});
test("login throttling is shared with the admin alias and counters are atomic", async () => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const handler = attempt % 2 ? adminLogin : handlers.login;
    assert.equal((await handler(request("/login", { email: "missing@example.com", password }))).status, 401);
  }
  const throttled = await handlers.login(request("/login", { email: " MISSING@example.com ", password }));
  assert.equal(throttled.status, 429); assert.ok(throttled.headers.get("retry-after"));
  const attempts = await Promise.allSettled(Array.from({ length: 12 }, () => rateLimit("concurrent", 3)));
  assert.equal(attempts.filter(r => r.status === "fulfilled").length, 3);
});
test("protected APIs derive ownership and privilege from sessions, never request fields", async () => {
  assert.equal((await userGet(request("/users?email=victim@example.com", undefined, undefined, "GET"))).status, 401);
  assert.equal((await userPut(request("/users", { id: "victim" }))).status, 401);
  assert.equal((await listingPost(request("/listings", {}))).status, 401);
  assert.equal((await wantedPost(request("/wanted", {}))).status, 401);
  const member = await enroll();
  const another = await enroll("other@example.com");
  const saved = await userPut(request("/users", { id: another.body.user.id, email: "admin@example.com", phoneVerified: true, name: "Updated", passwordHash: "injected" }, member.cookie));
  const profile = await saved.json();
  assert.equal(profile.id, member.body.user.id); assert.equal(profile.email, "member@example.com"); assert.equal(profile.phoneVerified, false);
  const listing = await listingPost(request("/listings", { id: "chosen-id", sellerId: another.body.user.id, sellerPhoneVerified: true, boostedAt: "2099-01-01", title: "Cow", district: "Kigali", category: "cattle", price: 10 }, member.cookie));
  assert.equal(listing.status, 201);
  const record = await listing.json();
  assert.notEqual(record.id, "chosen-id"); assert.equal(record.sellerId, member.body.user.id); assert.equal(record.sellerPhone, "+250781234567"); assert.equal(record.sellerPhoneVerified, false); assert.equal(record.boostedAt, undefined);
  assert.equal((await listingPatch(request("/listing", { title: "Hijacked" }, another.cookie, "PATCH"), params(record.id))).status, 404);
  assert.equal((await listingDelete(request("/listing", undefined, another.cookie, "DELETE"), params(record.id))).status, 404);
  const patched = await listingPatch(request("/listing", { sellerId: another.body.user.id, boostedAt: "2099", status: "sold" }, member.cookie, "PATCH"), params(record.id));
  assert.equal(patched.status, 200, await patched.clone().text());
  assert.equal((await patched.json()).sellerId, member.body.user.id);
  assert.equal((await adminBoost(request("/admin/boost", undefined, member.cookie), params(record.id))).status, 401);
  const admin = await enroll("admin@example.com");
  assert.equal(admin.body.admin, false);
  assert.equal((await adminBoost(request("/admin/boost", undefined, admin.cookie), params(record.id))).status, 401);
  process.env.ADMIN_USER_ID = admin.body.user.id;
  assert.equal((await adminBoost(request("/admin/boost", undefined, admin.cookie), params(record.id))).status, 200);
  const wanted = await wantedPost(request("/wanted", { buyerId: another.body.user.id, category: "cattle", title: "Wanted" }, member.cookie));
  const wantedRecord = await wanted.json();
  assert.equal(wantedRecord.buyerId, member.body.user.id);
  assert.equal((await wantedPatch(request("/wanted", { status: "closed" }, another.cookie, "PATCH"), params(wantedRecord.id))).status, 404);
  assert.equal((await wantedDelete(request("/wanted", undefined, another.cookie, "DELETE"), params(wantedRecord.id))).status, 404);
  const publicProfile = await publicUserGet(request("/users/id", undefined, undefined, "GET"), params(member.body.user.id));
  const fields = await publicProfile.json();
  assert.equal(fields.email, undefined); assert.equal(fields.passwordHash, undefined);
});
test("database-designated administrators receive admin sessions and cannot self-assign the role", async () => {
  const account = await enroll("database-admin@example.com");
  assert.equal(account.body.admin, false);
  await upsertUser({ ...account.body.user, isAdmin: true });
  const loggedIn = await signIn("database-admin@example.com");
  assert.equal(loggedIn.body.admin, true);
  assert.equal((await sessionIdentity(loggedIn.cookie.split("=")[1]))!.admin, true);

  const updated = await userPut(request("/users", { isAdmin: false, name: "Database Admin" }, loggedIn.cookie));
  assert.equal(updated.status, 200);
  assert.equal((await getUserById(account.body.user.id))!.isAdmin, true);
});
test("CSRF, malformed input and unsafe redirects fail closed", async () => {
  assert.equal((await handlers.login(request("/login", {}, undefined, "POST", "https://evil.example"))).status, 403);
  const noOrigin = request("/login", {}); noOrigin.headers.delete("origin");
  assert.equal((await handlers.login(noOrigin)).status, 403);
  assert.equal((await handlers.login(request("/login", { email: { $ne: null }, password }))).status, 400);
  assert.equal((await handlers.login(new Request("https://market.example/login", { method: "POST", headers: { Origin: process.env.APP_ORIGIN!, "Content-Type": "application/json" }, body: "{" }))).status, 400);
  for (const value of ["//evil.example", "https://evil.example", "javascript:alert(1)", "/\\evil.example", "/\n/evil.example"]) assert.equal(safeRedirect(value), "/account");
  assert.equal(safeRedirect("/sell?step=1"), "/sell?step=1");
});
test("legacy profiles cannot log in or be overwritten through signup; recovery proves mailbox ownership", async () => {
  await upsertUser({ id: "legacy", name: "Legacy", email: "legacy@example.com", district: "Kigali", userType: "farmer", phoneVerified: false, createdAt: new Date().toISOString() });
  assert.equal((await handlers.login(request("/login", { email: "legacy@example.com", password }))).status, 401);
  assert.equal((await handlers.register(request("/register", { email: "legacy@example.com", name: "Attacker", phone: "0781234567", district: "Kigali", password }))).status, 409);
  assert.equal((await getUserById("legacy"))!.name, "Legacy");
  await handlers.forgotPassword(request("/forgot", { email: "legacy@example.com" }));
  assert.equal((await handlers.resetPassword(request("/reset", { email: "legacy@example.com", token: mailToken(), password }))).status, 200);
  assert.equal((await signIn("legacy@example.com")).body.user.id, "legacy");
});

test("duplicate signup cannot replace the password or create a session", async () => {
  const email = "member@example.com";
  const body = { email, name: "Member", phone: "0781234567", district: "Kigali", password };
  assert.equal((await handlers.register(request("/register", body))).status, 201);
  const duplicate = await handlers.register(request("/register", { ...body, password: "attacker replacement password" }));
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.headers.get("set-cookie"), null);
  assert.equal(emails.length, 0);
  assert.equal((await handlers.login(request("/login", { email, password: "attacker replacement password" }))).status, 401);
  await signIn();
});
test("signup and login work without mail configuration; recovery still requires it", async () => {
  const previous = process.env.RESEND_API_KEY;
  const previousFrom = process.env.AUTH_EMAIL_FROM;
  delete process.env.RESEND_API_KEY;
  delete process.env.AUTH_EMAIL_FROM;
  try {
    const member = await enroll();
    assert.equal((await sessionIdentity(member.cookie.split("=")[1]))!.user.email, "member@example.com");
    await signIn();
    assert.equal(emails.length, 0);
    assert.equal((await handlers.forgotPassword(request("/forgot", { email: "member@example.com" }))).status, 503);
  } finally { process.env.RESEND_API_KEY = previous; process.env.AUTH_EMAIL_FROM = previousFrom; }
});
