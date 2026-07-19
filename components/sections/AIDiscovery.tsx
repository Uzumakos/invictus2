"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Brain, Sparkles, Send, RefreshCw, AlertCircle, CheckSquare, Layers, 
  Clipboard, ChevronRight, ChevronLeft, Building2, Target, Users, 
  Database, Coins, Calendar, Globe, FileText, Check, CheckCircle2, 
  ArrowRight, Shield, Lightbulb, Laptop, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, ProjectDiscovery, RecommendationRule, DiscoveryState } from "@/lib/types";
import { useRouter } from "@/lib/i18n/navigation";

interface AIDiscoveryProps {
  onSectionChange?: (sectionId: string) => void;
}

const INITIAL_STATE: DiscoveryState = {
  projectTypes: [],
  customAnswers: {},
  companyName: "",
  industry: "",
  country: "",
  orgType: "Startup",
  teamSize: "1-10",
  employeeCount: "5",
  website: "",
  socialLinks: "",
  businessGoals: [],
  hasSoftware: "No",
  challenges: "",
  painPoints: "",
  limits: "",
  audienceTypes: [],
  languages: "",
  expectedUsers: "",
  growthExpectations: "",
  features: [],
  techStack: "",
  cloudProvider: "",
  compliance: "",
  accessibility: "",
  needsMigration: false,
  needsAPI: false,
  needsAI: false,
  needsAutomation: false,
  budgetRange: "Under $2k",
  isDecisionMaker: "Yes",
  isFundingAvailable: "Yes",
  expectedROI: "",
  timeline: "1–3 months",
  preferredLanguage: "English",
  timezone: "EST",
  meetingHours: "09:00 - 13:00",
  links: "",
  notes: "",
};

