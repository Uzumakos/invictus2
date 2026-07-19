import React from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIDiscovery from "@/components/sections/AIDiscovery";
import { loadDB } from "@/lib/db";
import { Sparkles, Brain, Compass, BarChart3 } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DiscoveryPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = (await loadDB()) as any;
  const settings = db.settings;
  const socialLinks = settings?.socialLinks || {};

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />
      
      <main className="flex-grow pt-36 sm:pt-40 pb-16">
        {/* Page Hero Header */}
        <section className="bg-gradient-to-b from-white via-[var(--color-brand-bg)] to-transparent pt-12 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-[10px] font-sans font-bold tracking-widest uppercase border border-[var(--color-brand-primary)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-POWERED ARCHITECTURE ESTIMATOR</span>
            </span>

            <h1 className="font-serif font-medium text-4xl sm:text-5xl text-[var(--color-brand-dark)] tracking-tight">
              Smart Project Discovery Engine
            </h1>

            <p className="font-serif italic text-base sm:text-lg text-[var(--color-brand-muted)] max-w-2xl mx-auto leading-relaxed">
              Answer a few questions regarding your business needs, infrastructure requirements, and user scale to generate an instant technical roadmap and budget range.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-[var(--color-brand-dark)]/70">
              <span className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-[var(--color-brand-primary)]" /> Intelligent Scope Analysis
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-500" /> Architectural Roadmap
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-500" /> Instant Budget Estimation
              </span>
            </div>
          </div>
        </section>

        <AIDiscovery />
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
