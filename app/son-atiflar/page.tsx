"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { LatestCitations } from "@/components/latest-citations";
import { useI18n } from "@/lib/i18n";

export default function LatestCitationsPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl px-5">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-16 text-center sm:pt-24"
      >
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
          <Sparkles className="h-7 w-7 text-bronze" strokeWidth={1.5} />
        </div>
        <p className="eyebrow mb-3">{t("brand.tagline")}</p>
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
          {t("latest.title")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {t("latest.subtitle")}
        </p>
      </motion.header>

      <section className="mt-12">
        <LatestCitations limit={50} />
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/muhurle"
          className="group inline-flex items-center justify-center gap-1.5 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-bronze"
        >
          {t("latest.sealCta")}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="h-20" />
    </div>
  );
}
