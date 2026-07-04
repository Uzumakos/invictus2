"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQItem } from "@/lib/types";

interface FAQProps {
  faqItems: FAQItem[];
}

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const locale = useLocale() as "en" | "fr";
  const question = item.question[locale] || item.question["en"];
  const answer = item.answer[locale] || item.answer["en"];

  return (
    <div className="border-b border-[var(--color-brand-neutral)]/20 py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left font-serif font-medium text-lg text-[var(--color-brand-dark)] hover:text-[var(--color-brand-primary)] transition-colors group"
      >
        <span className="flex items-center gap-3 pr-4">
          <HelpCircle className="w-5 h-5 text-[var(--color-brand-primary)] shrink-0 opacity-70 group-hover:opacity-100" />
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[var(--color-brand-muted)] transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-180 text-[var(--color-brand-primary)]" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 pt-2 text-sm text-[var(--color-brand-muted)] leading-relaxed max-w-4xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ({ faqItems }: FAQProps) {
  const t = useTranslations("faq");
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
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

        {/* FAQ Accordion List */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[var(--color-brand-neutral)]/20 shadow-2xs">
          {faqItems.map((item) => (
            <FAQAccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
