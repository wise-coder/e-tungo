import "server-only";
import { ensureLocalDb, getMongoDb } from "./db";

type RecordDoc = { _id: string; version: number; json: string; expiresAt: Date | null };
export type Stored<T> = { value: T; version: number };
let initialized: Promise<void> | undefined;

async function database() {
  const mongo = await getMongoDb();
  if (mongo) {
    const collection = mongo.collection<RecordDoc>("auth_state");
    initialized ??= collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).then(() => {});
    await initialized;
    return collection;
  }
  const sqlite = ensureLocalDb();
  sqlite.exec(`CREATE TABLE IF NOT EXISTS auth_state (
    id TEXT PRIMARY KEY, version INTEGER NOT NULL, json TEXT NOT NULL, expiresAt INTEGER
  ); CREATE INDEX IF NOT EXISTS auth_state_expiry ON auth_state(expiresAt);`);
  sqlite.prepare("DELETE FROM auth_state WHERE expiresAt <= ?").run(Date.now());
  return null;
}

export async function readState<T>(id: string): Promise<Stored<T> | null> {
  const mongo = await database();
  const row = mongo
    ? await mongo.findOne({ _id: id, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] })
    : ensureLocalDb().prepare("SELECT version, json FROM auth_state WHERE id = ?").get(id) as { version: number; json: string } | undefined;
  return row ? { value: JSON.parse(row.json) as T, version: row.version } : null;
}

// Compare-and-swap makes token consumption and counters atomic across workers.
export async function writeState<T>(id: string, value: T, expected: number | null, expiresAt: number | null = null) {
  const mongo = await database();
  const json = JSON.stringify(value);
  if (mongo) {
    if (expected === null) {
      try {
        await mongo.insertOne({ _id: id, version: 1, json, expiresAt: expiresAt === null ? null : new Date(expiresAt) });
        return true;
      } catch (error) {
        if ((error as { code?: number }).code === 11000) return false;
        throw error;
      }
    }
    const result = await mongo.updateOne({ _id: id, version: expected }, {
      $set: { json, expiresAt: expiresAt === null ? null : new Date(expiresAt) }, $inc: { version: 1 },
    });
    return result.modifiedCount === 1;
  }
  const db = ensureLocalDb();
  const result = expected === null
    ? db.prepare("INSERT OR IGNORE INTO auth_state (id, version, json, expiresAt) VALUES (?, 1, ?, ?)").run(id, json, expiresAt)
    : db.prepare("UPDATE auth_state SET json = ?, version = version + 1, expiresAt = ? WHERE id = ? AND version = ?").run(json, expiresAt, id, expected);
  return result.changes === 1;
}

export async function deleteState(id: string) {
  const mongo = await database();
  if (mongo) await mongo.deleteOne({ _id: id });
  else ensureLocalDb().prepare("DELETE FROM auth_state WHERE id = ?").run(id);
}
