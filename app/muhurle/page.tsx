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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createSealCheckout } from "@/app/actions/checkout";
import { isContractConfigured } from "@/lib/contract";
import { useI18n } from "@/lib/i18n";

const SHARE_LINK_RE =
  /^https:\/\/(?:chat\.openai\.com|chatgpt\.com|claude\.ai)\/share\/[A-Za-z0-9-]+\/?$/i;

const PRICE_LABEL = process.env.NEXT_PUBLIC_SEAL_PRICE_USD ?? "2";

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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (searchParams.get("canceled")) {
      toast.info(t("mint.canceled"));
    }
  }, [searchParams, t]);

  async function handleCheckout() {
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

    setBusy(true);
    try {
      const res = await createSealCheckout({
        method: tab === "link" ? "share-link" : "direct-paste",
        shareUrl: tab === "link" ? shareUrl.trim() : undefined,
        text: tab === "paste" ? pasteText : undefined,
        sourceRef: sourceRef.trim(),
        authorName: authorName.trim() || undefined,
      });

      if (!res.ok) {
        toast.error(res.error);
        setBusy(false);
        return;
      }
      // Redirect to Stripe Checkout. (Keep busy = true through navigation.)
      window.location.href = res.url;
    } catch {
      toast.error("Could not start checkout. Please try again.");
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

      {/* Wallet-free assurance */}
      <div className="mb-8 flex items-start gap-3 rounded-md border border-seal/30 bg-seal-soft p-4 text-sm">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
        <span className="text-foreground">{t("mint.noWallet")}</span>
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

        {/* Action */}
        <div className="mt-7 border-t border-border pt-6">
          <Button
            size="lg"
            onClick={handleCheckout}
            disabled={busy}
            className="w-full bg-primary text-primary-foreground hover:bg-bronze sm:w-auto"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("mint.action.preparing")}
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                {t("mint.action.pay").replace("{price}", PRICE_LABEL)}
              </>
            )}
          </Button>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            {t("mint.pay.note").replace("{price}", PRICE_LABEL)}
          </p>
        </div>
      </div>
    </div>
  );
}
