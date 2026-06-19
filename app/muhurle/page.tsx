"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import {
  Link2,
  ClipboardType,
  Loader2,
  Check,
  Copy,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { sealFromShareLink, sealFromDirectText } from "@/app/actions/pinata";
import {
  CITATION_REGISTRY_ABI,
  CONTRACT_ADDRESS,
  activeChain,
  isContractConfigured,
} from "@/lib/contract";
import {
  findAvailableCitationCode,
  formatApaCitation,
  explorerTxUrl,
} from "@/lib/citation";
import type { OnChainCitation, OriginInputType, PinResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type Phase = "idle" | "pin" | "code" | "sign" | "confirm" | "done";

interface SealResult {
  code: string;
  txHash: `0x${string}`;
  ipfsCID: string;
  citation: OnChainCitation;
  origin: OriginInputType;
}

const SHARE_LINK_RE =
  /^https:\/\/(?:chat\.openai\.com|chatgpt\.com|claude\.ai)\/share\/[A-Za-z0-9-]+\/?$/i;

export default function MintPage() {
  const { t } = useI18n();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [tab, setTab] = useState<"link" | "paste">("link");
  const [shareUrl, setShareUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [authorName, setAuthorName] = useState("");

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<SealResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const busy = phase !== "idle" && phase !== "done";

  async function handleSeal() {
    // ── Client-side validation ─────────────────────────────
    if (!sourceRef.trim()) {
      toast.error(t("mint.error.sourceRef"));
      return;
    }
    if (tab === "link" && !SHARE_LINK_RE.test(shareUrl.trim())) {
      toast.error(t("mint.error.badLink"));
      return;
    }
    if (tab === "paste" && !pasteText.trim()) {
      toast.error(t("mint.error.empty"));
      return;
    }
    if (!isContractConfigured) {
      toast.error(t("mint.warn.noContract"));
      return;
    }
    if (!publicClient) {
      toast.error("RPC client unavailable.");
      return;
    }

    try {
      // ── 1 · Pin to IPFS via Server Action ────────────────
      setPhase("pin");
      const pin: PinResult =
        tab === "link"
          ? await sealFromShareLink(shareUrl.trim())
          : await sealFromDirectText(pasteText);

      if (!pin.ok) {
        setPhase("idle");
        toast.error(pin.error);
        return;
      }

      // ── 2 · Reserve a deterministic citation code ────────
      setPhase("code");
      const code = await findAvailableCitationCode(async (candidate) => {
        return (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CITATION_REGISTRY_ABI,
          functionName: "exists",
          args: [candidate],
        })) as boolean;
      });

      // ── 3 · Sign & broadcast the registry transaction ────
      setPhase("sign");
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CITATION_REGISTRY_ABI,
        functionName: "registerCitation",
        args: [code, sourceRef.trim(), pin.ipfsCID],
        chainId: activeChain.id,
      });

      // ── 4 · Wait for on-chain confirmation ───────────────
      setPhase("confirm");
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      if (receipt.status !== "success") {
        throw new Error("Transaction reverted on-chain.");
      }

      const sealed: SealResult = {
        code,
        txHash,
        ipfsCID: pin.ipfsCID,
        origin: pin.origin,
        citation: {
          sourceRef: sourceRef.trim(),
          ipfsCID: pin.ipfsCID,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
          author: (address ?? "0x0") as `0x${string}`,
          isRegistered: true,
        },
      };
      setResult(sealed);
      setPhase("done");
      setDialogOpen(true);
      toast.success(`${t("mint.success.title")} — ${code}`);
    } catch (err) {
      setPhase("idle");
      const message =
        err instanceof Error ? err.message : "Sealing failed unexpectedly.";
      // Surface a friendly note when the daily code is already taken.
      toast.error(message.includes("CitationAlreadyExists")
        ? "That citation code was just taken. Please try again."
        : message);
    }
  }

  const steps: { key: Phase; label: string }[] = [
    { key: "pin", label: t("mint.step.pin") },
    { key: "code", label: t("mint.step.code") },
    { key: "sign", label: t("mint.step.sign") },
    { key: "confirm", label: t("mint.step.confirm") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <header className="mb-10">
        <p className="eyebrow mb-3">{t("brand.tagline")}</p>
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          {t("mint.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("mint.subtitle")}
        </p>
      </header>

      {!isContractConfigured && (
        <div className="mb-8 flex items-start gap-3 rounded-md border border-bronze/40 bg-accent p-4 text-sm text-accent-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t("mint.warn.noContract")}</span>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "link" | "paste")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="h-4 w-4" /> {t("mint.tab.link")}
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-2">
              <ClipboardType className="h-4 w-4" /> {t("mint.tab.paste")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-6 space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("mint.link.label")}
            </label>
            <Input
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder={t("mint.link.placeholder")}
              inputMode="url"
              disabled={busy}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">{t("mint.link.help")}</p>
          </TabsContent>

          <TabsContent value="paste" className="mt-6 space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("mint.paste.label")}
            </label>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={t("mint.paste.placeholder")}
              rows={10}
              disabled={busy}
              className="font-mono text-sm leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">{t("mint.paste.help")}</p>
          </TabsContent>
        </Tabs>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("mint.sourceRef.label")}
            </label>
            <Input
              value={sourceRef}
              onChange={(e) => setSourceRef(e.target.value)}
              placeholder={t("mint.sourceRef.placeholder")}
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("mint.author.label")}
            </label>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("mint.author.placeholder")}
              disabled={busy}
            />
          </div>
        </div>

        {/* Progress ladder */}
        {busy && (
          <div className="mt-7 space-y-2.5 rounded-md border border-border bg-secondary/50 p-4">
            {steps.map((s) => {
              const order: Phase[] = ["pin", "code", "sign", "confirm"];
              const currentIdx = order.indexOf(phase);
              const stepIdx = order.indexOf(s.key);
              const state =
                stepIdx < currentIdx
                  ? "done"
                  : stepIdx === currentIdx
                    ? "active"
                    : "pending";
              return (
                <div key={s.key} className="flex items-center gap-3 text-sm">
                  {state === "done" ? (
                    <Check className="h-4 w-4 text-seal" />
                  ) : state === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-bronze" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                  <span
                    className={
                      state === "pending"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action zone */}
        <div className="mt-7 border-t border-border pt-6">
          {!isConnected ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                {t("mint.connectFirst")}
              </p>
              <ConnectButton
                label={t("nav.mint")}
                showBalance={false}
                chainStatus="full"
              />
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleSeal}
              disabled={busy}
              className="w-full bg-primary text-primary-foreground hover:bg-bronze sm:w-auto"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("mint.action.sealing")}
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  {t("mint.action.seal")}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── APA citation clipboard module ──────────────────────── */}
      <SuccessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        result={result}
        authorName={authorName}
        chainId={chainId}
      />
    </div>
  );
}

function SuccessDialog({
  open,
  onOpenChange,
  result,
  authorName,
  chainId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  result: SealResult | null;
  authorName: string;
  chainId: number;
}) {
  const { t } = useI18n();
  if (!result) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const apa = formatApaCitation({
    code: result.code,
    citation: result.citation,
    authorName,
    baseUrl,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-seal-soft"
          >
            <ShieldCheck className="h-6 w-6 text-seal" />
          </motion.div>
          <DialogTitle className="font-serif text-2xl">
            {t("mint.success.title")}
          </DialogTitle>
          <DialogDescription>{t("mint.success.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <CopyRow
            label={t("mint.success.code")}
            value={result.code}
            mono
          />
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("mint.success.apa")}
            </p>
            <CopyBlock value={apa} />
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <a
              href={explorerTxUrl(chainId, result.txHash)}
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
        </div>
      </DialogContent>
    </Dialog>
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
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/50 px-3 py-2.5">
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
        className="shrink-0 rounded-sm p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
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
    <div className="relative rounded-md border border-border bg-secondary/50 p-4">
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
        className="absolute right-2 top-2 rounded-sm p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
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
