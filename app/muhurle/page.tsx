"use client";

import { Suspense } from "react";
import { Gift, Sparkles } from "lucide-react";
import { SealForm } from "@/components/seal-form";
import { isContractConfigured } from "@/lib/contract";
import { FREE_MODE } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

export default function MintPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <header className="mb-8">
        <p className="eyebrow mb-3">{t("brand.tagline")}</p>
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          {t("mint.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("mint.subtitle")}</p>
      </header>

      <div className="mb-6 flex items-start gap-3 rounded-md border border-seal/30 bg-seal-soft p-4 text-sm">
        {FREE_MODE ? (
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
        ) : (
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
        )}
        <span className="text-foreground">
          {FREE_MODE ? t("mint.freeLaunch") : t("mint.noWallet")}
        </span>
      </div>

      {!isContractConfigured && (
        <div className="mb-6 rounded-md border border-bronze/40 bg-accent p-4 text-sm text-accent-foreground">
          {t("mint.warn.noContract")}
        </div>
      )}

      <Suspense fallback={null}>
        <SealForm />
      </Suspense>
    </div>
  );
}
