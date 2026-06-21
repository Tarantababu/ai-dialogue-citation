"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle, Plus, Minus, ArrowRight, MessageSquareHeart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Grouped Q&A. Each id maps to faq.q.<id> / faq.a.<id> in the dictionary. */
const GROUPS: { titleKey: string; ids: string[] }[] = [
  { titleKey: "faq.group.about", ids: ["what", "who", "free"] },
  {
    titleKey: "faq.group.sealing",
    ids: ["how", "linkVsPaste", "platforms", "gemini", "account", "time", "language"],
  },
  { titleKey: "faq.group.citation", ids: ["code", "cite", "edit", "lost"] },
  { titleKey: "faq.group.readers", ids: ["lookup", "readerAccount"] },
  { titleKey: "faq.group.trust", ids: ["where", "ifGone", "timestamp"] },
  { titleKey: "faq.group.privacy", ids: ["public", "sensitive", "email"] },
];

export default function FaqPage() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>("what");

  return (
    <div className="mx-auto max-w-2xl px-5">
      {/* ── Header ────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-16 text-center sm:pt-24"
      >
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
          <HelpCircle className="h-7 w-7 text-bronze" strokeWidth={1.5} />
        </div>
        <p className="eyebrow mb-3">{t("brand.tagline")}</p>
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
          {t("faq.title")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {t("faq.subtitle")}
        </p>
      </motion.header>

      {/* ── Question groups ───────────────────────────────────── */}
      <div className="mt-14 space-y-12">
        {GROUPS.map((group) => (
          <section key={group.titleKey}>
            <h2 className="eyebrow mb-4 text-bronze">{t(group.titleKey)}</h2>
            <div className="divide-y divide-border border-y border-border">
              {group.ids.map((id) => {
                const isOpen = open === id;
                return (
                  <div key={id}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-4 py-4 text-left"
                    >
                      <span
                        className={cn(
                          "font-serif text-lg font-medium leading-snug transition-colors",
                          isOpen ? "text-bronze" : "text-foreground",
                        )}
                      >
                        {t(`faq.q.${id}`)}
                      </span>
                      <span className="mt-1 shrink-0 text-bronze" aria-hidden>
                        {isOpen ? (
                          <Minus className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="-mt-1 pb-5 pr-8 text-[15px] leading-relaxed text-muted-foreground"
                      >
                        {t(`faq.a.${id}`)}
                      </motion.p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* ── Still have a question ─────────────────────────────── */}
      <section className="mt-16 rounded-xl border border-seal/30 bg-seal-soft/40 p-6 text-center sm:p-8">
        <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-seal-soft">
          <MessageSquareHeart className="h-5 w-5 text-seal" strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-xl font-semibold text-foreground">
          {t("faq.stillTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("faq.stillBody")}
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/geri-bildirim"
            className="inline-flex items-center justify-center rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-bronze"
          >
            {t("faq.stillCta")}
          </Link>
          <Link
            href="/muhurle"
            className="group inline-flex items-center justify-center gap-1.5 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-bronze"
          >
            {t("faq.sealCta")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
