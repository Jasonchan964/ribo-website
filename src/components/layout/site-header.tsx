"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/", key: "home" },
  { href: "/#products", key: "products" },
  { href: "/#technology", key: "technology" },
  { href: "/#about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const overlay = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          overlay
            ? "border-transparent bg-transparent"
            : "border-b border-border/80 bg-background/95 shadow-sm backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="relative z-10 shrink-0"
            aria-label={t("common.logoAlt")}
          >
            <BrandLogo size="md" priority />
          </Link>

          <nav
            className="hidden items-center lg:flex"
            aria-label={tNav("home")}
          >
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition-colors",
                      overlay
                        ? "text-white/80 hover:text-accent"
                        : "text-foreground/70 hover:text-primary",
                    )}
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LocaleSwitcher variant={overlay ? "dark" : "light"} />
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden rounded-sm sm:inline-flex",
                overlay
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {tCommon("getQuote")}
            </Link>
            <button
              type="button"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-sm lg:hidden",
                overlay
                  ? "text-white hover:bg-white/10"
                  : "text-primary hover:bg-muted",
              )}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="sr-only">Menu</span>
              {mobileOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-primary px-6 pb-8 pt-24 shadow-2xl">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="block border-b border-white/10 py-4 text-sm font-medium uppercase tracking-[0.2em] text-white/90 transition-colors hover:text-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 rounded-sm bg-accent text-accent-foreground hover:bg-accent/90",
              )}
              onClick={() => setMobileOpen(false)}
            >
              {tCommon("getQuote")}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
