"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Layers, HelpCircle, Compass, ShieldAlert, CheckCircle2, TrendingUp, Lightbulb, X, ArrowUpRight } from "lucide-react";
import { Project, Language } from "@/lib/types";

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const t = useTranslations("projects");
  const currentLanguage = useLocale() as Language;

  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Motion Variants
  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const projectCardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 },
    },
  };

  return (
    <section id="projects" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
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
          <h2 className="font-serif font-medium text-3xl sm:text-4xl tracking-tight text-[var(--color-brand-dark)]">
            {t("subtitle")}
          </h2>
          <div className="w-16 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-5" />
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {projects.map((proj) => {
            const cat = proj.category[currentLanguage] || proj.category["en"];
            const desc = proj.description[currentLanguage] || proj.description["en"];

            return (
              <motion.div
                key={proj.id}
                className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl overflow-hidden shadow-2xs group flex flex-col justify-between"
                variants={projectCardVariants}
                whileHover={{ y: -6, borderColor: "var(--color-brand-primary)" }}
                transition={{ duration: 0.35 }}
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-brand-panel)]">
                    <img
                      src={proj.image}
                      alt={proj.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-103 transition-all duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--color-brand-primary)] border border-[var(--color-brand-neutral)]/30">
                      {cat}
                    </div>
                  </div>

                  <div className="p-8 space-y-4">
                    <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                      {desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.technologies.slice(0, 4).map((tech, idx) => (
                        <span key={idx} className="bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] border border-[var(--color-brand-neutral)]/25 px-2 py-1 rounded text-[10px] font-mono font-medium">
                          {tech}
                        </span>
                      ))}
                      {proj.technologies.length > 4 && (
                        <span className="text-[10px] font-mono font-bold text-[var(--color-brand-primary)] pt-1 pl-1">
                          +{proj.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 pt-2">
                  <button
                    onClick={() => setActiveProject(proj)}
                    className="w-full py-3 bg-[var(--color-brand-panel)] hover:bg-[var(--color-brand-primary)] hover:text-white rounded-xl text-xs font-bold tracking-wider uppercase text-[var(--color-brand-dark)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{t("viewCase")}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Detailed Case Study Slide-over / Modal */}
        <AnimatePresence>
          {activeProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-brand-dark)]/60 backdrop-blur-xs"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                className="bg-white border border-[var(--color-brand-neutral)]/25 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              >
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-brand-neutral)]/20 bg-[var(--color-brand-bg)] sticky top-0 z-10">
                  <div>
                    <span className="text-[9px] font-sans text-[var(--color-brand-primary)] tracking-wider uppercase block font-bold">CASE STUDY EXPLORATION</span>
                    <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                      {activeProject.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="p-1 rounded-full text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-bg)] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                  {/* Banner Image */}
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/20 shadow-2xs">
                    <img src={activeProject.image} alt={activeProject.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                      {/* Challenge */}
                      <div className="space-y-3">
                        <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)] flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-red-500 opacity-80" />
                          {t("problem")}
                        </h4>
                        <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                          {activeProject.problem[currentLanguage] || activeProject.problem["en"]}
                        </p>
                      </div>

                      {/* Research */}
                      <div className="space-y-3">
                        <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)] flex items-center gap-2">
                          <Compass className="w-5 h-5 text-[var(--color-brand-primary)]" />
                          {t("research")}
                        </h4>
                        <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                          {activeProject.research[currentLanguage] || activeProject.research["en"]}
                        </p>
                      </div>

                      {/* Architecture */}
                      <div className="space-y-3">
                        <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)] flex items-center gap-2">
                          <Layers className="w-5 h-5 text-[var(--color-brand-muted)]" />
                          {t("architecture")}
                        </h4>
                        <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                          {activeProject.architecture[currentLanguage] || activeProject.architecture["en"]}
                        </p>
                      </div>

                      {/* Solutions */}
                      <div className="space-y-3">
                        <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)] flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-[var(--color-brand-accent)]" />
                          {t("solution")}
                        </h4>
                        <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                          {activeProject.solutions[currentLanguage] || activeProject.solutions["en"]}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Technical specifications panel */}
                      <div className="bg-[var(--color-brand-bg)] p-6 rounded-2xl border border-[var(--color-brand-neutral)]/20 shadow-2xs space-y-4">
                        <h4 className="font-sans font-bold text-xs text-[var(--color-brand-primary)] tracking-widest uppercase">
                          {t("technologies")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeProject.technologies.map((t, idx) => (
                            <span key={idx} className="bg-white border border-[var(--color-brand-neutral)]/30 text-[var(--color-brand-dark)] px-2.5 py-1 rounded text-xs font-mono font-medium shadow-3xs">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Results */}
                      <div className="space-y-3 bg-[var(--color-brand-bg)] p-6 rounded-2xl border border-[var(--color-brand-neutral)]/20 shadow-2xs">
                        <h4 className="font-serif font-bold text-base text-[var(--color-brand-dark)] flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          {t("results")}
                        </h4>
                        <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                          {activeProject.results[currentLanguage] || activeProject.results["en"]}
                        </p>
                      </div>

                      {/* Lessons learned */}
                      <div className="space-y-3 bg-[var(--color-brand-bg)] p-6 rounded-2xl border border-[var(--color-brand-neutral)]/20 shadow-2xs">
                        <h4 className="font-serif font-bold text-base text-[var(--color-brand-dark)] flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-primary)] opacity-85" />
                          {t("lessons")}
                        </h4>
                        <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                          {activeProject.lessons[currentLanguage] || activeProject.lessons["en"]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[var(--color-brand-neutral)]/20 bg-[var(--color-brand-bg)] flex justify-end">
                  <button
                    onClick={() => setActiveProject(null)}
                    className="px-6 py-3.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    {t("close")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
