"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import Logo from "./Logo";

const NAV_SECTIONS = [
  { key: "about", href: "/about" },
  { key: "services", href: "/consulting" },
  { key: "projects", href: "/case-studies" },
  { key: "training", href: "/training" },
  { key: "portal", href: "/portal" },
  { key: "discovery", href: "/#discovery" },
  { key: "contact", href: "/#contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  // Scroll handler for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection observer for active section
  useEffect(() => {
    const ids = NAV_SECTIONS.map((s) => s.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const handleNavClick = useCallback(
    (href: string) => {
      setMobileOpen(false);
      if (href.startsWith("/") && !href.includes("#")) {
        router.push(href);
        return;
      }

      const hash = href.split("#")[1];
      if (pathname === "/") {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        router.push(href);
      }
    },
    [router, pathname]
  );

  const switchLocale = useCallback(
    (newLocale: string) => {
      setLangOpen(false);
      router.replace(pathname, { locale: newLocale });
    },
    [router, pathname]
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--color-brand-neutral)]/30"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => {
              if (pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-3 group"
            aria-label="Back to homepage"
            id="header-logo-btn"
          >
            <Logo size={36} />
            <span className="font-serif font-medium text-sm text-[var(--color-brand-dark)] hidden sm:block group-hover:text-[var(--color-brand-primary)] transition-colors">
              Amedee Erns Baptiste
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_SECTIONS.map((section) => {
              const isActive = activeSection === section.href.replace("#", "");
              return (
                <button
                  key={section.key}
                  id={`nav-${section.key}`}
                  onClick={() => handleNavClick(section.href)}
                  className={`relative px-3 py-2 text-xs font-medium tracking-wide transition-colors rounded-md ${
                    isActive
                      ? "text-[var(--color-brand-primary)]"
                      : "text-[var(--color-brand-dark)]/70 hover:text-[var(--color-brand-primary)]"
                  }`}
                >
                  {t(section.key)}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[var(--color-brand-primary)]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right side: Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Language dropdown */}
            <div className="relative">
              <button
                id="lang-switcher-btn"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-brand-neutral)] text-xs font-medium text-[var(--color-brand-dark)]/70 hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-all"
              >
                <Globe size={13} />
                <span className="uppercase">{locale}</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform ${langOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-28 bg-white rounded-xl shadow-lg border border-[var(--color-brand-neutral)]/40 overflow-hidden z-50"
                  >
                    {["en", "fr"].map((lang) => (
                      <button
                        key={lang}
                        id={`lang-${lang}-btn`}
                        onClick={() => switchLocale(lang)}
                        className={`w-full px-4 py-2.5 text-xs font-medium text-left hover:bg-[var(--color-brand-bg)] transition-colors ${
                          locale === lang
                            ? "text-[var(--color-brand-primary)]"
                            : "text-[var(--color-brand-dark)]/70"
                        }`}
                      >
                        {lang === "en" ? "🇺🇸 English" : "🇫🇷 Français"}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Book CTA */}
            <button
              id="header-book-cta"
              onClick={() => handleNavClick("#services")}
              className="hidden sm:block px-4 py-1.5 bg-[var(--color-brand-primary)] text-white text-xs font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Book Now
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg text-[var(--color-brand-dark)]/70 hover:text-[var(--color-brand-primary)] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-white/98 backdrop-blur-md border-t border-[var(--color-brand-neutral)]/30"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.key}
                  id={`mobile-nav-${section.key}`}
                  onClick={() => handleNavClick(section.href)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-[var(--color-brand-dark)]/80 hover:text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-bg)] rounded-lg transition-colors"
                >
                  {t(section.key)}
                </button>
              ))}
              <div className="pt-3 pb-1 border-t border-[var(--color-brand-neutral)]/30 flex gap-2">
                {["en", "fr"].map((lang) => (
                  <button
                    key={lang}
                    id={`mobile-lang-${lang}`}
                    onClick={() => switchLocale(lang)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      locale === lang
                        ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                        : "border-[var(--color-brand-neutral)] text-[var(--color-brand-dark)]/70"
                    }`}
                  >
                    {lang === "en" ? "EN" : "FR"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
