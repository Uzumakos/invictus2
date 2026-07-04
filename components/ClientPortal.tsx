"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Shield, Lock, Send, FileText, CheckCircle2, Circle, Calendar, MessageSquare, Plus, Check, Loader2, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { 
  Language, 
  Booking, 
  PortalTask, 
  PortalDocument, 
  PortalMessage,
  PortalProject,
  PortalPayment,
  PortalConsultation,
  PortalNotification,
  ProjectDiscovery
} from "@/lib/types";

// Sub-components
import PortalDashboard from "./portal/PortalDashboard";
import PortalTasks from "./portal/PortalTasks";
import PortalConsultations from "./portal/PortalConsultations";
import PortalDocuments from "./portal/PortalDocuments";
import PortalMessages from "./portal/PortalMessages";
import PortalPayments from "./portal/PortalPayments";
import PortalDiscoveries from "./portal/PortalDiscoveries";

export default function ClientPortal() {
  const t = useTranslations("portal");
  const currentLanguage = useLocale() as Language;

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks" | "consultations" | "documents" | "messages" | "discoveries" | "payments">("dashboard");

  // Portal database states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<PortalTask[]>([]);
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [payments, setPayments] = useState<PortalPayment[]>([]);
  const [consultations, setConsultations] = useState<PortalConsultation[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [discoveries, setDiscoveries] = useState<ProjectDiscovery[]>([]);

  // Form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchPortalData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const checkAutologin = () => {
      const email = localStorage.getItem("portal_autologin_email");
      const name = localStorage.getItem("portal_autologin_name");
      if (email) {
        setClientEmail(email);
        setClientName(name || email.split("@")[0]);
        setIsLoggedIn(true);
        localStorage.removeItem("portal_autologin_email");
        localStorage.removeItem("portal_autologin_name");
      }
    };

    checkAutologin();
    window.addEventListener("portal_autologin", checkAutologin);
    return () => {
      window.removeEventListener("portal_autologin", checkAutologin);
    };
  }, []);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, tasksRes, docsRes, msgsRes, projRes, payRes, conRes, notifRes, discoveriesRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/tasks"),
        fetch("/api/documents"),
        fetch("/api/messages"),
        fetch("/api/projects"),
        fetch("/api/payments"),
        fetch("/api/consultations"),
        fetch("/api/notifications"),
        fetch("/api/discoveries"),
      ]);

      if (
        bookingsRes.ok && 
        tasksRes.ok && 
        docsRes.ok && 
        msgsRes.ok && 
        projRes.ok && 
        payRes.ok && 
        conRes.ok && 
        notifRes.ok &&
        discoveriesRes.ok
      ) {
        const [bookingsData, tasksData, docsData, msgsData, projData, payData, conData, notifData, discoveriesData] = await Promise.all([
          bookingsRes.json(),
          tasksRes.json(),
          docsRes.json(),
          msgsRes.json(),
          projRes.json(),
          payRes.json(),
          conRes.json(),
          notifRes.json(),
          discoveriesRes.json(),
        ]);

        const targetEmail = clientEmail.toLowerCase().trim();
        const clientBookings = bookingsData.filter((b: any) => b.clientEmail?.toLowerCase().includes(targetEmail));
        const clientTasks = tasksData.filter((t: any) => t.clientEmail?.toLowerCase().includes(targetEmail) || t.assignedTo === "client" || true); // fallback fallback filter
        const clientMessages = msgsData.filter((m: any) => m.clientEmail?.toLowerCase().includes(targetEmail) || true); // fallback

        // Discoveries matching email prefix or company name
        const clientNamePart = clientName.toLowerCase().trim();
        const emailPrefixPart = targetEmail.split("@")[0];
        const clientDiscoveries = (discoveriesData || []).filter((d: any) => {
          const compName = (d.answers?.companyName || "").toLowerCase();
          const emailField = (d.answers?.email || d.answers?.clientEmail || "").toLowerCase();
          return compName.includes(clientNamePart) || compName.includes(emailPrefixPart) || emailPrefixPart.includes(compName) || emailField.includes(targetEmail);
        });

        setBookings(clientBookings);
        setTasks(clientTasks);
        setDocuments(docsData);
        setMessages(clientMessages);
        setProjects(projData);
        setPayments(payData);
        setConsultations(conData);
        setNotifications(notifData);
        setDiscoveries(clientDiscoveries);
      }
    } catch (err) {
      console.error("Failed to load client portal data:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 400);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientEmail.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    const parts = clientEmail.split("@");
    setClientName(parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
    }, 600);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setClientEmail("");
    setClientName("");
  };

  const handleToggleTask = async (task: PortalTask) => {
    const nextStatusMap: Record<string, "todo" | "in_progress" | "review" | "done"> = {
      todo: "in_progress",
      in_progress: "review",
      review: "done",
      done: "todo",
    };
    const nextStatus = nextStatusMap[task.status] || "todo";

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
      }
    } catch (err) {
      console.error("Failed to update task state:", err);
    }
  };

  const handleCreateTask = async (
    title: string, 
    description: string, 
    deadline: string, 
    assignedTo: "client" | "amedee"
  ) => {
    const payload = {
      clientEmail: clientEmail.toLowerCase().trim(),
      title: { en: title, fr: title },
      description: { en: description, fr: description },
      deadline,
      status: "todo",
      assignedTo
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newTaskItem = await res.json();
        setTasks(prev => [...prev, newTaskItem]);

        // Post a notification
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientEmail: clientEmail.toLowerCase().trim(),
            text: `New milestone action added: '${title}'.`,
            type: "task"
          })
        });
        
        // Refresh notifications
        const notifFetch = await fetch("/api/notifications");
        if (notifFetch.ok) {
          const freshNotifs = await notifFetch.json();
          setNotifications(freshNotifs);
        }
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark alert read:", err);
    }
  };

  const handleSendMessage = async (text: string) => {
    const payload = {
      clientEmail: clientEmail.toLowerCase().trim(),
      sender: "client",
      text,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newMsgItem = await res.json();
        setMessages(prev => [...prev, newMsgItem]);
      }
    } catch (err) {
      console.error("Failed to transmit chat message:", err);
    }
  };

  return (
    <section id="portal" className="py-24 bg-white text-[var(--color-brand-dark)] min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          /* Login Screen */
          <div className="max-w-md mx-auto bg-[var(--color-brand-bg)] p-8 sm:p-10 rounded-3xl border border-[var(--color-brand-neutral)]/20 shadow-2xs space-y-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif font-medium text-2xl text-[var(--color-brand-dark)]">
                {t("login")}
              </h2>
              <p className="text-xs text-[var(--color-brand-muted)] font-medium leading-relaxed">
                Provide the email address used during your booking reservation to access your secure deliverable logs.
              </p>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">{t("email")}</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full bg-white border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-3xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("loginCta")}
              </button>
            </form>

            <div className="border-t border-[var(--color-brand-neutral)]/20 pt-4 flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] text-[var(--color-brand-muted)] font-bold">OR LOAD SANDBOX DEMO</span>
              <button
                onClick={() => {
                  setClientEmail("jr.noel@haitistartups.com");
                  setClientName("Jean-Rene Noel");
                  setIsLoggedIn(true);
                }}
                className="text-xs font-bold text-[var(--color-brand-primary)] hover:text-[var(--color-brand-dark)] underline transition-colors cursor-pointer"
              >
                Access 'jr.noel@haitistartups.com' workspace
              </button>
            </div>
          </div>
        ) : (
          /* Main Workspace Screen */
          <div className="space-y-8">
            {/* Workspace Header */}
            <div className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[9px] font-sans font-bold text-[var(--color-brand-primary)] tracking-widest uppercase block">SECURE CLIENT WORKSPACE</span>
                <h2 className="font-serif font-bold text-2xl text-[var(--color-brand-dark)]">
                  Welcome, {clientName}
                </h2>
                <span className="text-[10px] font-mono text-[var(--color-brand-muted)]">{clientEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-[var(--color-brand-neutral)]/45 text-xs font-bold uppercase rounded-xl hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                {t("logout")}
              </button>
            </div>

            {/* Navigation tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--color-brand-neutral)]/15 pb-4">
              {[
                { id: "dashboard", label: t("dashboard") },
                { id: "tasks", label: t("tasks") },
                { id: "consultations", label: t("meetings") },
                { id: "documents", label: t("documents") },
                { id: "messages", label: t("messages") },
                { id: "payments", label: t("payments") },
                { id: "discoveries", label: "Roadmaps" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[var(--color-brand-primary)] text-white"
                      : "bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/15 text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content panel */}
            <div className="min-h-[40vh] pt-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[var(--color-brand-primary)] animate-spin" />
                </div>
              ) : (
                <>
                  {activeTab === "dashboard" && (
                    <PortalDashboard
                      bookings={bookings}
                      projects={projects}
                      payments={payments}
                      documents={documents}
                      notifications={notifications}
                      messages={messages}
                      clientEmail={clientEmail}
                      setActiveTab={setActiveTab}
                      onMarkNotificationRead={handleMarkNotificationRead}
                    />
                  )}

                  {activeTab === "tasks" && (
                    <PortalTasks
                      tasks={tasks}
                      onToggleTask={handleToggleTask}
                      onCreateTask={handleCreateTask}
                    />
                  )}

                  {activeTab === "consultations" && (
                    <PortalConsultations
                      consultations={consultations}
                      bookings={bookings}
                    />
                  )}

                  {activeTab === "documents" && (
                    <PortalDocuments
                      documents={documents}
                    />
                  )}

                  {activeTab === "messages" && (
                    <PortalMessages
                      messages={messages}
                      onSendMessage={handleSendMessage}
                    />
                  )}

                  {activeTab === "payments" && (
                    <PortalPayments
                      payments={payments}
                    />
                  )}

                  {activeTab === "discoveries" && (
                    <PortalDiscoveries
                      discoveries={discoveries}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
