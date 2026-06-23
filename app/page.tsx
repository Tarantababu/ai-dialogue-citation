"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Anchor, Clock, Quote, Gift, Globe, ExternalLink } from "lucide-react";
import { SealForm } from "@/components/seal-form";
import { LatestCitations } from "@/components/latest-citations";
import { useI18n } from "@/lib/i18n";
import {
  CONTRACT_ADDRESS,
  activeChain,
  isContractConfigured,
} from "@/lib/contract";
import { explorerReadContractUrl } from "@/lib/citation";
import { FREE_MODE } from "@/lib/config";

export default function HomePage() {
  const { t } = useI18n();

  const pillars = [
    { icon: Anchor, title: t("home.pillars.permanence.title"), body: t("home.pillars.permanence.body") },
    { icon: Clock, title: t("home.pillars.timestamp.title"), body: t("home.pillars.timestamp.body") },
    { icon: Quote, title: t("home.pillars.citation.title"), body: t("home.pillars.citation.body") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-16 text-center sm:pt-24"
      >
        <p className="eyebrow mb-5">{t("home.eyebrow")}</p>
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
          {t("home.hero.title")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {t("home.hero.lede")}
        </p>
      </motion.section>

      {/* ── Seal form - the primary action ───────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mt-12"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {t("mint.title")}
          </h2>
          {FREE_MODE && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-seal/30 bg-seal-soft px-3 py-1 text-xs font-medium text-seal">
              <Gift className="h-3.5 w-3.5" /> {t("mint.action.sealFree")}
            </span>
          )}
        </div>

        <Suspense fallback={null}>
          <SealForm />
        </Suspense>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("cta.verify.title")} ·{" "}
          <Link
            href="/dogrulama"
            className="font-medium text-bronze underline-offset-4 hover:underline"
          >
            {t("cta.verify.action")} →
          </Link>
        </p>
      </motion.section>

      {/* ── Latest citations (only renders when the feed has entries) ── */}
      <section className="mt-14">
        <LatestCitations compact limit={5} />
      </section>

      <div className="hairline my-16" />

      {/* ── Why it matters (minimal pillars) ─────────────────── */}
      <section className="grid gap-10 sm:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.title}>
            <p.icon className="h-5 w-5 text-bronze" strokeWidth={1.5} />
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </div>
        ))}
      </section>

      {/* ── Independent permanence ───────────────────────────── */}
      <section className="mt-16 rounded-xl border border-seal/30 bg-seal-soft/40 p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <Globe className="h-5 w-5 shrink-0 text-seal" strokeWidth={1.5} />
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {t("home.independent.title")}
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("home.independent.body")}
        </p>
        {isContractConfigured && (
          <a
            href={explorerReadContractUrl(activeChain.id, CONTRACT_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-bronze underline-offset-4 hover:underline"
          >
            {t("home.independent.viewRegistry")}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        )}
      </section>

      {/* ── Closing quote ────────────────────────────────────── */}
      <section className="py-20 text-center">
        <blockquote className="mx-auto max-w-xl font-serif text-xl italic leading-relaxed text-muted-foreground">
          &ldquo;{t("home.quote")}&rdquo;
        </blockquote>
      </section>
    </div>
  );
}
