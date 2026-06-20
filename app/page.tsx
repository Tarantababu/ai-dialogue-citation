"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileSignature,
  ScanSearch,
  Anchor,
  Clock,
  Quote,
  Globe,
  ExternalLink,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CONTRACT_ADDRESS, activeChain, isContractConfigured } from "@/lib/contract";
import { explorerReadContractUrl } from "@/lib/citation";

export default function HomePage() {
  const { t } = useI18n();

  const pillars = [
    {
      icon: Anchor,
      title: t("home.pillars.permanence.title"),
      body: t("home.pillars.permanence.body"),
    },
    {
      icon: Clock,
      title: t("home.pillars.timestamp.title"),
      body: t("home.pillars.timestamp.body"),
    },
    {
      icon: Quote,
      title: t("home.pillars.citation.title"),
      body: t("home.pillars.citation.body"),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="grid gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-8"
        >
          <p className="eyebrow mb-5">{t("home.eyebrow")}</p>
          <h1 className="max-w-3xl text-balance font-serif text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
            {t("home.hero.title")}
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {t("home.hero.lede")}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/muhurle"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-bronze"
            >
              {t("cta.mint.action")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dogrulama"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-bronze hover:text-bronze"
            >
              {t("cta.verify.action")}
            </Link>
          </div>
        </motion.div>

        {/* Specimen citation card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
          className="lg:col-span-4"
        >
          <div className="rounded-md border border-border bg-card p-6 shadow-sm">
            <p className="eyebrow mb-4">Specimen</p>
            <p className="font-mono text-sm text-bronze">DC-20260619-01</p>
            <div className="my-4 hairline" />
            <p className="font-serif text-sm italic leading-relaxed text-muted-foreground">
              Aydın, Y. (2026, June 19). On the ethics of synthetic reasoning
              [Sealed human–AI dialogue, DC-20260619-01]. DeCite.
            </p>
          </div>
        </motion.div>
      </section>

      <div className="hairline" />

      {/* ── The crisis ───────────────────────────────────────── */}
      <section className="grid gap-10 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-4">
          <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            {t("home.crisis.title")}
          </h2>
        </div>
        <div className="lg:col-span-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t("home.crisis.body")}
          </p>
          <blockquote className="academic-quote mt-8 font-serif text-xl">
            &ldquo;{t("home.quote")}&rdquo;
          </blockquote>
        </div>
      </section>

      <div className="hairline" />

      {/* ── Pillars ──────────────────────────────────────────── */}
      <section className="my-16 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.title} className="bg-card p-8">
            <p.icon className="h-6 w-6 text-bronze" strokeWidth={1.5} />
            <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
              {p.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </div>
        ))}
      </section>

      {/* ── Independent permanence ───────────────────────────── */}
      <section className="my-16 rounded-md border border-seal/30 bg-seal-soft/50 p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <div className="mb-3 flex items-center gap-2.5">
              <Globe className="h-6 w-6 shrink-0 text-seal" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                {t("home.independent.title")}
              </h2>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("home.independent.body")}
            </p>
          </div>
          {isContractConfigured && (
            <div className="lg:col-span-4 lg:text-right">
              <a
                href={explorerReadContractUrl(activeChain.id, CONTRACT_ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm border border-bronze/40 bg-card px-5 py-3 text-sm font-medium text-bronze transition-colors hover:bg-accent"
              >
                {t("home.independent.viewRegistry")}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Dual portals ─────────────────────────────────────── */}
      <section className="grid gap-6 pb-24 md:grid-cols-2">
        <PortalCard
          href="/muhurle"
          icon={<FileSignature className="h-7 w-7 text-bronze" strokeWidth={1.5} />}
          title={t("cta.mint.title")}
          desc={t("cta.mint.desc")}
          action={t("cta.mint.action")}
        />
        <PortalCard
          href="/dogrulama"
          icon={<ScanSearch className="h-7 w-7 text-bronze" strokeWidth={1.5} />}
          title={t("cta.verify.title")}
          desc={t("cta.verify.desc")}
          action={t("cta.verify.action")}
        />
      </section>
    </div>
  );
}

function PortalCard({
  href,
  icon,
  title,
  desc,
  action,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-md border border-border bg-card p-8 transition-colors hover:border-bronze"
    >
      {icon}
      <h3 className="mt-6 font-serif text-2xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {desc}
      </p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-bronze">
        {action}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
