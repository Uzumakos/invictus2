"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Calendar, Clock, ArrowLeft, Search, Tag, Eye } from "lucide-react";
import { Article, Language } from "@/lib/types";

interface BlogProps {
  articles: Article[];
}

export default function Blog({ articles }: BlogProps) {
  const t = useTranslations("blog");
  const locale = useLocale() as Language;

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", "engineering", "ai", "marketing", "strategy"];

  const filteredArticles = articles.filter((article) => {
    const title = (article.title[locale] || article.title["en"] || "").toLowerCase();
    const excerpt = (article.excerpt[locale] || article.excerpt["en"] || "").toLowerCase();
    const tags = article.tags.map((tag) => tag.toLowerCase());
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      title.includes(query) ||
      excerpt.includes(query) ||
      tags.some((tag) => tag.includes(query));

    const matchesCategory = activeCategory === "all" || article.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

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
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <section id="blog" className="py-24 bg-white text-[var(--color-brand-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!selectedArticle ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Section Heading */}
              <motion.div 
                className="text-center"
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
                <div className="w-16 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-5" />
              </motion.div>

              {/* Filters / Search Row */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--color-brand-bg)] p-4 rounded-2xl border border-[var(--color-brand-neutral)]/20 shadow-2xs">
                {/* Categories Tab list */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeCategory === cat
                          ? "bg-[var(--color-brand-primary)] text-white"
                          : "bg-white border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/40"
                      }`}
                    >
                      {t(cat)}
                    </button>
                  ))}
                </div>

                {/* Search Bar Input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4.5 h-4.5 text-[var(--color-brand-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("search")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[var(--color-brand-neutral)]/45 text-xs focus:outline-none focus:border-[var(--color-brand-primary)] font-semibold"
                  />
                </div>
              </div>

              {/* Articles Grid List */}
              {filteredArticles.length === 0 ? (
                <div className="text-center py-16 text-[var(--color-brand-muted)] font-medium">
                  {t("noResults")}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredArticles.map((art) => {
                    const title = art.title[locale] || art.title["en"];
                    const excerpt = art.excerpt[locale] || art.excerpt["en"];
                    
                    return (
                      <motion.div
                        key={art.id}
                        className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-8 rounded-3xl glow-card flex flex-col justify-between"
                        variants={cardVariants}
                        whileHover={{ y: -6, borderColor: "var(--color-brand-primary)" }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <div className="flex items-center gap-4 text-[10px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase mb-4">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{art.publishedAt}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{art.readingTime} {t("minRead")}</span>
                          </div>
                          
                          <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)] mb-3 leading-snug">
                            {title}
                          </h3>
                          <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium mb-6">
                            {excerpt}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {art.tags.map((t, idx) => (
                              <span key={idx} className="bg-white text-[var(--color-brand-dark)] border border-[var(--color-brand-neutral)]/45 px-2 py-1 rounded text-[9px] font-mono font-medium">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => setSelectedArticle(art)}
                            className="w-full py-3 bg-white hover:bg-[var(--color-brand-primary)] hover:text-white rounded-xl text-xs font-bold tracking-widest uppercase border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-dark)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{t("readMore")}</span>
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Selected Article view */
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("backToBlog")}</span>
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{selectedArticle.publishedAt}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{selectedArticle.readingTime} {t("minRead")}</span>
                  <span className="bg-[var(--color-brand-panel)] px-2.5 py-1 rounded-full text-[9px] font-bold text-[var(--color-brand-primary)]">{selectedArticle.category}</span>
                </div>
                
                <h1 className="font-serif font-medium text-3xl sm:text-4xl text-[var(--color-brand-dark)] leading-tight">
                  {selectedArticle.title[locale] || selectedArticle.title["en"]}
                </h1>

                <div className="flex flex-wrap gap-1.5">
                  {selectedArticle.tags.map((t, idx) => (
                    <span key={idx} className="bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] border border-[var(--color-brand-neutral)]/20 px-2 py-1 rounded text-[10px] font-mono font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full h-[1px] bg-[var(--color-brand-neutral)]/30" />

              {/* Body Content */}
              <article className="prose prose-slate max-w-none text-sm text-[var(--color-brand-muted)] leading-relaxed font-medium space-y-6">
                {(selectedArticle.content[locale] || selectedArticle.content["en"])
                  .split("\n\n")
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </article>

              <div className="w-full h-[1px] bg-[var(--color-brand-neutral)]/30 pt-6" />

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-3.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-colors cursor-pointer"
                >
                  {t("backToBlog")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