export default function AIDiscovery({ onSectionChange }: AIDiscoveryProps) {
  const t = useTranslations("discovery");
  const locale = useLocale() as Language;
  const router = useRouter();

  const steps = [
    { id: "welcome", num: 1, name: t("steps.welcome") },
    { id: "project-type", num: 2, name: t("steps.projectType") },
    { id: "organization", num: 3, name: t("steps.organization") },
    { id: "business-goals", num: 4, name: t("steps.goals") },
    { id: "current-situation", num: 5, name: t("steps.context") },
    { id: "target-audience", num: 6, name: t("steps.audience") },
    { id: "features", num: 7, name: t("steps.features") },
    { id: "technical-preferences", num: 8, name: t("steps.technical") },
    { id: "budget", num: 9, name: t("steps.budget") },
    { id: "timeline", num: 10, name: t("steps.timeline") },
    { id: "language", num: 11, name: t("steps.language") },
    { id: "additional-info", num: 12, name: t("steps.additional") },
    { id: "summary", num: 13, name: t("steps.summary") },
  ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<DiscoveryState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedDiscovery, setSavedDiscovery] = useState<ProjectDiscovery | null>(null);
  const [rules, setRules] = useState<RecommendationRule[]>([]);

  // Load from local storage and fetch rules on mount
  useEffect(() => {
    const saved = localStorage.getItem("project_discovery_draft");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse saved discovery draft", err);
      }
    }

    fetch("/api/recommendation-rules")
      .then((res) => res.json())
      .then((data) => setRules(data))
      .catch((err) => console.error("Error loading rules:", err));
  }, []);

  // Autosave to local storage when formData changes
  useEffect(() => {
    localStorage.setItem("project_discovery_draft", JSON.stringify(formData));
  }, [formData]);

  const updateField = <K extends keyof DiscoveryState>(field: K, value: DiscoveryState[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    const stepId = steps[currentStepIdx].id;
    if (stepId === "project-type" && formData.projectTypes.length === 0) {
      alert("Please select at least one project type before proceeding.");
      return;
    }
    if (stepId === "organization" && (!formData.companyName || !formData.industry)) {
      alert("Company Name and Industry are required.");
      return;
    }
    
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      const el = document.getElementById("discovery");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
      const el = document.getElementById("discovery");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this questionnaire? All progress will be cleared.")) {
      setFormData(INITIAL_STATE);
      setCurrentStepIdx(0);
      setSubmitSuccess(false);
      setSavedDiscovery(null);
      localStorage.removeItem("project_discovery_draft");
    }
  };

  const featureCatalog = [
    { id: "Authentication", cat: "Security", desc: "User login, registration, multi-factor codes, password hashes" },
    { id: "Payments", cat: "Commerce", desc: "Stripe gateways, recurring credit cards, automatic invoicing" },
    { id: "Dashboard", cat: "Analytics", desc: "Interactive charts, trend indexes, metrics monitoring panels" },
    { id: "Notifications", cat: "Channels", desc: "SMS alerts, emails, push triggers, central alerts feed" },
    { id: "Messaging", cat: "Collaboration", desc: "Encrypted messaging threads, shared file boards, client contact feed" },
    { id: "Calendar", cat: "Booking", desc: "Client scheduler, timezone offsets, Google Meet triggers" },
    { id: "Reports", cat: "Data", desc: "CSV exports, PDF receipts, aggregated charts summaries" },
    { id: "Inventory", cat: "Operations", desc: "Real-time stock quantities, supplier listings, supply pipelines" },
    { id: "CMS", cat: "Content", desc: "Self-service blog, content updates editor" },
    { id: "Multilingual", cat: "Global", desc: "Instant translations, locale tags, language detection rules" },
    { id: "Document Management", cat: "Compliance", desc: "Cloud files sharing, secure NDAs signatures, PDF contracts storage" },
    { id: "Role Management", cat: "Security", desc: "Admin, Manager, Client, Guest granular workspace privileges" },
    { id: "Admin Panel", cat: "Operations", desc: "Submissions browser, status logs, users metadata editor" },
    { id: "Search", cat: "Data", desc: "Fuzzy keyword indexing, robust search filters" },
    { id: "Maps", cat: "Location", desc: "Google Maps Platform coordinates pins, store finders" },
    { id: "AI Ready", cat: "AI", desc: "Vector indexing, Google Gemini integration middleware, contextual embeddings" },
    { id: "Offline Support", cat: "Global", desc: "Offline database caches, background workers" },
  ];

  // Dynamic conditional questions
  const getDynamicQuestionForType = (type: string) => {
    if (locale === "fr") {
      switch (type) {
        case "Website":
          return "Quel est votre objectif de conversion principal ? (ex: capture de leads e-mail, vitrine de services, ventes directes)";
        case "E-commerce":
          return "Quels processeurs d'expédition ou passerelles de paiement sont nécessaires ? (ex: Stripe, paiement local, Sogebank)";
        case "SaaS":
          return "Quel est votre plan d'abonnement ou de monétisation prévu ? (ex: abonnement mensuel + premium, crédits d'utilisation)";
        case "CRM":
        case "ERP":
          return "Combien de départements d'entreprise accèderont à cet outil ? (ex: Ventes, Logistique, Admins)";
        case "Mobile App":
          return "Quelles plateformes mobiles sont ciblées ? (ex: iOS natif, Android, React Native)";
        case "AI Integration":
          return "Quels ensembles de données ou documents l'IA doit-elle traiter ? (ex: résumés de conformité PDF, bases de données de sols)";
        case "Technical Audit":
          return "Quelles bases de données ou serveurs existants sont actuellement utilisés ? (ex: SQL hérité, journaux Excel)";
        case "Training Program":
          return "Quelle est la taille et l'expertise de votre équipe cible ? (ex: 50 enseignants avec une faible culture numérique)";
        default:
          return "Quelles règles ou directives spécifiques à votre secteur s'appliquent à ce projet ?";
      }
    }

    switch (type) {
      case "Website":
        return "What is your primary conversion goal? (e.g. capture email leads, services showcase, direct sales)";
      case "E-commerce":
        return "What shipping processors or payment gateways are needed? (e.g. Stripe, local cash, Sogebank)";
      case "SaaS":
        return "What is your intended subscription or monetization plan? (e.g. monthly tier + premium, usage credits)";
      case "CRM":
      case "ERP":
        return "How many corporate departments will access this tool? (e.g. Sales, Logistics, Admins)";
      case "Mobile App":
        return "Which mobile platforms are targeted? (e.g. iOS native, Android, React Native)";
      case "AI Integration":
        return "What datasets or documents should the AI process? (e.g. PDF compliance briefs, soil databases)";
      case "Technical Audit":
        return "What legacy database or servers are currently running? (e.g. legacy SQL, Excel logs)";
      case "Training Program":
        return "What is the size and expertise of your targeted team? (e.g. 50 teachers with low digital literacy)";
      default:
        return "What specific industry rules or guidelines apply to this project?";
    }
  };

  // Dynamic Rule-based Recommendation Engine
  const generateRecommendations = () => {
    const recommendedServices: string[] = [];
    const recommendedFeatures: string[] = [];
    let complexity: "Low" | "Medium" | "High" | "Critical" = "Medium";
    const notes: string[] = [];

    // Evaluate database recommendation rules dynamically
    if (rules.length > 0) {
      const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

      sortedRules.forEach((rule) => {
        if (!rule.enabled) return;

        let isMatch = false;
        const results = rule.conditions.map((cond) => {
          const fieldVal = formData[cond.field as keyof DiscoveryState];

          if (fieldVal === undefined || fieldVal === null) return false;

          const matchVal = cond.value;

          switch (cond.operator) {
            case "includes":
              return Array.isArray(fieldVal) && fieldVal.includes(matchVal as string);
            case "includes_any":
              return Array.isArray(fieldVal) && Array.isArray(matchVal) && matchVal.some((v) => fieldVal.includes(v));
            case "equals":
              return String(fieldVal) === String(matchVal);
            case "not_equals":
              return String(fieldVal) !== String(matchVal);
            case "greater_than":
              return Number(fieldVal) > Number(matchVal);
            case "less_than":
              return Number(fieldVal) < Number(matchVal);
            case "is_true":
              return !!fieldVal === !!matchVal;
            case "not_empty":
              return Array.isArray(fieldVal) ? fieldVal.length > 0 : !!fieldVal;
            default:
              return false;
          }
        });

        if (rule.conditionOperator === "AND") {
          isMatch = results.every(Boolean);
        } else {
          isMatch = results.some(Boolean);
        }

        if (isMatch) {
          rule.actions.forEach((act) => {
            if (act.type === "recommend_service") recommendedServices.push(act.value);
            if (act.type === "recommend_feature") recommendedFeatures.push(act.value);
            if (act.type === "set_complexity") complexity = act.value as any;
            if (act.type === "add_note") notes.push(act.value);
          });
        }
      });
    }

    // Default Fallbacks
    if (recommendedServices.length === 0) {
      if (formData.projectTypes.includes("AI Integration")) {
        recommendedServices.push("AI Strategy & Implementation Planning");
      } else {
        recommendedServices.push("Software Architecture & System Design");
      }
      recommendedServices.push("Strategic Consultation Sprint");
    }
    if (recommendedFeatures.length === 0) {
      recommendedFeatures.push("Secure Client Authentication Vault", "Responsive Layout Core Grid");
    }

    // Remove duplicates
    const uniqueServices = Array.from(new Set(recommendedServices));
    const uniqueFeatures = Array.from(new Set(recommendedFeatures));

    const projectTypeTranslations: Record<string, string> = {
      "Website": "Site Web",
      "SaaS": "SaaS",
      "E-commerce": "E-commerce",
      "Marketplace": "Place de Marché",
      "CRM": "CRM",
      "ERP": "ERP",
      "Mobile App": "Application Mobile",
      "AI Integration": "Intégration IA",
      "Technical Audit": "Audit Technique",
      "Training Program": "Programme de Formation"
    };

    const complexityTranslations: Record<string, string> = {
      "Low": "FAIBLE",
      "Medium": "MOYENNE",
      "High": "ÉLEVÉE",
      "Critical": "CRITIQUE"
    };

    const overviewMarkdown = locale === "fr"
      ? `### PLAN DE ROUTE ARCHITECTURAL DU PROJET

- **Organisation Client :** ${formData.companyName || "Privé"} (${formData.orgType === "Startup" ? "Jeune Entreprise" : formData.orgType === "SME" ? "PME" : formData.orgType === "Enterprise" ? "Grande Entreprise" : formData.orgType === "NGO" ? "ONG" : formData.orgType === "University" ? "Université" : "Public"})
- **Secteur d'Activité :** ${formData.industry || "Commerce Général"} | **Origine :** ${formData.country || "Haïti / Global"}
- **Portée du Projet :** ${formData.projectTypes.map(t => projectTypeTranslations[t] || t).join(" + ")}
- **Budget Cible :** ${formData.budgetRange === "Under $2k" ? "Moins de 2 000 $" : formData.budgetRange === "$2k–$5k" ? "2 000 $ – 5 000 $" : formData.budgetRange === "$5k–$10k" ? "5 000 $ – 10 000 $" : formData.budgetRange === "$10k–$25k" ? "10 000 $ – 25 000 $" : formData.budgetRange === "$25k–$50k" ? "25 000 $ – 5 0000 $" : "Plus de 50 000 $"} | **Calendrier :** ${formData.timeline === "Immediate (< 1 month)" ? "Immédiat (< 1 mois)" : formData.timeline === "1–3 months" ? "1 à 3 mois" : formData.timeline === "3–6 months" ? "3 à 6 mois" : "Support Continu"}
- **Langues Requises :** ${formData.languages || "Anglais / Français"}
- **Échelle Attendue :** Jusqu'à ${formData.expectedUsers ? parseInt(formData.expectedUsers).toLocaleString() : "1 000"} utilisateurs actifs simultanés.

---

### Analyse Structurelle et Paramètres de Complexité

1. **Complexité du Système Évaluée comme : ${complexityTranslations[complexity] || complexity} :** Sur la base des paramètres du projet, nous avons modélisé une infrastructure de complexité **${(complexityTranslations[complexity] || complexity).toLowerCase()}**.
2. **Défis actuels et goulots d'étranglement :** ${formData.challenges ? `"${formData.challenges}"` : "Aucun déclaré. Infrastructure de conteneurisation cloud standard recommandée."}
3. **Échelle d'audience et limites de charge :** ${formData.expectedUsers ? `Cible de ${formData.expectedUsers} utilisateurs actifs.` : "Les facteurs de charge standard des PME s'applient."}
${notes.length > 0 ? `4. **Notes Systémiques Stratégiques :**\n${notes.map(n => `- ${n}`).join("\n")}` : ""}

---

### Étape Conseillée

Nous vous conseillons de planifier une consultation pour **${uniqueServices[0] || "Architecture Logicielle"}** afin de préciser ces spécifications et fixer les jalons de livraison.`
      : `### PROJECT ARCHITECTURAL ROADMAP BLUEPRINT

- **Client Organization:** ${formData.companyName || "Private"} (${formData.orgType || "SME"})
- **Sector Industry:** ${formData.industry || "General Commerce"} | **Origin:** ${formData.country || "Haiti / Global"}
- **Target Deliverable Scope:** ${formData.projectTypes.join(" + ")}
- **Financial Bracket:** ${formData.budgetRange} | **Target Delivery:** ${formData.timeline}
- **Required Languages:** ${formData.languages || "English / French"}
- **Expected Scale:** Up to ${formData.expectedUsers ? parseInt(formData.expectedUsers).toLocaleString() : "1,000"} concurrent active users.

---

### Core Structural Analysis & Complexity Parameters

1. **System Complexity is Evaluated as ${complexity.toUpperCase()}:** Based on the selected project parameters, we have modeled a **${complexity}** complexity infrastructure deployment.
2. **Current Challenges & Pain-points:** ${formData.challenges ? `"${formData.challenges}"` : "None declared. Standard cloud container infrastructure recommended."}
3. **Audience Scale and Load limits:** ${formData.expectedUsers ? `Targeting ${formData.expectedUsers} active users.` : "Standard SME load factors apply."}
${notes.length > 0 ? `4. **Strategic System Notes:**\n${notes.map(n => `- ${n}`).join("\n")}` : ""}

---

### Recommended Action Step

We advise scheduling a consultation for **${uniqueServices[0] || "Software Architecture"}** to refine these specifications and set delivery milestones.`;

    return {
      title: `${formData.companyName || "New Project"} - Discovery Analysis Blueprint`,
      complexity,
      recommendedServices: uniqueServices,
      recommendedFeatures: uniqueFeatures,
      overviewMarkdown,
      preparationStatus: "Ready" as const,
    };
  };

  const currentSummary = generateRecommendations();

  const handleSubmitDiscovery = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      answers: {
        ...formData,
        organization: {
          companyName: formData.companyName,
          industry: formData.industry,
          country: formData.country,
          orgType: formData.orgType,
          teamSize: formData.teamSize,
          employeeCount: formData.employeeCount,
          website: formData.website,
          socialLinks: formData.socialLinks,
        },
        businessGoals: formData.businessGoals,
        currentSituation: {
          hasSoftware: formData.hasSoftware,
          challenges: formData.challenges,
          painPoints: formData.painPoints,
          limits: formData.limits,
        },
        targetAudience: {
          audienceTypes: formData.audienceTypes,
          languages: formData.languages,
          expectedUsers: formData.expectedUsers,
          growthExpectations: formData.growthExpectations,
        },
        technicalPreferences: {
          techStack: formData.techStack,
          cloudProvider: formData.cloudProvider,
          compliance: formData.compliance,
          accessibility: formData.accessibility,
          needsMigration: formData.needsMigration,
          needsAPI: formData.needsAPI,
          needsAI: formData.needsAI,
          needsAutomation: formData.needsAutomation,
        },
        budget: {
          range: formData.budgetRange,
          isDecisionMaker: formData.isDecisionMaker,
          isFundingAvailable: formData.isFundingAvailable,
          expectedROI: formData.expectedROI,
        },
        language: {
          locale: formData.preferredLanguage,
          timezone: formData.timezone,
          meetingHours: formData.meetingHours,
        },
        additionalInfo: {
          links: formData.links,
          notes: formData.notes,
        },
      },
      summary: {
        title: currentSummary.title,
        complexity: currentSummary.complexity,
        recommendedServices: currentSummary.recommendedServices,
        recommendedFeatures: currentSummary.recommendedFeatures,
        overviewMarkdown: currentSummary.overviewMarkdown,
        preparationStatus: currentSummary.preparationStatus,
      }
    };

    try {
      const response = await fetch("/api/discoveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Server rejected project discovery roadmap registration.");
      }

      const data = await response.json();
      setSavedDiscovery(data);
      setSubmitSuccess(true);
      
      // Auto-save info for secure client portal login matching
      if (formData.companyName) {
        localStorage.setItem("portal_autologin_email", `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}@workspace.com`);
        localStorage.setItem("portal_autologin_name", formData.companyName);
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Failed to transmit Discovery Brief.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferToBooking = () => {
    const goalsString = `Business goals: ${formData.businessGoals.join(", ")}. Challenges: ${formData.challenges}`;
    const contextString = `Technology preferences: ${formData.techStack || "None"}. Budget Bracket: ${formData.budgetRange}. Overview Draft:\n${currentSummary.overviewMarkdown}`;
    
    const payload = {
      clientName: formData.companyName || "Private Client",
      clientEmail: `${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "client"}@workspace.com`,
      goals: goalsString,
      context: contextString,
      serviceId: "software-architecture",
      serviceTitle: currentSummary.recommendedServices[0] || "Software Architecture & System Design",
      discoveryId: savedDiscovery?.id,
    };

    localStorage.setItem("discovery_booking_payload", JSON.stringify(payload));
    window.dispatchEvent(new Event("discovery_book_consultation"));
    
    if (onSectionChange) {
      onSectionChange("services");
    } else {
      router.push("/consulting");
    }
  };

  const activeStep = steps[currentStepIdx];
  const progressPercent = Math.round(((currentStepIdx + 1) / steps.length) * 100);

  return (
    <section id="discovery" className="py-24 bg-[var(--color-brand-panel)] text-[var(--color-brand-dark)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-primary)]/5 rounded-full filter blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-brand-muted)]/5 rounded-full filter blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Header */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-[var(--color-brand-primary)]/10 rounded-xl text-[var(--color-brand-primary)] border border-[var(--color-brand-neutral)]/20 animate-pulse">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-2xl tracking-tight">{t("title")}</h2>
                <p className="text-[9px] uppercase font-mono tracking-widest text-[var(--color-brand-primary)]">CTO-as-a-Service System Architect</p>
              </div>
            </div>
            
            {currentStepIdx > 0 && !submitSuccess && (
              <button 
                onClick={handleReset}
                className="text-[9px] font-mono tracking-wider text-[var(--color-brand-muted)] hover:text-red-600 transition-colors flex items-center space-x-1 uppercase bg-white px-2.5 py-1.5 rounded-xl border border-[var(--color-brand-neutral)]/45"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t("reset")}</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-[var(--color-brand-muted)]">
              <span>{t("progress")}: {progressPercent}%</span>
              <span>{t("stepLabel")} {currentStepIdx + 1} OF {steps.length} — {activeStep.name}</span>
            </div>
            <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[var(--color-brand-neutral)]/30">
              <motion.div 
                className="bg-[var(--color-brand-primary)] h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Stepper Wizard Window */}
        <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl p-8 sm:p-10 shadow-2xs relative min-h-[50vh] flex flex-col justify-between">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                /* 14. SUBMIT SUCCESS */
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center py-10"
                >
                  <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto text-green-600 animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[var(--color-brand-dark)]">
                    {locale === "fr" ? "Feuille de route de cadrage compilée avec succès !" : "Scoping Roadmap Successfully Compiled!"}
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] max-w-md mx-auto leading-relaxed font-semibold">
                    {locale === "fr" 
                      ? "Merci. Nous avons sauvegardé votre feuille de route de découverte de projet et généré un profil d'accès sécurisé pour le Portail Client au nom de votre entreprise." 
                      : "Thank you. We have saved your project discovery roadmap and generated a secure Client Portal workspace credentials profile under your company name."}
                  </p>

                  <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                      onClick={handleTransferToBooking}
                      className="w-full sm:w-auto bg-[#FF7A00] hover:bg-[var(--color-brand-dark)] text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{locale === "fr" ? "Réserver la consultation recommandée" : "Book Recommended Consultation"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (onSectionChange) {
                          onSectionChange("portal");
                        } else {
                          router.push("/portal");
                        }
                      }}
                      className="w-full sm:w-auto bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{locale === "fr" ? "Ouvrir le portail client" : "Open Workspace Portal"}</span>
                      <span>→</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Step 1: Welcome Intro */}
                  {activeStep.id === "welcome" && (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 text-center py-6"
                    >
                      <h3 className="font-serif font-bold text-2xl text-[var(--color-brand-dark)]">
                        {locale === "fr" ? "Évaluation Architecturale de Niveau CTO" : "CTO-level Architectural Evaluation"}
                      </h3>
                      <p className="text-xs text-[var(--color-brand-muted)] max-w-xl mx-auto leading-relaxed font-medium">
                        {locale === "fr" 
                          ? "Répondez à ce questionnaire guidé en 12 étapes. Notre moteur d'analyse évaluera vos objectifs et vos contraintes budgétaires, générera un plan technique de cadrage et préparera des recommandations d'actions concrètes."
                          : "Complete this guided 12-stage questionnaire. Our rule matching engine will parse your goals and budget ranges, generate a technical scoping draft blueprint, and prepare recommended action steps — no AI required."}
                      </p>
                      <div className="w-16 h-[2px] bg-[var(--color-brand-primary)] mx-auto mt-4" />
                    </motion.div>
                  )}

                  {/* Step 2: Project types */}
                  {activeStep.id === "project-type" && (
                    <motion.div
                      key="project-type"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("projectType.title")}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {["Website", "SaaS", "E-commerce", "Marketplace", "CRM", "ERP", "Mobile App", "AI Integration", "Technical Audit", "Training Program"].map((type) => {
                          const isSelected = formData.projectTypes.includes(type);
                          const projectTypeTranslations: Record<string, string> = {
                            "Website": "Site Web",
                            "SaaS": "SaaS",
                            "E-commerce": "E-commerce",
                            "Marketplace": "Place de Marché",
                            "CRM": "CRM",
                            "ERP": "ERP",
                            "Mobile App": "Application Mobile",
                            "AI Integration": "Intégration IA",
                            "Technical Audit": "Audit Technique",
                            "Training Program": "Programme de Formation"
                          };
                          const displayLabel = locale === "fr" ? projectTypeTranslations[type] || type : type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  updateField("projectTypes", formData.projectTypes.filter((t) => t !== type));
                                } else {
                                  updateField("projectTypes", [...formData.projectTypes, type]);
                                }
                              }}
                              className={`p-4 rounded-xl border text-xs font-bold transition-all text-left ${
                                isSelected
                                  ? "bg-[var(--color-brand-panel)]/40 border-[var(--color-brand-primary)] font-bold text-[var(--color-brand-primary)]"
                                  : "border-[var(--color-brand-neutral)]/45 bg-white text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/40"
                              }`}
                            >
                              {displayLabel}
                            </button>
                          );
                        })}
                      </div>

                      {/* Render conditional text questions for selected types */}
                      {formData.projectTypes.map((type) => {
                        const projectTypeTranslations: Record<string, string> = {
                          "Website": "Site Web",
                          "SaaS": "SaaS",
                          "E-commerce": "E-commerce",
                          "Marketplace": "Place de Marché",
                          "CRM": "CRM",
                          "ERP": "ERP",
                          "Mobile App": "Application Mobile",
                          "AI Integration": "Intégration IA",
                          "Technical Audit": "Audit Technique",
                          "Training Program": "Programme de Formation"
                        };
                        const displayLabel = locale === "fr" ? projectTypeTranslations[type] || type : type;
                        return (
                          <div key={type} className="bg-[var(--color-brand-bg)] p-4 rounded-xl space-y-2 border">
                            <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-primary)] uppercase tracking-wider">
                              {locale === "fr" ? `Détails du contexte : ${displayLabel}` : `${type} Context Detail`}
                            </label>
                            <span className="block text-xs font-serif text-[var(--color-brand-dark)] font-bold mb-1.5">
                              {getDynamicQuestionForType(type)}
                            </span>
                            <input
                              type="text"
                              value={(formData.customAnswers && formData.customAnswers[type]) || ""}
                              onChange={(e) => {
                                const newAnswers = { ...(formData.customAnswers || {}), [type]: e.target.value };
                                updateField("customAnswers", newAnswers);
                              }}
                              placeholder={locale === "fr" ? "Ajouter de brefs détails..." : "Add brief details..."}
                              className="w-full bg-white border border-[var(--color-brand-neutral)]/45 rounded-lg px-3 py-2 text-xs text-[var(--color-brand-dark)]"
                            />
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Step 3: Organization Details */}
                  {activeStep.id === "organization" && (
                    <motion.div
                      key="organization"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("organization.title")}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("organization.companyName")} *</label>
                          <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => updateField("companyName", e.target.value)}
                            placeholder="e.g. Nexus Tech Group"
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("organization.industry")} *</label>
                          <input
                            type="text"
                            required
                            value={formData.industry}
                            onChange={(e) => updateField("industry", e.target.value)}
                            placeholder="e.g. Finance, Education, Healthcare"
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("organization.country")}</label>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => updateField("country", e.target.value)}
                            placeholder="e.g. Haiti, Canada"
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("organization.orgType")}</label>
                          <select
                            value={formData.orgType}
                            onChange={(e) => updateField("orgType", e.target.value)}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          >
                            <option value="Startup">{locale === "fr" ? "Jeune Entreprise (Startup)" : "Startup"}</option>
                            <option value="SME">{locale === "fr" ? "PME / Entreprise Privée" : "SME / Private Company"}</option>
                            <option value="Enterprise">{locale === "fr" ? "Grande Entreprise" : "Large Enterprise"}</option>
                            <option value="NGO">{locale === "fr" ? "ONG / Organisme International" : "NGO / International Agency"}</option>
                            <option value="University">{locale === "fr" ? "Université / Établissement d'Enseignement" : "University / Educational Institute"}</option>
                            <option value="Government">{locale === "fr" ? "Ministère / Organisme Public" : "Government Department"}</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Business Goals */}
                  {activeStep.id === "business-goals" && (
                    <motion.div
                      key="business-goals"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("businessGoals.title")}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {["Increase Sales / Leads", "Automate Offline Steps", "Scale User Capacity", "Integrate AI Systems", "Secure Legacy Database", "Digital Transformation"].map((goal) => {
                          const isSelected = formData.businessGoals.includes(goal);
                          const businessGoalTranslations: Record<string, string> = {
                            "Increase Sales / Leads": "Augmenter les Ventes / Prospects",
                            "Automate Offline Steps": "Automatiser les Processus Hors ligne",
                            "Scale User Capacity": "Augmenter la Capacité Utilisateurs",
                            "Integrate AI Systems": "Intégrer des Systèmes IA",
                            "Secure Legacy Database": "Sécuriser les Bases de Données Existantes",
                            "Digital Transformation": "Transformation Digitale"
                          };
                          const displayGoal = locale === "fr" ? businessGoalTranslations[goal] || goal : goal;
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  updateField("businessGoals", formData.businessGoals.filter((g) => g !== goal));
                                } else {
                                  updateField("businessGoals", [...formData.businessGoals, goal]);
                                }
                              }}
                              className={`p-4 rounded-xl border text-xs font-bold transition-all text-left ${
                                isSelected
                                  ? "bg-[var(--color-brand-panel)]/40 border-[var(--color-brand-primary)] font-bold text-[var(--color-brand-primary)]"
                                  : "border-[var(--color-brand-neutral)]/45 bg-white text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/40"
                              }`}
                            >
                              {displayGoal}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Current Situation & Painpoints */}
                  {activeStep.id === "current-situation" && (
                    <motion.div
                      key="current-situation"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("currentSituation.title")}</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("currentSituation.challenges")} *</label>
                          <textarea
                            rows={3}
                            value={formData.challenges}
                            onChange={(e) => updateField("challenges", e.target.value)}
                            placeholder={locale === "fr" ? "Ex: Les requêtes de base de données prennent 3s, les fichiers Excel se perdent, ou les passerelles de paiement sont fragmentées." : "E.g. Database queries take 3s, manual Excel sheets get lost, or payment gateways are fragmented."}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("currentSituation.limits")}</label>
                          <textarea
                            rows={2}
                            value={formData.limits}
                            onChange={(e) => updateField("limits", e.target.value)}
                            placeholder={locale === "fr" ? "Ex: Les chauffeurs traversent des zones sans couverture réseau." : "E.g. Drivers pass through dead cellular signal zones."}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 6: Target Audience */}
                  {activeStep.id === "target-audience" && (
                    <motion.div
                      key="target-audience"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("targetAudience.title")}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("targetAudience.expectedUsers")}</label>
                          <select
                            value={formData.expectedUsers}
                            onChange={(e) => updateField("expectedUsers", e.target.value)}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none font-mono"
                          >
                            <option value="Under 1,000">{locale === "fr" ? "Moins de 1 000" : "Under 1,000"}</option>
                            <option value="1,000 - 10,000">{locale === "fr" ? "1 000 - 10 000" : "1,000 - 10,000"}</option>
                            <option value="10,000 - 50,000">{locale === "fr" ? "10 000 - 50 000" : "10,000 - 50,000"}</option>
                            <option value="50,000+">{locale === "fr" ? "Plus de 50 000" : "50,000+"}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("targetAudience.languages")}</label>
                          <input
                            type="text"
                            value={formData.languages}
                            onChange={(e) => updateField("languages", e.target.value)}
                            placeholder="e.g. English, French"
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 7: Core Feature Catalog selection */}
                  {activeStep.id === "features" && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("features.title")}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
                        {featureCatalog.map((feat) => {
                          const isSelected = formData.features.includes(feat.id);
                          let displayId = feat.id;
                          let displayCat = feat.cat;
                          let displayDesc = feat.desc;
                          if (locale === "fr") {
                            const frFeatures: Record<string, { id: string; cat: string; desc: string }> = {
                              "Authentication": { id: "Authentification", cat: "Sécurité", desc: "Connexion utilisateur, inscription, codes multifacteurs, hachages de mots de passe" },
                              "Payments": { id: "Paiements", cat: "Commerce", desc: "Passerelles Stripe, cartes bancaires récurrentes, facturation automatique" },
                              "Dashboard": { id: "Tableau de bord", cat: "Analyses", desc: "Graphiques interactifs, indices de tendance, panneaux de surveillance des métriques" },
                              "Notifications": { id: "Notifications", cat: "Canaux", desc: "Alertes SMS, e-mails, déclencheurs push, flux centralisé d'alertes" },
                              "Messaging": { id: "Messagerie", cat: "Collaboration", desc: "Discussions chiffrées, espaces de fichiers partagés, fil de contact client" },
                              "Calendar": { id: "Calendrier", cat: "Réservation", desc: "Planificateur client, décalages horaires, déclencheurs Google Meet" },
                              "Reports": { id: "Rapports", cat: "Données", desc: "Exports CSV, reçus PDF, résumés de graphiques agrégés" },
                              "Inventory": { id: "Inventaire", cat: "Opérations", desc: "Quantités de stock en temps réel, listes de fournisseurs, flux d'approvisionnement" },
                              "CMS": { id: "CMS", cat: "Contenu", desc: "Blog en libre-service, éditeur de mises à jour de contenu" },
                              "Multilingual": { id: "Multilingue", cat: "Global", desc: "Traductions instantanées, balises de locale, règles de détection de langue" },
                              "Document Management": { id: "Gestion documentaire", cat: "Conformité", desc: "Partage de fichiers cloud, signatures d'accords de confidentialité sécurisés, stockage de contrats PDF" },
                              "Role Management": { id: "Gestion des rôles", cat: "Sécurité", desc: "Privilèges d'espace de travail granulaires pour admin, responsable, client, invité" },
                              "Admin Panel": { id: "Panneau d'administration", cat: "Opérations", desc: "Navigateur de soumissions, journaux de statut, éditeur de métadonnées utilisateur" },
                              "Search": { id: "Recherche", cat: "Données", desc: "Indexation par mots-clés flous, filtres de recherche robustes" },
                              "Maps": { id: "Cartes", cat: "Localisation", desc: "Épingles de coordonnées Google Maps Platform, localisateurs de magasins" },
                              "AI Ready": { id: "Prêt pour l'IA", cat: "IA", desc: "Indexation vectorielle, middleware d'intégration Google Gemini, plongements contextuels" },
                              "Offline Support": { id: "Support hors ligne", cat: "Global", desc: "Caches de bases de données hors ligne, agents d'arrière-plan" }
                            };
                            const mapped = frFeatures[feat.id];
                            if (mapped) {
                              displayId = mapped.id;
                              displayCat = mapped.cat;
                              displayDesc = mapped.desc;
                            }
                          }
                          return (
                            <button
                              key={feat.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  updateField("features", formData.features.filter((f) => f !== feat.id));
                                } else {
                                  updateField("features", [...formData.features, feat.id]);
                                }
                              }}
                              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? "bg-[var(--color-brand-panel)]/40 border-[var(--color-brand-primary)] shadow-2xs"
                                  : "border-[var(--color-brand-neutral)]/45 bg-white hover:border-[var(--color-brand-primary)]/40"
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="font-bold text-xs text-[var(--color-brand-dark)]">{displayId}</span>
                                <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-[var(--color-brand-muted)] bg-white px-2 py-0.5 rounded border border-[var(--color-brand-neutral)]/30">{displayCat}</span>
                              </div>
                              <p className="text-[10px] text-[var(--color-brand-muted)] leading-relaxed font-semibold">{displayDesc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 8: Stack & Preferences */}
                  {activeStep.id === "technical-preferences" && (
                    <motion.div
                      key="technical-preferences"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("technical.title")}</h4>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("technical.techStack")}</label>
                            <input
                              type="text"
                              value={formData.techStack}
                              onChange={(e) => updateField("techStack", e.target.value)}
                              placeholder={locale === "fr" ? "Laisser vide pour une recommandation..." : "Leave blank for recommendation..."}
                              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("technical.cloudProvider")}</label>
                            <input
                              type="text"
                              value={formData.cloudProvider}
                              onChange={(e) => updateField("cloudProvider", e.target.value)}
                              placeholder={locale === "fr" ? "ex: GCP (par défaut)" : "e.g. GCP (Amedee's default)"}
                              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {[
                            { id: "needsAI", label: locale === "fr" ? "Intégrer de l'IA Générative / LLMs" : "Integrate Generative AI / LLMs" },
                            { id: "needsMigration", label: locale === "fr" ? "Migration de Données Héritées Requise" : "Requires Legacy Data Migration" },
                            { id: "needsAPI", label: locale === "fr" ? "Intégrer des APIs Tierces" : "Integrate External Third-Party APIs" },
                            { id: "needsAutomation", label: locale === "fr" ? "Automatiser des Opérations Manuelles" : "Automate Manual Operations" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => updateField(item.id as any, !formData[item.id as keyof DiscoveryState])}
                              className={`p-4 rounded-xl border text-xs font-bold text-left transition-all ${
                                formData[item.id as keyof DiscoveryState]
                                  ? "bg-[var(--color-brand-panel)]/40 border-[var(--color-brand-primary)] font-bold text-[var(--color-brand-primary)]"
                                  : "border-[var(--color-brand-neutral)]/45 bg-white text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/40"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 9: Financial parameters */}
                  {activeStep.id === "budget" && (
                    <motion.div
                      key="budget"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("budget.title")}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{locale === "fr" ? "Fourchette budgétaire cible" : "Target Budget Range"}</label>
                          <select
                            value={formData.budgetRange}
                            onChange={(e) => updateField("budgetRange", e.target.value)}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold font-mono"
                          >
                            <option value="Under $2k">{locale === "fr" ? "Moins de 2 000 $" : "Under $2k"}</option>
                            <option value="$2k–$5k">{locale === "fr" ? "2 000 $ – 5 000 $" : "$2k–$5k"}</option>
                            <option value="$5k–$10k">{locale === "fr" ? "5 000 $ – 10 000 $" : "$5k–$10k"}</option>
                            <option value="$10k–$25k">{locale === "fr" ? "10 000 $ – 25 000 $" : "$10k–$25k"}</option>
                            <option value="$25k–$50k">{locale === "fr" ? "25 000 $ – 50 000 $" : "$25k–$50k"}</option>
                            <option value="$50k+">{locale === "fr" ? "50 000 $ +" : "$50k+"}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("budget.decisionMaker")}</label>
                          <select
                            value={formData.isDecisionMaker}
                            onChange={(e) => updateField("isDecisionMaker", e.target.value)}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                          >
                            <option value="Yes">{locale === "fr" ? "Oui, je suis le décideur" : "Yes, I am decision maker"}</option>
                            <option value="No">{locale === "fr" ? "Non, j'évalue pour un tiers / conseil" : "No, evaluating for board"}</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 10: Timeline */}
                  {activeStep.id === "timeline" && (
                    <motion.div
                      key="timeline"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("timeline.title")}</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {["Immediate (< 1 month)", "1–3 months", "3–6 months", "Continuous Support"].map((time) => {
                          const isSelected = formData.timeline === time;
                          const timeTranslations: Record<string, string> = {
                            "Immediate (< 1 month)": "Immédiat (< 1 mois)",
                            "1–3 months": "1 à 3 mois",
                            "3–6 months": "3 à 6 mois",
                            "Continuous Support": "Support Continu"
                          };
                          const label = locale === "fr" ? timeTranslations[time] || time : time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => updateField("timeline", time)}
                              className={`p-4 rounded-xl border text-xs font-bold text-left transition-all ${
                                isSelected
                                  ? "bg-[var(--color-brand-panel)]/40 border-[var(--color-brand-primary)] font-bold text-[var(--color-brand-primary)]"
                                  : "border-[var(--color-brand-neutral)]/45 bg-white text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/40"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 11: Language & Availability */}
                  {activeStep.id === "language" && (
                    <motion.div
                      key="language"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("language.title")}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("language.preferred")}</label>
                          <select
                            value={formData.preferredLanguage}
                            onChange={(e) => updateField("preferredLanguage", e.target.value)}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          >
                            <option value="English">{locale === "fr" ? "Anglais" : "English"}</option>
                            <option value="French">{locale === "fr" ? "Français" : "French"}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("language.timezone")}</label>
                          <select
                            value={formData.timezone}
                            onChange={(e) => updateField("timezone", e.target.value)}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          >
                            <option value="EST">{locale === "fr" ? "EST (Haïti / Côte Est)" : "EST (Haiti / East Coast)"}</option>
                            <option value="PST">{locale === "fr" ? "PST (Côte Ouest)" : "PST (Pacific Coast)"}</option>
                            <option value="GMT">{locale === "fr" ? "GMT (Londres / Europe)" : "GMT (London / Europe)"}</option>
                            <option value="CET">{locale === "fr" ? "CET (Europe Centrale)" : "CET (Central Europe)"}</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 12: Additional info */}
                  {activeStep.id === "additional-info" && (
                    <motion.div
                      key="additional-info"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">{t("additional.title")}</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("additional.links")}</label>
                          <input
                            type="text"
                            value={formData.links}
                            onChange={(e) => updateField("links", e.target.value)}
                            placeholder={locale === "fr" ? "ex: https://github.com/votreprojet, https://figma.com/..." : "e.g. https://github.com/yourproject, https://figma.com/..."}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase mb-1">{t("additional.notes")}</label>
                          <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            placeholder={locale === "fr" ? "Saisissez d'autres spécifications, exigences de conformité ou détails ici..." : "Type any other specifications, compliance mandates or details here..."}
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 13: Summary evaluation */}
                  {activeStep.id === "summary" && (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/20 pb-4">
                        <div>
                          <h4 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">{t("summary.title")}</h4>
                          <p className="text-[10px] text-[var(--color-brand-muted)] uppercase font-mono tracking-wider mt-0.5">{locale === "fr" ? "Synthèse d'évaluation automatique" : "Automated rule evaluation summary"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[var(--color-brand-muted)]">
                        <div className="bg-[var(--color-brand-bg)] p-3 rounded-lg border">
                          <span className="block text-[8px] font-sans font-bold uppercase">{t("summary.complexity")}</span>
                          <strong className="block text-sm text-[var(--color-brand-primary)] font-serif mt-0.5">{currentSummary.complexity}</strong>
                        </div>
                        <div className="bg-[var(--color-brand-bg)] p-3 rounded-lg border">
                          <span className="block text-[8px] font-sans font-bold uppercase">{t("summary.status")}</span>
                          <strong className="block text-sm text-green-600 font-serif mt-0.5">{locale === "fr" ? "PRÊT À TRANSMETTRE" : "READY TO TRANSMIT"}</strong>
                        </div>
                      </div>

                      {currentSummary.recommendedServices && currentSummary.recommendedServices.length > 0 && (
                        <div className="space-y-2">
                          <strong className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase">{t("summary.recommendedServices")}</strong>
                          <div className="flex flex-wrap gap-2">
                            {currentSummary.recommendedServices.map((service, idx) => (
                              <span key={idx} className="bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <strong className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase">{locale === "fr" ? "Aperçu de la feuille de route" : "Roadmap preview"}</strong>
                        <div className="bg-[var(--color-brand-bg)] border p-4 rounded-xl text-[10px] font-mono text-[var(--color-brand-muted)] max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {currentSummary.overviewMarkdown}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Stepper Footer Controls */}
          {!submitSuccess && (
            <div className="flex justify-between pt-6 border-t border-[var(--color-brand-neutral)]/20 mt-8">
              {currentStepIdx > 0 ? (
                <button
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-bg)] transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t("prev")}</span>
                </button>
              ) : (
                <div />
              )}

              {currentStepIdx < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white px-6 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <span>{t("next")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitDiscovery}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span>{isSubmitting ? (locale === "fr" ? "Transmission en cours..." : "Processing...") : t("submit")}</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
