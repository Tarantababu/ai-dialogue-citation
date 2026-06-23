"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { BrandSeal } from "@/components/brand-seal";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

/** Sticky academic-press masthead with a responsive (hamburger) mobile menu. */
export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // A few primary destinations stay visible; the rest collapse into "More".
  const primary: NavLink[] = [
    { href: "/son-atiflar", label: t("nav.latest") },
    { href: "/dogrulama", label: t("nav.verify") },
    { href: "/sss", label: t("nav.faq") },
  ];
  const more: NavLink[] = [
    { href: "/", label: t("nav.home") },
    { href: "/makbuz", label: t("nav.receipts") },
    { href: "/geri-bildirim", label: t("nav.feedback") },
  ];
  // Full ordered list for the mobile panel.
  const allLinks: NavLink[] = [
    { href: "/", label: t("nav.home") },
    { href: "/muhurle", label: t("nav.mint") },
    { href: "/son-atiflar", label: t("nav.latest") },
    { href: "/dogrulama", label: t("nav.verify") },
    { href: "/makbuz", label: t("nav.receipts") },
    { href: "/sss", label: t("nav.faq") },
    { href: "/geri-bildirim", label: t("nav.feedback") },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <BrandSeal />
          <div className="leading-tight">
            <span className="block font-serif text-lg font-semibold tracking-tight text-foreground">
              DeCite
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Sealed Citations
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-7">
          {primary.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-foreground",
                isActive(link.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-[21px] left-0 h-px w-full bg-bronze" />
              )}
            </Link>
          ))}
          <MoreMenu
            label={t("nav.more")}
            links={more}
            isActive={isActive}
            active={more.some((l) => isActive(l.href))}
          />
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {/* Desktop seal CTA - the primary action, so no duplicate nav link */}
          <Link
            href="/muhurle"
            className="group hidden items-center gap-1.5 rounded-sm bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-bronze md:inline-flex"
          >
            {t("nav.mint")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-bronze md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={cn(
                  "block rounded-sm px-3 py-2.5 text-base font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-accent text-bronze"
                    : "text-foreground hover:bg-secondary",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/muhurle"
              onClick={close}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-sm bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-bronze"
            >
              {t("nav.mint")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

/** Desktop "More" overflow menu (click-outside to dismiss). */
function MoreMenu({
  label,
  links,
  isActive,
  active,
}: {
  label: string;
  links: NavLink[];
  isActive: (href: string) => boolean;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "relative flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground",
          active || open ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
        {active && (
          <span className="absolute -bottom-[21px] left-0 h-px w-full bg-bronze" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-3 w-44 overflow-hidden rounded-sm border border-border bg-popover py-1 shadow-md">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3.5 py-2 text-sm transition-colors hover:bg-secondary",
                isActive(link.href) ? "text-bronze" : "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
