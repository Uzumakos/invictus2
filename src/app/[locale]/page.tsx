import React from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { ArrowRight, CheckCircle2, Cpu, Globe, Laptop, GraduationCap, Calendar, Layers } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Statistics from "@/components/sections/Statistics";
import Organizations from "@/components/sections/Organizations";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import { loadDB } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load datasets dynamically from Supabase database
  const db = (await loadDB()) as any;
  const settings = db.settings;
  const profileImageUrl = settings?.profileImageUrl || "/default-avatar.png";
  const trainingEnabled = settings?.trainingEnabled ?? true;
  const socialLinks = settings?.socialLinks || {};

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />
      
      <main className="flex-1 space-y-24 pb-24">
        {/* 1. Hero & Metrics */}
        <div>
          <Hero profileImageUrl={profileImageUrl} />
          <Statistics />
        </div>

        {/* 2. Trusted By Organizations */}
        <Organizations organizations={(db.organizations as any[]) || []} />

        {/* 3. About Preview Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[var(--color-brand-neutral)]/20 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold block">
                {locale === "fr" ? "APERÇU CONSEIL" : "ADVISORY PROFILE"}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[var(--color-brand-dark)]">
                {locale === "fr" ? "L'Esprit Strategique derrière la Technologie" : "Bridging Strategy with Deep Tech Architecture"}
              </h2>
              <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                {locale === "fr"
                  ? "Amedee Erns Baptiste accompagne les entreprises et institutions internationales dans l'adoption de l'IA et l'optimisation de leurs architectures technologiques. Découvrez un parcours unique unissant marketing de croissance et ingénierie logicielle."
                  : "Amedee Erns Baptiste serves as a technology consultant and CTO advisor for high-stakes projects globally. Leveraging a decade of multi-disciplinary experience in engineering, AI middleware integration, and growth marketing."}
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  locale === "fr" ? "Expertise en Ingénierie Logicielle" : "Software Systems Architecture",
                  locale === "fr" ? "Intégration et Stratégie d'IA" : "Generative AI Middleware",
                  locale === "fr" ? "Conseils en Transformation Digitale" : "Fractional CTO Advisory",
                  locale === "fr" ? "Formation Professionnelle Exécutive" : "Professional Upskilling & Academies"
                ].map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-[var(--color-brand-muted)] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-primary)] shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-dark)] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  <span>{locale === "fr" ? "Découvrir Amedee" : "Read Strategic Bio"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border border-[var(--color-brand-neutral)]/30 shadow-md bg-[var(--color-brand-panel)]">
                <img src={profileImageUrl} alt="Amedee Erns Baptiste" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Capabilities Preview Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold block">
              {locale === "fr" ? "COMPÉTENCES CLÉS" : "CORE CAPABILITIES"}
            </span>
            <h2 className="font-serif text-3xl tracking-tight text-[var(--color-brand-dark)]">
              {locale === "fr" ? "Nos Domaines d'Intervention" : "Capability Framework Preview"}
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
              {locale === "fr"
                ? "Cinq piliers de livrables technologiques stratégiques conçus pour maximiser l'efficacité opérationnelle."
                : "Five strategic pillars engineered to deliver software reliability and business value."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Laptop className="w-5 h-5 text-[var(--color-brand-primary)]" />,
                title: locale === "fr" ? "Ingénierie Logicielle" : "Software Engineering",
                desc: locale === "fr" ? "Architectures Cloud robustes, de Next.js à Go." : "Scalable system designs built with Next.js, FastAPI, and Go."
              },
              {
                icon: <Cpu className="w-5 h-5 text-emerald-500" />,
                title: locale === "fr" ? "IA & Automatisation" : "AI & Automation",
                desc: locale === "fr" ? "Déploiement d'agents autonomes et pipelines de données." : "Cognitive automation and LLM middleware integrations."
              },
              {
                icon: <Globe className="w-5 h-5 text-amber-500" />,
                title: locale === "fr" ? "Transformation Digitale" : "Digital Transformation",
                desc: locale === "fr" ? "Conseils technologiques CTO-as-a-Service pour entreprises." : "Fractional CTO roadmaps for modernizing operations."
              }
            ].map((pillar, idx) => (
              <div key={idx} className="bg-white border border-[var(--color-brand-neutral)]/20 p-6 rounded-3xl space-y-4 shadow-3xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/15 flex items-center justify-center">
                    {pillar.icon}
                  </div>
                  <h3 className="font-serif font-bold text-base text-[var(--color-brand-dark)]">{pillar.title}</h3>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/capabilities"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] hover:underline"
            >
              <span>{locale === "fr" ? "Découvrir tous les Piliers" : "Explore All Capabilities"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 5. Methodology Preview Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[var(--color-brand-neutral)]/20 p-8 sm:p-12 shadow-sm space-y-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold block">
                {locale === "fr" ? "MÉTHODOLOGIE PRO" : "METHODOLOGY LIFECYCLE"}
              </span>
              <h2 className="font-serif text-3xl tracking-tight text-[var(--color-brand-dark)]">
                {locale === "fr" ? "Un Cadre de Livraison en 6 Étapes" : "The 6-Step Delivery Framework"}
              </h2>
              <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                {locale === "fr"
                  ? "De l'audit technique à l'optimisation continue, notre framework structuré garantit des livraisons sans mauvaise surprise."
                  : "Discover → Define → Design → Develop → Deploy → Optimize. A systematic consulting methodology built to align timeline expectations and assure software performance."}
              </p>
              
              <div className="pt-2">
                <Link
                  href="/methodology"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-dark)] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  <span>{locale === "fr" ? "Découvrir la Méthodologie" : "Explore delivery Framework"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 font-mono text-xs border-l border-[var(--color-brand-neutral)]/30 pl-6">
              {[
                { num: "01", name: "Discover", desc: "System Audits & AI Feasibility" },
                { num: "02", name: "Define", desc: "Specifications & Architecture Diagrams" },
                { num: "03", name: "Develop", desc: "Modular Coding & Production Releases" }
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--color-brand-primary)] uppercase text-[10px]">
                    <span>Step {step.num}</span>
                    <span>•</span>
                    <span>{step.name}</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-brand-muted)] pb-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Case Studies Preview Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold block">
              {locale === "fr" ? "ÉTUDES DE CAS" : "PROJECT DEEP DIVES"}
            </span>
            <h2 className="font-serif text-3xl tracking-tight text-[var(--color-brand-dark)]">
              {locale === "fr" ? "Projets et Études de Cas Récents" : "Featured Case Studies"}
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
              {locale === "fr"
                ? "Découvrez comment nous aidons nos partenaires à déployer des systèmes fiables."
                : "Real-world engineering implementations demonstrating robust architectures and concrete business results."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {((db.projects as any[]) || []).slice(0, 2).map((proj) => {
              const cat = typeof proj.category === "object" && proj.category 
                ? (proj.category[locale] || proj.category["en"] || "") 
                : (proj.category || "");
              const desc = typeof proj.description === "object" && proj.description 
                ? (proj.description[locale] || proj.description["en"] || "") 
                : (proj.description || "");
              return (
                <div key={proj.id} className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl overflow-hidden shadow-3xs flex flex-col justify-between hover:border-[var(--color-brand-primary)]/40 transition-colors">
                  <div>
                    <div className="aspect-video w-full overflow-hidden bg-[var(--color-brand-panel)]">
                      <img src={proj.image} alt={proj.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                    <div className="p-6 space-y-3">
                      <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/10 px-2 py-0.5 rounded-full">{cat}</span>
                      <h3 className="font-serif font-bold text-lg text-[var(--color-brand-dark)] pt-1">{proj.title}</h3>
                      <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed line-clamp-3">{desc}</p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <Link
                      href="/case-studies"
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] hover:underline"
                    >
                      <span>{locale === "fr" ? "Voir l'étude de cas" : "Explore Case Study"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-dark)] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              <span>{locale === "fr" ? "Voir tous les projets" : "Explore All Case Studies"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 7. Consulting Packages Preview Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold block">
              {locale === "fr" ? "CONSEILS & PACKAGES" : "ADVISORY PACKAGES"}
            </span>
            <h2 className="font-serif text-3xl tracking-tight text-[var(--color-brand-dark)]">
              {locale === "fr" ? "Packages de Services de Conseil" : "Consulting & Advisory Services"}
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
              {locale === "fr"
                ? "Des forfaits structurés pour les fondateurs, les équipes de direction et les gouvernements."
                : "Structured consulting tiers spanning software audit, AI enablement, and dynamic training."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: locale === "fr" ? "CTO-as-a-Service / Conseil" : "Fractional CTO Advisory",
                price: "$1,500+",
                highlights: [
                  locale === "fr" ? "Planification stratégique IT" : "Strategic IT Roadmap Planning",
                  locale === "fr" ? "Audits d'architecture logicielle" : "Software Architecture Auditing",
                  locale === "fr" ? "Revues mensuelles de la tech stack" : "Monthly Tech Stack Appraisals"
                ]
              },
              {
                title: locale === "fr" ? "Audit Technique Ponctuel" : "One-Off Systems Audit",
                price: "$450+",
                highlights: [
                  locale === "fr" ? "Audit de performance (Lighthouse)" : "Full Performance Audits",
                  locale === "fr" ? "Vérification des vulnérabilités de sécurité" : "Security Vulnerability Audits",
                  locale === "fr" ? "Rapport de recommandations concret" : "Implementation Recommendation Reports"
                ]
              }
            ].map((pkg, idx) => (
              <div key={idx} className="bg-white border border-[var(--color-brand-neutral)]/20 p-8 rounded-3xl shadow-sm hover:border-[var(--color-brand-primary)]/40 transition-colors flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{pkg.title}</h3>
                  <div className="text-2xl font-bold text-[var(--color-brand-primary)] font-serif">{pkg.price}</div>
                  
                  <ul className="space-y-2 pt-2 border-t border-[var(--color-brand-neutral)]/15">
                    {pkg.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2 text-xs text-[var(--color-brand-muted)] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-brand-primary)] shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    href="/consulting"
                    className="w-full text-center py-3 bg-[var(--color-brand-panel)] hover:bg-[var(--color-brand-primary)] hover:text-white rounded-xl text-xs font-bold tracking-wider uppercase text-[var(--color-brand-dark)] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{locale === "fr" ? "Réserver ce service" : "Book selected package"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Training Preview Section */}
        {trainingEnabled && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-[var(--color-brand-neutral)]/20 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase font-bold block">
                  {locale === "fr" ? "FORMATION PROFESSIONNELLE" : "ACADEMY & WORKSHOPS"}
                </span>
                <h2 className="font-serif text-3xl tracking-tight text-[var(--color-brand-dark)]">
                  {locale === "fr" ? "Développer les Compétences du Futur" : "Upskilling Professional Teams"}
                </h2>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                  {locale === "fr"
                    ? "Formations certifiantes en marketing digital, usage de l'IA et outils bureautiques destinées aux enseignants et collaborateurs."
                    : "CMS-managed academy courses covering Teacher Digital Literacy, advanced Digital Marketing, and corporate AI workshops."}
                </p>

                <div className="pt-2">
                  <Link
                    href="/training"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-dark)] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    <span>{locale === "fr" ? "Parcourir les Formations" : "View Training Schedules"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-4">
                {[
                  { title: "Teacher Digital Literacy", time: "4 Years Curriculum" },
                  { title: "Digital Marketing Workshops", time: "3 Years Curriculum" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/10 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-brand-dark)]">{item.title}</span>
                    <span className="text-[10px] font-mono text-[var(--color-brand-primary)] font-bold">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. Testimonials & FAQs & Contact Forms */}
        <Testimonials testimonials={(db.testimonials as any[]) || []} />
        <FAQ faqItems={(db.faqItems as any[]) || []} />
        <Contact />
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
