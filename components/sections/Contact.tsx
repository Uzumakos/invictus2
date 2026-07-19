"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Language } from "@/lib/types";

export default function Contact() {
  const t = useTranslations("contact");
  const currentLanguage = useLocale() as Language;

  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [budget, setBudget] = useState("$10k - $25k");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !email || !notes) {
      setError(currentLanguage === Language.EN ? "Name, email and message notes are required" : "Le nom, l'e-mail et le message sont requis");
      return;
    }

    setSubmitting(true);
    setError(null);

    const leadPayload = {
      company: company || "Independent / Individual Project",
      contactName,
      email,
      industry: industry || "Consulting Request",
      budget,
      notes,
      source: "General Contact Form",
      status: "lead",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to transmit contact lead parameters");
      }

      setSuccess(true);
      setCompany("");
      setContactName("");
      setEmail("");
      setIndustry("");
      setNotes("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to transmit message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
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
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <section id="contact" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Column */}
          <motion.div
            className="lg:col-span-5 space-y-8 flex flex-col justify-between"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-2xl text-[var(--color-brand-primary)] italic">
                Let's Build Something Scalable.
              </h3>
              <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed font-medium">
                Whether you need engineering consulting, an AI implementation roadmap, or digital transformation training, I'm here to help you design a bulletproof system.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-[var(--color-brand-neutral)]/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-brand-neutral)]/20 flex items-center justify-center shrink-0 shadow-3xs">
                  <Mail className="w-4 h-4 text-[var(--color-brand-primary)]" />
                </div>
                <div>
                  <span className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase">EMAIL</span>
                  <a href="mailto:contact@amedeeerns.com" className="text-sm font-semibold text-[var(--color-brand-dark)] hover:text-[var(--color-brand-primary)] transition-colors">
                    contact@amedeeerns.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-brand-neutral)]/20 flex items-center justify-center shrink-0 shadow-3xs">
                  <Phone className="w-4 h-4 text-[var(--color-brand-primary)]" />
                </div>
                <div>
                  <span className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase">PHONE / WHATSAPP</span>
                  <a href="tel:+50937000000" className="text-sm font-semibold text-[var(--color-brand-dark)] hover:text-[var(--color-brand-primary)] transition-colors">
                    +509 3700 0000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-[var(--color-brand-neutral)]/20 flex items-center justify-center shrink-0 shadow-3xs">
                  <MapPin className="w-4 h-4 text-[var(--color-brand-primary)]" />
                </div>
                <div>
                  <span className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase">LOCATION</span>
                  <span className="text-sm font-semibold text-[var(--color-brand-dark)]">
                    Port-au-Prince, Haiti & Available Globally
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div
            className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[var(--color-brand-neutral)]/20 shadow-2xs"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-[var(--color-brand-dark)]">
                  {t("successTitle")}
                </h3>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed max-w-sm mx-auto font-medium">
                  {t("successMsg")} We will reply to your request in less than 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {t("sendAnother")}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("name")} *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("email")} *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("company")}</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your Company / Org"
                      className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("industry")}</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Finance, Education, NGO"
                      className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("budget")}</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                  >
                    <option value="Under $5k">Under $5k</option>
                    <option value="$5k - $10k">$5k - $10k</option>
                    <option value="$10k - $25k">$10k - $25k</option>
                    <option value="$25k - $50k">$25k - $50k</option>
                    <option value="$50k+">$50k+</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("message")} *</label>
                  <textarea
                    required
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your project, goals, and technical context..."
                    className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? t("submitting") : t("submit")}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
