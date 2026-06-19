"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BrandSeal } from "@/components/brand-seal";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Sticky academic-press masthead: colophon, primary nav, locale, wallet. */
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
            <span className="block font-serif text-base font-semibold tracking-tight text-foreground">
              Sıfır Düşüş
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Protocol
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
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="address"
          />
        </div>
      </div>
    </header>
  );
}
