"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

/** Quiet press-style footer rule. */
export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <p className="font-serif italic">{t("brand.name")}</p>
        <p className="text-xs uppercase tracking-[0.16em]">{t("footer.note")}</p>
        <nav className="flex items-center gap-5 text-xs">
          <Link href="/muhurle" className="hover:text-foreground">
            {t("nav.mint")}
          </Link>
          <Link href="/son-atiflar" className="hover:text-foreground">
            {t("nav.latest")}
          </Link>
          <Link href="/dogrulama" className="hover:text-foreground">
            {t("nav.verify")}
          </Link>
          <Link href="/makbuz" className="hover:text-foreground">
            {t("nav.receipts")}
          </Link>
          <Link href="/sss" className="hover:text-foreground">
            {t("nav.faq")}
          </Link>
          <Link href="/geri-bildirim" className="hover:text-foreground">
            {t("nav.feedback")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
