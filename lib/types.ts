/**
 * Shared, explicit type contracts for DeCite.
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
  schema: "decite/dialogue@1";
  origin: OriginInputType;
  /** Human author's display name, captured for citation/attribution. */
  authorName: string | null;
  /** Bibliographic reference of the host work. */
  sourceRef: string;
  /** The original AI share URL, when origin === "share-link". */
  sourceUrl: string | null;
  /** Detected platform label, e.g. "ChatGPT" | "Claude" | "Manual". */
  platform: string;
  /** AI model slug when detectable, e.g. "gpt-5-3-mini". */
  model: string | null;
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
  model: string | null;
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

/** Typed input for the unified, wallet-free seal-and-register action. */
export interface SealInput {
  method: OriginInputType;
  /** Required when method === "share-link". */
  shareUrl?: string;
  /** Required when method === "direct-paste". */
  text?: string;
  sourceRef: string;
  authorName?: string;
  /** Optional email so the author can look up their receipt later. */
  email?: string;
  /** Direct-paste only: the original AI conversation URL, for provenance. */
  originUrl?: string;
}

/** A receipt entry, keyed off the author's email in KV. */
export interface ReceiptEntry {
  code: string;
  sourceRef: string;
  ts: number;
}

/** Category of a feedback submission. */
export type FeedbackType = "suggestion" | "bug" | "praise" | "other";

/** A stored feedback / suggestion submission. */
export interface FeedbackEntry {
  type: FeedbackType;
  message: string;
  email: string | null;
  ts: number;
}

/** Successful result of the custodial seal-and-register action. */
export interface SealRegisterSuccess {
  ok: true;
  code: string;
  txHash: `0x${string}`;
  ipfsCID: string;
  /** Unix seconds of the sealing block. */
  timestamp: number;
  /** The on-chain notarizing wallet (DeCite custodian / relayer). */
  custodian: `0x${string}`;
  authorName: string | null;
  platform: string;
  model: string | null;
  origin: OriginInputType;
  sourceUrl: string | null;
  chainId: number;
}

export type SealRegisterResult = SealRegisterSuccess | { ok: false; error: string };

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
