"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Shield, Lock, Send, FileText, CheckCircle2, Circle, Calendar, MessageSquare, Plus, Check, Loader2, DollarSign, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'exists' | 'pending' | 'not_found' | 'error'>('idle');
  const [loginMethod, setLoginMethod] = useState<'magic_link' | 'password'>('magic_link');
  const [clientPassword, setClientPassword] = useState("");

  // Password Management States
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalCurrentPassword, setModalCurrentPassword] = useState("");
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [modalPasswordError, setModalPasswordError] = useState<string | null>(null);
  const [modalPasswordSuccess, setModalPasswordSuccess] = useState<string | null>(null);
  const [modalPasswordLoading, setModalPasswordLoading] = useState(false);
  const [showForgotPasswordNotice, setShowForgotPasswordNotice] = useState(false);

  const searchParams = useSearchParams();
  const errorParam = searchParams?.get("error");

  useEffect(() => {
    if (isLoggedIn) {
      fetchPortalData();
    }
  }, [isLoggedIn]);

  // Check if client user has a password set
  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/portal/password-status")
        .then(res => res.json())
        .then(data => {
          if (typeof data.hasPassword === "boolean") {
            setHasPassword(data.hasPassword);
          }
        })
        .catch(err => console.error("Error loading password status:", err));
    } else {
      setHasPassword(null);
    }
  }, [isLoggedIn]);

  // Debounced client email verification
  useEffect(() => {
    if (!clientEmail) {
      setEmailStatus('idle');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      setEmailStatus('idle');
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setEmailStatus('checking');
      try {
        const res = await fetch(`/api/portal/verify-email?email=${encodeURIComponent(clientEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            if (data.approved) {
              setEmailStatus('exists');
            } else {
              setEmailStatus('pending');
            }
          } else {
            setEmailStatus('not_found');
          }
        } else {
          setEmailStatus('error');
        }
      } catch (err) {
        console.error("Error verifying email:", err);
        setEmailStatus('error');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [clientEmail]);

  useEffect(() => {
    // 1. Check local client_token session first
    fetch("/api/portal/status")
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return { authenticated: false };
      })
      .then(data => {
        if (data.authenticated && data.user) {
          setIsLoggedIn(true);
          setClientEmail(data.user.email || "");
          setClientName(data.user.name || data.user.email?.split("@")[0] || "");
        } else {
          // 2. Check Supabase session as fallback
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              setIsLoggedIn(true);
              setClientEmail(session.user.email || "");
              setClientName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || "");
            }
          });
        }
      })
      .catch(() => {
        // Fallback
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setIsLoggedIn(true);
            setClientEmail(session.user.email || "");
            setClientName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || "");
          }
        });
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setClientEmail(session.user.email || "");
        setClientName(session.user.user_metadata?.name || session.user.email?.split("@")[0] || "");
      } else if (event === "SIGNED_OUT") {
        // only reset if they sign out of supabase AND don't have a local cookie session
        fetch("/api/portal/status")
          .then(res => res.json())
          .then(data => {
            if (!data.authenticated) {
              setIsLoggedIn(false);
              setClientEmail("");
              setClientName("");
            }
          });
      }
    });

    // UX fallback for prefilling email from localstorage autologin triggers
    const autologinEmail = localStorage.getItem("portal_autologin_email");
    if (autologinEmail) {
      setClientEmail(autologinEmail);
      localStorage.removeItem("portal_autologin_email");
    }

    return () => {
      subscription.unsubscribe();
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

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientEmail.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (loginMethod === "password") {
        // Direct password authentication
        const res = await fetch("/api/portal/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: clientEmail, password: clientPassword })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to log in.");
        }
        setIsLoggedIn(true);
        setClientEmail(data.user.email);
        setClientName(data.user.name || data.user.email.split("@")[0]);
      } else {
        // Direct verification check before OTP trigger
        const res = await fetch(`/api/portal/verify-email?email=${encodeURIComponent(clientEmail)}`);
        if (!res.ok) {
          throw new Error("Failed to verify email registration.");
        }
        const data = await res.json();
        if (!data.exists) {
          setEmailStatus('not_found');
          setError("This email address is not registered in our system. Please use the email you used for your booking.");
          setLoading(false);
          return;
        }
        if (!data.approved) {
          setEmailStatus('pending');
          setError("Your registration was found, but access is pending administrator approval.");
          setLoading(false);
          return;
        }

        const { error: authError } = await supabase.auth.signInWithOtp({
          email: clientEmail.toLowerCase().trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/portal`,
          },
        });

        if (authError) {
          setError(authError.message);
        } else {
          setSuccessMessage("A secure magic login link has been sent to your email. Check your inbox to sign in!");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await Promise.all([
        supabase.auth.signOut(),
        fetch("/api/auth/logout", { method: "POST" })
      ]);
      setIsLoggedIn(false);
      setClientEmail("");
      setClientName("");
      setClientPassword("");
      setHasPassword(null);
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggedIn(false);
      setClientEmail("");
      setClientName("");
      setClientPassword("");
      setHasPassword(null);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalPasswordError(null);
    setModalPasswordSuccess(null);
    setModalPasswordLoading(true);

    try {
      const res = await fetch("/api/portal/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: modalCurrentPassword,
          newPassword: modalNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }
      setModalPasswordSuccess(hasPassword ? "Password updated successfully!" : "Password created successfully!");
      setHasPassword(true);
      setModalCurrentPassword("");
      setModalNewPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setModalPasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setModalPasswordError(err.message || "An error occurred.");
    } finally {
      setModalPasswordLoading(false);
    }
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
              {errorParam === "pending_approval" && !successMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>Access Pending. Your email must be approved by the administrator before accessing the client portal.</span>
                </div>
              )}
              {errorParam === "unauthorized" && !successMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>Unauthorized. Please sign in again or use an authorized email.</span>
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Login Method Toggle Switcher */}
              <div className="flex border-b border-[var(--color-brand-neutral)]/15 pb-2 justify-center gap-4 text-xs font-bold uppercase tracking-wider mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('magic_link');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`pb-1 border-b-2 cursor-pointer transition-all ${
                    loginMethod === 'magic_link'
                      ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                      : 'border-transparent text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                  }`}
                >
                  {t("useMagicLink")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`pb-1 border-b-2 cursor-pointer transition-all ${
                    loginMethod === 'password'
                      ? 'border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]'
                      : 'border-transparent text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                  }`}
                >
                  {t("usePassword")}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">{t("email")}</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="your.email@domain.com"
                    className="w-full bg-white border border-[var(--color-brand-neutral)]/45 rounded-xl pl-4 pr-10 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                  />
                  {emailStatus === 'checking' && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--color-brand-primary)]" />
                    </div>
                  )}
                  {emailStatus === 'exists' && (
                    <div className="absolute right-3 top-3">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                  {(emailStatus === 'not_found' || emailStatus === 'error') && (
                    <div className="absolute right-3 top-3">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                  {emailStatus === 'pending' && (
                    <div className="absolute right-3 top-3">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                  )}
                </div>

                {/* Inline Status Message */}
                {emailStatus !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-medium leading-relaxed mt-1"
                  >
                    {emailStatus === 'checking' && (
                      <span className="text-[var(--color-brand-muted)]">{t("emailChecking")}</span>
                    )}
                    {emailStatus === 'exists' && (
                      <span className="text-emerald-600">{t("emailRegistered")}</span>
                    )}
                    {emailStatus === 'pending' && (
                      <span className="text-amber-600">{t("emailPending")}</span>
                    )}
                    {emailStatus === 'not_found' && (
                      <span className="text-red-600">{t("emailNotFound")}</span>
                    )}
                    {emailStatus === 'error' && (
                      <span className="text-red-600">{t("emailError")}</span>
                    )}
                  </motion.div>
                )}
              </div>

              {loginMethod === 'password' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase">{t("password")}</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordNotice(!showForgotPasswordNotice)}
                      className="text-[9px] font-sans font-bold text-[var(--color-brand-primary)] tracking-wider uppercase hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                  />
                  {showForgotPasswordNotice && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-[var(--color-brand-muted)] leading-relaxed mt-1"
                    >
                      No worries! Select the <strong>Magic Link</strong> option above to sign in securely, and you can reset your password anytime from your portal dashboard.
                    </motion.p>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={
                  loading || 
                  (loginMethod === 'magic_link' && (emailStatus === 'checking' || emailStatus === 'not_found' || emailStatus === 'pending' || emailStatus === 'error'))
                }
                className="w-full py-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-3xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : loginMethod === 'magic_link' ? (
                  "Send Magic Link"
                ) : (
                  t("loginCta")
                )}
              </button>
            </form>
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
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setModalPasswordError(null);
                    setModalPasswordSuccess(null);
                    setModalCurrentPassword("");
                    setModalNewPassword("");
                    setShowPasswordModal(true);
                  }}
                  className="px-4 py-2 border border-[var(--color-brand-neutral)]/45 text-xs font-bold uppercase rounded-xl hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)] transition-colors cursor-pointer w-full sm:w-auto text-center font-bold"
                >
                  {hasPassword ? "Change Password" : "Set Password"}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-[var(--color-brand-neutral)]/45 text-xs font-bold uppercase rounded-xl hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer w-full sm:w-auto text-center"
                >
                  {t("logout")}
                </button>
              </div>
            </div>

            {/* Set Password Prompt Banner */}
            {hasPassword === false && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-amber-800"
              >
                <div className="flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-bold">Set up your password</p>
                    <p className="text-[11px] text-amber-700/90 font-medium">You haven't set a password for direct login yet. Set one now to access the portal instantly without needing a magic link next time!</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalPasswordError(null);
                    setModalPasswordSuccess(null);
                    setModalCurrentPassword("");
                    setModalNewPassword("");
                    setShowPasswordModal(true);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase rounded-xl tracking-wider transition-colors shrink-0 cursor-pointer font-bold"
                >
                  Set Password
                </button>
              </motion.div>
            )}

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

      {/* Password Management Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[var(--color-brand-neutral)]/20 shadow-xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                    {hasPassword ? "Change Password" : "Set Password"}
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)] font-medium mt-1">
                    {hasPassword 
                      ? "Enter your current password and choose a new one."
                      : "Create a password to enable direct email & password sign in."}
                  </p>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                {modalPasswordError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{modalPasswordError}</span>
                  </div>
                )}
                {modalPasswordSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{modalPasswordSuccess}</span>
                  </div>
                )}

                {hasPassword && (
                  <div>
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">Current Password</label>
                    <input
                      type="password"
                      required
                      value={modalCurrentPassword}
                      onChange={(e) => setModalCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={modalNewPassword}
                    onChange={(e) => setModalNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="w-1/2 py-3 border border-[var(--color-brand-neutral)]/45 hover:bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalPasswordLoading}
                    className="w-1/2 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-3xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modalPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
