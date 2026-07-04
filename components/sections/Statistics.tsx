"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "motion/react";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
}

function AnimatedCounter({ value, suffix, label }: StatItemProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const end = value;
    if (start === end) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.floor(easeProgress * (end - start) + start);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  // Format count nicely (e.g. 2500 -> 2 500 or 2,500)
  const formattedCount = count.toLocaleString();

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl shadow-xs glow-card">
      <span ref={ref} className="text-4xl sm:text-5xl font-serif font-medium text-[var(--color-brand-primary)] stat-number mb-2">
        {formattedCount}
        {suffix}
      </span>
      <span className="text-xs font-sans font-semibold tracking-wider text-[var(--color-brand-muted)] uppercase text-center">
        {label}
      </span>
    </div>
  );
}

export default function Statistics() {
  const t = useTranslations("stats");

  const stats = [
    { value: 10, suffix: "+", label: t("experience") },
    { value: 40, suffix: "+", label: t("projects") },
    { value: 2500, suffix: "+", label: t("students") },
    { value: 150, suffix: "+", label: t("consultations") },
  ];

  return (
    <section id="statistics" className="py-16 bg-[var(--color-brand-bg)] border-b border-[var(--color-brand-neutral)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
