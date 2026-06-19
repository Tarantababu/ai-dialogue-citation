import "server-only";
import {
  publicClient,
  CONTRACT_ADDRESS,
  CITATION_REGISTRY_ABI,
  isContractConfigured,
} from "@/lib/contract";
import { normalizeCitationCode } from "@/lib/citation";
import type {
  OnChainCitation,
  SealedPayload,
  VerificationRecord,
} from "@/lib/types";

export type VerifyOutcome =
  | { status: "ok"; record: VerificationRecord }
  | { status: "not-found" }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

function gatewayUrl(cid: string): string {
  const host = process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "gateway.pinata.cloud";
  return `https://${host}/ipfs/${cid}`;
}

/** Best-effort fetch + shape-validation of the pinned dialogue JSON. */
async function loadPayload(cid: string): Promise<SealedPayload | null> {
  try {
    const res = await fetch(gatewayUrl(cid), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (
      data &&
      typeof data === "object" &&
      Array.isArray((data as Record<string, unknown>).messages)
    ) {
      return data as SealedPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve a citation code fully: read the on-chain record, then hydrate the
 * archived dialogue from IPFS. Runs only on the server.
 */
export async function loadVerification(
  rawCode: string,
): Promise<VerifyOutcome> {
  if (!isContractConfigured) return { status: "unconfigured" };

  const code = normalizeCitationCode(rawCode);

  try {
    const result = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CITATION_REGISTRY_ABI,
      functionName: "getCitation",
      args: [code],
    })) as readonly [string, string, bigint, `0x${string}`, boolean];

    const citation: OnChainCitation = {
      sourceRef: result[0],
      ipfsCID: result[1],
      timestamp: result[2],
      author: result[3],
      isRegistered: result[4],
    };

    if (!citation.isRegistered) return { status: "not-found" };

    const payload = await loadPayload(citation.ipfsCID);

    return {
      status: "ok",
      record: {
        code,
        citation,
        payload,
        ipfsUrl: gatewayUrl(citation.ipfsCID),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // getCitation reverts with CitationNotFound for unknown codes.
    if (message.includes("CitationNotFound")) return { status: "not-found" };
    return { status: "error", message };
  }
}
