"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/ui/brand-logo";
import { CtaButton } from "@/components/ui/cta-button";
import { UI_COPY, alternateLocaleHref, localizedHref, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/types";

export function SiteHeader({
  site,
  locale = "zh",
}: {
  site: SiteConfig;
  locale?: Locale;
}) {
  const pathname = usePathname();
  const copy = UI_COPY[locale];
  const [scrolled, setScrolled] = useState(false);
  // Drawer state is keyed by the pathname so navigating closes it without an effect.
  const [menu, setMenu] = useState<{ open: boolean; path: string }>({
    open: false,
    path: pathname,
  });
  const open = menu.open && menu.path === pathname;
  const setOpen = (value: boolean) => setMenu({ open: value, path: pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
  }, [locale]);

  const isActive = (href: string) =>
    href === "/" || href === "/en" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-99 transition-all duration-500 ease-[var(--ease-brand)]",
          scrolled
            ? "border-b border-line/70 bg-white/85 py-2.5 backdrop-blur-xl"
            : "border-b border-transparent py-4",
        )}
      >
        <div className="container-x flex items-center justify-between gap-6">
          <Link href={localizedHref("/", locale)} aria-label={site.logoText}>
            <BrandLogo logoText={site.logoText} logoSub={site.logoSub} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {site.nav.map((item) => (
              <Link
                key={item.href}
                href={localizedHref(item.href, locale)}
                className={cn(
                  "group relative px-4 py-2 text-[15px] font-medium transition-colors duration-300",
                  isActive(localizedHref(item.href, locale))
                    ? "text-brand"
                    : "text-ink hover:text-brand",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand transition-transform duration-300 ease-[var(--ease-out-soft)]",
                    isActive(localizedHref(item.href, locale))
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher locale={locale} />
            <CtaButton href="#contact" size="md">
              {copy.header.freeAccount}
              <Arrow />
            </CtaButton>
          </div>

          <div className="relative z-101 flex items-center gap-2 lg:hidden">
            <LanguageSwitcher locale={locale} compact />
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label={open ? copy.header.closeMenu : copy.header.openMenu}
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-lg border border-line bg-white/70"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 rounded bg-ink transition-all duration-300",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute top-1.5 left-0 block h-0.5 w-5 rounded bg-ink transition-all duration-300",
                    open && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 rounded bg-ink transition-all duration-300",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — meetsocial uses a 1.017s ease-in-out transform */}
      <div
        className={cn(
          "fixed inset-0 z-100 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-night/50 backdrop-blur-sm transition-opacity duration-500",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-x-3 top-3 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all duration-700 ease-[var(--ease-out-soft)]",
            open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <BrandLogo logoText={site.logoText} logoSub={site.logoSub} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center rounded-lg bg-surface text-ink"
              aria-label={copy.header.closeMenu}
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col">
            {site.nav.map((item, i) => (
              <Link
                key={item.href}
                href={localizedHref(item.href, locale)}
                className="flex items-center justify-between border-b border-line py-4 text-lg font-medium text-ink last:border-0"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {item.label}
                <Arrow className="text-brand" />
              </Link>
            ))}
          </nav>
          <CtaButton href="#contact" className="mt-6 w-full" size="lg">
            {copy.header.freeAccount}
          </CtaButton>
          <p className="mt-4 text-center text-xs text-ink-4">{site.businessEmail}</p>
        </div>
      </div>
    </>
  );
}

function LanguageSwitcher({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const target = alternateLocaleHref(pathname, locale);

  return (
    <Link
      href={target}
      aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
      className={cn(
        "group inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 text-xs font-semibold text-ink-3 transition-all duration-300 hover:border-brand/35 hover:text-brand",
        compact && "gap-1.5 px-2.5",
      )}
    >
      <Languages className="size-4" />
      {compact ? (
        <span>{locale === "zh" ? "EN" : "中"}</span>
      ) : (
        <>
          <span className={cn(locale === "zh" && "text-brand")}>中</span>
          <span className="text-line">/</span>
          <span className={cn(locale === "en" && "text-brand")}>EN</span>
        </>
      )}
    </Link>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-4 transition-transform duration-300 group-hover:translate-x-1", className)}
      aria-hidden="true"
    >
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
