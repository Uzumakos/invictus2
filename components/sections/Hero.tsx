"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";

interface HeroProps {
  profileImageUrl: string;
}

export default function Hero({ profileImageUrl }: HeroProps) {
  const t = useTranslations("hero");
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 18,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
      },
    },
  };

  const imageContainerVariants = {
    hidden: { opacity: 0, scale: 0.95, rotate: -2 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 20,
        delay: 0.4,
      },
    },
  };

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const tagline = t("tagline");

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] overflow-hidden pt-28 pb-12">
      {/* Giant Typography Background */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-full text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <h1 className="font-serif italic text-[12vw] sm:text-[18vw] leading-none text-[var(--color-brand-primary)]/[0.04] tracking-widest uppercase">
          AMEDEE
        </h1>
      </motion.div>

      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--color-brand-primary)]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--color-brand-neutral)]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col space-y-8 text-center lg:text-left">
            {/* Availability Badge */}
            <motion.div 
              className="self-center lg:self-start flex items-center space-x-2 bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/30 px-3.5 py-1.5 rounded-full text-[10px] font-sans font-bold tracking-widest text-[var(--color-brand-primary)] uppercase"
              variants={badgeVariants}
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] block"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              <span>{t("availability")}</span>
            </motion.div>

            {/* Main Catchy Heading */}
            <motion.h2 
              className="font-serif font-medium text-4xl sm:text-5xl xl:text-6xl text-[var(--color-brand-dark)] tracking-tight leading-[1.05]"
              variants={itemVariants}
            >
              {tagline.includes("with") ? (
                <>
                  {tagline.split("with")[0]} <span className="text-[var(--color-brand-primary)] italic">with {tagline.split("with")[1]}</span>
                </>
              ) : (
                tagline
              )}
            </motion.h2>

            {/* Supporting Subtitle */}
            <motion.p 
              className="text-[var(--color-brand-muted)] text-base sm:text-lg font-serif italic max-w-2xl leading-relaxed mx-auto lg:mx-0"
              variants={itemVariants}
            >
              "{t("sub")}"
            </motion.p>

            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => handleNavClick("/services")}
                className="w-full sm:w-auto bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-full flex items-center justify-center space-x-2.5 transition-all duration-300 shadow-xs cursor-pointer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t("ctaPrimary")}</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
              
              <motion.button
                onClick={() => handleNavClick("/case-studies")}
                className="w-full sm:w-auto bg-[var(--color-brand-panel)] hover:bg-[var(--color-brand-neutral)] border border-[var(--color-brand-neutral)] text-[var(--color-brand-dark)] font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t("ctaSecondary")}</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Hero Right Content: Portrait */}
          <motion.div 
            className="lg:col-span-5 flex flex-col items-center justify-center relative"
            variants={imageContainerVariants}
          >
            <div className="relative w-72 aspect-[4/5] sm:w-80 lg:w-96 rounded-[120px] overflow-hidden shadow-md border border-[var(--color-brand-neutral)] bg-[var(--color-brand-panel)] group">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-bg)]/20 to-transparent z-10 pointer-events-none"></div>

              <img
                src={profileImageUrl || "/Profil_1.png"}
                alt="Amedee Erns Baptiste"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-102 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                }}
              />
            </div>

            {/* Ambient circular details behind image */}
            <div className="absolute -z-10 w-80 h-80 border border-[var(--color-brand-neutral)]/40 rounded-full scale-110 pointer-events-none animate-spin-slow"></div>
            <div className="absolute -z-10 w-96 h-96 border border-[var(--color-brand-neutral)]/40 rounded-full scale-125 pointer-events-none"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
