import React from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Training from "@/components/sections/Training";
import ComingSoon from "@/components/sections/ComingSoon";
import { loadDB } from "@/lib/db";
import { Language } from "@/lib/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TrainingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = (await loadDB()) as any;
  const programs = db.trainingPrograms || [];
  const settings = db.settings;
  const trainingEnabled = settings?.trainingEnabled ?? true;
  const socialLinks = settings?.socialLinks || {};

  const courseJsonLds = programs.map((p: any) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": p.title[locale] || p.title["en"] || p.title,
    "description": p.description?.[locale] || p.description?.["en"] || p.description || "",
    "provider": {
      "@type": "Person",
      "name": "Amedee Erns Baptiste"
    }
  }));

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      {courseJsonLds.map((jsonLd: any, idx: number) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
      <Header />
      
      <main className="flex-grow pt-32 pb-24">
        {trainingEnabled ? (
          <Training programs={programs} locale={locale as Language} />
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <ComingSoon />
          </div>
        )}
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
