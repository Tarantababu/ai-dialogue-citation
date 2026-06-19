"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import {
  formatApaCitation,
  explorerTxUrl,
  shortenAddress,
} from "@/lib/citation";
import type { OnChainCitation, SealRegisterResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

/** Post-payment confirmation: shows the sealed code + copyable APA citation. */
export function SealSuccessView({ result }: { result: SealRegisterResult }) {
  const { t } = useI18n();

  if (!result.ok) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          {t("success.error.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          {result.error}
        </p>
        <Link href="/muhurle" className={buttonVariants({ className: "mt-8" })}>
          <ArrowLeft className="h-4 w-4" /> {t("success.retry")}
        </Link>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const citation: OnChainCitation = {
    sourceRef: "",
    ipfsCID: result.ipfsCID,
    timestamp: BigInt(result.timestamp),
    author: result.custodian,
    isRegistered: true,
  };
  const apa = formatApaCitation({
    code: result.code,
    citation,
    authorName: result.authorName ?? undefined,
    baseUrl,
    platform: result.platform,
    model: result.model,
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <div className="rounded-lg border border-seal/30 bg-seal-soft p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
          className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-seal text-seal"
        >
          <ShieldCheck className="h-7 w-7" />
        </motion.div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          {t("mint.success.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("mint.success.desc")}
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <CopyRow label={t("mint.success.code")} value={result.code} mono />

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("mint.success.apa")}
          </p>
          <CopyBlock value={apa} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <a
            href={explorerTxUrl(result.chainId, result.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-bronze hover:underline"
          >
            {t("mint.success.tx")} <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Link
            href={`/dogrulama/${result.code}`}
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-bronze"
          >
            {t("mint.viewVerify")} →
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("mint.success.custodian")}{" "}
          <span className="font-mono">{shortenAddress(result.custodian)}</span>
        </p>

        <div className="border-t border-border pt-5">
          <Link
            href="/muhurle"
            className="text-sm font-medium text-bronze hover:underline"
          >
            {t("success.sealAnother")} →
          </Link>
        </div>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`truncate text-sm ${mono ? "font-mono text-bronze" : ""}`}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="shrink-0 rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label={t("mint.copy")}
      >
        {copied ? (
          <Check className="h-4 w-4 text-seal" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

function CopyBlock({ value }: { value: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-md border border-border bg-card p-4">
      <p className="pr-10 font-serif text-sm italic leading-relaxed text-foreground">
        {value}
      </p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success(t("mint.copied"));
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label={t("mint.copy")}
      >
        {copied ? (
          <Check className="h-4 w-4 text-seal" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
