"use server";

import { headers } from "next/headers";
import { sealFromShareLink, sealFromDirectText } from "./pinata";
import {
  getStripe,
  isStripeConfigured,
  SEAL_PRICE_CENTS,
  SEAL_CURRENCY,
  META,
} from "@/lib/stripe";
import { isContractConfigured } from "@/lib/contract";
import { enforceSealLimit } from "@/lib/ratelimit";
import type { PinResult, SealInput } from "@/lib/types";

/**
 * Payment-gated sealing (Option: per-seal fee, email-only).
 *
 * Order of operations: pin the dialogue to IPFS FIRST (cheap, no gas), stash
 * the resulting CID + reference on the Stripe PaymentIntent metadata, then send
 * the user to Stripe Checkout. The on-chain notarization (which costs gas) only
 * happens AFTER payment, in lib/seal-finalize.ts. This protects the relayer
 * wallet: no payment, no gas spent.
 */

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function cap(value: string | undefined, max: number): string {
  return (value ?? "").slice(0, max);
}

async function baseUrl(): Promise<string> {
  const h = await headers();
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function createSealCheckout(
  input: SealInput,
): Promise<CheckoutResult> {
  try {
    const sourceRef = input.sourceRef?.trim();
    if (!sourceRef) {
      return { ok: false, error: "Please provide a bibliographic reference." };
    }
    if (!isContractConfigured) {
      return {
        ok: false,
        error:
          "The registry contract is not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.",
      };
    }
    if (!isStripeConfigured) {
      return {
        ok: false,
        error: "Payments are not configured. Set STRIPE_SECRET_KEY.",
      };
    }

    // Per-IP rate limit (no global cap — payment self-limits gas).
    const gate = await enforceSealLimit(false);
    if (!gate.ok) return { ok: false, error: gate.error };

    const authorName = input.authorName?.trim() || null;
    const email = input.email?.trim();

    // ── 1 · Pin the dialogue to IPFS (pre-payment) ───────────────
    let pin: PinResult;
    if (input.method === "share-link") {
      if (!input.shareUrl?.trim()) {
        return { ok: false, error: "Please provide a share URL." };
      }
      pin = await sealFromShareLink(input.shareUrl.trim(), sourceRef, authorName);
    } else {
      if (!input.text?.trim()) {
        return { ok: false, error: "Please provide the conversation content." };
      }
      pin = await sealFromDirectText(
        input.text,
        sourceRef,
        authorName,
        input.originUrl ?? null,
      );
    }
    if (!pin.ok) return { ok: false, error: pin.error };

    // ── 2 · Create the Stripe Checkout Session ───────────────────
    const stripe = getStripe();
    const base = await baseUrl();

    const sealMeta: Record<string, string> = {
      [META.ipfsCID]: pin.ipfsCID,
      [META.sourceRef]: cap(sourceRef, 480),
      [META.authorName]: cap(authorName ?? "", 200),
      [META.origin]: pin.origin,
      [META.platform]: pin.platform,
      [META.model]: cap(pin.model ?? "", 80),
      [META.sourceUrl]: cap(pin.sourceUrl ?? "", 480),
      [META.email]: cap(email ?? "", 200),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "if_required",
      ...(email ? { customer_email: email } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: SEAL_CURRENCY,
            unit_amount: SEAL_PRICE_CENTS,
            product_data: {
              name: "DeCite — Citation Seal",
              description: cap(sourceRef, 200),
            },
          },
        },
      ],
      metadata: sealMeta,
      payment_intent_data: { metadata: sealMeta },
      success_url: `${base}/muhurle/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/muhurle?canceled=1`,
    });

    if (!session.url) {
      return { ok: false, error: "Stripe did not return a checkout URL." };
    }
    return { ok: true, url: session.url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not start checkout.",
    };
  }
}
