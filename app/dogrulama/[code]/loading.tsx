"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Streamed loading state for a citation page. Because `loading.tsx` wraps the
 * route in a Suspense boundary, this shows instantly on click (and on direct
 * load) while the on-chain + archive lookup runs, so a click never feels like
 * nothing happened.
 */
export default function VerificationLoading() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      {/* Looking-up banner */}
      <div className="flex flex-col items-center gap-4 rounded-lg border border-seal/30 bg-seal-soft p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-seal/40 text-seal">
          <ShieldCheck className="h-8 w-8 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-seal">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-serif text-lg">{t("verify.loading")}</span>
        </div>
      </div>

      {/* Skeleton of the citation + details cards */}
      <div className="mt-8 space-y-4" aria-hidden>
        <div className="h-28 animate-pulse rounded-lg border border-border bg-secondary/60" />
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-secondary/60" />
          <div className="h-40 animate-pulse rounded-md border border-border bg-secondary/60" />
        </div>
      </div>
    </div>
  );
}
