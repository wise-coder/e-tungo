import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const OPTIONS = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const DUMMY = `scrypt$131072$8$1$${"00".repeat(16)}$${"00".repeat(64)}`;
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, OPTIONS, (error, result) => error ? reject(error) : resolve(result));
  });
}
export function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 15 && value.length <= 128;
}
export async function hashPassword(password: string) {
  if (!validPassword(password)) throw new Error("Password must contain 15–128 characters.");
  const salt = randomBytes(16);
  const hash = await derive(password, salt);
  return `scrypt$131072$8$1$${salt.toString("hex")}$${hash.toString("hex")}`;
}
export async function verifyPassword(password: unknown, encoded?: string | null) {
  if (typeof password !== "string" || password.length > 128) return false;
  const safeHash = encoded && /^scrypt\$131072\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(encoded) ? encoded : DUMMY;
  const parts = safeHash.split("$");
  const actual = await derive(password, Buffer.from(parts[4], "hex"));
  return timingSafeEqual(actual, Buffer.from(parts[5], "hex")) && safeHash !== DUMMY;
}
