"use server";

import { getReceipts, kvConfigured } from "@/lib/kv";
import type { ReceiptEntry } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ReceiptLookupResult =
  | { ok: true; entries: ReceiptEntry[]; configured: boolean }
  | { ok: false; error: string };

/** Look up the citation codes sealed under a given email address. */
export async function lookupReceipts(
  rawEmail: string,
): Promise<ReceiptLookupResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!kvConfigured) {
    // No store configured — be explicit so the operator knows why it's empty.
    return { ok: true, entries: [], configured: false };
  }
  try {
    const entries = await getReceipts(email);
    entries.sort((a, b) => b.ts - a.ts);
    return { ok: true, entries, configured: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Lookup failed.",
    };
  }
}
