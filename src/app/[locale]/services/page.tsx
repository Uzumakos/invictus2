import React from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Services from "@/components/sections/Services";
import { loadDB } from "@/lib/db";
import { Cpu, CheckCircle2, Shield, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = (await loadDB()) as any;
  const settings = db.settings;
  const socialLinks = settings?.socialLinks || {};
  const services = db.consultingServices || db.services || [];

  const servicesJsonLd = services.map((s: any) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": typeof s.title === "object" ? (s.title[locale] || s.title["en"]) : s.title,
    "description": typeof s.description === "object" ? (s.description[locale] || s.description["en"]) : s.description,
    "provider": {
      "@type": "Person",
      "name": "Amedee Erns Baptiste"
    },
    "offers": {
      "@type": "Offer",
      "price": s.price,
      "priceCurrency": "USD"
    }
  }));

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      {servicesJsonLd.map((jsonLd: any, idx: number) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      <Header />
      
      <main className="flex-grow pt-36 sm:pt-40 pb-16">
        {/* Page Hero Header */}
        <section className="bg-gradient-to-b from-white via-[var(--color-brand-bg)] to-transparent pt-12 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-[10px] font-sans font-bold tracking-widest uppercase border border-[var(--color-brand-primary)]/20">
              <Cpu className="w-3.5 h-3.5" />
              <span>CONSULTING & SYSTEM ARCHITECTURE</span>
            </span>

            <h1 className="font-serif font-medium text-4xl sm:text-5xl text-[var(--color-brand-dark)] tracking-tight">
              Services & Specialized Offerings
            </h1>

            <p className="font-serif italic text-base sm:text-lg text-[var(--color-brand-muted)] max-w-2xl mx-auto leading-relaxed">
              Tailored software architecture, AI integration planning, cloud migrations, and strategic advisory. Select a service tier to lock in your session.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-[var(--color-brand-dark)]/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Guaranteed Dedicated Time
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[var(--color-brand-primary)]" /> NDA & Full Confidentiality
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" /> Instant Google Calendar Sync
              </span>
            </div>
          </div>
        </section>

        <Services />
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
