"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, CheckCircle2, AlertCircle, Clock, Calendar, FileText, 
  HelpCircle, ShieldAlert, ShieldCheck, RefreshCw, Paperclip
} from "lucide-react";
import { Language } from "@/lib/types";
import { useRouter } from "@/lib/i18n/navigation";

enum ContactOption {
  INQUIRY = "inquiry",
  DISCOVERY = "discovery",
  PROPOSAL = "proposal",
}

export default function Contact() {
  const t = useTranslations("contact");
  const currentLanguage = useLocale() as Language;
  const router = useRouter();

  const [activeOption, setActiveOption] = useState<ContactOption>(ContactOption.PROPOSAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OPTION 1 — General Inquiry Fields
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryCompany, setInquiryCompany] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryCountry, setInquiryCountry] = useState("");
  const [inquiryReason, setInquiryReason] = useState("General Questions");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const [turnstileVerifying, setTurnstileVerifying] = useState(false);

  // OPTION 3 — Project Proposal Fields
  const [propCompany, setPropCompany] = useState("");
  const [propIndustry, setPropIndustry] = useState("");
  const [propWebsite, setPropWebsite] = useState("");
  const [propCountry, setPropCountry] = useState("");
  const [propBudget, setPropBudget] = useState("Unknown");
  const [propTimeline, setPropTimeline] = useState("No timeline");
  const [propProjectType, setPropProjectType] = useState("Software Development");
  const [propDescription, setPropDescription] = useState("");
  const [propDeliverables, setPropDeliverables] = useState("");
  const [propCompanyType, setPropCompanyType] = useState("Small Business");
  const [propPrevRelationship, setPropPrevRelationship] = useState("None");
  const [propContactName, setPropContactName] = useState("");
  const [propContactEmail, setPropContactEmail] = useState("");
  const [propContactMethod, setPropContactMethod] = useState("Email");
  const [propContactLang, setPropContactLang] = useState<Language>(currentLanguage);
  const [propAttachment, setPropAttachment] = useState<File | null>(null);
  const [propAttachmentName, setPropAttachmentName] = useState("");

  // Rate Limiter validation (Max 3 submissions per hour for general inquiries)
  const checkRateLimit = (): boolean => {
    try {
      const timestampsStr = localStorage.getItem("cas_inquiry_timestamps");
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      
      if (!timestampsStr) {
        return true;
      }
      
      const timestamps: number[] = JSON.parse(timestampsStr);
      const recentTimestamps = timestamps.filter(t => t > oneHourAgo);
      
      localStorage.setItem("cas_inquiry_timestamps", JSON.stringify(recentTimestamps));
      
      return recentTimestamps.length < 3;
    } catch {
      return true;
    }
  };

  const recordSubmission = () => {
    try {
      const timestampsStr = localStorage.getItem("cas_inquiry_timestamps");
      const timestamps: number[] = timestampsStr ? JSON.parse(timestampsStr) : [];
      timestamps.push(Date.now());
      localStorage.setItem("cas_inquiry_timestamps", JSON.stringify(timestamps));
    } catch {}
  };

  // Turnstile Simulation Hook
  useEffect(() => {
    if (activeOption === ContactOption.INQUIRY && !turnstileVerified && !turnstileVerifying) {
      setTurnstileVerifying(true);
      const timer = setTimeout(() => {
        setTurnstileVerified(true);
        setTurnstileVerifying(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeOption]);

  const resetTurnstile = () => {
    setTurnstileVerified(false);
    setTurnstileVerifying(true);
    setTimeout(() => {
      setTurnstileVerified(true);
      setTurnstileVerifying(false);
    }, 1200);
  };

  // Form Validation & Verification
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // Reject common temporary/disposable emails
    const disposableDomains = [
      "mailinator.com", "yopmail.com", "tempmail.com", "trashmail.com",
      "guerrillamail.com", "sharklasers.com", "dispostable.com", "getairmail.com"
    ];
    const domain = email.split("@")[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  };

  const containsSpam = (text: string): boolean => {
    const spamKeywords = [
      "crypto", "bitcoin", "solana", "ethereum", "casino", "viagra",
      "seo ranking", "free money", "lottery", "millions of dollars",
      "buy tokens", "investing opportunity", "adult video", "earn online"
    ];
    const textLower = text.toLowerCase();
    return spamKeywords.some(keyword => textLower.includes(keyword));
  };

  const containsLinks = (text: string): boolean => {
    // Blocks http://, https://, www., and common link formats
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-z]{2,}\/[^\s]*)/gi;
    return linkRegex.test(text);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Check Rate Limit
    if (!checkRateLimit()) {
      setError(t("rateLimited"));
      return;
    }

    // 2. Validate email
    if (!validateEmail(inquiryEmail)) {
      setError(t("emailInvalid"));
      return;
    }

    // 3. Spam Check
    if (containsSpam(inquiryName) || containsSpam(inquiryCompany) || containsSpam(inquiryMessage)) {
      setError(t("spamBlocked"));
      return;
    }

    // 4. Suspicious Link Check
    if (containsLinks(inquiryMessage)) {
      setError(t("spamBlocked"));
      return;
    }

    // 5. Cloudflare Turnstile simulation
    if (!turnstileVerified) {
      setError("Please wait for Cloudflare security check verification.");
      return;
    }

    setSubmitting(true);

    const payload = {
      company: inquiryCompany || "Independent Inquiry",
      contactName: inquiryName,
      email: inquiryEmail,
      country: inquiryCountry,
      reason: inquiryReason,
      notes: inquiryMessage,
      source: "General Inquiry",
      status: "lead", // goes into DB as lead (hidden from pipeline board)
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Transmission error. Failed to post inquiry.");
      }

      recordSubmission();
      setSuccess(true);
      setInquiryName("");
      setInquiryCompany("");
      setInquiryEmail("");
      setInquiryCountry("");
      setInquiryMessage("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propContactName || !propContactEmail || !propDescription) {
      setError(currentLanguage === Language.EN ? "Name, email and project brief description are required" : "Le nom, l'e-mail et le brief sont requis");
      return;
    }

    if (!validateEmail(propContactEmail)) {
      setError(t("emailInvalid"));
      return;
    }

    setSubmitting(true);

    // Mock attachment upload link if exists
    let attachmentUrl = "";
    if (propAttachment) {
      attachmentUrl = `/uploads/${propAttachment.name}`; // Simulation URL
    }

    const payload = {
      company: propCompany || `${propContactName} Project`,
      industry: propIndustry || "Not specified",
      website: propWebsite,
      country: propCountry,
      budget: propBudget,
      timeline: propTimeline,
      projectType: propProjectType,
      notes: propDescription,
      expectedDeliverables: propDeliverables,
      companyType: propCompanyType,
      previousRelationship: propPrevRelationship,
      contactName: propContactName,
      email: propContactEmail,
      preferredContactMethod: propContactMethod,
      preferredLanguage: propContactLang,
      attachmentUrl,
      source: "Proposal Request",
      status: "proposal", // status set to 'proposal'
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to transmit proposal request details");
      }

      setSuccess(true);
      setPropCompany("");
      setPropIndustry("");
      setPropWebsite("");
      setPropCountry("");
      setPropDescription("");
      setPropDeliverables("");
      setPropContactName("");
      setPropContactEmail("");
      setPropAttachment(null);
      setPropAttachmentName("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit proposal request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPropAttachment(file);
      setPropAttachmentName(file.name);
    }
  };

  const handleBookDiscoveryCall = () => {
    // Redirect to consulting booking route with strategy service auto-triggered
    router.push("/consulting?book=strategy");
  };

  return (
    <section id="contact" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-brand-primary)]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
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

        {/* Redesigned 3 Options Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Option 1 Option Selector Card */}
          <div 
            onClick={() => { setActiveOption(ContactOption.INQUIRY); setSuccess(false); setError(null); }}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
              activeOption === ContactOption.INQUIRY
                ? "bg-white border-[var(--color-brand-primary)] shadow-md"
                : "bg-white/50 border-[var(--color-brand-neutral)]/20 hover:border-[var(--color-brand-primary)]/40 hover:bg-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-serif font-bold text-base text-[var(--color-brand-dark)]">{t("option1")}</span>
                <span className="bg-gray-100 text-gray-600 text-[8px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
              </div>
              <p className="text-[11px] text-[var(--color-brand-muted)] leading-relaxed font-medium">
                {t("option1Subtitle")}
              </p>
            </div>
            <span className="text-[10px] font-sans font-bold text-[var(--color-brand-primary)] uppercase tracking-wider block mt-4">
              Write Message →
            </span>
          </div>

          {/* Option 2 Option Selector Card */}
          <div 
            onClick={() => { setActiveOption(ContactOption.DISCOVERY); setSuccess(false); setError(null); }}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
              activeOption === ContactOption.DISCOVERY
                ? "bg-white border-[var(--color-brand-primary)] shadow-md"
                : "bg-white/50 border-[var(--color-brand-neutral)]/20 hover:border-[var(--color-brand-primary)]/40 hover:bg-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-serif font-bold text-base text-[var(--color-brand-dark)]">{t("option2")}</span>
                <span className="bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-[8px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">$60 USD</span>
              </div>
              <p className="text-[11px] text-[var(--color-brand-muted)] leading-relaxed font-medium">
                {t("option2Subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-sans font-bold text-[var(--color-brand-primary)] uppercase tracking-wider mt-4">
              <span>{t("bookDiscoveryCall")} →</span>
              <span className="bg-red-500 text-white text-[7px] font-bold px-1 py-0.2 rounded-sm ml-1.5 animate-pulse uppercase tracking-normal">Primary CTA</span>
            </div>
          </div>

          {/* Option 3 Option Selector Card */}
          <div 
            onClick={() => { setActiveOption(ContactOption.PROPOSAL); setSuccess(false); setError(null); }}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
              activeOption === ContactOption.PROPOSAL
                ? "bg-white border-[var(--color-brand-primary)] shadow-md"
                : "bg-white/50 border-[var(--color-brand-neutral)]/20 hover:border-[var(--color-brand-primary)]/40 hover:bg-white"
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-serif font-bold text-base text-[var(--color-brand-dark)]">{t("option3")}</span>
                <span className="bg-emerald-100 text-emerald-700 text-[8px] font-sans font-bold px-2 py-0.5 rounded-full uppercase">Proposal</span>
              </div>
              <p className="text-[11px] text-[var(--color-brand-muted)] leading-relaxed font-medium">
                {t("option3Subtitle")}
              </p>
            </div>
            <span className="text-[10px] font-sans font-bold text-[var(--color-brand-primary)] uppercase tracking-wider block mt-4">
              Configure Project →
            </span>
          </div>

        </div>

        {/* Dynamic Panels */}
        <div className="bg-white border border-[var(--color-brand-neutral)]/25 rounded-3xl p-8 sm:p-10 shadow-2xs max-w-4xl mx-auto">
          
          <AnimatePresence mode="wait">
            
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-[var(--color-brand-dark)]">
                  {t("successTitle")}
                </h3>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed max-w-md mx-auto font-medium">
                  {activeOption === ContactOption.INQUIRY 
                    ? t("successMsgOption1") 
                    : t("successMsgOption3")}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 bg-[var(--color-brand-primary)] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {t("sendAnother")}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Option 1 Form Panel */}
                {activeOption === ContactOption.INQUIRY && (
                  <motion.form 
                    key="inquiry-form"
                    onSubmit={handleSubmitInquiry}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("name")} *</label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("email")} *</label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("company")}</label>
                        <input
                          type="text"
                          value={inquiryCompany}
                          onChange={(e) => setInquiryCompany(e.target.value)}
                          placeholder="Your Company / Org"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("country")}</label>
                        <input
                          type="text"
                          value={inquiryCountry}
                          onChange={(e) => setInquiryCountry(e.target.value)}
                          placeholder="e.g. USA, Canada, Haiti"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("reason")}</label>
                      <select
                        value={inquiryReason}
                        onChange={(e) => setInquiryReason(e.target.value)}
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                      >
                        <option value="General Questions">General Questions</option>
                        <option value="Partnership Requests">Partnership Requests</option>
                        <option value="Speaking Invitations">Speaking Invitations</option>
                        <option value="Media Interviews">Media Interviews</option>
                        <option value="Academic Collaborations">Academic Collaborations</option>
                        <option value="Business Networking">Business Networking</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase">{t("message")} *</label>
                        <span className={`text-[9px] font-mono font-bold ${inquiryMessage.length > 500 ? "text-red-500" : "text-[var(--color-brand-muted)]"}`}>
                          {500 - inquiryMessage.length} {t("charsRemaining")}
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        maxLength={500}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Write your general question or networking proposal..."
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                      />
                    </div>

                    {/* Turnstile Security Widget */}
                    <div className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {turnstileVerifying ? (
                            <RefreshCw className="w-4 h-4 text-[var(--color-brand-primary)] animate-spin" />
                          ) : turnstileVerified ? (
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans font-bold text-[var(--color-brand-dark)] tracking-wide uppercase">
                            {turnstileVerified ? "Verified Safe" : "Verifying Browser Security"}
                          </span>
                          <span className="block text-[8px] text-[var(--color-brand-muted)] font-mono">
                            Protected by Cloudflare Turnstile
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={resetTurnstile}
                        className="text-[8px] font-sans font-bold uppercase tracking-wider text-[var(--color-brand-primary)] hover:underline"
                      >
                        Reset Check
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting || !turnstileVerified}
                        className="w-full py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span>{submitting ? t("submitting") : t("submitInquiry")}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </motion.form>
                )}

                {/* Option 2 Redirect Panel */}
                {activeOption === ContactOption.DISCOVERY && (
                  <motion.div 
                    key="discovery-panel"
                    className="text-center py-8 space-y-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="w-16 h-16 bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h4 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                        Strategic Discovery Session
                      </h4>
                      <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium">
                        Schedule a focused 30-minute video session with Amedee Erns Baptiste to discuss architecture reviews, cloud migration budgets, and tech audits. The $60 booking fee is credited to future custom developments.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-[10px] font-mono text-[var(--color-brand-muted)] font-bold pt-2">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--color-brand-primary)]" /> 30-Minute Video Call</span>
                      <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-[var(--color-brand-primary)]" /> Detailed Post-Session Brief</span>
                    </div>

                    <button
                      onClick={handleBookDiscoveryCall}
                      className="px-8 py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
                    >
                      <span>{t("bookDiscoveryCall")}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* Option 3 Form Panel */}
                {activeOption === ContactOption.PROPOSAL && (
                  <motion.form 
                    key="proposal-form"
                    onSubmit={handleSubmitProposal}
                    className="space-y-4 text-xs font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    
                    {/* Project Brief Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("company")} *</label>
                        <input
                          type="text"
                          required
                          value={propCompany}
                          onChange={(e) => setPropCompany(e.target.value)}
                          placeholder="Your Company Name"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("industry")}</label>
                        <input
                          type="text"
                          value={propIndustry}
                          onChange={(e) => setPropIndustry(e.target.value)}
                          placeholder="e.g. Fintech, Healthcare, NGO"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("website")}</label>
                        <input
                          type="text"
                          value={propWebsite}
                          onChange={(e) => setPropWebsite(e.target.value)}
                          placeholder="https://yourcompany.com"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("country")}</label>
                        <input
                          type="text"
                          value={propCountry}
                          onChange={(e) => setPropCountry(e.target.value)}
                          placeholder="e.g. Canada, France, Haiti"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Proposal Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("budgetRange")}</label>
                        <select
                          value={propBudget}
                          onChange={(e) => setPropBudget(e.target.value)}
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        >
                          <option value="Unknown">Select budget bracket...</option>
                          <option value="Under $1,000">Under $1,000</option>
                          <option value="$1,000–5,000">$1,000 – $5,000</option>
                          <option value="$5,000–15,000">$5,000 – $15,000</option>
                          <option value="Above $15,000">Above $15,000</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("timeline")}</label>
                        <select
                          value={propTimeline}
                          onChange={(e) => setPropTimeline(e.target.value)}
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        >
                          <option value="No timeline">Select timeline...</option>
                          <option value="Flexible">Flexible</option>
                          <option value="Within 3 months">Within 3 months</option>
                          <option value="Within 1 month">Within 1 month</option>
                          <option value="Urgent">Urgent / Immediate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("projectType")}</label>
                        <select
                          value={propProjectType}
                          onChange={(e) => setPropProjectType(e.target.value)}
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        >
                          <option value="Software Development">Software Development</option>
                          <option value="AI Consulting">AI Consulting</option>
                          <option value="Digital Transformation">Digital Transformation</option>
                          <option value="Training">Training Program</option>
                          <option value="Architecture Audit">Architecture Audit</option>
                          <option value="Long-Term Advisory">Long-Term Advisory</option>
                        </select>
                      </div>
                    </div>

                    {/* CRM Profiling Parameters (needed for scoring engine) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("companyType")}</label>
                        <select
                          value={propCompanyType}
                          onChange={(e) => setPropCompanyType(e.target.value)}
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                        >
                          <option value="Individual">Individual</option>
                          <option value="Startup">Startup</option>
                          <option value="Small Business">Small Business</option>
                          <option value="Enterprise">Enterprise</option>
                          <option value="Government">Government Entity</option>
                          <option value="NGO">NGO / Non-Profit</option>
                          <option value="University">University / Academic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("previousRelationship")}</label>
                        <select
                          value={propPrevRelationship}
                          onChange={(e) => setPropPrevRelationship(e.target.value)}
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                        >
                          <option value="None">New client / No relationship</option>
                          <option value="Existing Client">Existing Client</option>
                          <option value="Referral">Referral / Referral contact</option>
                          <option value="Returning Client">Returning / Past Client</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("message")} (Project Brief) *</label>
                      <textarea
                        required
                        rows={3}
                        value={propDescription}
                        onChange={(e) => setPropDescription(e.target.value)}
                        placeholder="Provide detailed description of project goals, legacy systems context, and core pain points..."
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("expectedDeliverables")}</label>
                      <textarea
                        rows={2}
                        value={propDeliverables}
                        onChange={(e) => setPropDeliverables(e.target.value)}
                        placeholder="E.g., RAG system blueprint, database schema proposal, 2-day on-site workshop..."
                        className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                      />
                    </div>

                    {/* Contact Person Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--color-brand-neutral)]/15 pt-4 mt-2">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("name")} (Contact Person) *</label>
                        <input
                          type="text"
                          required
                          value={propContactName}
                          onChange={(e) => setPropContactName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("email")} (Contact Email) *</label>
                        <input
                          type="email"
                          required
                          value={propContactEmail}
                          onChange={(e) => setPropContactEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="w-full bg-[var(--color-brand-bg)] border border(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("preferredContact")}</label>
                        <select
                          value={propContactMethod}
                          onChange={(e) => setPropContactMethod(e.target.value)}
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        >
                          <option value="Email">Email</option>
                          <option value="Phone">Phone</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Zoom">Zoom / Google Meet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("preferredLanguage")}</label>
                        <select
                          value={propContactLang}
                          onChange={(e) => setPropContactLang(e.target.value as Language)}
                          className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                        >
                          <option value={Language.EN}>English</option>
                          <option value={Language.FR}>Français</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">{t("attachment")}</label>
                        <div className="relative w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] hover:border-[var(--color-brand-primary)] flex items-center justify-between cursor-pointer">
                          <span className="truncate font-semibold text-[var(--color-brand-muted)] flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-[var(--color-brand-primary)] shrink-0" />
                            {propAttachmentName || "Choose file..."}
                          </span>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span>{submitting ? t("submitting") : t("submit")}</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </motion.form>
                )}

              </div>
            )}
            
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
