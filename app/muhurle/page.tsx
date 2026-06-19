"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Link2,
  ClipboardType,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Lock,
  Gift,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createSealCheckout } from "@/app/actions/checkout";
import { sealFree } from "@/app/actions/seal-free";
import { SealSuccessView } from "@/components/seal-success-view";
import { isContractConfigured } from "@/lib/contract";
import { FREE_MODE, SEAL_PRICE_USD } from "@/lib/config";
import { isShareUrl } from "@/lib/share-providers";
import type { SealInput, SealRegisterResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export default function MintPage() {
  return (
    <Suspense fallback={null}>
      <MintForm />
    </Suspense>
  );
}

function MintForm() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"link" | "paste">("link");
  const [shareUrl, setShareUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [freeResult, setFreeResult] = useState<SealRegisterResult | null>(null);

  useEffect(() => {
    if (searchParams.get("canceled")) {
      toast.info(t("mint.canceled"));
    }
  }, [searchParams, t]);

  // After a successful free seal, show the confirmation in place of the form.
  if (freeResult?.ok) {
    return <SealSuccessView result={freeResult} />;
  }

  function buildInput(): SealInput {
    return {
      method: tab === "link" ? "share-link" : "direct-paste",
      shareUrl: tab === "link" ? shareUrl.trim() : undefined,
      text: tab === "paste" ? pasteText : undefined,
      sourceRef: sourceRef.trim(),
      authorName: authorName.trim() || undefined,
      email: email.trim() || undefined,
    };
  }

  function validate(): boolean {
    if (!sourceRef.trim()) {
      toast.error(t("mint.error.sourceRef"));
      return false;
    }
    if (tab === "link" && !isShareUrl(shareUrl.trim())) {
      toast.error(t("mint.error.badLink"));
      return false;
    }
    if (tab === "paste" && !pasteText.trim()) {
      toast.error(t("mint.error.empty"));
      return false;
    }
    if (!isContractConfigured) {
      toast.error(t("mint.warn.noContract"));
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setBusy(true);
    try {
      if (FREE_MODE) {
        const res = await sealFree(buildInput());
        if (!res.ok) {
          toast.error(res.error);
          setBusy(false);
          return;
        }
        setFreeResult(res);
        toast.success(`${t("mint.success.title")} — ${res.code}`);
      } else {
        const res = await createSealCheckout(buildInput());
        if (!res.ok) {
          toast.error(res.error);
          setBusy(false);
          return;
        }
        window.location.href = res.url; // keep busy through navigation
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <header className="mb-10">
        <p className="eyebrow mb-3">{t("brand.tagline")}</p>
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          {t("mint.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("mint.subtitle")}</p>
      </header>

      {/* Wallet-free / free-launch assurance */}
      <div className="mb-8 flex items-start gap-3 rounded-md border border-seal/30 bg-seal-soft p-4 text-sm">
        {FREE_MODE ? (
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
        ) : (
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
        )}
        <span className="text-foreground">
          {FREE_MODE ? t("mint.freeLaunch") : t("mint.noWallet")}
        </span>
      </div>

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

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("mint.email.label")}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("mint.email.placeholder")}
            disabled={busy}
          />
          <p className="text-xs text-muted-foreground">{t("mint.email.help")}</p>
        </div>

        {/* Action */}
        <div className="mt-7 border-t border-border pt-6">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={busy}
            className="w-full bg-primary text-primary-foreground hover:bg-bronze sm:w-auto"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {FREE_MODE
                  ? t("mint.action.sealing")
                  : t("mint.action.preparing")}
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                {FREE_MODE
                  ? t("mint.action.sealFree")
                  : t("mint.action.pay").replace("{price}", SEAL_PRICE_USD)}
              </>
            )}
          </Button>
          {!FREE_MODE && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {t("mint.pay.note").replace("{price}", SEAL_PRICE_USD)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
