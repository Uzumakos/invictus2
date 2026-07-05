import React from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Search, Compass, Eye, Terminal, Send, TrendingUp } from "lucide-react";
import { loadDB } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MethodologyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = (await loadDB()) as any;
  const settings = db.settings;
  const socialLinks = settings?.socialLinks || {};

  const steps = [
    {
      num: "01",
      icon: <Search className="w-5 h-5 text-[var(--color-brand-primary)]" />,
      title: locale === "fr" ? "Discover (Découvrir)" : "Discover & Audit",
      objective: locale === "fr" 
        ? "Analyser vos systèmes existants, vos freins technologiques et vos opportunités commerciales."
        : "Auditing existing systems, technical debt, and business pain-points.",
      output: locale === "fr" ? "Rapport d'audit technique & AI Blueprint" : "Technical Audit Report & AI Readiness Assessment",
      tools: ["Supabase Discovery Engine", "Lighthouse", "Google Analytics 4"],
      impact: locale === "fr" ? "Clarifier l'alignement technologique dès le départ." : "Clarity on technical feasibility and ROI target areas."
    },
    {
      num: "02",
      icon: <Compass className="w-5 h-5 text-emerald-500" />,
      title: locale === "fr" ? "Define (Définir)" : "Define & Architect",
      objective: locale === "fr"
        ? "Spécifier précisément la portée fonctionnelle, les choix d'architecture et les KPIs cibles."
        : "Defining system specifications, tech stack selection, and scalability parameters.",
      output: locale === "fr" ? "Cahier des charges & Plan de conception" : "Software Architecture Specification & System Diagram",
      tools: ["Figma Diagrams", "Zod Schemas", "Next.js Boilerplates"],
      impact: locale === "fr" ? "Éviter les dérives de budget et les imprévus techniques." : "Zero scope creep and a bulletproof developer blueprint."
    },
    {
      num: "03",
      icon: <Eye className="w-5 h-5 text-amber-500" />,
      title: locale === "fr" ? "Design (Concevoir)" : "Design & Prototype",
      objective: locale === "fr"
        ? "Créer des maquettes UI/UX interactives et valider le parcours utilisateur global."
        : "Crafting modern editorial user interfaces and validating core user flows.",
      output: locale === "fr" ? "Prototypes Figma interactifs" : "High-fidelity Figma Prototypes & UI Design Systems",
      tools: ["Figma", "Tailwind CSS", "Lucide Icons"],
      impact: locale === "fr" ? "Valider l'ergonomie et l'adhésion client à 100%." : "Guaranteed modern aesthetic appeal and seamless usability."
    },
    {
      num: "04",
      icon: <Terminal className="w-5 h-5 text-indigo-500" />,
      title: locale === "fr" ? "Develop (Développer)" : "Develop & Code",
      objective: locale === "fr"
        ? "Coder la solution avec des normes de production strictes (tests, propreté du code)."
        : "Writing modular, performant code backed by rigorous static testing.",
      output: locale === "fr" ? "Code source documenté & Base de données" : "Production-ready GitHub Codebase & Database Migrations",
      tools: ["Next.js", "TypeScript", "FastAPI / Go", "Supabase Client"],
      impact: locale === "fr" ? "Assurer une maintenance facile et une sécurité renforcée." : "Highly maintainable code with minimal technical debt."
    },
    {
      num: "05",
      icon: <Send className="w-5 h-5 text-purple-500" />,
      title: locale === "fr" ? "Deploy (Déployer)" : "Deploy & Automate",
      objective: locale === "fr"
        ? "Déployer sur des infrastructures cloud de confiance avec intégration continue."
        : "Automating cloud delivery with continuous deployment integrations.",
      output: locale === "fr" ? "Pipeline CI-CD & Hébergement live" : "Vercel / GCP Cloud Hosting & CI/CD Pipelines",
      tools: ["GitHub Actions", "Vercel CDN", "GCP / Docker"],
      impact: locale === "fr" ? "Déploiements instantanés et sécurisés sans interruption." : "Near-zero downtime and streamlined release pipelines."
    },
    {
      num: "06",
      icon: <TrendingUp className="w-5 h-5 text-rose-500" />,
      title: locale === "fr" ? "Optimize (Optimiser)" : "Optimize & Scale",
      objective: locale === "fr"
        ? "Suivre les comportements réels, optimiser les conversions et ajuster l'infra."
        : "Monitoring telemetry metrics, user behavior, and scaling capacity.",
      output: locale === "fr" ? "Rapport analytique de conversion (GA4)" : "Conversion Rate Optimization Plan & Capacity Reports",
      tools: ["Google Analytics", "Supabase Telemetry", "Sentry Logs"],
      impact: locale === "fr" ? "Améliorer en continu l'efficacité commerciale." : "Continued compounding of ROI and operational efficiency."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold">
              {locale === "fr" ? "NOTRE ACCOMPAGNEMENT" : "DELIVERY METHODOLOGY"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
              {locale === "fr" 
                ? "Cycle de Vie d'un Projet Réussi" 
                : "The 6-Step Advisory Lifecycle"}
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)] max-w-2xl mx-auto leading-relaxed">
              {locale === "fr"
                ? "De l'audit initial jusqu'à la mise à l'échelle continue, notre méthodologie élimine le hasard."
                : "From initial audit to continuous scaling, our methodology eliminates risk and guarantees performance."}
            </p>
            <div className="w-12 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-4" />
          </div>

          {/* Steps Timeline Grid */}
          <div className="max-w-4xl mx-auto space-y-8 relative">
            <div className="absolute left-[39px] top-6 bottom-6 w-[1px] bg-[var(--color-brand-neutral)]/30 hidden sm:block" />

            {steps.map((step, idx) => (
              <div 
                key={idx}
                className="flex flex-col sm:flex-row gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-brand-neutral)]/20 shadow-sm relative group hover:border-[var(--color-brand-primary)]/30 transition-colors"
              >
                {/* step circle icon */}
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 flex items-center justify-center shrink-0 relative z-10 shadow-3xs">
                  {step.icon}
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                    <h3 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">
                      {step.title}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 px-2 py-0.5 rounded-full border border-[var(--color-brand-primary)]/10">
                      Step {step.num}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <p className="text-[var(--color-brand-muted)] leading-relaxed">
                        <strong>{locale === "fr" ? "Objectif :" : "Objective:"}</strong> {step.objective}
                      </p>
                      <p className="text-[var(--color-brand-muted)]">
                        <strong>{locale === "fr" ? "Impact Business :" : "Business Impact:"}</strong> {step.impact}
                      </p>
                    </div>

                    <div className="bg-[var(--color-brand-bg)] p-4 rounded-2xl border border-[var(--color-brand-neutral)]/10 space-y-2.5">
                      <p className="text-[10px] font-sans font-bold text-[var(--color-brand-dark)] uppercase tracking-wider">
                        {locale === "fr" ? "Livrable final" : "Core Deliverable"}
                      </p>
                      <p className="font-medium text-[var(--color-brand-primary)]">{step.output}</p>
                      
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {step.tools.map((tool, tIdx) => (
                          <span 
                            key={tIdx}
                            className="bg-white border border-[var(--color-brand-neutral)]/30 px-2 py-0.5 rounded text-[9px] font-mono font-medium text-[var(--color-brand-dark)]/70"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
