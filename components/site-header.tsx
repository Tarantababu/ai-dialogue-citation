"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BrandSeal } from "@/components/brand-seal";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Sticky academic-press masthead: colophon, primary nav, locale, seal CTA. */
export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/muhurle", label: t("nav.mint") },
    { href: "/dogrulama", label: t("nav.verify") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandSeal />
          <div className="leading-tight">
            <span className="block font-serif text-lg font-semibold tracking-tight text-foreground">
              DeCite
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Sealed Citations
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[21px] left-0 h-px w-full bg-bronze" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <Link
            href="/muhurle"
            className="group inline-flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-bronze"
          >
            {t("nav.mint")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
