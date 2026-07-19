import React from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import About from "@/components/sections/About";
import Statistics from "@/components/sections/Statistics";
import TechStack from "@/components/sections/TechStack";
import { Compass, Lightbulb, Target, ArrowRight } from "lucide-react";
import { loadDB } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = (await loadDB()) as any;
  const settings = db.settings;
  const socialLinks = settings?.socialLinks || {};

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          {/* Detailed About Intro Section */}
          <About />

          {/* Core Values / Mission Statements */}
          <section className="bg-white rounded-3xl border border-[var(--color-brand-neutral)]/20 p-8 sm:p-12 shadow-sm space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold">
                {locale === "fr" ? "VISION ET MISSION" : "VISION & MISSION"}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
                {locale === "fr"
                  ? "Accompagner la transformation digitale et l'adoption de l'IA"
                  : "Empowering scalable digital transformations and AI adoption."}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/5 flex items-center justify-center text-[var(--color-brand-primary)]">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg">{locale === "fr" ? "Advisoring Stratégique" : "Strategic Advisory"}</h4>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {locale === "fr"
                    ? "Guider les fondateurs et dirigeants vers des choix technologiques robustes et pérennes."
                    : "Guiding founders and executives towards robust and sustainable technology roadmaps."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/5 flex items-center justify-center text-[var(--color-brand-primary)]">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg">{locale === "fr" ? "Intégration de l'IA" : "AI Enablement"}</h4>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {locale === "fr"
                    ? "Démystifier et intégrer l'intelligence artificielle pour générer des gains opérationnels concrets."
                    : "Demystifying and integrating artificial intelligence to drive concrete operational efficiency."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/10 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-primary)]/5 flex items-center justify-center text-[var(--color-brand-primary)]">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-lg">{locale === "fr" ? "Impact Global" : "Global Impact"}</h4>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {locale === "fr"
                    ? "Propulser l'excellence technologique de l'échelle locale (Haïti) jusqu'à l'international."
                    : "Propelling technology excellence from a local scale (Haiti) to Respected global standards."}
                </p>
              </div>
            </div>
          </section>

          {/* Journey Section (Marketing -> Dev -> AI -> Consulting) */}
          <section className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold">
                {locale === "fr" ? "LE PARCOURS" : "THE JOURNEY"}
              </span>
              <h3 className="font-serif text-3xl font-medium tracking-tight">
                {locale === "fr" ? "L'Évolution d'une Expertise" : "The Evolution of Expertise"}
              </h3>
            </div>

            <div className="relative border-l border-[var(--color-brand-neutral)]/30 max-w-3xl mx-auto pl-8 space-y-12">
              <div className="relative">
                <div className="absolute -left-12 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-brand-primary)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-brand-primary)]">
                  1
                </div>
                <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">Digital Marketing Specialist</h4>
                <p className="text-[11px] font-mono text-[var(--color-brand-muted)] mb-2">2018 - 2026</p>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {locale === "fr"
                    ? "Début de carrière axé sur l'acquisition de clients, le marketing digital avancé et les formations technologiques, jetant les bases des stratégies de croissance."
                    : "Beginning the journey focused on customer acquisition, advanced digital marketing, and tech training, establishing the foundations of growth strategy."}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-12 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-brand-primary)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-brand-primary)]">
                  2
                </div>
                <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">Software Engineering & Architecture</h4>
                <p className="text-[11px] font-mono text-[var(--color-brand-muted)] mb-2">2020 - 2026</p>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {locale === "fr"
                    ? "Transition vers l'ingénierie logicielle avancée et la conception d'architectures robustes. Développement de produits complexes à fort trafic pour des organisations mondiales."
                    : "Transitioning to complex software engineering and systems architecture. Developing high-traffic custom systems and SaaS products for international entities."}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-12 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-[var(--color-brand-primary)] flex items-center justify-center text-xs font-mono font-bold text-[var(--color-brand-primary)]">
                  3
                </div>
                <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">AI & Automation Consulting</h4>
                <p className="text-[11px] font-mono text-[var(--color-brand-muted)] mb-2">2024 - Present</p>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {locale === "fr"
                    ? "CTO-as-a-Service et intégration de l'intelligence artificielle. Combinaison de l'excellence en ingénierie et de la vision stratégique pour la transformation numérique globale."
                    : "Acting as a fractional CTO and integrating generative AI middleware. Bridging technical engineering with strategic digital advising."}
                </p>
              </div>
            </div>
          </section>

          {/* Statistics Preview */}
          <Statistics />

          {/* Tech Stack Preview */}
          <TechStack />

        </div>
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
