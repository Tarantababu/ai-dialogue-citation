"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Receipt, Search, Loader2, FileText, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { lookupReceipts } from "@/app/actions/receipts";
import type { ReceiptEntry } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; entries: ReceiptEntry[]; configured: boolean };

export default function ReceiptsPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState({ status: "loading" });
    const res = await lookupReceipts(email);
    if (!res.ok) {
      toast.error(res.error);
      setState({ status: "idle" });
      return;
    }
    setState({ status: "done", entries: res.entries, configured: res.configured });
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-20">
      <div className="text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
          <Receipt className="h-7 w-7 text-bronze" strokeWidth={1.5} />
        </div>
        <p className="eyebrow mb-3">{t("brand.tagline")}</p>
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          {t("receipts.title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t("receipts.subtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("receipts.placeholder")}
              className="h-12 pl-10 text-base"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={state.status === "loading"}
            className="h-12 bg-primary text-primary-foreground hover:bg-bronze"
          >
            {state.status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("receipts.action")
            )}
          </Button>
        </div>
      </form>

      {state.status === "done" && (
        <div className="mt-10">
          {!state.configured ? (
            <Notice icon={<Inbox className="h-6 w-6 text-muted-foreground" />}>
              {t("receipts.notConfigured")}
            </Notice>
          ) : state.entries.length === 0 ? (
            <Notice icon={<Inbox className="h-6 w-6 text-muted-foreground" />}>
              {t("receipts.empty")}
            </Notice>
          ) : (
            <div className="overflow-hidden rounded-md border border-border">
              {state.entries.map((entry, i) => (
                <Link
                  key={`${entry.code}-${i}`}
                  href={`/dogrulama/${entry.code}`}
                  className="flex items-center gap-4 border-b border-border bg-card px-4 py-3.5 transition-colors last:border-b-0 hover:bg-secondary/50"
                >
                  <FileText className="h-4 w-4 shrink-0 text-bronze" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm text-bronze">
                      {entry.code}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.sourceRef}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Date(entry.ts * 1000).toLocaleDateString()}
                  </time>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Notice({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-card px-6 py-10 text-center">
      {icon}
      <p className="max-w-sm text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
