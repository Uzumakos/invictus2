"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Laptop, Database, Brain, Cloud, Terminal } from "lucide-react";

export default function TechStack() {
  const t = useTranslations("techStack");

  const categories = [
    {
      title: t("frontend"),
      icon: <Laptop className="w-6 h-6 text-[var(--color-brand-primary)]" />,
      items: ["React", "Next.js 15", "TypeScript", "Tailwind CSS v4", "Framer Motion", "Redux Toolkit"],
    },
    {
      title: t("backend"),
      icon: <Database className="w-6 h-6 text-[var(--color-brand-muted)]" />,
      items: ["Node.js", "Express", "Python / FastAPI", "Go (Golang)", "PostgreSQL", "Redis", "RabbitMQ"],
    },
    {
      title: t("ai"),
      icon: <Brain className="w-6 h-6 text-[var(--color-brand-accent)]" />,
      items: ["Google Gemini API", "OpenAI API", "Vector DBs (Chroma/Pinecone)", "RAG Architectures", "LangChain / LlamaIndex"],
    },
    {
      title: t("devops"),
      icon: <Cloud className="w-6 h-6 text-[var(--color-brand-primary)]" />,
      items: ["Google Cloud Platform (GCP)", "Docker", "Kubernetes", "GitHub Actions CI/CD", "Vercel", "Linux Admin"],
    },
    {
      title: t("tools"),
      icon: <Terminal className="w-6 h-6 text-[var(--color-brand-muted)]" />,
      items: ["Git & GitHub", "Figma", "Postman", "Supabase", "Prisma ORM", "Linux Shell Scripting"],
    },
  ];

  const sectionHeaderVariants = {
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
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section id="tech-stack" className="py-24 bg-white text-[var(--color-brand-dark)]">
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
          <h2 className="font-serif font-medium text-3xl sm:text-4xl text-[var(--color-brand-dark)] tracking-tight">
            {t("subtitle")}
          </h2>
          <div className="w-16 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-5" />
        </motion.div>

        {/* Categories Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              className="p-8 bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 rounded-3xl glow-card flex flex-col justify-between"
              variants={cardVariants}
              whileHover={{ y: -6, borderColor: "var(--color-brand-primary)" }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <div className="w-12 h-12 rounded-full bg-white border border-[var(--color-brand-neutral)]/25 flex items-center justify-center mb-6 shadow-xs">
                  {cat.icon}
                </div>
                <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)] mb-6">
                  {cat.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="bg-white border border-[var(--color-brand-neutral)]/40 text-[var(--color-brand-dark)] px-3 py-1.5 rounded-lg text-xs font-mono font-medium shadow-2xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
