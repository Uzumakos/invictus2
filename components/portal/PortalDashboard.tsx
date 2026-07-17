"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "motion/react";
import { 
  Calendar, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  Bell, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  CreditCard,
  Loader2
} from "lucide-react";
import { Booking, PortalProject, PortalPayment, PortalDocument, PortalNotification, PortalMessage, Language } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "@/lib/i18n/navigation";

interface PortalDashboardProps {
  bookings: Booking[];
  projects: PortalProject[];
  payments: PortalPayment[];
  documents: PortalDocument[];
  notifications: PortalNotification[];
  messages: PortalMessage[];
  clientEmail: string;
  setActiveTab: (tab: "dashboard" | "tasks" | "consultations" | "documents" | "messages" | "discoveries" | "payments") => void;
  onMarkNotificationRead: (id: string) => Promise<void>;
}

export default function PortalDashboard({
  bookings,
  projects,
  payments,
  documents,
  notifications,
  messages,
  clientEmail,
  setActiveTab,
  onMarkNotificationRead,
}: PortalDashboardProps) {
  const t = useTranslations("portal");
  const locale = useLocale() as Language;
  const router = useRouter();
  
  const targetEmail = clientEmail.toLowerCase().trim();
  
  const clientProjects = projects.filter(
    (p) => p.clientEmail.toLowerCase().trim() === targetEmail
  );
  const clientPayments = payments.filter(
    (p) => p.clientEmail.toLowerCase().trim() === targetEmail
  );
  const clientNotifications = notifications.filter(
    (n) => n.clientEmail.toLowerCase().trim() === targetEmail
  );
  
  const unreadCount = clientNotifications.filter((n) => !n.read).length;
  const activeMeetings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending" || b.status === "awaiting_payment");
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // V3 Portal Extension State
  const [timeline, setTimeline] = React.useState<any[]>([]);
  const [scorecard, setScorecard] = React.useState<any>({
    scoreValue: 0,
    category: "N/A",
    recommendations: { en: [], fr: [] }
  });
  const [loadingExtensions, setLoadingExtensions] = React.useState(true);

  React.useEffect(() => {
    async function loadPortalExtensions() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        const [timelineRes, scorecardRes] = await Promise.all([
          fetch(`/api/portal/timeline`, { headers }),
          fetch(`/api/portal/scorecard`, { headers })
        ]);

        if (timelineRes.status === 401 || scorecardRes.status === 401) {
          await supabase.auth.signOut();
          router.push("/portal?error=unauthorized");
          return;
        }

        if (timelineRes.status === 403 || scorecardRes.status === 403) {
          await supabase.auth.signOut();
          router.push("/portal?error=pending_approval");
          return;
        }

        if (timelineRes.ok) {
          setTimeline(await timelineRes.json());
        }
        if (scorecardRes.ok) {
          setScorecard(await scorecardRes.json());
        }
      } catch (err) {
        console.error("Failed to load portal BI extensions:", err);
      } finally {
        setLoadingExtensions(false);
      }
    }

    if (targetEmail) {
      loadPortalExtensions();
    }
  }, [targetEmail, router]);

  // Scorecard SVG Math
  const score = scorecard.scoreValue || 0;
  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-[var(--color-brand-neutral)]/20 p-6 rounded-2xl shadow-2xs flex items-center space-x-4"
        >
          <div className="p-3 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block">Maturity Score</span>
            <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">
              {loadingExtensions ? "..." : `${score}% Completed`}
            </h4>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-[var(--color-brand-neutral)]/20 p-6 rounded-2xl shadow-2xs flex items-center space-x-4"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block">Financial Status</span>
            <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">
              {clientPayments.some(p => p.status === "pending" || p.status === "overdue") ? "Invoice Outstanding" : "Account Settled"}
            </h4>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-[var(--color-brand-neutral)]/20 p-6 rounded-2xl shadow-2xs flex items-center space-x-4"
        >
          <div className="p-3 bg-red-50 text-red-500 rounded-xl relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block">System Updates</span>
            <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">
              {unreadCount} Unread Alerts
            </h4>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Meetings, Timeline, and Digital Scorecard (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Digital Transformation Scorecard */}
          <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/15 pb-3">
              <h4 className="font-serif font-bold text-xs text-[var(--color-brand-dark)] uppercase tracking-wider flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-brand-primary)]" />
                <span>Digital Transformation Maturity Scorecard</span>
              </h4>
              <span className="text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">
                Maturity Index
              </span>
            </div>

            {loadingExtensions ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-[var(--color-brand-primary)] animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Radial dial */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        className="text-[var(--color-brand-neutral)]/10"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r={radius}
                        className="text-[var(--color-brand-primary)]"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-bold font-mono text-[var(--color-brand-dark)]">{score}%</span>
                      <span className="block text-[8px] font-sans font-bold text-[var(--color-brand-muted)] uppercase">Index</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">Maturity Track:</span>
                      <span className="text-[9px] font-bold text-[var(--color-brand-primary)] uppercase tracking-wide bg-[var(--color-brand-primary)]/5 px-2 py-0.5 rounded border border-[var(--color-brand-primary)]/10">
                        {scorecard.category || "General"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">
                      {locale === "fr" 
                        ? "Votre indice de maturité technologique mesure le déploiement de vos solutions cloud, la robustesse de votre architecture et l'optimisation de vos processus opérationnels."
                        : "Your technology maturity index evaluates cloud deployment success, systems architecture robustness, and operational process automation flows."
                      }
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {scorecard.recommendations && (scorecard.recommendations[locale] || scorecard.recommendations["en"])?.length > 0 && (
                  <div className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-4 rounded-xl space-y-2">
                    <span className="block text-[9px] font-sans font-bold text-[var(--color-brand-dark)] uppercase tracking-wider border-b border-[var(--color-brand-neutral)]/10 pb-1.5">
                      {locale === "fr" ? "Recommandations Stratégiques" : "Strategic Optimization Recommendations"}
                    </span>
                    <ul className="space-y-1.5 text-xs text-[var(--color-brand-muted)]">
                      {(scorecard.recommendations[locale] || scorecard.recommendations["en"]).map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Section 2: Relationship Timeline Roadmap */}
          <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/15 pb-3">
              <h4 className="font-serif font-bold text-xs text-[var(--color-brand-dark)] uppercase tracking-wider flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[var(--color-brand-primary)]" />
                <span>Relationship Roadmap & Deliverables Timeline</span>
              </h4>
              <span className="text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">
                Milestones
              </span>
            </div>

            {loadingExtensions ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-[var(--color-brand-primary)] animate-spin" />
              </div>
            ) : timeline.length > 0 ? (
              <div className="relative pl-6 space-y-6 pt-2">
                {/* Continuous vertical connector line */}
                <div className="absolute left-[9px] top-4 bottom-4 w-0.5 bg-[var(--color-brand-neutral)]/20" />

                {timeline.map((item, idx) => {
                  const isCompleted = item.status === "completed";
                  const isInProgress = item.status === "in_progress";
                  
                  return (
                    <motion.div 
                      key={item.id}
                      className="relative flex items-start space-x-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[-21px] top-1 z-10">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-xs flex items-center justify-center text-white" />
                        ) : isInProgress ? (
                          <div className="w-5 h-5 rounded-full bg-[var(--color-brand-primary)] border-4 border-white shadow-xs animate-pulse flex items-center justify-center text-white" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 border-4 border-white shadow-xs" />
                        )}
                      </div>

                      {/* Stage content */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h5 className="font-serif font-bold text-sm text-[var(--color-brand-dark)]">
                            {locale === "fr" ? item.titleFr : item.titleEn}
                          </h5>
                          <span className={`text-[8px] font-sans font-bold uppercase px-1.5 py-0.5 rounded border ${
                            isCompleted 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : isInProgress
                              ? "bg-[var(--color-brand-primary)]/10 border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] animate-pulse"
                              : "bg-gray-50 border-gray-100 text-gray-500"
                          }`}>
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                        {item.completedAt && (
                          <span className="block text-[9px] font-mono text-[var(--color-brand-muted)] opacity-60">
                            {locale === "fr" ? "Complété le: " : "Completed: "} {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[var(--color-brand-bg)] border border-dashed border-[var(--color-brand-neutral)]/20 rounded-xl">
                <Clock className="w-6 h-6 text-[var(--color-brand-muted)] mx-auto mb-2 opacity-60" />
                <p className="text-xs text-[var(--color-brand-muted)] font-mono">
                  {locale === "fr" ? "Aucune étape de feuille de route enregistrée." : "No project roadmap milestones registered yet."}
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Upcoming Consultations */}
          <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/15 pb-3">
              <h4 className="font-serif font-bold text-xs text-[var(--color-brand-primary)] uppercase tracking-wider flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[var(--color-brand-primary)]" />
                <span>Upcoming Sessions</span>
              </h4>
              <span className="text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">
                {activeMeetings.length} Scheduled
              </span>
            </div>
            
            {activeMeetings.length > 0 ? (
              <div className="space-y-4">
                {activeMeetings.map((b) => (
                  <motion.div 
                    key={b.id} 
                    className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors hover:border-[var(--color-brand-primary)]/20"
                    whileHover={{ scale: 1.005 }}
                  >
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono text-[var(--color-brand-muted)] uppercase tracking-wider">Consulting Stream</span>
                      <span className="font-serif font-bold text-[var(--color-brand-dark)] text-sm block">
                        {b.serviceTitle[locale] || b.serviceTitle["en"]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="text-right font-mono text-[11px] text-[var(--color-brand-muted)]">
                        <div className="font-bold text-[var(--color-brand-dark)]">{b.date}</div>
                        <div>{b.time} ({b.timezone})</div>
                      </div>
                      <span className={`text-[8px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
                        b.status === "confirmed"
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : b.status === "awaiting_payment"
                          ? "bg-amber-50 border-amber-100 text-amber-700 animate-pulse"
                          : "bg-gray-50 border-gray-200 text-gray-700"
                      }`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[var(--color-brand-bg)] border border-dashed border-[var(--color-brand-neutral)]/20 rounded-xl">
                <Clock className="w-6 h-6 text-[var(--color-brand-muted)] mx-auto mb-2 opacity-60" />
                <p className="text-xs text-[var(--color-brand-muted)] font-mono">No pending client consultations scheduled.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Alerts and Chat Feed (1/3 width) */}
        <div className="space-y-8">
          {/* Workspace Alerts */}
          <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/15 pb-3">
              <h4 className="font-serif font-bold text-xs text-[var(--color-brand-dark)] uppercase tracking-wider flex items-center space-x-2">
                <Bell className="w-4 h-4 text-[var(--color-brand-primary)]" />
                <span>Security & Workspace Alerts</span>
              </h4>
            </div>

            {clientNotifications.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {clientNotifications.map((n) => (
                  <motion.div 
                    key={n.id}
                    layout
                    className={`p-3 rounded-xl border text-[11px] leading-relaxed relative flex items-start space-x-2.5 transition-colors ${
                      n.read 
                        ? "bg-white border-[var(--color-brand-neutral)]/25 text-[var(--color-brand-muted)] opacity-70"
                        : "bg-[var(--color-brand-primary)]/5 border-[var(--color-brand-primary)]/20 text-[var(--color-brand-dark)]"
                    }`}
                  >
                    {!n.read && (
                      <button 
                        onClick={() => onMarkNotificationRead(n.id)}
                        className="absolute top-2 right-2 text-[9px] font-sans font-bold text-[var(--color-brand-primary)] hover:text-[var(--color-brand-dark)] uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                    <div className="mt-0.5 text-[var(--color-brand-primary)] shrink-0">
                      {n.type === "meeting" ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : n.type === "document" ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : n.type === "payment" ? (
                        <DollarSign className="w-3.5 h-3.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="pr-10 font-medium">{n.text}</p>
                      <span className="block text-[8px] font-mono text-[var(--color-brand-muted)]">
                        {new Date(n.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-brand-muted)] font-mono py-4 text-center">No active notifications.</p>
            )}
          </div>

          {/* Secure Chat Widget */}
          <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 shadow-2xs space-y-4">
            <h4 className="font-serif font-bold text-xs text-[var(--color-brand-dark)] uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[var(--color-brand-primary)]" />
              <span>Direct Chat Feed</span>
            </h4>
            
            {latestMessage ? (
              <div className="bg-[var(--color-brand-bg)] p-4 rounded-xl border border-[var(--color-brand-neutral)]/20 space-y-2">
                <div className="flex justify-between items-center text-[9px] font-mono text-[var(--color-brand-muted)]">
                  <span className="font-sans font-bold uppercase">{latestMessage.sender === "client" ? "You" : "Amedee"}</span>
                  <span>{new Date(latestMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-[var(--color-brand-dark)] line-clamp-3 leading-relaxed font-semibold">
                  {latestMessage.text}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-brand-muted)] font-mono text-center py-4">No chat messages found.</p>
            )}

            <button
              onClick={() => setActiveTab("messages")}
              className="w-full py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors border-0"
            >
              <span>Launch Secure Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
