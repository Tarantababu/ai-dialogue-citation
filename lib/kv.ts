import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type {
  FeedbackEntry,
  PublicCitationEntry,
  ReceiptEntry,
} from "@/lib/types";

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

const PUBLIC_KEY = "decite:public";
const MAX_PUBLIC = 1000;

/**
 * Append a citation to the public "Latest citations" feed (best-effort).
 * Called only when the author opted in. Returns false when KV isn't configured.
 */
export async function recordPublicCitation(
  entry: PublicCitationEntry,
): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  await r.lpush(PUBLIC_KEY, JSON.stringify(entry));
  await r.ltrim(PUBLIC_KEY, 0, MAX_PUBLIC - 1);
  return true;
}

/** Read the most recently sealed public citations, newest first. */
export async function getPublicCitations(
  limit = 50,
): Promise<PublicCitationEntry[]> {
  const r = getRedis();
  if (!r) return [];
  const items = await r.lrange<string | PublicCitationEntry>(
    PUBLIC_KEY,
    0,
    limit - 1,
  );
  const out: PublicCitationEntry[] = [];
  for (const item of items) {
    try {
      const obj = typeof item === "string" ? JSON.parse(item) : item;
      if (obj && typeof obj.code === "string") out.push(obj as PublicCitationEntry);
    } catch {
      // skip malformed entry
    }
  }
  return out;
}

const FEEDBACK_KEY = "decite:feedback";
const MAX_FEEDBACK = 5000;

/** Append a feedback submission. Returns false when KV isn't configured. */
export async function recordFeedback(entry: FeedbackEntry): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  await r.lpush(FEEDBACK_KEY, JSON.stringify(entry));
  await r.ltrim(FEEDBACK_KEY, 0, MAX_FEEDBACK - 1);
  return true;
}

/** Read recent feedback, most recent first (for an admin view). */
export async function getFeedback(limit = 200): Promise<FeedbackEntry[]> {
  const r = getRedis();
  if (!r) return [];
  const items = await r.lrange<string | FeedbackEntry>(FEEDBACK_KEY, 0, limit - 1);
  const out: FeedbackEntry[] = [];
  for (const item of items) {
    try {
      const obj = typeof item === "string" ? JSON.parse(item) : item;
      if (obj && typeof obj.message === "string") out.push(obj as FeedbackEntry);
    } catch {
      // skip
    }
  }
  return out;
}
