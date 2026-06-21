"use server";

import { getPublicCitations, kvConfigured } from "@/lib/kv";
import type { PublicCitationEntry } from "@/lib/types";

export type LatestCitationsResult =
  | { ok: true; entries: PublicCitationEntry[]; configured: boolean }
  | { ok: false; error: string };

/** Read the most recently sealed, publicly listed citations (newest first). */
export async function getLatestCitations(
  limit = 50,
): Promise<LatestCitationsResult> {
  if (!kvConfigured) {
    return { ok: true, entries: [], configured: false };
  }
  try {
    const entries = await getPublicCitations(limit);
    entries.sort((a, b) => b.ts - a.ts);
    return { ok: true, entries, configured: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not load the feed.",
    };
  }
}
