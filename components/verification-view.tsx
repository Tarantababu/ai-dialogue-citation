"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  FileText,
  Database,
  AlertTriangle,
  Settings2,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  shortenAddress,
  originLabel,
  explorerAddressUrl,
} from "@/lib/citation";
import type { DialogueMessage, OriginInputType } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export type VerificationViewModel =
  | {
      status: "ok";
      code: string;
      sourceRef: string;
      ipfsCID: string;
      ipfsUrl: string;
      author: `0x${string}`;
      timestamp: number;
      registryAddress: `0x${string}`;
      chainId: number;
      origin: OriginInputType | null;
      platform: string | null;
      sourceUrl: string | null;
      messages: DialogueMessage[] | null;
    }
  | { status: "not-found"; code: string }
  | { status: "unconfigured"; code: string }
  | { status: "error"; code: string };

export function VerificationView({ model }: { model: VerificationViewModel }) {
  const { t } = useI18n();

  if (model.status !== "ok") {
    return <StatusState model={model} />;
  }

  const date = new Date(model.timestamp * 1000);
  const formattedDate = date.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <Link
        href="/dogrulama"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("verify.back")}
      </Link>

      {/* ── Seal banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-lg border border-seal/30 bg-seal-soft p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <motion.div
            initial={{ scale: 1.3, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: -6 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-seal text-seal"
          >
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          <div>
            <p className="font-mono text-sm text-seal">{model.code}</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-foreground">
              {t("verify.sealed")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {model.sourceRef}
            </p>
          </div>
        </div>
      </div>

      {/* ── Metadata table ───────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
          {t("verify.meta.title")}
        </h2>
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableBody>
              <MetaRow label={t("verify.meta.code")}>
                <span className="font-mono text-bronze">{model.code}</span>
              </MetaRow>
              <MetaRow label={t("verify.meta.timestamp")}>
                {formattedDate} UTC
              </MetaRow>
              <MetaRow label={t("verify.meta.author")}>
                <a
                  href={explorerAddressUrl(model.chainId, model.author)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-bronze hover:underline"
                >
                  {shortenAddress(model.author)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </MetaRow>
              <MetaRow label={t("verify.meta.registry")}>
                <a
                  href={explorerAddressUrl(model.chainId, model.registryAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-bronze hover:underline"
                >
                  {shortenAddress(model.registryAddress)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </MetaRow>
              <MetaRow label={t("verify.meta.origin")}>
                <Badge
                  variant="secondary"
                  className="rounded-sm font-normal"
                >
                  {model.origin
                    ? originLabel(model.origin)
                    : model.platform ?? "—"}
                </Badge>
              </MetaRow>
              <MetaRow label={t("verify.meta.cid")}>
                <span className="break-all font-mono text-xs text-muted-foreground">
                  {model.ipfsCID}
                </span>
              </MetaRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ── Split view: origin link + IPFS archive ───────────── */}
      <section className="mt-10 grid gap-6 lg:grid-cols-5">
        {/* Origin (Option A only) */}
        <div className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-md border border-border bg-card p-6">
            <FileText className="h-5 w-5 text-bronze" strokeWidth={1.5} />
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              {t("verify.origin.link")}
            </h3>
            {model.sourceUrl ? (
              <>
                <a
                  href={model.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 break-all text-sm text-bronze hover:underline"
                >
                  {t("verify.origin.open")}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
                <p className="mt-auto pt-4 text-xs leading-relaxed text-muted-foreground">
                  {t("verify.origin.warn")}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("verify.ipfs.desc")}
              </p>
            )}
          </div>
        </div>

        {/* IPFS archive (always available) */}
        <div className="lg:col-span-3">
          <div className="flex h-full flex-col rounded-md border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-seal" strokeWidth={1.5} />
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {t("verify.ipfs.title")}
                </h3>
              </div>
              <a
                href={model.ipfsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-bronze hover:underline"
              >
                {t("verify.ipfs.open")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t("verify.ipfs.desc")}
            </p>

            <div className="mt-4 max-h-96 space-y-4 overflow-y-auto pr-1">
              {model.messages && model.messages.length > 0 ? (
                model.messages.map((m, i) => (
                  <DialogueTurn key={i} message={m} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("verify.ipfs.desc")}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DialogueTurn({ message }: { message: DialogueMessage }) {
  const { t } = useI18n();
  const isUser = message.role === "user";
  return (
    <div>
      <p
        className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
          isUser ? "text-bronze" : "text-seal"
        }`}
      >
        {isUser ? t("verify.role.user") : t("verify.role.assistant")}
      </p>
      <div
        className={`rounded-md border px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "border-border bg-secondary/60"
            : "border-seal/20 bg-seal-soft/40"
        }`}
      >
        <p className="whitespace-pre-wrap text-foreground">{message.text}</p>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell className="w-48 bg-secondary/40 align-top text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </TableCell>
      <TableCell className="align-top text-sm">{children}</TableCell>
    </TableRow>
  );
}

function StatusState({
  model,
}: {
  model: Exclude<VerificationViewModel, { status: "ok" }>;
}) {
  const { t } = useI18n();

  const config = {
    "not-found": {
      icon: ShieldAlert,
      tone: "text-destructive",
      ring: "border-destructive/30",
      message: t("verify.error.notFound"),
    },
    unconfigured: {
      icon: Settings2,
      tone: "text-bronze",
      ring: "border-bronze/30",
      message: t("verify.error.config"),
    },
    error: {
      icon: AlertTriangle,
      tone: "text-destructive",
      ring: "border-destructive/30",
      message: t("verify.error.notFound"),
    },
  }[model.status];

  const Icon = config.icon;

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <div
        className={`mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border ${config.ring}`}
      >
        <Icon className={`h-8 w-8 ${config.tone}`} />
      </div>
      <p className="font-mono text-sm text-muted-foreground">{model.code}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
        {config.message}
      </h1>
      <Link href="/dogrulama" className={buttonVariants({ className: "mt-8" })}>
        <ArrowLeft className="h-4 w-4" /> {t("verify.back")}
      </Link>
    </div>
  );
}
