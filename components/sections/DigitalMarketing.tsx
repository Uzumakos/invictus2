"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CheckCircle2, TrendingUp, Award, Users, Globe } from "lucide-react";

export default function DigitalMarketing() {
  const t = useTranslations("digitalMarketing");

  const highlights = [
    "SEO & Content Optimization",
    "Paid Advertising (Google, Meta)",
    "Growth Hacking & Funnel Design",
    "Analytics & ROI Attribution",
    "AI-Augmented Marketing Operations",
    "Brand Positioning Strategy",
  ];

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="digital-marketing" className="py-24 bg-white text-[var(--color-brand-dark)] relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-[var(--color-brand-primary)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Highlight */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase block font-bold">
              {t("title")}
            </span>
            <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[var(--color-brand-dark)] tracking-tight leading-tight">
              {t("subtitle")}
            </h2>
            <div className="w-16 h-[1px] bg-[var(--color-brand-primary)] my-2" />
            
            <p className="text-[var(--color-brand-muted)] text-sm sm:text-base leading-relaxed">
              We design and deliver intensive, customized bootcamps and long-term training programs for sales teams, marketing agencies, university students, and enterprise divisions looking to dominate the digital landscape.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-primary)] shrink-0" />
                  <span className="text-xs font-semibold text-[var(--color-brand-dark)]/85">{h}</span>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={() => handleNavClick("training")}
                className="px-6 py-3.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-full transition-colors cursor-pointer"
              >
                {t("cta")}
              </button>
            </div>
          </div>

          {/* Right Metrics Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-6">
            
            <motion.div
              className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-6 rounded-2xl flex flex-col items-center text-center justify-center glow-card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <Award className="w-8 h-8 text-[var(--color-brand-primary)] mb-3" />
              <span className="text-3xl font-serif text-[var(--color-brand-dark)] font-bold mb-1">15+</span>
              <span className="text-[9px] font-sans font-bold tracking-wider text-[var(--color-brand-muted)] uppercase">{t("stat1")}</span>
            </motion.div>

            <motion.div
              className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-6 rounded-2xl flex flex-col items-center text-center justify-center glow-card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <Users className="w-8 h-8 text-[var(--color-brand-muted)] mb-3" />
              <span className="text-3xl font-serif text-[var(--color-brand-dark)] font-bold mb-1">1,200+</span>
              <span className="text-[9px] font-sans font-bold tracking-wider text-[var(--color-brand-muted)] uppercase">{t("stat2")}</span>
            </motion.div>

            <motion.div
              className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-6 rounded-2xl flex flex-col items-center text-center justify-center glow-card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <TrendingUp className="w-8 h-8 text-[var(--color-brand-accent)] mb-3" />
              <span className="text-3xl font-serif text-[var(--color-brand-dark)] font-bold mb-1">4.9/5</span>
              <span className="text-[9px] font-sans font-bold tracking-wider text-[var(--color-brand-muted)] uppercase">{t("stat3")}</span>
            </motion.div>

            <motion.div
              className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-6 rounded-2xl flex flex-col items-center text-center justify-center glow-card"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              <Globe className="w-8 h-8 text-[var(--color-brand-primary)] mb-3" />
              <span className="text-3xl font-serif text-[var(--color-brand-dark)] font-bold mb-1">6+</span>
              <span className="text-[9px] font-sans font-bold tracking-wider text-[var(--color-brand-muted)] uppercase">{t("stat4")}</span>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
