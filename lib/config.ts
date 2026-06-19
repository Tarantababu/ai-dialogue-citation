/**
 * Runtime feature flags. Only NEXT_PUBLIC_* values here are safe to read from
 * client components; the rest default sensibly when read on the client.
 */

/** When true, sealing is free (rate-limited) instead of paid via Stripe. */
export const FREE_MODE =
  (process.env.NEXT_PUBLIC_FREE_MODE ?? "true").toLowerCase() === "true";

/** Display-only price label for the paid flow. */
export const SEAL_PRICE_USD = process.env.NEXT_PUBLIC_SEAL_PRICE_USD ?? "2";
