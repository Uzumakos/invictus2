"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ComingSoon() {
  const t = useTranslations("training");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to subscribe");

      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="training" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] relative overflow-hidden flex flex-col justify-center min-h-[60vh]">
      {/* Decorative ambient elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-full text-center z-0">
        <h2 className="font-serif italic text-[14vw] sm:text-[18vw] leading-none text-[var(--color-brand-primary)]/[0.02] tracking-widest uppercase">
          ACADEMY
        </h2>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center space-x-2 bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/30 px-4 py-2 rounded-full text-xs font-sans font-bold tracking-widest text-[var(--color-brand-primary)] uppercase mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] block animate-ping" />
          <span>{t("comingSoonTitle")}</span>
        </motion.div>

        {/* Section title */}
        <h3 className="font-serif font-medium text-4xl sm:text-5xl text-[var(--color-brand-dark)] tracking-tight mb-6">
          {t("title")}
        </h3>
        <p className="text-[var(--color-brand-muted)] text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          {t("comingSoonMsg")}
        </p>

        {/* Email Signup Form */}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <div className="relative w-full">
              <Mail className="w-5 h-5 text-[var(--color-brand-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("notifyPlaceholder")}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-[var(--color-brand-neutral)]/40 text-sm focus:outline-none focus:border-[var(--color-brand-primary)] shadow-2xs font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] disabled:opacity-50 text-white text-xs font-bold tracking-widest uppercase rounded-full shadow-xs cursor-pointer shrink-0 transition-all"
            >
              {submitting ? "..." : t("notifyCta")}
            </button>
          </form>

          {/* Toast-style status messages */}
          <AnimatePresence mode="wait">
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 mt-4 text-emerald-600 text-xs font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t("notifySuccess")}</span>
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 mt-4 text-red-600 text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t("notifyError")}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
