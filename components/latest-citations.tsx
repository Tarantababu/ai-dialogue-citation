"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Inbox, Loader2 } from "lucide-react";
import { getLatestCitations } from "@/app/actions/public-citations";
import type { PublicCitationEntry } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type State =
  | { status: "loading" }
  | { status: "done"; entries: PublicCitationEntry[]; configured: boolean }
  | { status: "error" };

/**
 * Public "Latest citations" feed. Self-loading on mount via a server action.
 * `compact` renders a short, borderless variant for the home page; the full
 * variant (with empty/not-configured notices) is used on /son-atiflar.
 */
export function LatestCitations({
  limit = 50,
  compact = false,
}: {
  limit?: number;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getLatestCitations(limit)
      .then((res) => {
        if (!active) return;
        setState(
          res.ok
            ? { status: "done", entries: res.entries, configured: res.configured }
            : { status: "error" },
        );
      })
      .catch(() => active && setState({ status: "error" }));
    return () => {
      active = false;
    };
  }, [limit]);

  // On the home page (compact), stay invisible until there's something to show:
  // no spinner, no empty/not-configured notices.
  if (compact) {
    if (state.status !== "done" || state.entries.length === 0) return null;
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {t("latest.title")}
          </h2>
          <Link
            href="/son-atiflar"
            className="shrink-0 text-sm font-medium text-bronze underline-offset-4 hover:underline"
          >
            {t("latest.viewAll")} →
          </Link>
        </div>
        <List entries={state.entries} anon={t("latest.anon")} />
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("latest.loading")}
      </div>
    );
  }
  if (state.status === "error") return <Notice>{t("latest.error")}</Notice>;
  if (!state.configured) return <Notice>{t("latest.notConfigured")}</Notice>;
  if (state.entries.length === 0) return <Notice>{t("latest.empty")}</Notice>;

  return <List entries={state.entries} anon={t("latest.anon")} />;
}

function List({
  entries,
  anon,
}: {
  entries: PublicCitationEntry[];
  anon: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      {entries.map((entry, i) => (
        <Link
          key={`${entry.code}-${i}`}
          href={`/dogrulama/${entry.code}`}
          className="flex items-center gap-4 border-b border-border bg-card px-4 py-3.5 transition-colors last:border-b-0 hover:bg-secondary/50"
        >
          <FileText className="h-4 w-4 shrink-0 text-bronze" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {entry.sourceRef}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-mono text-bronze">{entry.code}</span>
              {" · "}
              {entry.authorName || anon}
              {entry.platform ? ` · ${entry.platform}` : ""}
            </p>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {new Date(entry.ts * 1000).toLocaleDateString()}
          </time>
        </Link>
      ))}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-card px-6 py-10 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground" />
      <p className="max-w-sm text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
