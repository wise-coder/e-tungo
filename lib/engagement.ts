import "server-only";
import { randomUUID } from "node:crypto";
import { ensureLocalDb, getMongoDb } from "./db";
import type { Listing } from "./types";

export type EngagementAction = "view" | "call" | "whatsapp" | "share";
type Event = { listingId: string; visitorKey: string; action: EngagementAction; createdAt: string };
type Save = { listingId: string; userId: string; createdAt: string };

function setupLocal() {
  const db = ensureLocalDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS listing_events (
      id TEXT PRIMARY KEY, listingId TEXT NOT NULL, visitorKey TEXT NOT NULL,
      action TEXT NOT NULL, createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS listing_events_listing ON listing_events(listingId, action, createdAt);
    CREATE INDEX IF NOT EXISTS listing_events_visitor ON listing_events(visitorKey, action);
    CREATE TABLE IF NOT EXISTS listing_saves (
      listingId TEXT NOT NULL, userId TEXT NOT NULL, createdAt TEXT NOT NULL,
      PRIMARY KEY(listingId, userId)
    );
    CREATE INDEX IF NOT EXISTS listing_saves_user ON listing_saves(userId);
  `);
  return db;
}

export async function recordEngagement(listingId: string, visitorKey: string, action: EngagementAction) {
  const createdAt = new Date().toISOString();
  const mongo = await getMongoDb();
  if (mongo) {
    await mongo.collection<Event & { _id: string }>("listing_events").insertOne({
      _id: randomUUID(), listingId, visitorKey, action, createdAt,
    });
    return;
  }
  setupLocal().prepare("INSERT INTO listing_events VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), listingId, visitorKey, action, createdAt);
}

export async function toggleSave(listingId: string, userId: string) {
  const mongo = await getMongoDb();
  if (mongo) {
    const saves = mongo.collection<Save & { _id: string }>("listing_saves");
    const _id = `${listingId}:${userId}`;
    const previous = await saves.findOne({ _id });
    if (previous) { await saves.deleteOne({ _id }); return false; }
    await saves.updateOne({ _id }, { $setOnInsert: { listingId, userId, createdAt: new Date().toISOString() } }, { upsert: true });
    return true;
  }
  const db = setupLocal();
  const previous = db.prepare("SELECT 1 FROM listing_saves WHERE listingId = ? AND userId = ?").get(listingId, userId);
  if (previous) { db.prepare("DELETE FROM listing_saves WHERE listingId = ? AND userId = ?").run(listingId, userId); return false; }
  db.prepare("INSERT INTO listing_saves VALUES (?, ?, ?)").run(listingId, userId, new Date().toISOString());
  return true;
}

export async function isSaved(listingId: string, userId: string) {
  const mongo = await getMongoDb();
  if (mongo) return Boolean(await mongo.collection<Save & { _id: string }>("listing_saves").findOne({ _id: `${listingId}:${userId}` }));
  return Boolean(setupLocal().prepare("SELECT 1 FROM listing_saves WHERE listingId = ? AND userId = ?").get(listingId, userId));
}

export async function savedListingIds(userId: string) {
  const mongo = await getMongoDb();
  if (mongo) return (await mongo.collection<Save>("listing_saves").find({ userId }).sort({ createdAt: -1 }).toArray()).map(s => s.listingId);
  return (setupLocal().prepare("SELECT listingId FROM listing_saves WHERE userId = ? ORDER BY createdAt DESC").all(userId) as Array<{ listingId: string }>).map(s => s.listingId);
}

export async function engagementData(listingIds?: string[]) {
  const mongo = await getMongoDb();
  const filter = listingIds ? { listingId: { $in: listingIds } } : {};
  const where = listingIds ? ` WHERE listingId IN (${listingIds.map(() => "?").join(",")})` : "";
  const events = mongo
    ? await mongo.collection<Event>("listing_events").find(filter).toArray()
    : setupLocal().prepare(`SELECT listingId, visitorKey, action, createdAt FROM listing_events${where}`).all(...(listingIds ?? [])) as Event[];
  const saves = mongo
    ? await mongo.collection<Save>("listing_saves").find(filter).toArray()
    : setupLocal().prepare(`SELECT listingId, userId, createdAt FROM listing_saves${where}`).all(...(listingIds ?? [])) as Save[];
  return { events, saves };
}

export async function enrichListings(listings: Listing[]): Promise<Listing[]> {
  if (!listings.length) return listings;
  const { events, saves } = await engagementData(listings.map(listing => listing.id));
  const byListing = new Map<string, Event[]>();
  const savesByListing = new Map<string, Save[]>();
  for (const event of events) byListing.set(event.listingId, [...(byListing.get(event.listingId) ?? []), event]);
  for (const save of saves) savesByListing.set(save.listingId, [...(savesByListing.get(save.listingId) ?? []), save]);
  const now = Date.now();
  return listings.map(listing => {
    const e = byListing.get(listing.id) ?? [];
    const s = savesByListing.get(listing.id) ?? [];
    const count = (action: EngagementAction) => e.filter(item => item.action === action).length;
    const recentWeight = (date: string) => {
      const age = now - new Date(date).getTime();
      return age < 24 * 3600_000 ? 3 : age < 7 * 24 * 3600_000 ? 1 : 0;
    };
    const trendingScore = e.reduce((score, item) => score + recentWeight(item.createdAt) *
      ({ view: 1, call: 5, whatsapp: 5, share: 3 }[item.action]), 0)
      + s.reduce((score, item) => score + recentWeight(item.createdAt) * 3, 0);
    return {
      ...listing, views: count("view"),
      uniqueViews: new Set(e.filter(item => item.action === "view").map(item => item.visitorKey)).size,
      saves: s.length, calls: count("call"), whatsappClicks: count("whatsapp"), shares: count("share"),
      trendingScore,
    };
  });
}

export async function uniqueMarketplaceVisitors() {
  const { events } = await engagementData();
  return new Set(events.filter(event => event.action === "view").map(event => event.visitorKey)).size;
}

export async function deleteEngagement(listingId: string) {
  const mongo = await getMongoDb();
  if (mongo) {
    await Promise.all([
      mongo.collection("listing_events").deleteMany({ listingId }),
      mongo.collection("listing_saves").deleteMany({ listingId }),
    ]);
  } else {
    const db = setupLocal();
    db.prepare("DELETE FROM listing_events WHERE listingId = ?").run(listingId);
    db.prepare("DELETE FROM listing_saves WHERE listingId = ?").run(listingId);
  }
}
