"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Link2,
  ClipboardType,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  isShareUrl,
  classifyShareUrl,
  detectPlatformFromUrl,
} from "@/lib/share-providers";
import type { SealInput, SealRegisterResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

/**
 * The full seal-a-dialogue form, self-contained and reusable. Embedded on the
 * home page and the /muhurle page. On success it replaces itself with the
 * confirmation view. Wrap usages in <Suspense> (it reads search params).
 */
export function SealForm() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<"link" | "paste">("link");
  const [shareUrl, setShareUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [pasteUrl, setPasteUrl] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [listPublicly, setListPublicly] = useState(true);
  const [busy, setBusy] = useState(false);
  const [freeResult, setFreeResult] = useState<SealRegisterResult | null>(null);

  useEffect(() => {
    if (searchParams.get("canceled")) toast.info(t("mint.canceled"));
  }, [searchParams, t]);

  if (freeResult?.ok) return <SealSuccessView result={freeResult} />;

  const linkProvider = shareUrl.trim() ? classifyShareUrl(shareUrl.trim()) : null;
  const pasteOnly = linkProvider?.mode === "paste-only";
  const pasteUrlPlatform = pasteUrl.trim()
    ? detectPlatformFromUrl(pasteUrl.trim())
    : null;

  function buildInput(): SealInput {
    return {
      method: tab === "link" ? "share-link" : "direct-paste",
      shareUrl: tab === "link" ? shareUrl.trim() : undefined,
      text: tab === "paste" ? pasteText : undefined,
      originUrl: tab === "paste" ? pasteUrl.trim() || undefined : undefined,
      sourceRef: sourceRef.trim(),
      authorName: authorName.trim() || undefined,
      email: email.trim() || undefined,
      listPublicly,
    };
  }

  function validate(): boolean {
    if (!sourceRef.trim()) {
      toast.error(t("mint.error.sourceRef"));
      return false;
    }
    if (tab === "link" && pasteOnly && linkProvider) {
      setTab("paste");
      toast.info(
        t("mint.pasteOnlyHint").replace("{provider}", linkProvider.platform),
      );
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
        toast.success(`${t("mint.success.title")}: ${res.code}`);
      } else {
        const res = await createSealCheckout(buildInput());
        if (!res.ok) {
          toast.error(res.error);
          setBusy(false);
          return;
        }
        window.location.assign(res.url);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  // Segmented control: a clearly raised white pill with the app's bronze
  // "selected" accent for the active tab, on a defined track.
  const tabTriggerCls =
    "gap-2 whitespace-normal rounded-md px-3 py-2.5 text-center text-xs font-medium text-muted-foreground transition-all hover:text-foreground data-active:bg-card data-active:font-semibold data-active:text-bronze data-active:shadow-sm data-active:ring-1 data-active:ring-bronze/30 sm:text-sm";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "link" | "paste")}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 rounded-lg border border-border bg-secondary/70 p-1.5">
          <TabsTrigger value="link" className={tabTriggerCls}>
            <Link2 className="h-4 w-4 shrink-0" /> {t("mint.tab.link")}
          </TabsTrigger>
          <TabsTrigger value="paste" className={tabTriggerCls}>
            <ClipboardType className="h-4 w-4 shrink-0" /> {t("mint.tab.paste")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="mt-5 space-y-2">
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
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("mint.link.help")}
          </p>
          {pasteOnly && linkProvider && (
            <div className="mt-3 flex items-start gap-3 rounded-md border border-bronze/40 bg-accent p-3 text-sm text-accent-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>
                  {t("mint.pasteOnlyHint").replace(
                    "{provider}",
                    linkProvider.platform,
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setTab("paste")}
                  className="mt-1.5 font-medium text-bronze underline-offset-2 hover:underline"
                >
                  {t("mint.switchToPaste")} →
                </button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paste" className="mt-5 space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t("mint.paste.label")}
          </label>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={t("mint.paste.placeholder")}
            rows={8}
            disabled={busy}
            className="font-mono text-sm leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">{t("mint.paste.help")}</p>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-foreground">
              {t("mint.originUrl.label")}
            </label>
            <Input
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder={t("mint.originUrl.placeholder")}
              inputMode="url"
              disabled={busy}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {pasteUrlPlatform
                ? t("mint.originUrl.detected").replace(
                    "{provider}",
                    pasteUrlPlatform,
                  )
                : t("mint.originUrl.help")}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

      {/* Share publicly toggle - on by default */}
      <div className="mt-4 flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <label
            htmlFor="seal-share-public"
            className="block cursor-pointer text-sm font-medium text-foreground"
          >
            {t("mint.share.label")}
          </label>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("mint.share.help")}
          </p>
        </div>
        <button
          id="seal-share-public"
          type="button"
          role="switch"
          aria-checked={listPublicly}
          aria-label={t("mint.share.label")}
          disabled={busy}
          onClick={() => setListPublicly((v) => !v)}
          className={cn(
            "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
            listPublicly ? "bg-seal" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
              listPublicly ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      <div className="mt-6">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={busy}
          className="w-full bg-primary text-primary-foreground hover:bg-bronze"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {FREE_MODE ? t("mint.action.sealing") : t("mint.action.preparing")}
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
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            {t("mint.pay.note").replace("{price}", SEAL_PRICE_USD)}
          </p>
        )}
      </div>
    </div>
  );
}
