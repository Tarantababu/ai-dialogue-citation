"use server";

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sealFromShareLink, sealFromDirectText } from "./pinata";
import {
  publicClient,
  activeChain,
  CONTRACT_ADDRESS,
  CITATION_REGISTRY_ABI,
  isContractConfigured,
} from "@/lib/contract";
import { findAvailableCitationCode } from "@/lib/citation";
import type { PinResult, SealInput, SealRegisterResult } from "@/lib/types";

/**
 * ────────────────────────────────────────────────────────────────────────
 *  DeCite — Wallet-free custodial sealing.
 *
 *  Users never connect a wallet. A single server-managed relayer wallet
 *  (RELAYER_PRIVATE_KEY) pays gas and notarizes every citation on Polygon.
 *  The human author is recorded off-chain in the IPFS payload; the on-chain
 *  `author` field is the DeCite custodian address.
 *
 *  ⚠️ The relayer key is SERVER-ONLY (never NEXT_PUBLIC_) and must never reach
 *  the client. Gate this action behind payment / rate-limiting before going to
 *  production — every call spends real gas from the relayer wallet.
 * ────────────────────────────────────────────────────────────────────────
 */

const RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

/** Build a viem wallet client from the relayer key, or throw a clear error. */
function getRelayer() {
  const raw = process.env.RELAYER_PRIVATE_KEY;
  if (!raw || raw === "0xYOUR_RELAYER_PRIVATE_KEY") {
    throw new Error(
      "The signing service is not configured. Set RELAYER_PRIVATE_KEY in the server environment.",
    );
  }
  const key = (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
  const account = privateKeyToAccount(key);
  const walletClient = createWalletClient({
    account,
    chain: activeChain,
    transport: http(RPC_URL),
  });
  return { account, walletClient };
}

/**
 * Unified entry point used by the minter: pin → reserve code → notarize.
 * Returns a fully serializable result (no BigInt) for the client.
 */
export async function sealAndRegister(
  input: SealInput,
): Promise<SealRegisterResult> {
  try {
    // ── Validation ───────────────────────────────────────────────
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
    const authorName = input.authorName?.trim() || null;

    // ── 1 · Pin the dialogue to IPFS ─────────────────────────────
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

    // ── 2 · Reserve a deterministic DeCite code ──────────────────
    const code = await findAvailableCitationCode(async (candidate) => {
      return (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CITATION_REGISTRY_ABI,
        functionName: "exists",
        args: [candidate],
      })) as boolean;
    });

    // ── 3 · Notarize on Polygon via the relayer wallet ───────────
    const { account, walletClient } = getRelayer();
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CITATION_REGISTRY_ABI,
      functionName: "registerCitation",
      args: [code, sourceRef, pin.ipfsCID],
    });

    // ── 4 · Wait for confirmation ────────────────────────────────
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    if (receipt.status !== "success") {
      return { ok: false, error: "The notarizing transaction reverted on-chain." };
    }

    const block = await publicClient.getBlock({
      blockNumber: receipt.blockNumber,
    });

    return {
      ok: true,
      code,
      txHash,
      ipfsCID: pin.ipfsCID,
      timestamp: Number(block.timestamp),
      custodian: account.address,
      authorName,
      platform: pin.platform,
      origin: pin.origin,
      sourceUrl: pin.sourceUrl,
      chainId: activeChain.id,
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
