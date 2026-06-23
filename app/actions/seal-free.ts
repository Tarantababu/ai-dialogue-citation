"use server";

import { sealFromShareLink, sealFromDirectText } from "./pinata";
import { sealOnChain } from "@/lib/relayer";
import { isContractConfigured } from "@/lib/contract";
import { enforceSealLimit } from "@/lib/ratelimit";
import { recordReceipt, recordPublicCitation } from "@/lib/kv";
import { sendSealReceipt } from "@/lib/email";
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
      pin = await sealFromDirectText(
        input.text,
        sourceRef,
        authorName,
        input.originUrl ?? null,
      );
    }
    if (!pin.ok) return { ok: false, error: pin.error };

    // ── 2 · Notarize on Polygon ──────────────────────────────────
    const seal = await sealOnChain({ sourceRef, ipfsCID: pin.ipfsCID });

    // ── 3 · Record receipt + email it (both best-effort) ─────────
    await recordReceipt(input.email, {
      code: seal.code,
      sourceRef,
      ts: seal.timestamp,
    });

    // ── 3b · List in the public feed when opted in (default on) ──
    if (input.listPublicly !== false) {
      await recordPublicCitation({
        code: seal.code,
        sourceRef,
        authorName,
        platform: pin.platform,
        ts: seal.timestamp,
      });
    }

    if (input.email?.trim()) {
      await sendSealReceipt({
        to: input.email.trim(),
        code: seal.code,
        sourceRef,
        authorName,
        platform: pin.platform,
        model: pin.model,
        custodian: seal.custodian,
        txHash: seal.txHash,
        chainId: seal.chainId,
        timestamp: seal.timestamp,
        ipfsCID: pin.ipfsCID,
      });
    }

    return {
      ok: true,
      code: seal.code,
      sourceRef,
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
        ? "That citation code was just taken. Please try again."
        : message,
    };
  }
}
