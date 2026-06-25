"use client";

import { useEffect, useState } from "react";
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
  Bot,
  Quote,
  Copy,
  Check,
  Globe,
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
  explorerReadContractUrl,
  ipfsGatewayUrls,
  buildCitationFormats,
} from "@/lib/citation";

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
import { aiModelLabel } from "@/lib/dialogue-clean";
import { MarkdownMessage } from "@/components/markdown-message";
import { siteBaseUrl } from "@/lib/site";
import type { DialogueMessage, OnChainCitation, OriginInputType } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type VerificationViewModel =
  | {
      status: "ok";
      code: string;
      sourceRef: string;
      ipfsCID: string;
      ipfsUrl: string;
      custodian: `0x${string}`;
      authorName: string | null;
      timestamp: number;
      registryAddress: `0x${string}`;
      chainId: number;
      origin: OriginInputType | null;
      platform: string | null;
      aiModel: string | null;
      sourceUrl: string | null;
      messages: DialogueMessage[] | null;
    }
  | { status: "not-found"; code: string }
  | { status: "unconfigured"; code: string }
  | { status: "error"; code: string };

export function VerificationView({ model }: { model: VerificationViewModel }) {
  const { t } = useI18n();

  // Reader landed on a verification page - track the outcome (a hit, a bad
  // code, etc.). Runs before any early return so all statuses are captured.
  useEffect(() => {
    analytics.verifyResultViewed({ status: model.status, code: model.code });
  }, [model.status, model.code]);

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

      {/* ── Ready-to-cite ────────────────────────────────────── */}
      <CitationCard model={model} />

      {/* ── Metadata table ───────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">
          {t("verify.meta.title")}
        </h2>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableBody>
              <MetaRow label={t("verify.meta.code")}>
                <span className="font-mono text-bronze">{model.code}</span>
              </MetaRow>
              {model.authorName && (
                <MetaRow label={t("verify.meta.authorName")}>
                  {model.authorName}
                </MetaRow>
              )}
              {(model.platform || model.aiModel) && (
                <MetaRow label={t("verify.meta.ai")}>
                  <span className="inline-flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-bronze" />
                    {aiModelLabel(model.platform, model.aiModel)}
                  </span>
                </MetaRow>
              )}
              <MetaRow label={t("verify.meta.timestamp")}>
                {formattedDate} UTC
              </MetaRow>
              <MetaRow label={t("verify.meta.custodian")}>
                <a
                  href={explorerAddressUrl(model.chainId, model.custodian)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-bronze hover:underline"
                >
                  {shortenAddress(model.custodian)}
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
                    : model.platform ?? "Not recorded"}
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
                  onClick={() => analytics.externalOpened("origin")}
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
                onClick={() => analytics.externalOpened("ipfs")}
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

      {/* ── Independent, app-free access ─────────────────────── */}
      <PermanenceCard model={model} />
    </div>
  );
}

/** How to retrieve this citation directly from Polygon + IPFS, without DeCite. */
function PermanenceCard({
  model,
}: {
  model: Extract<VerificationViewModel, { status: "ok" }>;
}) {
  const { t } = useI18n();
  const gateways = ipfsGatewayUrls(model.ipfsCID, PINATA_GATEWAY);

  return (
    <section className="mt-10 rounded-lg border border-seal/30 bg-seal-soft/50 p-6 sm:p-7">
      <div className="flex items-center gap-2.5">
        <Globe className="h-5 w-5 text-seal" strokeWidth={1.5} />
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {t("verify.perm.title")}
        </h2>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {t("verify.perm.body")}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Path 1 - the blockchain registry */}
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bronze">
            1 · {t("verify.perm.chain")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("verify.perm.callHint").replace("{code}", model.code)}
          </p>
          <div className="mt-3 break-all rounded-sm bg-secondary/60 px-2.5 py-2 font-mono text-xs text-foreground">
            {model.registryAddress}
          </div>
          <a
            href={explorerReadContractUrl(model.chainId, model.registryAddress)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.externalOpened("registry")}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-bronze hover:underline"
          >
            {t("verify.perm.readOn")}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>

        {/* Path 2 - the IPFS archive via any gateway */}
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bronze">
            2 · {t("verify.perm.ipfs")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("verify.perm.ipfsHint")}
          </p>
          <div className="mt-3 break-all rounded-sm bg-secondary/60 px-2.5 py-2 font-mono text-xs text-foreground">
            {model.ipfsCID}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {gateways.map((g) => (
              <a
                key={g.label}
                href={g.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-bronze hover:underline"
              >
                {g.label}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">
        {t("verify.perm.note")}
      </p>
    </section>
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
        <MarkdownMessage text={message.text} />
      </div>
    </div>
  );
}

/** Ready-to-paste citation for papers/books, with copy. */
function CitationCard({
  model,
}: {
  model: Extract<VerificationViewModel, { status: "ok" }>;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const baseUrl = siteBaseUrl();
  const citation: OnChainCitation = {
    sourceRef: model.sourceRef,
    ipfsCID: model.ipfsCID,
    timestamp: BigInt(model.timestamp),
    author: model.custodian,
    isRegistered: true,
  };
  const formats = buildCitationFormats({
    code: model.code,
    citation,
    authorName: model.authorName ?? undefined,
    baseUrl,
    platform: model.platform,
    model: model.aiModel,
  });
  const [styleId, setStyleId] = useState(formats[0].id);
  const current = formats.find((f) => f.id === styleId) ?? formats[0];

  return (
    <section className="mt-8 rounded-lg border border-bronze/30 bg-accent/40 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Quote className="h-4 w-4 text-bronze" />
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {t("verify.cite.title")}
        </h2>
      </div>

      {/* Academic style selector */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {formats.map((f) => {
          const active = f.id === styleId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setStyleId(f.id);
                setCopied(false);
                analytics.citationStyleChanged({ style: f.id });
              }}
              aria-pressed={active}
              className={cn(
                "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-bronze bg-bronze text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-bronze/50 hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="relative rounded-md border border-border bg-card p-4">
        <p
          className={cn(
            "pr-10 leading-relaxed text-foreground",
            current.mono
              ? "overflow-x-auto whitespace-pre font-mono text-xs"
              : "break-words font-serif text-sm italic",
          )}
        >
          {current.text}
        </p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(current.text);
            setCopied(true);
            analytics.citationCopied({ style: current.id });
            setTimeout(() => setCopied(false), 1600);
          }}
          className="absolute right-2 top-2 rounded-sm bg-card/90 p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={t("mint.copy")}
        >
          {copied ? (
            <Check className="h-4 w-4 text-seal" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("verify.cite.help")}</p>
    </section>
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
      <TableCell className="w-32 bg-secondary/40 align-top text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-48">
        {label}
      </TableCell>
      <TableCell className="align-top break-words text-sm">{children}</TableCell>
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
