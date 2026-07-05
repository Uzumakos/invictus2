import React from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Services from "@/components/sections/Services";
import { loadDB } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ConsultingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = (await loadDB()) as any;
  const settings = db.settings;
  const socialLinks = settings?.socialLinks || {};
  const services = db.services || [];

  const servicesJsonLd = services.map((s: any) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": s.title[locale] || s.title["en"] || s.title,
    "description": s.description[locale] || s.description["en"] || s.description,
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
      
      <main className="flex-grow pt-32 pb-24">
        <Services />
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
