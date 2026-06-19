import type { OnChainCitation, OriginInputType } from "@/lib/types";

/**
 * Deterministic, human-readable citation codes + bibliography formatting.
 *
 * Code grammar:  DC-YYYYMMDD-NN
 *   DC = DeCite · date · 2-digit daily sequence.
 * The sequence is resolved deterministically against on-chain state so two
 * authors sealing on the same day never collide.
 */

const CODE_REGEX = /^DC-\d{8}-\d{2,}$/;

export function isValidCitationCode(code: string): boolean {
  return CODE_REGEX.test(code.trim().toUpperCase());
}

export function normalizeCitationCode(code: string): string {
  return code.trim().toUpperCase();
}

function yyyymmdd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function buildCitationCode(date: Date, sequence: number): string {
  return `DC-${yyyymmdd(date)}-${String(sequence).padStart(2, "0")}`;
}

/**
 * Find the lowest unused daily sequence for today's date by probing on-chain
 * existence. `checkExists` should resolve to true when a code is already taken.
 */
export async function findAvailableCitationCode(
  checkExists: (code: string) => Promise<boolean>,
  now: Date = new Date(),
  maxSequence = 99,
): Promise<string> {
  for (let seq = 1; seq <= maxSequence; seq++) {
    const candidate = buildCitationCode(now, seq);
    const taken = await checkExists(candidate);
    if (!taken) return candidate;
  }
  throw new Error(
    "Daily citation sequence exhausted. Please try again after midnight UTC.",
  );
}

const ORIGIN_LABEL: Record<OriginInputType, string> = {
  "share-link": "Official AI share link",
  "direct-paste": "Direct text capture",
};

export function originLabel(origin: OriginInputType): string {
  return ORIGIN_LABEL[origin] ?? "Unknown";
}

/** Truncate a wallet address for display: 0x1234… abcd */
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Build an APA-7 style reference for a sealed human–AI collaboration.
 * Example:
 *   Author. (2026, June 19). On the ethics of synthetic reasoning
 *   [Sealed human–AI dialogue, DC-20260619-01]. DeCite.
 *   https://app.example.com/dogrulama/DC-20260619-01
 */
export function formatApaCitation(params: {
  code: string;
  citation: OnChainCitation;
  authorName?: string;
  baseUrl: string;
  platform?: string | null;
  model?: string | null;
}): string {
  const { code, citation, authorName, baseUrl, platform, model } = params;
  const date = new Date(Number(citation.timestamp) * 1000);
  const year = date.getUTCFullYear();
  const month = MONTHS[date.getUTCMonth()];
  const day = date.getUTCDate();

  const author = authorName?.trim()
    ? authorName.trim()
    : shortenAddress(citation.author);

  const title = citation.sourceRef?.trim() || "Untitled sealed dialogue";
  const url = `${baseUrl.replace(/\/$/, "")}/dogrulama/${code}`;

  const ai =
    platform && platform !== "Manual"
      ? ` with ${platform}${model ? ` (${model})` : ""}`
      : "";

  return `${author}. (${year}, ${month} ${day}). ${title} [Sealed human–AI dialogue${ai}, ${code}]. DeCite. ${url}`;
}

/** Block-explorer transaction URL for a given chain id. */
export function explorerTxUrl(chainId: number, txHash: string): string {
  const base =
    chainId === 137
      ? "https://polygonscan.com"
      : "https://amoy.polygonscan.com";
  return `${base}/tx/${txHash}`;
}

export function explorerAddressUrl(chainId: number, address: string): string {
  const base =
    chainId === 137
      ? "https://polygonscan.com"
      : "https://amoy.polygonscan.com";
  return `${base}/address/${address}`;
}
