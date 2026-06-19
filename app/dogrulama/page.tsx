"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { isValidCitationCode, normalizeCitationCode } from "@/lib/citation";
import { useI18n } from "@/lib/i18n";

export default function VerifyLandingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [code, setCode] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeCitationCode(code);
    if (!isValidCitationCode(normalized)) {
      toast.error(t("verify.error.format"));
      return;
    }
    router.push(`/dogrulama/${normalized}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card">
        <ScanSearch className="h-7 w-7 text-bronze" strokeWidth={1.5} />
      </div>
      <p className="eyebrow mb-3">{t("brand.tagline")}</p>
      <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
        {t("verify.title")}
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        {t("verify.subtitle")}
      </p>

      <form onSubmit={onSubmit} className="mt-10 w-full">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("verify.input.placeholder")}
              className="h-12 pl-10 font-mono text-base uppercase"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 bg-primary text-primary-foreground hover:bg-bronze"
          >
            {t("verify.action")}
          </Button>
        </div>
      </form>

      <p className="mt-6 font-mono text-xs text-muted-foreground">
        BC-SD-YYYYMMDD-NN
      </p>
    </div>
  );
}
