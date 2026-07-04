"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { Testimonial } from "@/lib/types";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const t = useTranslations("testimonials");
  const locale = useLocale() as "en" | "fr";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 15 },
    },
  };

  return (
    <section id="testimonials" className="py-24 bg-white text-[var(--color-brand-dark)]">
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

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((test) => {
            const role = test.role[locale] || test.role["en"];
            const content = test.content[locale] || test.content["en"];

            return (
              <motion.div
                key={test.id}
                className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-8 rounded-3xl glow-card relative flex flex-col justify-between"
                variants={cardVariants}
                whileHover={{ y: -6, borderColor: "var(--color-brand-primary)" }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  {/* Rating stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[var(--color-brand-accent)] text-[var(--color-brand-accent)]" />
                    ))}
                  </div>

                  {/* Quote content */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-[var(--color-brand-primary)]/10 absolute -top-4 -left-4 pointer-events-none" />
                    <p className="text-sm font-serif italic text-[var(--color-brand-dark)] leading-relaxed relative z-10 pl-2">
                      "{content}"
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-[var(--color-brand-neutral)]/25">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-brand-panel)] overflow-hidden shrink-0">
                    <img
                      src={test.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                      alt={test.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[var(--color-brand-dark)]">
                      {test.name}
                    </h4>
                    <p className="text-xs text-[var(--color-brand-muted)]">
                      {role}, <span className="font-semibold text-[var(--color-brand-primary)]">{test.company}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
