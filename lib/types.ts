/**
 * Shared, explicit type contracts for the Sıfır Düşüş Protocol.
 * No `any` is permitted anywhere in the codebase — extend these instead.
 */

/** A single turn in a human–AI dialogue. */
export interface DialogueMessage {
  role: "user" | "assistant";
  text: string;
}

/** Which ingestion path produced a sealed payload. */
export type OriginInputType = "share-link" | "direct-paste";

/** The canonical JSON document that gets pinned to IPFS. */
export interface SealedPayload {
  schema: "sifir-dusus/dialogue@1";
  origin: OriginInputType;
  /** The original AI share URL, when origin === "share-link". */
  sourceUrl: string | null;
  /** Detected platform label, e.g. "ChatGPT" | "Claude" | "Manual". */
  platform: string;
  messages: DialogueMessage[];
  /** ISO-8601 capture time (informational; the seal of record is on-chain). */
  capturedAt: string;
}

/** Successful result of a Server Action that pins to IPFS. */
export interface PinSuccess {
  ok: true;
  ipfsCID: string;
  size: number;
  platform: string;
  origin: OriginInputType;
  sourceUrl: string | null;
  messageCount: number;
}

/** Failure result of a Server Action. */
export interface PinFailure {
  ok: false;
  error: string;
}

export type PinResult = PinSuccess | PinFailure;

/** On-chain citation record as decoded from CitationRegistry.getCitation. */
export interface OnChainCitation {
  sourceRef: string;
  ipfsCID: string;
  timestamp: bigint;
  author: `0x${string}`;
  isRegistered: boolean;
}

/** Fully resolved verification view-model used by the reader hub. */
export interface VerificationRecord {
  code: string;
  citation: OnChainCitation;
  payload: SealedPayload | null;
  /** IPFS gateway URL for the raw pinned file. */
  ipfsUrl: string;
}
