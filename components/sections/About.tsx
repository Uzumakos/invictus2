"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Code, Brain, Target, GraduationCap, ArrowRight, Zap, Check } from "lucide-react";
import { motion } from "motion/react";

export default function About() {
  const t = useTranslations("about");
  const locale = useLocale();

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const skillDomains = [
    {
      icon: <Brain className="w-5 h-5 text-[var(--color-brand-primary)]" />,
      title: locale === "en" ? "AI Product Strategy" : "Stratégie Produit IA",
      desc: locale === "en"
        ? "RAG, prompt engineering, agentic automation, and Gemini model integrations."
        : "RAG, optimisation de prompts, agents IA autonomes et intégration d'API Gemini.",
    },
    {
      icon: <Code className="w-5 h-5 text-[var(--color-brand-muted)]" />,
      title: locale === "en" ? "Full-Stack Engineering" : "Ingénierie Logicielle",
      desc: locale === "en"
        ? "Designing scalable databases, high-throughput microservices, and fast React applications."
        : "Conception de bases de données évolutives, microservices haute performance et apps React.",
    },
    {
      icon: <Target className="w-5 h-5 text-[var(--color-brand-primary)]" />,
      title: locale === "en" ? "Digital Transformation" : "Transformation Digitale",
      desc: locale === "en"
        ? "Helping companies transition offline structures into automated, secure cloud infrastructures."
        : "Aider les entreprises à migrer leurs processus hors ligne vers des infrastructures cloud.",
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-[var(--color-brand-muted)]" />,
      title: locale === "en" ? "Education & Training" : "Éducation & Formations",
      desc: locale === "en"
        ? "Digital literacy programs for university educators and executive digital marketing bootcamps."
        : "Programmes de littératie numérique pour enseignants et formations intensives en marketing.",
    },
  ];

  const technologies = [
    "TypeScript", "React", "Node.js / Express", "Next.js", "Python", 
    "Go", "PostgreSQL", "Google Cloud / GCP", "Docker", "Tailwind CSS",
    "RabbitMQ", "Redis", "Google Gemini API", "Vector Databases", "LangChain"
  ];

  const roles = [
    t("roles.0"),
    t("roles.1"),
    t("roles.2"),
    t("roles.3"),
    t("roles.4"),
  ];

  // Motion Variants
  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const childCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="about" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <motion.div 
          className="text-center mb-16"
          variants={sectionHeaderVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase block mb-3 font-bold">
            {t("title")}
          </span>
          <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[var(--color-brand-dark)] tracking-tight">
            {t("subtitle")}
          </h2>
          <motion.div 
            className="w-16 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-5"
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </motion.div>

        {/* Narrative & Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Block - Bio */}
          <motion.div 
            className="lg:col-span-5 flex flex-col space-y-6"
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 className="font-serif font-bold italic text-2xl text-[var(--color-brand-primary)]">
              {locale === "en" ? "Strategic Vision" : "La Vision Stratégique"}
            </h3>
            <p className="text-[var(--color-brand-muted)] leading-relaxed text-base">
              {t("bio")}
            </p>
            <div className="space-y-3 pt-2">
              {roles.map((role, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex items-center space-x-2.5"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[var(--color-brand-primary)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-brand-muted)]">{role}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="pt-4">
              <motion.button
                onClick={() => handleNavClick("services")}
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{t("cta")}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right Block - Core Capabilities & Tech Stack */}
          <div className="lg:col-span-7 flex flex-col space-y-10">
            
            {/* Capabilities grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {skillDomains.map((domain, idx) => (
                <motion.div 
                  key={idx} 
                  className="bg-white p-6 rounded-xl border border-[var(--color-brand-neutral)]/20 shadow-xs relative overflow-hidden"
                  variants={childCardVariants}
                  whileHover={{ 
                    y: -4, 
                    borderColor: "var(--color-brand-primary)",
                    boxShadow: "0 10px 30px -15px rgba(0,0,0,0.08)"
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-panel)] flex items-center justify-center mb-4">
                    {domain.icon}
                  </div>
                  <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)] mb-2">
                    {domain.title}
                  </h4>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                    {domain.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Tech Stack Horizontal Pills */}
            <motion.div 
              className="bg-white p-6 rounded-xl border border-[var(--color-brand-neutral)]/20 shadow-xs"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-sans font-bold text-xs text-[var(--color-brand-primary)] tracking-widest uppercase mb-4 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[var(--color-brand-primary)]" />
                <span>{t("techLabel")}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, idx) => (
                  <motion.span
                    key={idx}
                    className="bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/40 text-[var(--color-brand-dark)] px-3 py-1.5 rounded-md text-xs font-mono font-medium inline-block"
                    whileHover={{ scale: 1.05, backgroundColor: "#fff", borderColor: "var(--color-brand-primary)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
