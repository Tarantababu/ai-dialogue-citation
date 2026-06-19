import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/**
 * Seal rate limiting. Two layers:
 *   1. Per-IP sliding window (anti-spam).
 *   2. Global daily cap (bounds relayer gas spend in free mode).
 *
 * Uses Upstash Redis when configured (shared across serverless instances); a
 * best-effort in-memory fallback otherwise so the gate still works out of the
 * box, just per-instance.
 */

const SEAL_RATE_PER_HOUR = Number(process.env.SEAL_RATE_PER_HOUR ?? "5");
const SEAL_DAILY_GLOBAL_CAP = Number(process.env.SEAL_DAILY_GLOBAL_CAP ?? "200");

const upstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

let redis: Redis | null = null;
let perIpLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  if (!upstashConfigured) return null;
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

function getPerIpLimiter(): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  if (!perIpLimiter) {
    perIpLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(SEAL_RATE_PER_HOUR, "1 h"),
      prefix: "decite:rl:ip",
      analytics: false,
    });
  }
  return perIpLimiter;
}

// ── In-memory fallbacks (per warm instance) ──────────────────────────────────
const memHits = new Map<string, number[]>();
let memGlobal = { day: "", count: 0 };

function memPerIp(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const hits = (memHits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= SEAL_RATE_PER_HOUR) {
    memHits.set(ip, hits);
    return false;
  }
  hits.push(now);
  memHits.set(ip, hits);
  return true;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function checkGlobalCap(): Promise<boolean> {
  const r = getRedis();
  if (r) {
    const key = `decite:global:${today()}`;
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, 60 * 60 * 26);
    return count <= SEAL_DAILY_GLOBAL_CAP;
  }
  const day = today();
  if (memGlobal.day !== day) memGlobal = { day, count: 0 };
  memGlobal.count += 1;
  return memGlobal.count <= SEAL_DAILY_GLOBAL_CAP;
}

/** Resolve the caller's IP from proxy headers. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "0.0.0.0";
}

export type LimitResult = { ok: true } | { ok: false; error: string };

/**
 * Enforce the seal rate limit for the current request.
 * @param enforceGlobal also enforce the daily global cap (free seals).
 */
export async function enforceSealLimit(
  enforceGlobal: boolean,
): Promise<LimitResult> {
  const ip = await clientIp();

  const limiter = getPerIpLimiter();
  const ipAllowed = limiter
    ? (await limiter.limit(ip)).success
    : memPerIp(ip);

  if (!ipAllowed) {
    return {
      ok: false,
      error: `Rate limit reached (${SEAL_RATE_PER_HOUR} seals/hour). Please try again later.`,
    };
  }

  if (enforceGlobal) {
    const underCap = await checkGlobalCap();
    if (!underCap) {
      return {
        ok: false,
        error:
          "The free daily sealing limit has been reached. Please try again tomorrow.",
      };
    }
  }

  return { ok: true };
}
