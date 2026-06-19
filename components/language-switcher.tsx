"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, Check } from "lucide-react";
import { LOCALES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Compact dropdown for switching the interface locale (English default). */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.language")}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-bronze hover:text-foreground"
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="uppercase">{locale}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 max-h-80 w-40 overflow-y-auto rounded-sm border border-border bg-popover shadow-md">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-secondary",
                l.code === locale ? "text-bronze" : "text-foreground",
              )}
            >
              {l.label}
              {l.code === locale && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
