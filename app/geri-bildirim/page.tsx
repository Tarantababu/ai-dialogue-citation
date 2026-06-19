"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MessageSquareHeart, Loader2, Check, Lightbulb, Bug, Heart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitFeedback } from "@/app/actions/feedback";
import type { FeedbackType } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TYPES: { value: FeedbackType; labelKey: string; icon: typeof Lightbulb }[] = [
  { value: "suggestion", labelKey: "feedback.type.suggestion", icon: Lightbulb },
  { value: "bug", labelKey: "feedback.type.bug", icon: Bug },
  { value: "praise", labelKey: "feedback.type.praise", icon: Heart },
  { value: "other", labelKey: "feedback.type.other", icon: MoreHorizontal },
];

export default function FeedbackPage() {
  const { t } = useI18n();
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error(t("feedback.error.empty"));
      return;
    }
    setBusy(true);
    try {
      const res = await submitFeedback({
        type,
        message: message.trim(),
        email: email.trim() || undefined,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setDone(true);
    } catch {
      toast.error(t("feedback.error.generic"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-seal-soft">
          <Check className="h-8 w-8 text-seal" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          {t("feedback.thanks.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t("feedback.thanks.body")}
        </p>
        <div className="mt-8 flex justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setMessage("");
              setType("suggestion");
            }}
            className="font-medium text-bronze hover:underline"
          >
            {t("feedback.thanks.again")}
          </button>
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            {t("feedback.thanks.home")} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <header className="mb-8 text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
          <MessageSquareHeart className="h-7 w-7 text-bronze" strokeWidth={1.5} />
        </div>
        <p className="eyebrow mb-3">{t("brand.tagline")}</p>
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          {t("feedback.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{t("feedback.subtitle")}</p>
      </header>

      <form
        onSubmit={onSubmit}
        className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <label className="mb-2 block text-sm font-medium text-foreground">
          {t("feedback.type.label")}
        </label>
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((opt) => {
            const active = type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-md border px-3 py-3 text-xs font-medium transition-colors",
                  active
                    ? "border-bronze bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:border-bronze/50 hover:text-foreground",
                )}
              >
                <opt.icon className="h-4 w-4" />
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>

        <label className="mb-2 block text-sm font-medium text-foreground">
          {t("feedback.message.label")}
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("feedback.message.placeholder")}
          rows={7}
          maxLength={4000}
          disabled={busy}
          className="text-sm leading-relaxed"
        />

        <label className="mb-2 mt-5 block text-sm font-medium text-foreground">
          {t("feedback.email.label")}
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("feedback.email.placeholder")}
          disabled={busy}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {t("feedback.email.help")}
        </p>

        <div className="mt-7 border-t border-border pt-6">
          <Button
            type="submit"
            size="lg"
            disabled={busy}
            className="w-full bg-primary text-primary-foreground hover:bg-bronze sm:w-auto"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t("feedback.sending")}
              </>
            ) : (
              t("feedback.submit")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
