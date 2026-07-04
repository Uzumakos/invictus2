"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Users, BookOpen, Check, X, AlertCircle } from "lucide-react";
import { Language } from "@/lib/types";

type TrainingProgram = {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  duration: string;
  audience: Record<string, string> | string;
  syllabus?: string[];
};

interface TrainingProps {
  programs: TrainingProgram[];
  locale: Language;
}

export default function Training({ programs, locale }: TrainingProps) {
  const t = useTranslations("training");

  const [enrollingCourse, setEnrollingCourse] = useState<TrainingProgram | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentRole, setStudentRole] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = (course: TrainingProgram) => {
    setEnrollingCourse(course);
    setSuccess(false);
    setError(null);
  };

  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollingCourse) return;

    if (!studentName || !studentEmail) {
      setError("Name and Email are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const courseTitle = enrollingCourse.title[locale] || enrollingCourse.title["en"] || "";

    const leadPayload = {
      company: studentRole || "Independent Professional",
      contactName: studentName,
      email: studentEmail,
      industry: "Education & Training",
      budget: "Course Enrollment",
      notes: `Interested in enrolling for "${courseTitle}". Context/Background: ${studentNotes}`,
      source: "Training Platform Registration",
      status: "discovery",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to register enrollment lead.");
      }

      setSuccess(true);
      setStudentName("");
      setStudentEmail("");
      setStudentRole("");
      setStudentNotes("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="training" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase block mb-3 font-bold">
            {t("title")}
          </span>
          <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[var(--color-brand-dark)] tracking-tight">
            {t("subtitle")}
          </h2>
          <div className="w-16 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-5" />
        </div>

        {/* Programs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((prog) => {
            const title = prog.title[locale] || prog.title["en"] || "";
            const excerpt = prog.description?.[locale] || prog.description?.["en"] || "";
            
            return (
              <motion.div
                key={prog.id}
                className="bg-white border border-[var(--color-brand-neutral)]/20 p-8 rounded-3xl glow-card flex flex-col justify-between shadow-2xs"
                whileHover={{ y: -6, borderColor: "var(--color-brand-primary)" }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <div className="w-12 h-12 bg-[var(--color-brand-panel)]/50 rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen className="w-6 h-6 text-[var(--color-brand-primary)]" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)] mb-3 leading-snug">
                    {title}
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium mb-6">
                    {excerpt}
                  </p>

                  <div className="space-y-3 font-semibold text-[10px] text-[var(--color-brand-muted)] tracking-wider uppercase border-t border-[var(--color-brand-neutral)]/20 pt-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-[var(--color-brand-primary)] shrink-0" />
                      <span>{t("duration")}: {prog.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-[var(--color-brand-muted)] shrink-0" />
                      <span>{t("audience")}: {typeof prog.audience === "object" ? (prog.audience[locale] || prog.audience["en"]) : prog.audience}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleEnroll(prog)}
                    className="w-full py-3.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
                  >
                    {t("register")}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal dialog for Enrollment */}
        <AnimatePresence>
          {enrollingCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-brand-dark)]/60 backdrop-blur-xs"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative"
              >
                
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--color-brand-neutral)]/20">
                  <div>
                    <span className="text-[9px] font-sans text-[var(--color-brand-primary)] tracking-widest uppercase block font-bold">PROGRAM REGISTRATION</span>
                    <h3 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">
                      {enrollingCourse.title[locale] || enrollingCourse.title["en"] || ""}
                    </h3>
                  </div>
                  <button
                    onClick={() => setEnrollingCourse(null)}
                    className="p-1 rounded-full text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-bg)] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {success ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">Subscription Received!</h4>
                    <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                      Thank you for your interest. We have logged your request. Our training coordinator will verify and contact you within 24 hours.
                    </p>
                    <button
                      onClick={() => setEnrollingCourse(null)}
                      className="px-6 py-2.5 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitEnrollment} className="space-y-4 pt-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">YOUR NAME *</label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="john.doe@company.com"
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">COMPANY / JOB TITLE</label>
                      <input
                        type="text"
                        value={studentRole}
                        onChange={(e) => setStudentRole(e.target.value)}
                        placeholder="e.g. Sales Director, Teacher, Marketing Lead"
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">ANY SPECIFIC EXPECTATIONS OR NOTES</label>
                      <textarea
                        rows={3}
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="Let us know what you want to achieve through this program."
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-brand-neutral)]/20">
                      <button
                        type="button"
                        onClick={() => setEnrollingCourse(null)}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {submitting ? "..." : "Enroll Now"}
                      </button>
                    </div>
                  </form>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
