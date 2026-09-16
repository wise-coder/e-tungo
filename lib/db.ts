import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { MongoClient, ServerApiVersion, Db } from "mongodb";
import type { Listing, User, WantedRequest } from "@/lib/types";
import { createBoostExpiry, sortListingsForMarket } from "@/lib/listing-boost";
import { deleteEngagement, enrichListings } from "@/lib/engagement";

type ListingRow = {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string | null;
  sellerPhone: string;
  sellerPhoneVerified: number | boolean;
  sellerDistrict: string;
  category: Listing["category"];
  title: string;
  price: number;
  priceUnit: string | null;
  quantity: number | null;
  district: string;
  sector: string | null;
  images: string;
  status: Listing["status"];
  views: number;
  postedAt: string;
  boostedAt: string | null;
  boostExpiresAt: string | null;
  featuredAt: string | null;
  featureExpiresAt: string | null;
  recommended: number | boolean;
  breed: string | null;
  sex: Listing["sex"] | null;
  age: string | null;
  weight: string | null;
  milkProduction: string | null;
  vaccinationStatus: string | null;
  purpose: string | null;
  chickenType: Listing["chickenType"] | null;
  litresAvailable: number | null;
  milkAvailability: Listing["milkAvailability"] | null;
  traysAvailable: number | null;
  description: string | null;
};

type WantedRequestRow = {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerDistrict: string;
  category: WantedRequest["category"];
  title: string;
  quantity: string | null;
  budget: string | null;
  neededBy: string | null;
  description: string | null;
  postedAt: string;
  status: WantedRequest["status"];
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  isAdmin: number | boolean;
  phone: string | null;
  district: string;
  userType: User["userType"];
  phoneVerified: number | boolean;
  createdAt: string;
  profileImage: string | null;
  bio: string | null;
};

type MongoListingDoc = {
  _id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string | null;
  sellerPhone: string;
  sellerPhoneVerified: boolean;
  sellerDistrict: string;
  category: Listing["category"];
  title: string;
  price: number;
  priceUnit: string | null;
  quantity: number | null;
  district: string;
  sector: string | null;
  images: string[];
  status: Listing["status"];
  views: number;
  postedAt: string;
  boostedAt: string | null;
  boostExpiresAt: string | null;
  featuredAt: string | null;
  featureExpiresAt: string | null;
  recommended: boolean;
  breed: string | null;
  sex: Listing["sex"] | null;
  age: string | null;
  weight: string | null;
  milkProduction: string | null;
  vaccinationStatus: string | null;
  purpose: string | null;
  chickenType: Listing["chickenType"] | null;
  litresAvailable: number | null;
  milkAvailability: Listing["milkAvailability"] | null;
  traysAvailable: number | null;
  description: string | null;
};

type MongoUserDoc = {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  phone: string | null;
  district: string;
  userType: User["userType"];
  phoneVerified: boolean;
  createdAt: string;
  profileImage: string | null;
  bio: string | null;
};

type MongoWantedRequestDoc = {
  _id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerDistrict: string;
  category: WantedRequest["category"];
  title: string;
  quantity: string | null;
  budget: string | null;
  neededBy: string | null;
  description: string | null;
  postedAt: string;
  status: WantedRequest["status"];
};
type MetaDoc = { _id: string; value: string };

export interface BootstrapData {
  listings: Listing[];
  wantedRequests: WantedRequest[];
}

const META_SEED_KEY = "seed_version";
const DEMO_DATA_VERSION = "3";
const MONGO_DB_NAME = process.env.MONGODB_DB_NAME?.trim() || "e-tungo";

