import React from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TechStack from "@/components/sections/TechStack";
import { Code2, BrainCircuit, BarChart3, GraduationCap, Zap, CheckCircle2 } from "lucide-react";
import { loadDB } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CapabilitiesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = (await loadDB()) as any;
  const settings = db.settings;
  const socialLinks = settings?.socialLinks || {};

  const pillars = [
    {
      icon: <Code2 className="w-6 h-6 text-[var(--color-brand-primary)]" />,
      title: locale === "fr" ? "Ingénierie Logicielle & Architecture" : "Software Engineering & Architecture",
      value: locale === "fr" 
        ? "Créer des systèmes sécurisés, hautement performants et évolutifs pour soutenir la croissance de votre entreprise."
        : "Building secure, highly performant, and scalable architectures designed for enterprise growth.",
      deliverables: locale === "fr"
        ? ["Conception d'APIs & microservices", "Optimisation de bases de données relationnelles", "Audits de sécurité et de performances", "Refactoring de code patrimonial"]
        : ["Microservices & API Design", "Relational Database Performance Tuning", "Security & Reliability Audits", "Legacy Codebase Refactoring"],
      tech: ["Next.js", "Go", "FastAPI", "PostgreSQL", "Redis", "Docker"]
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-emerald-500" />,
      title: locale === "fr" ? "IA & Automatisation des Opérations" : "AI & Automation Strategy",
      value: locale === "fr"
        ? "Intégrer les technologies cognitives au cœur de vos processus pour démultiplier la productivité."
        : "Integrating cognitive technologies directly into your business workflows to multiply productivity.",
      deliverables: locale === "fr"
        ? ["Déploiement d'agents IA autonomes", "Pipelines de données RAG (génération augmentée)", "Automatisation de workflows (Make, n8n)", "Intégration d'APIs LLM (Gemini, OpenAI)"]
        : ["Autonomous AI Agents", "RAG Data Pipelines", "Workflow Automation (Make, n8n)", "Gemini/OpenAI API Integrations"],
      tech: ["LangChain", "Vector DBs", "n8n", "Python", "Gemini API"]
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: locale === "fr" ? "Transformation Digitale d'Entreprise" : "Digital Transformation Advisory",
      value: locale === "fr"
        ? "Moderniser les infrastructures technologiques des organisations privées et publiques."
        : "Modernizing IT infrastructures and operational workflows for corporate and public entities.",
      deliverables: locale === "fr"
        ? ["CTO-as-a-Service (temps partiel)", "Plan directeur des systèmes d'information", "Accompagnement à la migration Cloud", "Mise en place de cultures DevOps / CI-CD"]
        : ["Fractional CTO Advisory", "IT Systems Master Planning", "Cloud Migration Strategy", "DevOps & CI/CD Pipeline Setup"],
      tech: ["Google Cloud (GCP)", "Kubernetes", "GitHub Actions", "Vercel"]
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
      title: locale === "fr" ? "Marketing Digital & Stratégies de Croissance" : "Digital Marketing & Growth Engine",
      value: locale === "fr"
        ? "Concevoir des entonnoirs d'acquisition analytiques pour maximiser le retour sur investissement média."
        : "Structuring analytical customer acquisition funnels to maximize media return on investment (ROI).",
      deliverables: locale === "fr"
        ? ["Stratégie de marketing de contenu", "Optimisation du taux de conversion (CRO)", "Campagnes publicitaires payantes (Ads)", "Intégration d'outils analytiques complexes"]
        : ["Content Marketing Engine", "Conversion Rate Optimization (CRO)", "Data-driven Paid Ad Campaigns", "Advanced Tracking & Analytics Setup"],
      tech: ["Google Analytics 4", "GTM", "Meta Ads", "SEO Architectures"]
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-rose-500" />,
      title: locale === "fr" ? "Formation Professionnelle & Académie" : "Training & Digital Literacy",
      value: locale === "fr"
        ? "Élever les compétences numériques des équipes d'enseignants, d'ingénieurs et de cadres."
        : "Upskilling teams, educators, and enterprise personnel in modern software toolkits.",
      deliverables: locale === "fr"
        ? ["Formations sur l'alphabétisation numérique", "Ateliers pratiques sur l'usage de l'IA", "Programmes de formation d'ingénieurs", "Certifications professionnelles"]
        : ["Teacher Digital Literacy Programs", "Hands-on AI Workshops for Teams", "Custom Corporate Curriculums", "Technical Bootcamps & Seminars"],
      tech: ["Workspace Tools", "LMS Platforms", "Generative AI Tools"]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold">
              {locale === "fr" ? "VOS LEVIERS DE CROISSANCE" : "CAPABILITY FRAMEWORK"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
              {locale === "fr" 
                ? "Cinq Piliers d'Excellence Technologique" 
                : "Five Pillars of High-Value Delivery"}
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)] max-w-2xl mx-auto leading-relaxed">
              {locale === "fr"
                ? "Chaque pilier allie rigueur d'ingénierie et pragmatisme commercial pour assurer des résultats concrets."
                : "Bridging engineering rigor with business performance to generate measurable operational results."}
            </p>
            <div className="w-12 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-4" />
          </div>

          {/* Pillars List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-[var(--color-brand-neutral)]/20 p-8 shadow-sm hover:border-[var(--color-brand-primary)]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/10 flex items-center justify-center shadow-2xs">
                    {pillar.icon}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                      {pillar.value}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[var(--color-brand-neutral)]/10">
                    <h4 className="text-[10px] font-sans uppercase font-bold text-[var(--color-brand-dark)] tracking-wider">
                      {locale === "fr" ? "Livrables clés" : "Key Deliverables"}
                    </h4>
                    <ul className="space-y-2">
                      {pillar.deliverables.map((del, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs text-[var(--color-brand-muted)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-brand-primary)] mt-0.5 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--color-brand-neutral)]/10 flex flex-wrap gap-1.5">
                  {pillar.tech.map((t, tIdx) => (
                    <span 
                      key={tIdx}
                      className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/25 text-[var(--color-brand-dark)]/80 px-2.5 py-1 rounded-md text-[10px] font-mono font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Technology Stack Breakdown */}
          <TechStack />

        </div>
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
