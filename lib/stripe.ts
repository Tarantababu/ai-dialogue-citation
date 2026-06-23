import "server-only";
import Stripe from "stripe";

/**
 * Server-only Stripe client + pricing config. The secret key never reaches the
 * browser. Per-seal pricing is read from SEAL_PRICE_CENTS (defaults to $2.00).
 */

export const SEAL_PRICE_CENTS = Number(process.env.SEAL_PRICE_CENTS ?? "200");
export const SEAL_CURRENCY = (process.env.SEAL_CURRENCY ?? "usd").toLowerCase();

export const isStripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_SECRET_KEY !== "sk_test_YOUR_STRIPE_SECRET_KEY",
);

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isStripeConfigured) {
    throw new Error(
      "Payments are not configured on the server (STRIPE_SECRET_KEY).",
    );
  }
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      typescript: true,
    });
  }
  return cached;
}

/** Metadata keys stamped onto the Stripe PaymentIntent (our idempotency store). */
export const META = {
  ipfsCID: "decite_ipfs_cid",
  sourceRef: "decite_source_ref",
  authorName: "decite_author_name",
  origin: "decite_origin",
  platform: "decite_platform",
  model: "decite_model",
  sourceUrl: "decite_source_url",
  email: "decite_email",
  listPublic: "decite_list_public",
  // Written after a successful seal - presence means "already finalized".
  code: "decite_code",
  txHash: "decite_tx",
  timestamp: "decite_ts",
  custodian: "decite_custodian",
} as const;
