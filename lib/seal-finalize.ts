import "server-only";
import type Stripe from "stripe";
import { getStripe, META } from "@/lib/stripe";
import { sealOnChain } from "@/lib/relayer";
import { activeChain } from "@/lib/contract";
import { recordReceipt, recordPublicCitation } from "@/lib/kv";
import { sendSealReceipt } from "@/lib/email";
import type { OriginInputType, SealRegisterResult } from "@/lib/types";

/**
 * Turn a paid Stripe session into a finalized, notarized citation.
 *
 * Idempotency: the on-chain seal result is written back onto the PaymentIntent
 * metadata. A reload (or the webhook firing after the success page) sees the
 * stored code and returns it instead of sealing twice. No database required.
 */

function reconstruct(meta: Stripe.Metadata): SealRegisterResult {
  return {
    ok: true,
    code: meta[META.code] as string,
    sourceRef: meta[META.sourceRef] || "",
    txHash: meta[META.txHash] as `0x${string}`,
    ipfsCID: meta[META.ipfsCID] as string,
    timestamp: Number(meta[META.timestamp] ?? "0"),
    custodian: meta[META.custodian] as `0x${string}`,
    authorName: meta[META.authorName] || null,
    platform: meta[META.platform] || "Manual",
    model: meta[META.model] || null,
    origin: (meta[META.origin] as OriginInputType) ?? "direct-paste",
    sourceUrl: meta[META.sourceUrl] || null,
    chainId: activeChain.id,
  };
}

async function finalizePaymentIntent(
  pi: Stripe.PaymentIntent,
): Promise<SealRegisterResult> {
  const stripe = getStripe();
  const meta = pi.metadata ?? {};

  // Already finalized → return the stored record (idempotent).
  if (meta[META.code]) return reconstruct(meta);

  const ipfsCID = meta[META.ipfsCID];
  const sourceRef = meta[META.sourceRef];
  if (!ipfsCID || !sourceRef) {
    return { ok: false, error: "This payment is missing its sealing payload." };
  }

  const seal = await sealOnChain({ sourceRef, ipfsCID });

  // Record a receipt + email it to the buyer (both best-effort).
  const buyerEmail = meta[META.email] || null;
  await recordReceipt(buyerEmail, {
    code: seal.code,
    sourceRef,
    ts: seal.timestamp,
  });

  // List in the public feed when the author opted in (default on).
  if (meta[META.listPublic] !== "0") {
    await recordPublicCitation({
      code: seal.code,
      sourceRef,
      authorName: meta[META.authorName] || null,
      platform: meta[META.platform] || "Manual",
      ts: seal.timestamp,
    });
  }
  if (buyerEmail) {
    await sendSealReceipt({
      to: buyerEmail,
      code: seal.code,
      sourceRef,
      authorName: meta[META.authorName] || null,
      platform: meta[META.platform] || "Manual",
      model: meta[META.model] || null,
      custodian: seal.custodian,
      txHash: seal.txHash,
      chainId: seal.chainId,
      timestamp: seal.timestamp,
      ipfsCID,
    });
  }

  // Persist the result so subsequent finalizations are no-ops.
  await stripe.paymentIntents.update(pi.id, {
    metadata: {
      ...meta,
      [META.code]: seal.code,
      [META.txHash]: seal.txHash,
      [META.timestamp]: String(seal.timestamp),
      [META.custodian]: seal.custodian,
    },
  });

  return {
    ok: true,
    code: seal.code,
    sourceRef,
    txHash: seal.txHash,
    ipfsCID,
    timestamp: seal.timestamp,
    custodian: seal.custodian,
    authorName: meta[META.authorName] || null,
    platform: meta[META.platform] || "Manual",
    model: meta[META.model] || null,
    origin: (meta[META.origin] as OriginInputType) ?? "direct-paste",
    sourceUrl: meta[META.sourceUrl] || null,
    chainId: seal.chainId,
  };
}

/** Finalize from a Checkout Session id (used by the success page). */
export async function finalizeCheckoutSession(
  sessionId: string,
): Promise<SealRegisterResult> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    if (session.payment_status !== "paid") {
      return { ok: false, error: "Payment has not completed for this session." };
    }
    const pi = session.payment_intent as Stripe.PaymentIntent | null;
    if (!pi || typeof pi === "string") {
      return { ok: false, error: "No payment intent is attached to this session." };
    }
    return await finalizePaymentIntent(pi);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Finalization failed.";
    return {
      ok: false,
      error: message.includes("CitationAlreadyExists")
        ? "That citation code was just taken. Please reload to retry."
        : message,
    };
  }
}

/** Finalize from a PaymentIntent id (used by the webhook backstop). */
export async function finalizePaymentIntentById(
  paymentIntentId: string,
): Promise<SealRegisterResult> {
  try {
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      return { ok: false, error: "Payment has not succeeded." };
    }
    return await finalizePaymentIntent(pi);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Finalization failed.",
    };
  }
}