declare global {
  var __eTungoDb: DatabaseSync | undefined;
  var __eTungoMongoClient: MongoClient | undefined;
  var __eTungoMongoDb: Db | undefined;
  var __eTungoMongoInitialized: boolean | undefined;
  var __eTungoMongoSetup: Promise<void> | undefined;
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  return uri;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isMongoMode() {
  return Boolean(getMongoUri());
}

export function ensureLocalDb() {
  if (!globalThis.__eTungoDb) {
    const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "e-tungo.sqlite");
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;

      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        sellerId TEXT NOT NULL,
        sellerName TEXT NOT NULL,
        sellerEmail TEXT,
        sellerPhone TEXT NOT NULL,
        sellerPhoneVerified INTEGER NOT NULL DEFAULT 0,
        sellerDistrict TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        price INTEGER NOT NULL,
        priceUnit TEXT,
        quantity INTEGER,
        district TEXT NOT NULL,
        sector TEXT,
        images TEXT NOT NULL,
        status TEXT NOT NULL,
      views INTEGER NOT NULL DEFAULT 0,
      postedAt TEXT NOT NULL,
      boostedAt TEXT,
      boostExpiresAt TEXT,
      featuredAt TEXT,
      featureExpiresAt TEXT,
      recommended INTEGER NOT NULL DEFAULT 0,
      breed TEXT,
        sex TEXT,
        age TEXT,
        weight TEXT,
        milkProduction TEXT,
        vaccinationStatus TEXT,
        purpose TEXT,
        chickenType TEXT,
        litresAvailable INTEGER,
        milkAvailability TEXT,
        traysAvailable INTEGER,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS wanted_requests (
        id TEXT PRIMARY KEY,
        buyerId TEXT NOT NULL,
        buyerName TEXT NOT NULL,
        buyerPhone TEXT NOT NULL,
        buyerDistrict TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        quantity TEXT,
        budget TEXT,
        neededBy TEXT,
        description TEXT,
        postedAt TEXT NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        isAdmin INTEGER NOT NULL DEFAULT 0,
        phone TEXT,
        district TEXT NOT NULL,
        userType TEXT NOT NULL,
        phoneVerified INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        profileImage TEXT,
        bio TEXT
      );
    `);
    const tableInfo = db.prepare("PRAGMA table_info(listings)").all() as Array<{ name: string }>;
    if (!tableInfo.some((column) => column.name === "sellerEmail")) {
      db.exec("ALTER TABLE listings ADD COLUMN sellerEmail TEXT");
    }
    if (!tableInfo.some((column) => column.name === "boostedAt")) {
      db.exec("ALTER TABLE listings ADD COLUMN boostedAt TEXT");
    }
    if (!tableInfo.some((column) => column.name === "boostExpiresAt")) {
      db.exec("ALTER TABLE listings ADD COLUMN boostExpiresAt TEXT");
    }
    if (!tableInfo.some((column) => column.name === "featuredAt")) db.exec("ALTER TABLE listings ADD COLUMN featuredAt TEXT");
    if (!tableInfo.some((column) => column.name === "featureExpiresAt")) db.exec("ALTER TABLE listings ADD COLUMN featureExpiresAt TEXT");
    if (!tableInfo.some((column) => column.name === "recommended")) db.exec("ALTER TABLE listings ADD COLUMN recommended INTEGER NOT NULL DEFAULT 0");
    const userTableInfo = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
    if (!userTableInfo.some((column) => column.name === "isAdmin")) db.exec("ALTER TABLE users ADD COLUMN isAdmin INTEGER NOT NULL DEFAULT 0");
    initializeLocalDb(db);
    globalThis.__eTungoDb = db;
  }

  return globalThis.__eTungoDb;
}

function initializeLocalDb(db: DatabaseSync) {
  const seeded = db
    .prepare("SELECT value FROM meta WHERE key = ?")
    .get(META_SEED_KEY) as { value: string } | undefined;
  if (seeded?.value === DEMO_DATA_VERSION) return;

  db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").run(META_SEED_KEY, DEMO_DATA_VERSION);
}

function listingToLocalParams(listing: Listing) {
  return {
    id: listing.id,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    sellerEmail: listing.sellerEmail ?? null,
    sellerPhone: listing.sellerPhone,
    sellerPhoneVerified: listing.sellerPhoneVerified ? 1 : 0,
    sellerDistrict: listing.sellerDistrict,
    category: listing.category,
    title: listing.title,
    price: listing.price,
    priceUnit: listing.priceUnit ?? null,
    quantity: listing.quantity ?? null,
    district: listing.district,
    sector: listing.sector ?? null,
    images: JSON.stringify(listing.images ?? []),
    status: listing.status,
    views: listing.views,
    postedAt: listing.postedAt,
    boostedAt: listing.boostedAt ?? null,
    boostExpiresAt: listing.boostExpiresAt ?? null,
    featuredAt: listing.featuredAt ?? null,
    featureExpiresAt: listing.featureExpiresAt ?? null,
    recommended: listing.recommended ? 1 : 0,
    breed: listing.breed ?? null,
    sex: listing.sex ?? null,
    age: listing.age ?? null,
    weight: listing.weight ?? null,
    milkProduction: listing.milkProduction ?? null,
    vaccinationStatus: listing.vaccinationStatus ?? null,
    purpose: listing.purpose ?? null,
    chickenType: listing.chickenType ?? null,
    litresAvailable: listing.litresAvailable ?? null,
    milkAvailability: listing.milkAvailability ?? null,
    traysAvailable: listing.traysAvailable ?? null,
    description: listing.description ?? null,
  };
}

function wantedToLocalParams(request: WantedRequest) {
  return {
    id: request.id,
    buyerId: request.buyerId,
    buyerName: request.buyerName,
    buyerPhone: request.buyerPhone,
    buyerDistrict: request.buyerDistrict,
    category: request.category,
    title: request.title,
    quantity: request.quantity ?? null,
    budget: request.budget ?? null,
    neededBy: request.neededBy ?? null,
    description: request.description ?? null,
    postedAt: request.postedAt,
    status: request.status,
  };
}

function userToLocalParams(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin ? 1 : 0,
    phone: user.phone ?? null,
    district: user.district,
    userType: user.userType,
    phoneVerified: user.phoneVerified ? 1 : 0,
    createdAt: user.createdAt,
    profileImage: user.profileImage ?? null,
    bio: user.bio ?? null,
  };
}

function listingToMongoDoc(listing: Listing): MongoListingDoc {
  return {
    _id: listing.id,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    sellerEmail: listing.sellerEmail ?? null,
    sellerPhone: listing.sellerPhone,
    sellerPhoneVerified: listing.sellerPhoneVerified,
    sellerDistrict: listing.sellerDistrict,
    category: listing.category,
    title: listing.title,
    price: listing.price,
    priceUnit: listing.priceUnit ?? null,
    quantity: listing.quantity ?? null,
    district: listing.district,
    sector: listing.sector ?? null,
    images: listing.images ?? [],
    status: listing.status,
    views: listing.views,
    postedAt: listing.postedAt,
    boostedAt: listing.boostedAt ?? null,
    boostExpiresAt: listing.boostExpiresAt ?? null,
    featuredAt: listing.featuredAt ?? null,
    featureExpiresAt: listing.featureExpiresAt ?? null,
    recommended: Boolean(listing.recommended),
    breed: listing.breed ?? null,
    sex: listing.sex ?? null,
    age: listing.age ?? null,
    weight: listing.weight ?? null,
    milkProduction: listing.milkProduction ?? null,
    vaccinationStatus: listing.vaccinationStatus ?? null,
    purpose: listing.purpose ?? null,
    chickenType: listing.chickenType ?? null,
    litresAvailable: listing.litresAvailable ?? null,
    milkAvailability: listing.milkAvailability ?? null,
    traysAvailable: listing.traysAvailable ?? null,
    description: listing.description ?? null,
  };
}

function userToMongoDoc(user: User): MongoUserDoc {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
    phone: user.phone ?? null,
    district: user.district,
    userType: user.userType,
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt,
    profileImage: user.profileImage ?? null,
    bio: user.bio ?? null,
  };
}

function wantedToMongoDoc(request: WantedRequest): MongoWantedRequestDoc {
  return {
    _id: request.id,
    buyerId: request.buyerId,
    buyerName: request.buyerName,
    buyerPhone: request.buyerPhone,
    buyerDistrict: request.buyerDistrict,
    category: request.category,
    title: request.title,
    quantity: request.quantity ?? null,
    budget: request.budget ?? null,
    neededBy: request.neededBy ?? null,
    description: request.description ?? null,
    postedAt: request.postedAt,
    status: request.status,
  };
}

function listingFromMongoDoc(doc: MongoListingDoc): Listing {
  return {
    id: doc._id,
    sellerId: doc.sellerId,
    sellerName: doc.sellerName,
    sellerEmail: doc.sellerEmail ?? undefined,
    sellerPhone: doc.sellerPhone,
    sellerPhoneVerified: Boolean(doc.sellerPhoneVerified),
    sellerDistrict: doc.sellerDistrict,
    category: doc.category,
    title: doc.title,
    price: doc.price,
    priceUnit: doc.priceUnit ?? undefined,
    quantity: doc.quantity ?? undefined,
    district: doc.district,
    sector: doc.sector ?? undefined,
    images: doc.images ?? [],
    status: doc.status,
    views: doc.views,
    postedAt: doc.postedAt,
    boostedAt: doc.boostedAt ?? undefined,
    boostExpiresAt: doc.boostExpiresAt ?? undefined,
    featuredAt: doc.featuredAt ?? undefined,
    featureExpiresAt: doc.featureExpiresAt ?? undefined,
    recommended: Boolean(doc.recommended),
    breed: doc.breed ?? undefined,
    sex: doc.sex ?? undefined,
    age: doc.age ?? undefined,
    weight: doc.weight ?? undefined,
    milkProduction: doc.milkProduction ?? undefined,
    vaccinationStatus: doc.vaccinationStatus ?? undefined,
    purpose: doc.purpose ?? undefined,
    chickenType: doc.chickenType ?? undefined,
    litresAvailable: doc.litresAvailable ?? undefined,
    milkAvailability: doc.milkAvailability ?? undefined,
    traysAvailable: doc.traysAvailable ?? undefined,
    description: doc.description ?? undefined,
  };
}

function wantedFromMongoDoc(doc: MongoWantedRequestDoc): WantedRequest {
  return {
    id: doc._id,
    buyerId: doc.buyerId,
    buyerName: doc.buyerName,
    buyerPhone: doc.buyerPhone,
    buyerDistrict: doc.buyerDistrict,
    category: doc.category,
    title: doc.title,
    quantity: doc.quantity ?? undefined,
    budget: doc.budget ?? undefined,
    neededBy: doc.neededBy ?? undefined,
    description: doc.description ?? undefined,
    postedAt: doc.postedAt,
    status: doc.status,
  };
}

function userFromRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    isAdmin: Boolean(row.isAdmin),
    phone: row.phone ?? undefined,
    district: row.district,
    userType: row.userType,
    phoneVerified: Boolean(row.phoneVerified),
    createdAt: row.createdAt,
    profileImage: row.profileImage ?? undefined,
    bio: row.bio ?? undefined,
  };
}

function userFromMongoDoc(doc: MongoUserDoc): User {
  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    isAdmin: Boolean(doc.isAdmin),
    phone: doc.phone ?? undefined,
    district: doc.district,
    userType: doc.userType,
    phoneVerified: Boolean(doc.phoneVerified),
    createdAt: doc.createdAt,
    profileImage: doc.profileImage ?? undefined,
    bio: doc.bio ?? undefined,
  };
}

function listingSellerEmail(row: Pick<ListingRow, "sellerEmail" | "sellerPhone">) {
  const email = row.sellerEmail?.trim();
  if (email) return email;
  const phone = row.sellerPhone.trim();
  return phone.includes("@") ? phone : undefined;
}

function getMongoClient() {
  const uri = getMongoUri();
  if (!uri) return null;

  if (!globalThis.__eTungoMongoClient) {
    globalThis.__eTungoMongoClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 5_000,
    });
  }

  return globalThis.__eTungoMongoClient;
}

export async function getMongoDb() {
  const client = getMongoClient();
  if (!client) return null;

  if (!globalThis.__eTungoMongoDb) {
    await client.connect();
    globalThis.__eTungoMongoDb = client.db(MONGO_DB_NAME);
  }

  return globalThis.__eTungoMongoDb;
}

async function ensureMongoIndexes(db: Db) {
  const listings = db.collection<MongoListingDoc>("listings");
  const wantedRequests = db.collection<MongoWantedRequestDoc>("wanted_requests");
  const users = db.collection<MongoUserDoc>("users");
  const events = db.collection("listing_events");
  const saves = db.collection("listing_saves");

  await Promise.all([
    listings.createIndex({ postedAt: -1 }),
    listings.createIndex({ sellerId: 1 }),
    listings.createIndex({ status: 1 }),
    listings.createIndex({ category: 1 }),
    listings.createIndex({ boostedAt: -1 }),
    wantedRequests.createIndex({ postedAt: -1 }),
    wantedRequests.createIndex({ buyerId: 1 }),
    wantedRequests.createIndex({ status: 1 }),
    wantedRequests.createIndex({ category: 1 }),
    users.createIndex({ email: 1 }, { unique: true }),
    events.createIndex({ listingId: 1, action: 1, createdAt: -1 }),
    events.createIndex({ visitorKey: 1, action: 1 }),
    saves.createIndex({ listingId: 1 }),
    saves.createIndex({ userId: 1, createdAt: -1 }),
  ]);
}

async function ensureMongoSeeded(db: Db) {
  if (globalThis.__eTungoMongoInitialized) return;

  const meta = db.collection<MetaDoc>("meta");
  const listings = db.collection<MongoListingDoc>("listings");
  const wantedRequests = db.collection<MongoWantedRequestDoc>("wanted_requests");

  const seeded = await meta.findOne({ _id: META_SEED_KEY });
  if (seeded?.value === DEMO_DATA_VERSION) {
    globalThis.__eTungoMongoInitialized = true;
    return;
  }

  await meta.updateOne(
    { _id: META_SEED_KEY },
    { $set: { value: DEMO_DATA_VERSION } },
    { upsert: true }
  );

  globalThis.__eTungoMongoInitialized = true;
}

async function ensureMongoSetup() {
  if (!globalThis.__eTungoMongoSetup) {
    globalThis.__eTungoMongoSetup = (async () => {
      const db = await getMongoDb();
      if (!db) return;
      await ensureMongoIndexes(db);
      await ensureMongoSeeded(db);
    })();
  }

  try {
    await globalThis.__eTungoMongoSetup;
  } catch (error) {
    // A failed first connection must not pin every later request to a rejected promise.
    globalThis.__eTungoMongoSetup = undefined;
    throw error;
  }
}

async function getMongoCollections() {
  const db = await getMongoDb();
  if (!db) {
    throw new Error("MongoDB Atlas is not configured");
  }

  await ensureMongoSetup();

  return {
    db,
    meta: db.collection<MetaDoc>("meta"),
    listings: db.collection<MongoListingDoc>("listings"),
    wantedRequests: db.collection<MongoWantedRequestDoc>("wanted_requests"),
    users: db.collection<MongoUserDoc>("users"),
  };
}

export async function getBootstrapData(): Promise<BootstrapData> {
  if (isMongoMode()) {
    const { listings, wantedRequests } = await getMongoCollections();
    const [listingDocs, wantedDocs] = await Promise.all([
      listings.find({}).sort({ postedAt: -1 }).toArray(),
      wantedRequests.find({}).sort({ postedAt: -1 }).toArray(),
    ]);

    return {
      listings: sortListingsForMarket(await enrichListings(listingDocs.map(listingFromMongoDoc))),
      wantedRequests: wantedDocs.map(wantedFromMongoDoc),
    };
  }

  const db = ensureLocalDb();
  const listingRows = db
    .prepare("SELECT * FROM listings ORDER BY postedAt DESC")
    .all() as ListingRow[];
  const wantedRows = db
    .prepare("SELECT * FROM wanted_requests ORDER BY postedAt DESC")
    .all() as WantedRequestRow[];

  return {
    listings: sortListingsForMarket(await enrichListings(listingRows.map(listingFromRow))),
    wantedRequests: wantedRows.map(wantedFromRow),
  };
}

export async function upsertUser(user: User): Promise<User> {
  if (isMongoMode()) {
    const { users } = await getMongoCollections();
    await users.replaceOne({ _id: user.id }, userToMongoDoc(user), { upsert: true });
    return user;
  }

  const db = ensureLocalDb();
  db.prepare(`
    INSERT INTO users (
      id, name, email, isAdmin, phone, district, userType, phoneVerified, createdAt, profileImage, bio
    ) VALUES (
      @id, @name, @email, @isAdmin, @phone, @district, @userType, @phoneVerified, @createdAt, @profileImage, @bio
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      isAdmin = excluded.isAdmin,
      phone = excluded.phone,
      district = excluded.district,
      userType = excluded.userType,
      phoneVerified = excluded.phoneVerified,
      createdAt = excluded.createdAt,
      profileImage = excluded.profileImage,
      bio = excluded.bio
  `).run(userToLocalParams(user));

  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  if (isMongoMode()) {
    const { users } = await getMongoCollections();
    const doc = await users.findOne({ _id: id });
    return doc ? userFromMongoDoc(doc) : null;
  }

  const db = ensureLocalDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? userFromRow(row) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();

  if (isMongoMode()) {
    const { users } = await getMongoCollections();
    const doc = await users.findOne({ email: normalized });
    return doc ? userFromMongoDoc(doc) : null;
  }

  const db = ensureLocalDb();
  const row = db.prepare("SELECT * FROM users WHERE lower(email) = ?").get(normalized) as
    | UserRow
    | undefined;
  return row ? userFromRow(row) : null;
}

export async function getAllUsers(): Promise<User[]> {
  if (isMongoMode()) {
    const { users } = await getMongoCollections();
    const docs = await users.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(userFromMongoDoc);
  }

  const db = ensureLocalDb();
  const rows = db.prepare("SELECT * FROM users ORDER BY createdAt DESC").all() as UserRow[];
  return rows.map(userFromRow);
}

export async function getListingsBySellerId(sellerId: string): Promise<Listing[]> {
  if (isMongoMode()) {
    const { listings } = await getMongoCollections();
    const docs = await listings.find({ sellerId }).sort({ postedAt: -1 }).toArray();
    return enrichListings(docs.map(listingFromMongoDoc));
  }

  const db = ensureLocalDb();
  const rows = db
    .prepare("SELECT * FROM listings WHERE sellerId = ? ORDER BY postedAt DESC")
    .all(sellerId) as ListingRow[];
  return enrichListings(rows.map(listingFromRow));
}

export async function createListing(listing: Listing): Promise<Listing> {
  if (isMongoMode()) {
    const { listings } = await getMongoCollections();
    await listings.insertOne(listingToMongoDoc(listing));
    return listing;
  }

  const db = ensureLocalDb();
  db.prepare(`
    INSERT INTO listings (
      id, sellerId, sellerName, sellerEmail, sellerPhone, sellerPhoneVerified, sellerDistrict,
      category, title, price, priceUnit, quantity, district, sector, images,
      status, views, postedAt, boostedAt, boostExpiresAt, featuredAt, featureExpiresAt, recommended, breed, sex, age, weight, milkProduction,
      vaccinationStatus, purpose, chickenType, litresAvailable, milkAvailability,
      traysAvailable, description
    ) VALUES (
      @id, @sellerId, @sellerName, @sellerEmail, @sellerPhone, @sellerPhoneVerified, @sellerDistrict,
      @category, @title, @price, @priceUnit, @quantity, @district, @sector, @images,
      @status, @views, @postedAt, @boostedAt, @boostExpiresAt, @featuredAt, @featureExpiresAt, @recommended, @breed, @sex, @age, @weight, @milkProduction,
      @vaccinationStatus, @purpose, @chickenType, @litresAvailable, @milkAvailability,
      @traysAvailable, @description
    )
  `).run(listingToLocalParams(listing));

  return listing;
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
  const current = await getListingById(id);
  if (!current) return null;

  const next: Listing = {
    ...current,
    ...updates,
    id,
    images: updates.images ?? current.images,
    sellerPhoneVerified: updates.sellerPhoneVerified ?? current.sellerPhoneVerified,
  };

  if (isMongoMode()) {
    const { listings } = await getMongoCollections();
    await listings.replaceOne({ _id: id }, listingToMongoDoc(next));
    return next;
  }

  const db = ensureLocalDb();
  db.prepare(`
    UPDATE listings SET
      sellerId = @sellerId,
      sellerName = @sellerName,
      sellerEmail = @sellerEmail,
      sellerPhone = @sellerPhone,
      sellerPhoneVerified = @sellerPhoneVerified,
      sellerDistrict = @sellerDistrict,
      category = @category,
      title = @title,
      price = @price,
      priceUnit = @priceUnit,
      quantity = @quantity,
      district = @district,
      sector = @sector,
      images = @images,
      status = @status,
      views = @views,
      postedAt = @postedAt,
      boostedAt = @boostedAt,
      boostExpiresAt = @boostExpiresAt,
      featuredAt = @featuredAt,
      featureExpiresAt = @featureExpiresAt,
      recommended = @recommended,
      breed = @breed,
      sex = @sex,
      age = @age,
      weight = @weight,
      milkProduction = @milkProduction,
      vaccinationStatus = @vaccinationStatus,
      purpose = @purpose,
      chickenType = @chickenType,
      litresAvailable = @litresAvailable,
      milkAvailability = @milkAvailability,
      traysAvailable = @traysAvailable,
      description = @description
    WHERE id = @id
  `).run(listingToLocalParams(next));

  return next;
}

export async function deleteListing(id: string) {
  await deleteEngagement(id);
  if (isMongoMode()) {
    const { listings } = await getMongoCollections();
    await listings.deleteOne({ _id: id });
    return;
  }

  const db = ensureLocalDb();
  db.prepare("DELETE FROM listings WHERE id = ?").run(id);
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (isMongoMode()) {
    const { listings } = await getMongoCollections();
    const doc = await listings.findOne({ _id: id });
    return doc ? (await enrichListings([listingFromMongoDoc(doc)]))[0] : null;
  }

  const db = ensureLocalDb();
  const row = db.prepare("SELECT * FROM listings WHERE id = ?").get(id) as ListingRow | undefined;
  return row ? (await enrichListings([listingFromRow(row)]))[0] : null;
}

export async function confirmListingBoost(id: string): Promise<Listing | null> {
  const current = await getListingById(id);
  if (!current) return null;

  const next: Listing = {
    ...current,
    boostedAt: new Date().toISOString(),
    boostExpiresAt: createBoostExpiry(new Date()),
  };

  if (isMongoMode()) {
    const { listings } = await getMongoCollections();
    await listings.replaceOne({ _id: id }, listingToMongoDoc(next));
    return next;
  }

  const db = ensureLocalDb();
  db.prepare(`
    UPDATE listings SET
      boostedAt = @boostedAt,
      boostExpiresAt = @boostExpiresAt
    WHERE id = @id
  `).run({ id, boostedAt: next.boostedAt!, boostExpiresAt: next.boostExpiresAt! });

  return next;
}

export async function createWantedRequest(request: WantedRequest): Promise<WantedRequest> {
  if (isMongoMode()) {
    const { wantedRequests } = await getMongoCollections();
    await wantedRequests.insertOne(wantedToMongoDoc(request));
    return request;
  }

  const db = ensureLocalDb();
  db.prepare(`
    INSERT INTO wanted_requests (
      id, buyerId, buyerName, buyerPhone, buyerDistrict, category, title,
      quantity, budget, neededBy, description, postedAt, status
    ) VALUES (
      @id, @buyerId, @buyerName, @buyerPhone, @buyerDistrict, @category, @title,
      @quantity, @budget, @neededBy, @description, @postedAt, @status
    )
  `).run(wantedToLocalParams(request));
  return request;
}

export async function updateWantedRequest(
  id: string,
  updates: Partial<WantedRequest>
): Promise<WantedRequest | null> {
  const current = await getWantedRequestById(id);
  if (!current) return null;

  const next: WantedRequest = {
    ...current,
    ...updates,
    id,
    quantity: updates.quantity ?? current.quantity,
    budget: updates.budget ?? current.budget,
    neededBy: updates.neededBy ?? current.neededBy,
    description: updates.description ?? current.description,
  };

  if (isMongoMode()) {
    const { wantedRequests } = await getMongoCollections();
    await wantedRequests.replaceOne({ _id: id }, wantedToMongoDoc(next));
    return next;
  }

  const db = ensureLocalDb();
  db.prepare(`
    UPDATE wanted_requests SET
      buyerId = @buyerId,
      buyerName = @buyerName,
      buyerPhone = @buyerPhone,
      buyerDistrict = @buyerDistrict,
      category = @category,
      title = @title,
      quantity = @quantity,
      budget = @budget,
      neededBy = @neededBy,
      description = @description,
      postedAt = @postedAt,
      status = @status
    WHERE id = @id
  `).run(wantedToLocalParams(next));

  return next;
}

export async function deleteWantedRequest(id: string) {
  if (isMongoMode()) {
    const { wantedRequests } = await getMongoCollections();
    await wantedRequests.deleteOne({ _id: id });
    return;
  }

  const db = ensureLocalDb();
  db.prepare("DELETE FROM wanted_requests WHERE id = ?").run(id);
}

export async function getWantedRequestById(id: string): Promise<WantedRequest | null> {
  if (isMongoMode()) {
    const { wantedRequests } = await getMongoCollections();
    const doc = await wantedRequests.findOne({ _id: id });
    return doc ? wantedFromMongoDoc(doc) : null;
  }

  const db = ensureLocalDb();
  const row = db
    .prepare("SELECT * FROM wanted_requests WHERE id = ?")
    .get(id) as WantedRequestRow | undefined;
  return row ? wantedFromRow(row) : null;
}

function listingFromRow(row: ListingRow): Listing {
  return {
    id: row.id,
    sellerId: row.sellerId,
    sellerName: row.sellerName,
    sellerEmail: listingSellerEmail(row),
    sellerPhone: row.sellerPhone,
    sellerPhoneVerified: Boolean(row.sellerPhoneVerified),
    sellerDistrict: row.sellerDistrict,
    category: row.category,
    title: row.title,
    price: row.price,
    priceUnit: row.priceUnit ?? undefined,
    quantity: row.quantity ?? undefined,
    district: row.district,
    sector: row.sector ?? undefined,
    images: JSON.parse(row.images) as string[],
    status: row.status,
    views: row.views,
    postedAt: row.postedAt,
    boostedAt: row.boostedAt ?? undefined,
    boostExpiresAt: row.boostExpiresAt ?? undefined,
    featuredAt: row.featuredAt ?? undefined,
    featureExpiresAt: row.featureExpiresAt ?? undefined,
    recommended: Boolean(row.recommended),
    breed: row.breed ?? undefined,
    sex: row.sex ?? undefined,
    age: row.age ?? undefined,
    weight: row.weight ?? undefined,
    milkProduction: row.milkProduction ?? undefined,
    vaccinationStatus: row.vaccinationStatus ?? undefined,
    purpose: row.purpose ?? undefined,
    chickenType: row.chickenType ?? undefined,
    litresAvailable: row.litresAvailable ?? undefined,
    milkAvailability: row.milkAvailability ?? undefined,
    traysAvailable: row.traysAvailable ?? undefined,
    description: row.description ?? undefined,
  };
}

function wantedFromRow(row: WantedRequestRow): WantedRequest {
  return {
    id: row.id,
    buyerId: row.buyerId,
    buyerName: row.buyerName,
    buyerPhone: row.buyerPhone,
    buyerDistrict: row.buyerDistrict,
    category: row.category,
    title: row.title,
    quantity: row.quantity ?? undefined,
    budget: row.budget ?? undefined,
    neededBy: row.neededBy ?? undefined,
    description: row.description ?? undefined,
    postedAt: row.postedAt,
    status: row.status,
  };
}
