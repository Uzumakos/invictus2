"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, TrendingUp, DollarSign, Users, Calendar, ArrowRight, 
  RefreshCw, Layers, Check, X, AlertCircle, Search, Filter, 
  Download, Brain, Clipboard, ChevronRight, Cpu, Building2, Trash2,
  Settings, Image, Globe, CheckCircle2, Save, LogOut, Plus, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Booking, CRMLead, ProjectDiscovery, PaymentMethod, PaymentConfig, SiteSettings } from "@/lib/types";
import { consultingOffers } from "@/lib/data";
import { ProjectEditForm, TrainingEditForm, ServiceEditForm, FAQEditForm } from "@/components/admin/CMSForms";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "crm" | "bookings" | "discoveries" | "payments" | "settings" | "users" | "cms">("analytics");

  // Server state data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [discoveries, setDiscoveries] = useState<ProjectDiscovery[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // CMS state data
  const [translations, setTranslations] = useState<any[]>([]);
  const [cmsProjects, setCmsProjects] = useState<any[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);
  const [faqItems, setFaqItems] = useState<any[]>([]);
  const [consultingServices, setConsultingServices] = useState<any[]>([]);

  // Add User Form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "client">("client");
  
  // Settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    trainingEnabled: true,
    profileImageUrl: "",
    adminPath: "/admin",
    socialLinks: { github: "", linkedin: "", twitter: "" }
  });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ methods: [] });

  // Error/Success state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter state for discoveries
  const [discSearch, setDiscSearch] = useState("");
  const [discTypeFilter, setDiscTypeFilter] = useState("all");
  const [discBudgetFilter, setDiscBudgetFilter] = useState("all");
  const [selectedDisc, setSelectedDisc] = useState<ProjectDiscovery | null>(null);

  // Link Generator state
  const [genEmail, setGenEmail] = useState("");
  const [genClientName, setGenClientName] = useState("");
  const [genCurrency, setGenCurrency] = useState("USD");
  const [genServiceId, setGenServiceId] = useState("");
  const [genCustomTitle, setGenCustomTitle] = useState("");
  const [genAmount, setGenAmount] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // CMS Editor States
  const [cmsSubTab, setCmsSubTab] = useState<"translations" | "projects" | "training" | "services" | "faqs">("translations");
  const [transSearch, setTransSearch] = useState("");
  const [editingTransKey, setEditingTransKey] = useState<string | null>(null);
  const [editingTransEn, setEditingTransEn] = useState("");
  const [editingTransFr, setEditingTransFr] = useState("");
  const [newTransKey, setNewTransKey] = useState("");
  const [newTransEn, setNewTransEn] = useState("");
  const [newTransFr, setNewTransFr] = useState("");

  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
  const [isTrainingFormOpen, setIsTrainingFormOpen] = useState(false);

  const [selectedServiceCMS, setSelectedServiceCMS] = useState<any | null>(null);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);

  const [selectedFAQ, setSelectedFAQ] = useState<any | null>(null);
  const [isFAQFormOpen, setIsFAQFormOpen] = useState(false);

  useEffect(() => {

    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    setLoading(true);
    try {
      // 1. Verify status
      const authRes = await fetch("/api/auth/status");
      if (!authRes.ok) {
        router.push("/admin/login");
        return;
      }

      // 2. Load all datasets
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setError(null);
    try {
      const [
        bookingsRes, leadsRes, discoveriesRes, settingsRes, paymentRes, usersRes, paymentsRes,
        transRes, projectsRes, trainingRes, faqRes, servicesRes
      ] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/leads"),
        fetch("/api/discoveries"),
        fetch("/api/settings"),
        fetch("/api/payment-config"),
        fetch("/api/users"),
        fetch("/api/payments"),
        fetch("/api/translations"),
        fetch("/api/case-studies"),
        fetch("/api/training-programs"),
        fetch("/api/faq-items"),
        fetch("/api/consulting-services")
      ]);

      setBookings(bookingsRes.ok ? await bookingsRes.json() : []);
      setLeads(leadsRes.ok ? await leadsRes.json() : []);
      setDiscoveries(discoveriesRes.ok ? await discoveriesRes.json() : []);
      setSiteSettings(settingsRes.ok ? await settingsRes.json() : { trainingEnabled: true });
      setPaymentConfig(paymentRes.ok ? await paymentRes.json() : { methods: [] });
      setUsers(usersRes.ok ? await usersRes.json() : []);
      setPayments(paymentsRes.ok ? await paymentsRes.json() : []);
      
      setTranslations(transRes.ok ? await transRes.json() : []);
      setCmsProjects(projectsRes.ok ? await projectsRes.json() : []);
      setTrainingPrograms(trainingRes.ok ? await trainingRes.json() : []);
      setFaqItems(faqRes.ok ? await faqRes.json() : []);
      setConsultingServices(servicesRes.ok ? await servicesRes.json() : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sync databases.");
    }
  };

  // CMS CRUD Actions
  const handleAddTranslation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransKey || !newTransEn || !newTransFr) {
      setError("Please fill all translation fields.");
      return;
    }
    setError(null);
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newTransKey,
          en: newTransEn,
          fr: newTransFr
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create translation.");
      setTranslations([data, ...translations]);
      setNewTransKey("");
      setNewTransEn("");
      setNewTransFr("");
      showToast("Translation added successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to add translation.");
    }
  };

  const handleSaveTranslation = async (key: string, en: string, fr: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/translations/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ en, fr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update translation.");
      setTranslations(translations.map((t) => (t.key === key ? data : t)));
      setEditingTransKey(null);
      showToast("Translation saved!");
    } catch (err: any) {
      setError(err.message || "Failed to update translation.");
    }
  };

  const handleDeleteTranslation = async (key: string) => {
    if (!confirm(`Are you sure you want to delete translation for key: ${key}?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/translations/${key}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete translation.");
      setTranslations(translations.filter((t) => t.key !== key));
      showToast("Translation deleted!");
    } catch (err: any) {
      setError(err.message || "Failed to delete translation.");
    }
  };

  // Case Studies (Projects) CRUD
  const handleSaveProject = async (projectData: any) => {
    setError(null);
    const isNew = !projectData.id;
    const url = isNew ? "/api/case-studies" : `/api/case-studies/${projectData.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save project.");
      
      if (isNew) {
        setCmsProjects([data, ...cmsProjects]);
      } else {
        setCmsProjects(cmsProjects.map((p) => (p.id === data.id ? data : p)));
      }
      setIsProjectFormOpen(false);
      setSelectedProject(null);
      showToast("Case study saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/case-studies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project.");
      setCmsProjects(cmsProjects.filter((p) => p.id !== id));
      showToast("Case study deleted!");
    } catch (err: any) {
      setError(err.message || "Failed to delete project.");
    }
  };

  // Training Programs CRUD
  const handleSaveTraining = async (trainingData: any) => {
    setError(null);
    const isNew = !trainingData.id;
    const url = isNew ? "/api/training-programs" : `/api/training-programs/${trainingData.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainingData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save training program.");
      
      if (isNew) {
        setTrainingPrograms([data, ...trainingPrograms]);
      } else {
        setTrainingPrograms(trainingPrograms.map((t) => (t.id === data.id ? data : t)));
      }
      setIsTrainingFormOpen(false);
      setSelectedTraining(null);
      showToast("Training program saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save training program.");
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training program?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/training-programs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete training program.");
      setTrainingPrograms(trainingPrograms.filter((t) => t.id !== id));
      showToast("Training program deleted!");
    } catch (err: any) {
      setError(err.message || "Failed to delete training program.");
    }
  };

  // Consulting Services CRUD
  const handleSaveService = async (serviceData: any) => {
    setError(null);
    const isNew = !serviceData.id;
    const url = isNew ? "/api/consulting-services" : `/api/consulting-services/${serviceData.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save service.");
      
      if (isNew) {
        setConsultingServices([data, ...consultingServices]);
      } else {
        setConsultingServices(consultingServices.map((s) => (s.id === data.id ? data : s)));
      }
      setIsServiceFormOpen(false);
      setSelectedServiceCMS(null);
      showToast("Consulting service saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save service.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this consulting service?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/consulting-services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service.");
      setConsultingServices(consultingServices.filter((s) => s.id !== id));
      showToast("Consulting service deleted!");
    } catch (err: any) {
      setError(err.message || "Failed to delete service.");
    }
  };

  // FAQs CRUD
  const handleSaveFAQ = async (faqData: any) => {
    setError(null);
    const isNew = !faqData.id;
    const url = isNew ? "/api/faq-items" : `/api/faq-items/${faqData.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save FAQ.");
      
      if (isNew) {
        setFaqItems([data, ...faqItems]);
      } else {
        setFaqItems(faqItems.map((f) => (f.id === data.id ? data : f)));
      }
      setIsFAQFormOpen(false);
      setSelectedFAQ(null);
      showToast("FAQ saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save FAQ.");
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/faq-items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete FAQ.");
      setFaqItems(faqItems.filter((f) => f.id !== id));
      showToast("FAQ deleted!");
    } catch (err: any) {
      setError(err.message || "Failed to delete FAQ.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setError("Please fill in all user fields.");
      return;
    }
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user.");
      }
      setUsers([...users, data]);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("client");
      showToast("User onboarded successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create user account.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user account?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }
      setUsers(users.filter((u) => u.id !== id));
      showToast("User account removed successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete user account.");
    }
  };

  const handleBookingStatus = async (bookingId: string, nextStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: nextStatus as any } : b)));
        showToast("Booking status updated successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeadCycleStatus = async (leadId: string, currentStatus: string) => {
    const pipelineOrder: string[] = ["lead", "discovery", "proposal", "negotiation", "won", "lost"];
    const idx = pipelineOrder.indexOf(currentStatus);
    const nextStatus = pipelineOrder[(idx + 1) % pipelineOrder.length];

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: nextStatus as any } : l)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToLead = async (disc: ProjectDiscovery) => {
    const payload = {
      company: disc.answers.companyName,
      contactName: disc.answers.companyName + " Contact",
      email: disc.answers.socialLinks || "unknown@domain.com",
      budget: disc.answers.budgetRange,
      notes: `Discovery converted lead. Type: ${disc.answers.projectTypes?.join(", ")}. Timeline: ${disc.answers.timeline}. ROI expected: ${disc.answers.expectedROI}`,
      source: "Scoping Conversion",
      status: "discovery"
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newLead = await res.json();
        setLeads((prev) => [newLead, ...prev]);
        showToast("Converted scoping submission into CRM Prospect.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDiscovery = async (id: string) => {
    if (!window.confirm("Archive this discovery?")) return;
    try {
      const res = await fetch(`/api/discoveries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true })
      });
      if (res.ok) {
        setDiscoveries(discoveries.filter(d => d.id !== id));
        if (selectedDisc?.id === id) setSelectedDisc(null);
        showToast("Archived discovery record.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Save Settings Tab
  const handleSaveSettings = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const settingsRes = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings)
      });

      const paymentRes = await fetch("/api/payment-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentConfig)
      });

      if (settingsRes.ok && paymentRes.ok) {
        showToast("Site settings and payment configurations saved successfully.");
      } else {
        throw new Error("Failed to save all settings fields.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update configurations.");
    }
  };

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" })
      });
      if (res.ok) {
        const updated = await res.json();
        setPayments(payments.map(p => p.id === paymentId ? updated : p));
        showToast("Payment verified and marked as PAID.");

        // Automatically approve and confirm matching bookings!
        const matchingBooking = bookings.find(
          b => b.paymentReference === updated.paymentReference || b.id === updated.paymentReference
        );
        if (matchingBooking && matchingBooking.status !== "confirmed") {
          await handleBookingStatus(matchingBooking.id, "confirmed");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to verify payment record.");
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "overdue" })
      });
      if (res.ok) {
        const updated = await res.json();
        setPayments(payments.map(p => p.id === paymentId ? updated : p));
        showToast("Payment receipt marked as overdue/rejected.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reject payment record.");
    }
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genEmail && !genClientName) {
      setError("Please provide either Client Email or Client Name.");
      return;
    }
    if (!genServiceId) return;
    
    let serviceParam = genServiceId;
    let amountParam = genAmount;

    if (genServiceId === "custom") {
      serviceParam = genCustomTitle ? genCustomTitle : "custom";
    }

    const host = typeof window !== "undefined" ? window.location.origin : "";
    // Since locale routes are structured as /[locale]/payments, default to /en/payments
    const link = `${host}/en/payments?serviceId=${encodeURIComponent(serviceParam)}&amount=${amountParam}&email=${encodeURIComponent(genEmail)}&clientName=${encodeURIComponent(genClientName)}&currency=${genCurrency}`;
    setGeneratedLink(link);
    showToast("Invoice link generated successfully.");
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      showToast("Copied payment link to clipboard!");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Company", "Industry", "Country", "Budget", "Timeline", "Complexity"];
      const rows = discoveries.map((d) => [
        d.id,
        `"${(d.answers?.companyName || "").replace(/"/g, '""')}"`,
        `"${(d.answers?.industry || "").replace(/"/g, '""')}"`,
        `"${(d.answers?.country || "").replace(/"/g, '""')}"`,
        `"${d.answers?.budgetRange}"`,
        `"${d.answers?.timeline}"`,
        d.summary?.complexity || "Medium"
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Amedee_Roadmaps_Export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, curr) => sum + curr.amount, 0);

  const pipelineColumns = [
    { id: "discovery", label: "Discovery" },
    { id: "proposal", label: "Proposal" },
    { id: "negotiation", label: "Negotiation" },
    { id: "won", label: "Won" },
    { id: "lost", label: "Lost" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121A1B] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#27187E] animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-24 bg-[#121A1B] text-white min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        
        {/* Toast Alerts */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 p-4 bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 shadow-xl"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div>
            <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">SECURED CORE WORKSPACE</span>
            <h2 className="font-serif font-bold text-2xl text-white">Administrator Control Panel</h2>
            <span className="text-[10px] text-[#CDD4DD]/40 font-mono">Managing system ledgers and settings</span>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={fetchAdminData}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-mono text-gray-300 flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-950/40 border border-red-500/20 hover:bg-red-900/35 px-4 py-2.5 rounded-xl text-xs font-sans font-bold text-red-400 flex items-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#CDD4DD]/10 pb-4 text-xs font-bold uppercase tracking-wider font-sans">
          {[
            { id: "analytics", label: "1. Performance" },
            { id: "crm", label: "2. CRM Pipeline" },
            { id: "bookings", label: "3. Bookings" },
            { id: "discoveries", label: "4. Roadmaps" },
            { id: "payments", label: "5. Payments Review" },
            { id: "settings", label: "6. Console Settings" },
            { id: "users", label: "7. User Control" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#27187E] text-white"
                  : "bg-[#1A2324] border border-[#CDD4DD]/10 text-[#CDD4DD]/50 hover:border-[#27187E]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab contents */}
        <div className="min-h-[50vh]">
          {/* TAB 1: Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-sans font-bold text-[#CDD4DD]/40 block">TOTAL REVENUE AUDITED</span>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold font-serif text-emerald-500">${totalRevenue.toLocaleString()}</span>
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-sans font-bold text-[#CDD4DD]/40 block">ACTIVE BOOKINGS</span>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold font-serif text-white">{bookings.length}</span>
                    <Calendar className="w-5 h-5 text-[#27187E]" />
                  </div>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-sans font-bold text-[#CDD4DD]/40 block">CRM ACTIVE PROSPECTS</span>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold font-serif text-white">{leads.length}</span>
                    <Users className="w-5 h-5 text-[#27187E]" />
                  </div>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-sans font-bold text-[#CDD4DD]/40 block">SCOPING ROADMAPS</span>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold font-serif text-white">{discoveries.length}</span>
                    <Brain className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                </div>
              </div>

              {/* Lead funnels stats */}
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-2xl space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#FF7A00] uppercase tracking-wider">Kanban Pipeline Statistics</h4>
                <div className="text-xs text-[#CDD4DD]/60 space-y-3 font-mono">
                  {pipelineColumns.map((col) => (
                    <div key={col.id} className="flex justify-between border-b border-[#CDD4DD]/5 pb-2">
                      <span>{col.label} stage:</span>
                      <span className="text-white font-bold">{leads.filter((l) => l.status === col.id).length} prospects</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRM Pipeline */}
          {activeTab === "crm" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Prospect Pipeline Manager</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {pipelineColumns.map((col) => {
                  const colLeads = leads.filter((l) => l.status === col.id);
                  return (
                    <div key={col.id} className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-2xl p-4 space-y-3 flex flex-col min-h-[300px]">
                      <div className="flex justify-between items-center border-b border-[#CDD4DD]/10 pb-2">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-white">{col.label}</span>
                        <span className="bg-[#27187E] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                          {colLeads.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        {colLeads.map((lead) => (
                          <div
                            key={lead.id}
                            onClick={() => handleLeadCycleStatus(lead.id, lead.status)}
                            className="bg-[#121A1B] p-3 rounded-xl border border-[#CDD4DD]/10 hover:border-[#FF7A00] cursor-pointer transition-all space-y-1"
                          >
                            <span className="font-serif font-bold text-xs text-white block truncate">{lead.company}</span>
                            <span className="text-[8px] text-[#CDD4DD]/40 block uppercase">{lead.contactName}</span>
                            <span className="text-[10px] text-[#FF7A00] block font-bold font-mono">{lead.budget}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Bookings */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">Consultation Booking Ledger</h4>

              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-wider uppercase block">{booking.packageType}</span>
                      <h4 className="font-serif font-bold text-base text-white">
                        {booking.serviceTitle.en || booking.serviceTitle.fr}
                      </h4>
                      <div className="text-xs text-[#CDD4DD]/60 font-mono space-y-1">
                        <p>Client: <strong className="text-white">{booking.clientName}</strong> ({booking.clientEmail})</p>
                        <p>Scheduled: {booking.date} at {booking.time} ({booking.timezone}) Spoken: <span className="uppercase">{booking.language}</span></p>
                        {booking.paymentMethod && <p>Payment: <span className="uppercase text-emerald-400 font-bold">{booking.paymentMethod}</span> (Ref: <span className="text-[#FF7A00]">{booking.paymentReference || booking.id}</span>)</p>}
                      </div>
                      <p className="text-[11px] text-[#CDD4DD]/40 italic bg-[#121A1B] p-3 rounded-xl border border-[#CDD4DD]/5 max-w-lg mt-2 leading-relaxed font-semibold">
                        Goals: {booking.questionnaire?.goals || "No context provided."}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 self-end sm:self-center shrink-0">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        booking.status === "confirmed" 
                          ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                          : booking.status === "awaiting_payment"
                          ? "bg-amber-950/40 border-amber-500/20 text-amber-400 animate-pulse"
                          : "bg-red-950/40 border-red-500/20 text-red-400"
                      }`}>
                        {booking.status}
                      </span>

                      {(booking.status === "pending" || booking.status === "awaiting_payment") && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookingStatus(booking.id, "confirmed")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-colors cursor-pointer"
                            title="Confirm & Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBookingStatus(booking.id, "cancelled")}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl transition-colors cursor-pointer"
                            title="Cancel booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Roadmaps */}
          {activeTab === "discoveries" && (
            <div className="space-y-4">
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-4 rounded-2xl flex flex-col md:flex-row gap-3 justify-between items-center">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search roadmaps..."
                    value={discSearch}
                    onChange={(e) => setDiscSearch(e.target.value)}
                    className="bg-[#121A1B]/55 border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E] w-64 font-semibold"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 bg-[#27187E] hover:bg-[#121A1B] text-white text-xs font-bold uppercase rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-sm w-full md:w-auto justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List pane */}
                <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {discoveries
                    .filter((d) => (d.answers?.companyName || "").toLowerCase().includes(discSearch.toLowerCase()))
                    .map((disc) => (
                      <div
                        key={disc.id}
                        onClick={() => setSelectedDisc(disc)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          selectedDisc?.id === disc.id
                            ? "bg-[#27187E]/20 border-[#27187E]"
                            : "bg-[#1A2324] border-[#CDD4DD]/10 hover:border-[#27187E]/50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <h5 className="font-serif font-bold text-xs text-white">{disc.answers?.companyName}</h5>
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400">
                            {disc.summary?.complexity || "Medium"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#CDD4DD]/50 font-mono">Industry: {disc.answers?.industry}</p>
                      </div>
                    ))}
                </div>

                {/* Detail pane */}
                <div className="lg:col-span-7">
                  {selectedDisc ? (
                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-2xl space-y-6">
                      <div className="pb-4 border-b border-[#CDD4DD]/10 flex justify-between items-center gap-4">
                        <div>
                          <span className="text-[8px] font-mono tracking-widest text-[#CDD4DD]/40 block">SCOPING BLUEPRINT</span>
                          <h4 className="font-serif font-bold text-base text-white">{selectedDisc.summary?.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConvertToLead(selectedDisc)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-sans font-bold uppercase transition-colors"
                          >
                            CRM Convert
                          </button>
                          <button
                            onClick={() => handleDeleteDiscovery(selectedDisc.id)}
                            className="bg-red-950/40 hover:bg-red-900/35 border border-red-500/20 text-red-400 p-1.5 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs">
                        <p>Company: <strong className="text-white">{selectedDisc.answers?.companyName}</strong>, Industry: <strong className="text-white">{selectedDisc.answers?.industry}</strong>, Budget: <strong className="text-white">{selectedDisc.answers?.budgetRange}</strong></p>
                        <p className="italic bg-[#121A1B] p-3 rounded-lg border border-[#CDD4DD]/5 text-[#CDD4DD]/55">
                          Challenges: "{selectedDisc.answers?.challenges}"
                        </p>
                        <div className="border-t border-[#CDD4DD]/5 pt-4">
                          <strong className="block text-[9px] font-sans uppercase mb-2">Automated Roadmap Overview</strong>
                          <div className="bg-[#121A1B] p-4 rounded-xl border border-[#CDD4DD]/5 text-[10px] font-mono text-[#CDD4DD]/50 max-h-48 overflow-y-auto whitespace-pre-wrap">
                            {selectedDisc.summary?.overviewMarkdown}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-8 border border-dashed border-[#CDD4DD]/10 rounded-2xl bg-[#1A2324] text-[#CDD4DD]/30">
                      Select a discovery blueprint to inspect details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Payments Review */}
          {activeTab === "payments" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Payment Link Generator */}
              <div className="lg:col-span-5 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-6 self-start">
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">INVOICE GENERATOR</span>
                  <h4 className="font-serif font-bold text-lg text-white">Generate Payment Link</h4>
                  <p className="text-[10px] text-[#CDD4DD]/50">Create a customized, pre-filled checkout link for client billing.</p>
                </div>

                <form onSubmit={handleGenerateLink} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Client Name</label>
                      <input
                        type="text"
                        value={genClientName}
                        onChange={(e) => setGenClientName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Client Email Address</label>
                      <input
                        type="email"
                        value={genEmail}
                        onChange={(e) => setGenEmail(e.target.value)}
                        placeholder="e.g. partner@company.com"
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Consulting Service Tier</label>
                    <select
                      value={genServiceId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGenServiceId(val);
                        if (val !== "custom" && val !== "") {
                          const selected = (consultingServices.length > 0 ? consultingServices : consultingOffers).find(s => s.id === val);
                          if (selected) setGenAmount(String(selected.price));
                        } else {
                          setGenAmount("");
                        }
                      }}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                    >
                      <option value="">-- Select --</option>
                      {(consultingServices.length > 0 ? consultingServices : consultingOffers).map((offer) => (
                        <option key={offer.id} value={offer.id}>
                          {(offer.title?.en || offer.title) as string} (${offer.price})
                        </option>
                      ))}
                      <option value="custom">Custom Service / Invoice</option>
                    </select>
                  </div>

                  {genServiceId === "custom" && (
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Custom Service Title</label>
                      <input
                        type="text"
                        required
                        value={genCustomTitle}
                        onChange={(e) => setGenCustomTitle(e.target.value)}
                        placeholder="e.g. Specialized Security Audit"
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Billing Currency</label>
                      <select
                        value={genCurrency}
                        onChange={(e) => setGenCurrency(e.target.value)}
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="GDS">GDS - Haitian Gourde</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Billing Amount</label>
                      <input
                        type="number"
                        required
                        value={genAmount}
                        onChange={(e) => setGenAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Build Payment URL
                  </button>
                </form>

                {generatedLink && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#121A1B] border border-[#CDD4DD]/10 p-4 rounded-xl space-y-3"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold text-[#FF7A00] uppercase tracking-wider">
                      <span>PRE-FILLED INVOICE CHECKOUT URL</span>
                      <button
                        onClick={handleCopyLink}
                        className="text-white hover:text-[#FF7A00] flex items-center gap-1 cursor-pointer"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>Copy URL</span>
                      </button>
                    </div>
                    <div className="bg-[#1A2324] border border-[#CDD4DD]/5 p-3 rounded-lg text-[10px] font-mono text-gray-300 break-all select-all">
                      {generatedLink}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Submitted Payments Ledger Table */}
              <div className="lg:col-span-7 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 self-start">
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">VERIFICATION INBOX</span>
                  <h4 className="font-serif font-bold text-lg text-white">Client Receipt Approvals</h4>
                  <p className="text-[10px] text-[#CDD4DD]/50">Inspect proof-of-payment receipts uploaded to CDN Storage and verify payments.</p>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto pr-2 animate-fadeIn">
                  {payments.length === 0 ? (
                    <div className="text-center py-12 text-[#CDD4DD]/30 border border-dashed border-[#CDD4DD]/10 rounded-2xl">
                      No payment receipts submitted yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                          <th className="py-3 px-4">Client / Service</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Method / Ref</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CDD4DD]/5">
                        {payments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-[#121A1B]/30">
                            <td className="py-3 px-4 space-y-1">
                              <div className="font-semibold text-white truncate max-w-[160px]">{pay.clientName || "Anonymous"}</div>
                              <div className="text-[10px] text-[#CDD4DD]/40 font-mono truncate max-w-[160px]">{pay.clientEmail}</div>
                              <div className="text-[10px] text-[#FF7A00] font-medium truncate max-w-[160px]">{pay.service}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-white">
                               {pay.currency === "GDS" ? `${pay.amount} GDS` : `$${pay.amount}`}
                             </td>
                            <td className="py-3 px-4 space-y-0.5 font-mono text-[10px]">
                              <div className="uppercase text-emerald-400 font-bold">{pay.paymentMethod}</div>
                              <div className="text-[#CDD4DD]/40">Ref: {pay.paymentReference}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                                pay.status === "paid"
                                  ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                  : pay.status === "pending"
                                  ? "bg-amber-950/40 border-amber-500/20 text-amber-400 animate-pulse"
                                  : "bg-red-950/40 border-red-500/20 text-red-400"
                              }`}>
                                {pay.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-y-1.5">
                              {pay.invoiceUrl && (
                                <a
                                  href={pay.invoiceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-block bg-[#121A1B] hover:bg-[#CDD4DD]/10 border border-[#CDD4DD]/10 text-white text-[9px] font-bold uppercase px-2 py-1 rounded transition-colors text-center w-full"
                                >
                                  View Screenshot
                                </a>
                              )}
                              
                              {pay.status === "pending" && (
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => handleVerifyPayment(pay.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-md transition-colors cursor-pointer"
                                    title="Approve Receipt"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectPayment(pay.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md transition-colors cursor-pointer"
                                    title="Reject / Mark Overdue"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: Site & Payment Settings */}
          {activeTab === "settings" && (
            <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 sm:p-8 rounded-3xl space-y-8">
              
              {/* Feature Flags */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-[#FF7A00] tracking-wider uppercase border-b border-[#CDD4DD]/10 pb-2">
                  1. Feature Toggles
                </h4>
                <div className="flex items-center justify-between p-4 bg-[#121A1B]/55 rounded-2xl border border-[#CDD4DD]/5">
                  <div>
                    <span className="text-sm font-semibold text-white block">Training Section Status</span>
                    <span className="text-[10px] text-[#CDD4DD]/40">Active display of Academy & Workshops. If toggled off, showing Coming Soon.</span>
                  </div>
                  <button
                    onClick={() => setSiteSettings({ ...siteSettings, trainingEnabled: !siteSettings.trainingEnabled })}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                      siteSettings.trainingEnabled ? "bg-[#27187E]" : "bg-gray-700"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                      siteSettings.trainingEnabled ? "translate-x-6" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Dynamic Profiles */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-white tracking-wider uppercase border-b border-[#CDD4DD]/10 pb-2">
                  2. Dynamic Media Links
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Profile Picture URL Link</label>
                    <div className="relative">
                      <Image className="w-4 h-4 text-[#CDD4DD]/30 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={siteSettings.profileImageUrl}
                        onChange={(e) => setSiteSettings({ ...siteSettings, profileImageUrl: e.target.value })}
                        placeholder="Paste image link here... e.g. https://images.unsplash.com/..."
                        className="w-full bg-[#121A1B]/55 border border-[#CDD4DD]/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-white tracking-wider uppercase border-b border-[#CDD4DD]/10 pb-2">
                  3. Social Media Targets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">GitHub Link</label>
                    <input
                      type="text"
                      value={siteSettings.socialLinks?.github || ""}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        socialLinks: { ...siteSettings.socialLinks, github: e.target.value }
                      })}
                      className="w-full bg-[#121A1B]/55 border border-[#CDD4DD]/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">LinkedIn Link</label>
                    <input
                      type="text"
                      value={siteSettings.socialLinks?.linkedin || ""}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        socialLinks: { ...siteSettings.socialLinks, linkedin: e.target.value }
                      })}
                      className="w-full bg-[#121A1B]/55 border border-[#CDD4DD]/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Twitter Link</label>
                    <input
                      type="text"
                      value={siteSettings.socialLinks?.twitter || ""}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        socialLinks: { ...siteSettings.socialLinks, twitter: e.target.value }
                      })}
                      className="w-full bg-[#121A1B]/55 border border-[#CDD4DD]/10 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-white tracking-wider uppercase border-b border-[#CDD4DD]/10 pb-2">
                  4. Payment Configurations & Details
                </h4>

                <div className="grid grid-cols-1 gap-6">
                  {paymentConfig.methods?.map((method, idx) => (
                    <div
                      key={method.id}
                      className="bg-[#121A1B]/55 p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-xs font-bold uppercase block text-white">{method.name} ({method.type})</span>
                          <span className="text-[9px] text-[#CDD4DD]/45">Specify active endpoints detail properties.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedMethods = [...(paymentConfig.methods || [])];
                            updatedMethods[idx] = { ...method, enabled: !method.enabled };
                            setPaymentConfig({ methods: updatedMethods });
                          }}
                          className={`w-10 h-5 rounded-full p-0.5 transition-all ${
                            method.enabled ? "bg-[#27187E]" : "bg-gray-700"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                            method.enabled ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Logo URL Link</label>
                          <input
                            type="text"
                            value={method.logoUrl || ""}
                            onChange={(e) => {
                              const updatedMethods = [...(paymentConfig.methods || [])];
                              updatedMethods[idx] = { ...method, logoUrl: e.target.value };
                              setPaymentConfig({ methods: updatedMethods });
                            }}
                            placeholder="Logo image URL link..."
                            className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white"
                          />
                        </div>

                        {/* Condition fields based on type */}
                        {method.type === "mobile" && (
                          <div>
                            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Phone Number</label>
                            <input
                              type="text"
                              value={method.phoneNumber || ""}
                              onChange={(e) => {
                                const updatedMethods = [...(paymentConfig.methods || [])];
                                updatedMethods[idx] = { ...method, phoneNumber: e.target.value };
                                setPaymentConfig({ methods: updatedMethods });
                              }}
                              placeholder="e.g. +509 3700 0000"
                              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white"
                            />
                          </div>
                        )}

                        {method.type === "bank" && (
                          <>
                            <div>
                              <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Account Number</label>
                              <input
                                type="text"
                                value={method.accountNumber || ""}
                                onChange={(e) => {
                                  const updatedMethods = [...(paymentConfig.methods || [])];
                                  updatedMethods[idx] = { ...method, accountNumber: e.target.value };
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                placeholder="Account number..."
                                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Account Holder Name</label>
                              <input
                                type="text"
                                value={method.accountHolder || ""}
                                onChange={(e) => {
                                  const updatedMethods = [...(paymentConfig.methods || [])];
                                  updatedMethods[idx] = { ...method, accountHolder: e.target.value };
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                placeholder="Full name..."
                                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white"
                              />
                            </div>
                          </>
                        )}

                        {method.type === "international" && (
                          <div>
                            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Account Email (Wise/Paypal)</label>
                            <input
                              type="text"
                              value={method.email || ""}
                              onChange={(e) => {
                                const updatedMethods = [...(paymentConfig.methods || [])];
                                updatedMethods[idx] = { ...method, email: e.target.value };
                                setPaymentConfig({ methods: updatedMethods });
                              }}
                              placeholder="e.g. billing@domain.com"
                              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action save button */}
              <div className="pt-6 border-t border-[#CDD4DD]/10 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-8 py-3.5 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Console Parameters
                </button>
              </div>

            </div>
          )}

          {/* TAB 6: User Accounts Control */}
          {activeTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Pane */}
              <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-6 self-start animate-fadeIn">
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">PROVISIONING CONSOLE</span>
                  <h4 className="font-serif font-bold text-lg text-white">Add New User Account</h4>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Jean-Claude"
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="e.g. user@domain.com"
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Passkey Credentials</label>
                    <input
                      type="password"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Security Access Level</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                    >
                      <option value="client">Client Portal Access (client)</option>
                      <option value="admin">Administrator Console (admin)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Onboard Account
                  </button>
                </form>
              </div>

              {/* Table Pane */}
              <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 animate-fadeIn">
                <div>
                  <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">CREDENTIAL REGISTER</span>
                  <h4 className="font-serif font-bold text-lg text-white">Active User Accounts</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Created At</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CDD4DD]/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#121A1B]/30">
                          <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                          <td className="py-3 px-4 font-mono text-[#CDD4DD]/70">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[9px] uppercase px-2 py-0.5 rounded-md border font-bold ${
                              u.role === "admin"
                                ? "bg-purple-950/40 border-purple-500/20 text-purple-400"
                                : "bg-blue-950/40 border-blue-500/20 text-blue-400"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#CDD4DD]/40">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CMS Databases */}
          {activeTab === "cms" && (
            <div className="space-y-6">
              {/* CMS Sub-navigation */}
              <div className="flex flex-wrap gap-2 border-b border-[#CDD4DD]/10 pb-4 text-xs font-bold uppercase tracking-wider font-sans">
                {[
                  { id: "translations", label: "Translations" },
                  { id: "projects", label: "Case Studies (Projects)" },
                  { id: "training", label: "Training Programs" },
                  { id: "services", label: "Consulting Services" },
                  { id: "faqs", label: "FAQs" }
                ].map((subTab) => (
                  <button
                    key={subTab.id}
                    type="button"
                    onClick={() => setCmsSubTab(subTab.id as any)}
                    className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                      cmsSubTab === subTab.id
                        ? "bg-[#FF7A00] text-white"
                        : "bg-[#1A2324] border border-[#CDD4DD]/10 text-[#CDD4DD]/50 hover:border-[#FF7A00]/50"
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* 1. Translations Editor */}
              {cmsSubTab === "translations" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Form: Add Translation */}
                  <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 self-start animate-fadeIn">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">DICTIONARY REGISTRY</span>
                      <h4 className="font-serif font-bold text-lg text-white">Add Translation Key</h4>
                    </div>
                    <form onSubmit={handleAddTranslation} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Unique Translation Key</label>
                        <input
                          type="text"
                          required
                          value={newTransKey}
                          onChange={(e) => setNewTransKey(e.target.value)}
                          placeholder="e.g. general.welcome"
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">English Translation (EN)</label>
                        <textarea
                          required
                          value={newTransEn}
                          onChange={(e) => setNewTransEn(e.target.value)}
                          placeholder="English text..."
                          rows={3}
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">French Translation (FR)</label>
                        <textarea
                          required
                          value={newTransFr}
                          onChange={(e) => setNewTransFr(e.target.value)}
                          placeholder="French text..."
                          rows={3}
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Register Translation
                      </button>
                    </form>
                  </div>

                  {/* Right Table: Translations Spreadsheet */}
                  <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">LOCALIZATION SPREADSHEET</span>
                        <h4 className="font-serif font-bold text-lg text-white">Dynamic Translation Strings</h4>
                      </div>
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-[#CDD4DD]/30 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search key or text..."
                          value={transSearch}
                          onChange={(e) => setTransSearch(e.target.value)}
                          className="bg-[#121A1B]/55 border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF7A00] w-full"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                            <th className="py-3 px-4 w-[25%]">Key</th>
                            <th className="py-3 px-4 w-[35%]">English (EN)</th>
                            <th className="py-3 px-4 w-[35%]">French (FR)</th>
                            <th className="py-3 px-4 text-right w-[5%]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {translations
                            .filter(t => 
                              (t.key || "").toLowerCase().includes(transSearch.toLowerCase()) ||
                              (t.en || "").toLowerCase().includes(transSearch.toLowerCase()) ||
                              (t.fr || "").toLowerCase().includes(transSearch.toLowerCase())
                            )
                            .map((t) => (
                              <tr key={t.key} className="hover:bg-[#121A1B]/30 align-top">
                                <td className="py-3 px-4 font-mono text-[10px] text-gray-300 font-bold break-all">{t.key}</td>
                                <td className="py-3 px-4">
                                  {editingTransKey === t.key ? (
                                    <textarea
                                      value={editingTransEn}
                                      onChange={(e) => setEditingTransEn(e.target.value)}
                                      rows={3}
                                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                                    />
                                  ) : (
                                    <div className="text-[11px] text-[#CDD4DD]/70 whitespace-pre-wrap">{t.en}</div>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {editingTransKey === t.key ? (
                                    <textarea
                                      value={editingTransFr}
                                      onChange={(e) => setEditingTransFr(e.target.value)}
                                      rows={3}
                                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                                    />
                                  ) : (
                                    <div className="text-[11px] text-[#CDD4DD]/70 whitespace-pre-wrap">{t.fr}</div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {editingTransKey === t.key ? (
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveTranslation(t.key, editingTransEn, editingTransFr)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-colors cursor-pointer"
                                        title="Save"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingTransKey(null)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 rounded transition-colors cursor-pointer"
                                        title="Cancel"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingTransKey(t.key);
                                          setEditingTransEn(t.en || "");
                                          setEditingTransFr(t.fr || "");
                                        }}
                                        className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                                        title="Edit"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTranslation(t.key)}
                                        className="text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Case Studies Editor */}
              {cmsSubTab === "projects" && (
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">PORTFOLIO REGISTRY</span>
                      <h4 className="font-serif font-bold text-lg text-white">Case Studies (Projects)</h4>
                    </div>
                    {!isProjectFormOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(null);
                          setIsProjectFormOpen(true);
                        }}
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Case Study</span>
                      </button>
                    )}
                  </div>

                  {isProjectFormOpen ? (
                    <ProjectEditForm 
                      project={selectedProject} 
                      onSave={handleSaveProject} 
                      onCancel={() => {
                        setIsProjectFormOpen(false);
                        setSelectedProject(null);
                      }} 
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                            <th className="py-3 px-4">Title</th>
                            <th className="py-3 px-4">Category (EN)</th>
                            <th className="py-3 px-4">Technologies</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {cmsProjects.map((p) => (
                            <tr key={p.id} className="hover:bg-[#121A1B]/30">
                              <td className="py-3 px-4 font-semibold text-white">{p.title}</td>
                              <td className="py-3 px-4 text-[#CDD4DD]/70">{p.category?.en || p.category}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {p.technologies?.map((tech: string) => (
                                    <span key={tech} className="bg-[#121A1B] text-[#CDD4DD]/50 text-[9px] px-1.5 py-0.5 rounded border border-[#CDD4DD]/5 font-mono">{tech}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProject(p);
                                    setIsProjectFormOpen(true);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProject(p.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Training Programs Editor */}
              {cmsSubTab === "training" && (
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">ACADEMY REGISTRY</span>
                      <h4 className="font-serif font-bold text-lg text-white">Training Programs</h4>
                    </div>
                    {!isTrainingFormOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTraining(null);
                          setIsTrainingFormOpen(true);
                        }}
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Program</span>
                      </button>
                    )}
                  </div>

                  {isTrainingFormOpen ? (
                    <TrainingEditForm 
                      program={selectedTraining} 
                      onSave={handleSaveTraining} 
                      onCancel={() => {
                        setIsTrainingFormOpen(false);
                        setSelectedTraining(null);
                      }} 
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                            <th className="py-3 px-4">Title (EN)</th>
                            <th className="py-3 px-4">Duration</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {trainingPrograms.map((t) => (
                            <tr key={t.id} className="hover:bg-[#121A1B]/30">
                              <td className="py-3 px-4 font-semibold text-white">{t.title?.en || t.title}</td>
                              <td className="py-3 px-4 text-[#CDD4DD]/70">{t.duration || t.readingTime}</td>
                              <td className="py-3 px-4 text-gray-400 capitalize">{t.category}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTraining(t);
                                    setIsTrainingFormOpen(true);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTraining(t.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Consulting Services Editor */}
              {cmsSubTab === "services" && (
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">SERVICES REGISTRY</span>
                      <h4 className="font-serif font-bold text-lg text-white">Consulting Services & Pricing</h4>
                    </div>
                    {!isServiceFormOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedServiceCMS(null);
                          setIsServiceFormOpen(true);
                        }}
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Offering</span>
                      </button>
                    )}
                  </div>

                  {isServiceFormOpen ? (
                    <ServiceEditForm 
                      service={selectedServiceCMS} 
                      onSave={handleSaveService} 
                      onCancel={() => {
                        setIsServiceFormOpen(false);
                        setSelectedServiceCMS(null);
                      }} 
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                            <th className="py-3 px-4">Title (EN)</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Duration</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {consultingServices.map((s) => (
                            <tr key={s.id} className="hover:bg-[#121A1B]/30">
                              <td className="py-3 px-4 font-semibold text-white">{s.title?.en || s.title}</td>
                              <td className="py-3 px-4 font-bold text-emerald-400">${s.price}</td>
                              <td className="py-3 px-4 text-[#CDD4DD]/70">{s.duration} mins</td>
                              <td className="py-3 px-4 text-gray-400 capitalize">{s.category}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedServiceCMS(s);
                                    setIsServiceFormOpen(true);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteService(s.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 5. FAQs Editor */}
              {cmsSubTab === "faqs" && (
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">FAQ REGISTRY</span>
                      <h4 className="font-serif font-bold text-lg text-white">Frequently Asked Questions</h4>
                    </div>
                    {!isFAQFormOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFAQ(null);
                          setIsFAQFormOpen(true);
                        }}
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add FAQ</span>
                      </button>
                    )}
                  </div>

                  {isFAQFormOpen ? (
                    <FAQEditForm 
                      faq={selectedFAQ} 
                      onSave={handleSaveFAQ} 
                      onCancel={() => {
                        setIsFAQFormOpen(false);
                        setSelectedFAQ(null);
                      }} 
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                            <th className="py-3 px-4">Question (EN)</th>
                            <th className="py-3 px-4">Answer (EN)</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {faqItems.map((f) => (
                            <tr key={f.id} className="hover:bg-[#121A1B]/30 align-top">
                              <td className="py-3 px-4 font-semibold text-white w-[40%]">{f.question?.en || f.question}</td>
                              <td className="py-3 px-4 text-[#CDD4DD]/70 w-[45%] line-clamp-2 max-w-sm truncate">{f.answer?.en || f.answer}</td>
                              <td className="py-3 px-4 text-right space-x-2 w-[15%]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFAQ(f);
                                    setIsFAQFormOpen(true);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFAQ(f.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
