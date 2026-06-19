import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type { ReceiptEntry } from "@/lib/types";

/**
 * Receipt store (email → sealed codes) backed by Upstash Redis.
 * Emails are hashed before use as keys so plaintext addresses are never stored.
 * When KV is not configured, all operations no-op gracefully.
 */

export const kvConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!kvConfigured) return null;
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

function receiptKey(email: string): string {
  const hash = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `decite:receipt:${hash}`;
}

const MAX_RECEIPTS = 200;

/** Append a receipt for an author's email (best-effort). */
export async function recordReceipt(
  email: string | null | undefined,
  entry: ReceiptEntry,
): Promise<void> {
  const r = getRedis();
  if (!r || !email?.trim()) return;
  const key = receiptKey(email);
  await r.lpush(key, JSON.stringify(entry));
  await r.ltrim(key, 0, MAX_RECEIPTS - 1);
}

/** Read all receipts for an email, most recent first. */
export async function getReceipts(email: string): Promise<ReceiptEntry[]> {
  const r = getRedis();
  if (!r || !email.trim()) return [];
  const items = await r.lrange<string | ReceiptEntry>(receiptKey(email), 0, -1);
  const parsed: ReceiptEntry[] = [];
  for (const item of items) {
    try {
      const obj = typeof item === "string" ? JSON.parse(item) : item;
      if (obj && typeof obj.code === "string") parsed.push(obj as ReceiptEntry);
    } catch {
      // skip malformed entry
    }
  }
  return parsed;
}
