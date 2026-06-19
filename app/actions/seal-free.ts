"use server";

import { sealFromShareLink, sealFromDirectText } from "./pinata";
import { sealOnChain } from "@/lib/relayer";
import { isContractConfigured } from "@/lib/contract";
import { enforceSealLimit } from "@/lib/ratelimit";
import { recordReceipt } from "@/lib/kv";
import { FREE_MODE } from "@/lib/config";
import type { PinResult, SealInput, SealRegisterResult } from "@/lib/types";

/**
 * Free, rate-limited sealing. Active while FREE_MODE is on (the launch period).
 * The relayer is protected by a per-IP rate limit + a global daily cap rather
 * than by payment. Pins to IPFS, notarizes on-chain, and records a receipt.
 */
export async function sealFree(input: SealInput): Promise<SealRegisterResult> {
  try {
    if (!FREE_MODE) {
      return { ok: false, error: "Free sealing is currently disabled." };
    }
    if (!isContractConfigured) {
      return {
        ok: false,
        error:
          "The registry contract is not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.",
      };
    }

    // ── Rate limit (per-IP + global daily cap) ───────────────────
    const gate = await enforceSealLimit(true);
    if (!gate.ok) return { ok: false, error: gate.error };

    const sourceRef = input.sourceRef?.trim();
    if (!sourceRef) {
      return { ok: false, error: "Please provide a bibliographic reference." };
    }
    const authorName = input.authorName?.trim() || null;

    // ── 1 · Pin to IPFS ──────────────────────────────────────────
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
      pin = await sealFromDirectText(input.text, sourceRef, authorName);
    }
    if (!pin.ok) return { ok: false, error: pin.error };

    // ── 2 · Notarize on Polygon ──────────────────────────────────
    const seal = await sealOnChain({ sourceRef, ipfsCID: pin.ipfsCID });

    // ── 3 · Record receipt (best-effort) ─────────────────────────
    await recordReceipt(input.email, {
      code: seal.code,
      sourceRef,
      ts: seal.timestamp,
    });

    return {
      ok: true,
      code: seal.code,
      txHash: seal.txHash,
      ipfsCID: pin.ipfsCID,
      timestamp: seal.timestamp,
      custodian: seal.custodian,
      authorName,
      platform: pin.platform,
      model: pin.model,
      origin: pin.origin,
      sourceUrl: pin.sourceUrl,
      chainId: seal.chainId,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Sealing failed unexpectedly.";
    return {
      ok: false,
      error: message.includes("CitationAlreadyExists")
        ? "That citation code was just taken — please try again."
        : message,
    };
  }
}
