"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, TrendingUp, DollarSign, Users, Calendar, ArrowRight, 
  RefreshCw, Layers, Check, X, AlertCircle, Search, Filter, 
  Download, Brain, Clipboard, ChevronRight, Cpu, Building2, Trash2,
  Settings, Image as ImageIcon, Globe, CheckCircle2, Save, LogOut, Plus, Edit,
  LayoutDashboard, UserCheck, FileText, BookOpen, HelpCircle, FolderKanban, Link,
  MessageSquare, History, Share2, BarChart3, Flame, Star, Percent, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Booking, CRMLead, ProjectDiscovery, PaymentConfig, SiteSettings } from "@/lib/types";
import { ProjectEditForm, TrainingEditForm, ServiceEditForm, FAQEditForm, BusinessProfileForm } from "@/components/admin/CMSForms";
import MediaLibrary from "@/components/admin/MediaLibrary";
import WebsiteBuilder from "@/components/admin/WebsiteBuilder";
import InvoiceManager from "@/components/admin/InvoiceManager";
import ClientBillingManager from "@/components/admin/ClientBillingManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import BrandAssetsForm from "@/components/admin/BrandAssetsForm";
import SEOCenterForm from "@/components/admin/SEOCenterForm";
import WhatsAppTemplatesManager from "@/components/admin/WhatsAppTemplatesManager";
import WhatsAppHistoryTable from "@/components/admin/WhatsAppHistoryTable";
import SharedLinksManager from "@/components/admin/SharedLinksManager";
import WhatsAppAnalyticsDashboard from "@/components/admin/WhatsAppAnalyticsDashboard";
import { getGoogleCalendarUrl } from "@/lib/googleCalendar";

type DashboardTab = 
  | "analytics" | "crm" | "bookings" | "discoveries" | "payments" 
  | "cms_sections" | "cms_case_studies" | "cms_training" | "cms_services" | "cms_faqs" | "cms_translations" | "cms_media"
  | "cms_invoices" | "cms_billing_profiles" | "cms_business_profile"
  | "cms_seo" | "cms_brand" | "cms_testimonials"
  | "wa_templates" | "wa_history" | "wa_shared_links" | "wa_analytics"
  | "users" | "settings"
  | "client_messages" | "client_tasks" | "client_projects";

interface ProjectDescData {
  text: string;
  adminFeedback?: string;
  clientFeedback?: string;
}

const parseProjectDesc = (desc: string): ProjectDescData => {
  try {
    if (desc && desc.trim().startsWith("{")) {
      const parsed = JSON.parse(desc);
      return {
        text: parsed.text || "",
        adminFeedback: parsed.adminFeedback || "",
        clientFeedback: parsed.clientFeedback || ""
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    text: desc || "",
    adminFeedback: "",
    clientFeedback: ""
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("analytics");
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Server state data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [discoveries, setDiscoveries] = useState<ProjectDiscovery[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Client portal integrations (messages, tasks, projects)
  const [portalMessages, setPortalMessages] = useState<any[]>([]);
  const [portalTasks, setPortalTasks] = useState<any[]>([]);
  const [clientProjects, setClientProjects] = useState<any[]>([]);

  // Chat panel states
  const [chatActiveEmail, setChatActiveEmail] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState("");

  // Task filtering & modal states
  const [taskFilterAssignee, setTaskFilterAssignee] = useState("all");
  const [taskFilterClient, setTaskFilterClient] = useState("all");
  const [taskFilterStatus, setTaskFilterStatus] = useState("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  
  // Task form fields
  const [taskFormTitle, setTaskFormTitle] = useState("");
  const [taskFormDesc, setTaskFormDesc] = useState("");
  const [taskFormDeadline, setTaskFormDeadline] = useState("");
  const [taskFormAssignedTo, setTaskFormAssignedTo] = useState<"client" | "amedee">("client");
  const [taskFormClientEmail, setTaskFormClientEmail] = useState("");

  // Project states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projectFormClientEmail, setProjectFormClientEmail] = useState("");
  const [projectFormTitle, setProjectFormTitle] = useState("");
  const [projectFormDescText, setProjectFormDescText] = useState("");
  const [projectFormStatus, setProjectFormStatus] = useState<"not_started" | "in_progress" | "review" | "completed">("not_started");
  const [projectFormProgress, setProjectFormProgress] = useState(0);
  const [projectFormStartDate, setProjectFormStartDate] = useState("");
  const [projectFormTargetLaunch, setProjectFormTargetLaunch] = useState("");
  const [projectFormAdminFeedback, setProjectFormAdminFeedback] = useState("");
  const [projectFormClientFeedback, setProjectFormClientFeedback] = useState("");

  // BI Center & Consulting states (V3)
  const [biData, setBiData] = useState<any>({
    mtdRevenue: 0,
    ytdRevenue: 0,
    pipelineValue: 0,
    consultingHours: 0,
    trainingRegistrations: 0,
    revenueByMonth: [],
    leadsPipeline: []
  });
  const [billingProfiles, setBillingProfiles] = useState<any[]>([]);
  const [consultingLogs, setConsultingLogs] = useState<any[]>([]);
  const [logClientId, setLogClientId] = useState("");
  const [logHours, setLogHours] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);

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
      const authRes = await fetch("/api/auth/status");
      if (!authRes.ok) {
        router.push("/admin/login");
        return;
      }
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
        transRes, projectsRes, trainingRes, faqRes, servicesRes, messagesRes, tasksRes, clientProjRes
      ] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/leads", { cache: "no-store" }),
        fetch("/api/discoveries", { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
        fetch("/api/payment-config", { cache: "no-store" }),
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/payments", { cache: "no-store" }),
        fetch("/api/translations", { cache: "no-store" }),
        fetch("/api/case-studies", { cache: "no-store" }),
        fetch("/api/training-programs", { cache: "no-store" }),
        fetch("/api/faq-items", { cache: "no-store" }),
        fetch("/api/consulting-services", { cache: "no-store" }),
        fetch("/api/messages", { cache: "no-store" }),
        fetch("/api/tasks", { cache: "no-store" }),
        fetch("/api/projects", { cache: "no-store" })
      ]);

      setBookings(bookingsRes.ok ? await bookingsRes.json() : []);
      setLeads(leadsRes.ok ? await leadsRes.json() : []);
      setDiscoveries(discoveriesRes.ok ? await discoveriesRes.json() : []);
      setSiteSettings(settingsRes.ok ? await settingsRes.json() : { trainingEnabled: true });
      setPaymentConfig(paymentRes.ok ? await paymentRes.json() : { methods: [] });
      setUsers(usersRes.ok ? await usersRes.json() : []);
      setPayments(paymentsRes.ok ? await paymentsRes.json() : []);
      setPortalMessages(messagesRes.ok ? await messagesRes.json() : []);
      setPortalTasks(tasksRes.ok ? await tasksRes.json() : []);
      setClientProjects(clientProjRes.ok ? await clientProjRes.json() : []);
      
      // V3 BI Fetching
      const biRes = await fetch("/api/analytics/bi", { cache: "no-store" });
      if (biRes.ok) {
        setBiData(await biRes.json());
      }
      const bpRes = await fetch("/api/client-billing-profiles", { cache: "no-store" });
      if (bpRes.ok) {
        setBillingProfiles(await bpRes.json());
      }
      const chRes = await fetch("/api/consulting-hours", { cache: "no-store" });
      if (chRes.ok) {
        setConsultingLogs(await chRes.json());
      }

      setTranslations(transRes.ok ? await transRes.json() : []);
      setCmsProjects(projectsRes.ok ? await projectsRes.json() : []);
      setTrainingPrograms(trainingRes.ok ? await trainingRes.json() : []);
      setFaqItems(faqRes.ok ? await faqRes.json() : []);
      setConsultingServices(servicesRes.ok ? await servicesRes.json() : []);
    } catch (err: any) {
      setError(err.message || "Failed to load database records.");
    }
  };

  // Client Projects CRUD operations
  const handleSaveClientProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormTitle.trim() || !projectFormClientEmail) return;

    const descObj = {
      text: projectFormDescText,
      adminFeedback: projectFormAdminFeedback,
      clientFeedback: projectFormClientFeedback
    };

    const payload = {
      clientEmail: projectFormClientEmail,
      title: projectFormTitle,
      description: JSON.stringify(descObj),
      status: projectFormStatus,
      progress: Number(projectFormProgress),
      startDate: projectFormStartDate,
      targetLaunch: projectFormTargetLaunch
    };

    try {
      let res;
      if (editingProject) {
        res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        const newProj = {
          id: "p_" + crypto.randomUUID(),
          ...payload
        };
        res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProj)
        });
      }

      if (res.ok) {
        setShowProjectModal(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to save client project:", err);
    }
  };

  const handleDeleteClientProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to delete client project:", err);
    }
  };

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logClientId || !logHours) return;
    try {
      const res = await fetch("/api/consulting-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: logClientId,
          hoursLogged: Number(logHours),
          description: logDesc,
          activityDate: logDate
        })
      });
      if (res.ok) {
        setLogHours("");
        setLogDesc("");
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this time entry?")) return;
    try {
      const res = await fetch(`/api/consulting-hours/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Secure Cache Invalidation (ISR) Trigger
  const triggerRevalidation = async () => {
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/[locale]", type: "layout" })
      });
      if (res.ok) {
        console.log("Next.js Page Cache purged successfully.");
      }
    } catch (err) {
      console.error("ISR revalidation failed:", err);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Translations CRUD
  const handleSaveTranslation = async (key: string, enVal: string, frVal: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/translations/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ en: enVal, fr: frVal }),
      });
      if (!res.ok) throw new Error("Failed to save translation.");
      const updated = await res.json();
      setTranslations(translations.map((t) => (t.key === key ? updated : t)));
      setEditingTransKey(null);
      showToast("Translation updated successfully!");
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to save translation.");
    }
  };

  const handleAddTranslation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newTransKey, en: newTransEn, fr: newTransFr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add translation.");
      setTranslations([data, ...translations]);
      setNewTransKey("");
      setNewTransEn("");
      setNewTransFr("");
      showToast("Translation key registered!");
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to add translation.");
    }
  };

  const handleDeleteTranslation = async (key: string) => {
    if (!confirm("Are you sure you want to delete this translation key?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/translations/${key}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete translation.");
      setTranslations(translations.filter((t) => t.key !== key));
      showToast("Translation deleted!");
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to delete translation.");
    }
  };

  // Case Studies CRUD
  const handleSaveProject = async (projectData: any) => {
    setError(null);
    const cleanId = (projectData.id || "").trim();
    const existsInDb = cmsProjects.some((p) => p.id === cleanId || p.id === projectData.id);
    const isNew = !cleanId || !existsInDb;
    const url = isNew ? "/api/case-studies" : `/api/case-studies/${encodeURIComponent(cleanId)}`;
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
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to save project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/case-studies/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project.");
      setCmsProjects(cmsProjects.filter((p) => p.id !== id));
      showToast("Case study deleted!");
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to delete project.");
    }
  };

  // Training Programs CRUD
  const handleSaveTraining = async (trainingData: any) => {
    setError(null);
    const cleanId = (trainingData.id || "").trim();
    const existsInDb = trainingPrograms.some((t) => t.id === cleanId || t.id === trainingData.id);
    const isNew = !cleanId || !existsInDb;
    const url = isNew ? "/api/training-programs" : `/api/training-programs/${encodeURIComponent(cleanId)}`;
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
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to save training program.");
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training program?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/training-programs/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete training program.");
      setTrainingPrograms(trainingPrograms.filter((t) => t.id !== id));
      showToast("Training program deleted!");
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to delete training program.");
    }
  };

  // Consulting Services CRUD
  const handleSaveService = async (serviceData: any) => {
    setError(null);
    const cleanId = (serviceData.id || "").trim();
    const existsInDb = consultingServices.some((s) => s.id === cleanId || s.id === serviceData.id);
    const isNew = !cleanId || !existsInDb;
    const encodedId = encodeURIComponent(cleanId);
    const url = isNew ? "/api/consulting-services" : `/api/consulting-services/${encodedId}`;
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
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to save service.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this consulting service?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/consulting-services/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service.");
      setConsultingServices(consultingServices.filter((s) => s.id !== id));
      showToast("Consulting service deleted!");
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to delete service.");
    }
  };

  // FAQs CRUD
  const handleSaveFAQ = async (faqData: any) => {
    setError(null);
    const cleanId = (faqData.id || "").trim();
    const existsInDb = faqItems.some((f) => f.id === cleanId || f.id === faqData.id);
    const isNew = !cleanId || !existsInDb;
    const url = isNew ? "/api/faq-items" : `/api/faq-items/${encodeURIComponent(cleanId)}`;
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
      triggerRevalidation();
    } catch (err: any) {
      setError(err.message || "Failed to save FAQ.");
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/faq-items/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete FAQ.");
      setFaqItems(faqItems.filter((f) => f.id !== id));
      showToast("FAQ deleted!");
      triggerRevalidation();
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

  const handleUpdateEstimatedValue = async (leadId: string, currentVal: number) => {
    const val = prompt("Enter Estimated Revenue Value ($):", String(currentVal));
    if (val === null) return;
    const num = Number(val.replace(/[^\d]/g, ""));
    if (isNaN(num)) {
      alert("Please enter a valid number");
      return;
    }
    
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedValue: num }),
      });
      
      if (response.ok) {
        setLeads(leads.map((l) => (l.id === leadId ? { ...l, estimatedValue: num } : l)));
        showToast("Estimated revenue value updated!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("Are you sure you want to archive/delete this inquiry?")) return;
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setLeads(leads.filter((l) => l.id !== leadId));
        showToast("Lead archived successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromoteToDiscovery = async (leadId: string) => {
    if (!window.confirm("Promote this inquiry to the CRM pipeline?")) return;
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "discovery", notes: "Promoted to active pipeline." }),
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(leads.map((l) => (l.id === leadId ? updatedLead : l)));
        showToast("Lead promoted to Discovery stage!");
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
      link.setAttribute("download", `Invictus_Discoveries_${Date.now()}.csv`);
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

  const crmLeads = leads.filter(l => l.status !== "lead");
  const averageLeadScore = crmLeads.length > 0 
    ? Math.round(crmLeads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / crmLeads.length) 
    : 0;

  const hotLeadsCount = crmLeads.filter(l => (l.leadScore || 0) >= 75).length;
  const proposalRequestsCount = leads.filter(l => l.status === "proposal").length;
  const discoveryCallsCount = leads.filter(l => l.status === "discovery").length;

  const wonLeadsCount = leads.filter(l => l.status === "won").length;
  const lostLeadsCount = leads.filter(l => l.status === "lost").length;
  const conversionRate = (wonLeadsCount + lostLeadsCount) > 0
    ? Math.round((wonLeadsCount / (wonLeadsCount + lostLeadsCount)) * 100)
    : 0;

  const weightedRevenueForecast = leads.reduce((sum, l) => {
    const val = Number(l.estimatedValue) || 0;
    const prob = Number(l.probabilityOfClosing) || 0;
    return sum + (val * (prob / 100));
  }, 0);

  const pipelineColumns = [
    { id: "discovery", label: "Discovery" },
    { id: "proposal", label: "Proposal" },
    { id: "negotiation", label: "Negotiation" },
    { id: "won", label: "Won" },
    { id: "lost", label: "Lost" },
  ];

  // Global Search Filter logic
  const isSearchActive = globalSearchQuery.trim().length >= 2;
  const searchResults = {
    bookings: bookings.filter(b => 
      b.clientName?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      b.clientEmail?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    ),
    leads: leads.filter(l => 
      l.company?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      l.contactName?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    ),
    projects: cmsProjects.filter(p => 
      p.title?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    ),
    training: trainingPrograms.filter(t => 
      t.title?.en?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.title?.fr?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    ),
    services: consultingServices.filter(s => 
      s.title?.en?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      s.title?.fr?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    ),
    payments: payments.filter(p => 
      p.clientName?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      p.clientEmail?.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      p.paymentReference?.toLowerCase().includes(globalSearchQuery.toLowerCase())
    )
  };

  const totalSearchResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121A1B] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#FF7A00] animate-spin" />
      </div>
    );
  }

  // Workspaces groups for Left Sidebar
  const sidebarGroups = [
    {
      title: "Business Operations",
      items: [
        { id: "analytics", label: "Executive Dashboard", icon: LayoutDashboard },
        { id: "crm", label: "CRM", icon: TrendingUp },
      ]
    },
    {
      title: "Client Center & BI",
      items: [
        { id: "bookings", label: "Client Bookings", icon: Calendar },
        { id: "discoveries", label: "Discovery Roadmaps", icon: Brain },
        { id: "client_tasks", label: "Client Tasks", icon: CheckCircle2 },
        { id: "client_projects", label: "Client Projects", icon: Layers },
        { id: "payments", label: "Payment Center", icon: DollarSign },
        { id: "cms_invoices", label: "Invoice Center", icon: FileText },
        { id: "cms_billing_profiles", label: "Client Workspace Registry", icon: Users },
      ]
    },
    {
      title: "Communication Center",
      items: [
        { id: "client_messages", label: "Client Messages", icon: MessageSquare },
        { id: "wa_templates", label: "WhatsApp Templates", icon: MessageSquare },
        { id: "wa_history", label: "WhatsApp History", icon: History },
        { id: "wa_shared_links", label: "Shared Links", icon: Share2 },
        { id: "wa_analytics", label: "Analytics", icon: BarChart3 },
      ]
    },
    {
      title: "Content Studio (CMS)",
      items: [
        { id: "cms_sections", label: "Website Builder", icon: Layers },
        { id: "cms_services", label: "Services & Pricing", icon: Cpu },
        { id: "cms_media", label: "Media Center", icon: ImageIcon },
        { id: "cms_seo", label: "SEO Center", icon: Globe },
        { id: "cms_brand", label: "Brand Assets", icon: Layers },
        { id: "cms_testimonials", label: "Testimonials", icon: CheckCircle2 },
        { id: "cms_training", label: "Training", icon: BookOpen },
        { id: "cms_case_studies", label: "Insights", icon: FolderKanban },
        { id: "cms_faqs", label: "FAQs", icon: HelpCircle },
        { id: "cms_translations", label: "Translations", icon: Globe },
      ]
    },
    {
      title: "Platform Management",
      items: [
        { id: "users", label: "User Control", icon: UserCheck },
        { id: "cms_business_profile", label: "Business Profile", icon: Building2 },
        { id: "settings", label: "Console Settings", icon: Settings },
      ]
    }
  ];

  return (
    <section className="bg-[#121A1B] text-white min-h-screen relative flex overflow-hidden">
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

      {/* Left Sidebar Workspace navigation */}
      <aside className="w-64 bg-[#1A2324] border-r border-[#CDD4DD]/10 flex flex-col h-screen sticky top-0 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#CDD4DD]/10 flex items-center space-x-2.5">
          <Shield className="w-6 h-6 text-[#FF7A00]" />
          <div>
            <h2 className="font-serif font-bold text-sm tracking-wider text-white uppercase">INVICTUS CORE</h2>
            <span className="text-[8px] text-gray-500 font-mono tracking-widest uppercase">CONTROL CENTER</span>
          </div>
        </div>

        {/* Workspace Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sidebarGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[8px] font-sans font-bold text-[#CDD4DD]/30 tracking-widest uppercase px-3 block">
                {group.title}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setGlobalSearchQuery(""); // Clear search on tab switch
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center space-x-2.5 text-xs text-left cursor-pointer ${
                        isActive && !isSearchActive
                          ? "bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF7A00] font-bold"
                          : "bg-transparent border border-transparent text-[#CDD4DD]/50 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#CDD4DD]/10 space-y-2">
          <button
            onClick={fetchAdminData}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-2.5 rounded-xl text-[10px] font-mono text-gray-300 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Catalog</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-950/20 border border-red-500/20 hover:bg-red-900/30 px-3 py-2.5 rounded-xl text-[10px] font-bold text-red-400 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#121A1B] flex flex-col">
        {/* Top Header Row */}
        <header className="px-8 py-4 bg-[#1A2324]/50 border-b border-[#CDD4DD]/5 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
          {/* Global Search Box */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-[#CDD4DD]/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search across pages, clients, bookings, and payments..."
              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
            />
            {isSearchActive && (
              <button 
                onClick={() => setGlobalSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs shrink-0">
            <span className="bg-emerald-950 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full text-[10px] flex items-center space-x-1 uppercase font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>Operational</span>
            </span>
          </div>
        </header>

        {/* Dashboard Pages Body */}
        <div className="flex-1 p-8">
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-center space-x-2 mb-6 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Render Global Search Results if query active */}
          {isSearchActive ? (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">
                  SEARCH METRIC
                </span>
                <h3 className="font-serif font-bold text-xl text-white">
                  Found {totalSearchResults} matches for &ldquo;{globalSearchQuery}&rdquo;
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Bookings Matches */}
                {searchResults.bookings.length > 0 && (
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-3">
                    <span className="text-[9px] font-bold text-[#FF7A00] uppercase block">Bookings ({searchResults.bookings.length})</span>
                    <div className="space-y-2">
                      {searchResults.bookings.map(b => (
                        <div 
                          key={b.id} 
                          onClick={() => { setActiveTab("bookings"); setGlobalSearchQuery(""); }}
                          className="bg-[#121A1B] p-2.5 rounded-xl border border-transparent hover:border-[#FF7A00]/20 cursor-pointer transition-all"
                        >
                          <p className="font-bold text-white text-[11px]">{b.clientName}</p>
                          <p className="text-[9px] text-[#CDD4DD]/50">{b.clientEmail}</p>
                          <p className="text-[9px] text-gray-400">{b.packageType}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. CRM Leads Matches */}
                {searchResults.leads.length > 0 && (
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-3">
                    <span className="text-[9px] font-bold text-[#FF7A00] uppercase block">CRM Prospects ({searchResults.leads.length})</span>
                    <div className="space-y-2">
                      {searchResults.leads.map(l => (
                        <div 
                          key={l.id} 
                          onClick={() => { setActiveTab("crm"); setGlobalSearchQuery(""); }}
                          className="bg-[#121A1B] p-2.5 rounded-xl border border-transparent hover:border-[#FF7A00]/20 cursor-pointer transition-all"
                        >
                          <p className="font-bold text-white text-[11px]">{l.company}</p>
                          <p className="text-[9px] text-[#CDD4DD]/50">{l.contactName} &middot; {l.email}</p>
                          <p className="text-[9px] text-[#FF7A00] uppercase font-bold">{l.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Case Studies Matches */}
                {searchResults.projects.length > 0 && (
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-3">
                    <span className="text-[9px] font-bold text-[#FF7A00] uppercase block">Case Studies ({searchResults.projects.length})</span>
                    <div className="space-y-2">
                      {searchResults.projects.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => { setActiveTab("cms_case_studies"); setGlobalSearchQuery(""); }}
                          className="bg-[#121A1B] p-2.5 rounded-xl border border-transparent hover:border-[#FF7A00]/20 cursor-pointer transition-all"
                        >
                          <p className="font-bold text-white text-[11px]">{p.title}</p>
                          <p className="text-[9px] text-[#CDD4DD]/50">{p.id}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Training Matches */}
                {searchResults.training.length > 0 && (
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-3">
                    <span className="text-[9px] font-bold text-[#FF7A00] uppercase block">Training Programs ({searchResults.training.length})</span>
                    <div className="space-y-2">
                      {searchResults.training.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => { setActiveTab("cms_training"); setGlobalSearchQuery(""); }}
                          className="bg-[#121A1B] p-2.5 rounded-xl border border-transparent hover:border-[#FF7A00]/20 cursor-pointer transition-all"
                        >
                          <p className="font-bold text-white text-[11px]">{t.title?.en || t.title}</p>
                          <p className="text-[9px] text-gray-400 uppercase">{t.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Services Matches */}
                {searchResults.services.length > 0 && (
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-3">
                    <span className="text-[9px] font-bold text-[#FF7A00] uppercase block">Services ({searchResults.services.length})</span>
                    <div className="space-y-2">
                      {searchResults.services.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => { setActiveTab("cms_services"); setGlobalSearchQuery(""); }}
                          className="bg-[#121A1B] p-2.5 rounded-xl border border-transparent hover:border-[#FF7A00]/20 cursor-pointer transition-all"
                        >
                          <p className="font-bold text-white text-[11px]">{s.title?.en || s.title}</p>
                          <p className="text-[9px] text-[#CDD4DD]/50">${s.price} USD &middot; {s.duration} mins</p>
                          <p className="text-[9px] text-emerald-400 uppercase font-bold">{s.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Payments Matches */}
                {searchResults.payments.length > 0 && (
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-3">
                    <span className="text-[9px] font-bold text-[#FF7A00] uppercase block">Payments ({searchResults.payments.length})</span>
                    <div className="space-y-2">
                      {searchResults.payments.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => { setActiveTab("payments"); setGlobalSearchQuery(""); }}
                          className="bg-[#121A1B] p-2.5 rounded-xl border border-transparent hover:border-[#FF7A00]/20 cursor-pointer transition-all"
                        >
                          <p className="font-bold text-white text-[11px]">{p.clientName || "Anonymous"}</p>
                          <p className="text-[9px] text-[#CDD4DD]/50">{p.clientEmail}</p>
                          <p className="text-[9px] font-bold text-emerald-400">{p.amount} {p.currency}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: Analytics Dashboard (BI Center V3) */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {/* BI Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">MTD Revenue</span>
                        <h3 className="text-base font-bold font-mono text-white">${(biData.mtdRevenue || 0).toLocaleString()}</h3>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">YTD Revenue</span>
                        <h3 className="text-base font-bold font-mono text-white">${(biData.ytdRevenue || 0).toLocaleString()}</h3>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Est. Pipeline</span>
                        <h3 className="text-base font-bold font-mono text-[#FF7A00]">${(biData.pipelineValue || 0).toLocaleString()}</h3>
                      </div>
                      <div className="p-2.5 bg-[#FF7A00]/10 rounded-xl text-[#FF7A00]">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Consulting Hours</span>
                        <h3 className="text-base font-bold font-mono text-white">{biData.consultingHours || 0} hrs</h3>
                      </div>
                      <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Academy Signups</span>
                        <h3 className="text-base font-bold font-mono text-white">{biData.trainingRegistrations || 0}</h3>
                      </div>
                      <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Lead Qualification & CRM Forecast Metrics (Row 2) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Avg Lead Score</span>
                        <h3 className="text-base font-bold font-mono text-amber-400">{averageLeadScore} / 100</h3>
                      </div>
                      <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
                        <Star className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Hot Leads</span>
                        <h3 className="text-base font-bold font-mono text-red-400">{hotLeadsCount}</h3>
                      </div>
                      <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400">
                        <Flame className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Proposal Requests</span>
                        <h3 className="text-base font-bold font-mono text-purple-400">{proposalRequestsCount}</h3>
                      </div>
                      <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Discovery Calls</span>
                        <h3 className="text-base font-bold font-mono text-blue-400">{discoveryCallsCount}</h3>
                      </div>
                      <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                        <Phone className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-4 rounded-2xl flex flex-col justify-between shadow-md">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase">Conversion Rate</span>
                        <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <Percent className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-mono text-emerald-400">{conversionRate}%</h3>
                        <div className="flex justify-between text-[7px] text-[#CDD4DD]/50 font-bold uppercase tracking-tight mt-1 border-t border-[#CDD4DD]/5 pt-1">
                          <span>Won: {wonLeadsCount}</span>
                          <span>Lost: {lostLeadsCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl flex justify-between items-center shadow-md">
                      <div>
                        <span className="text-[8px] font-bold text-[#CDD4DD]/40 uppercase block">Weighted Forecast</span>
                        <h3 className="text-base font-bold font-mono text-emerald-400">${Math.round(weightedRevenueForecast).toLocaleString()}</h3>
                      </div>
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* SVG BI Charts Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Revenue Monthly Trend Area Graph */}
                    <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 shadow-md">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-base text-white">Monthly Revenue Flow ({new Date().getFullYear()})</h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">Real-Time Ledger</span>
                      </div>

                      <div className="w-full bg-[#121A1B] p-4 rounded-2xl border border-[#CDD4DD]/5 flex items-center justify-center">
                        {biData.revenueByMonth?.length > 0 ? (() => {
                          const maxVal = Math.max(...biData.revenueByMonth.map((m: any) => m.amount), 1000);
                          const width = 600;
                          const height = 180;
                          const points = biData.revenueByMonth.map((m: any, idx: number) => {
                            const x = (idx / (biData.revenueByMonth.length - 1 || 1)) * (width - 60) + 40;
                            const y = height - (m.amount / maxVal) * (height - 40) - 20;
                            return { x, y, month: m.month, amount: m.amount };
                          });

                          const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p: any) => `L ${p.x} ${p.y}`).join(" ");
                          const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 20} L ${points[0].x} ${height - 20} Z`;

                          return (
                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-xs overflow-visible">
                              <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
                                </linearGradient>
                              </defs>

                              {/* Grid lines */}
                              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                                const yVal = height - 20 - p * (height - 40);
                                return (
                                  <g key={i} className="opacity-10">
                                    <line x1="40" y1={yVal} x2={width - 20} y2={yVal} stroke="#CDD4DD" strokeDasharray="4 4" />
                                    <text x="5" y={yVal + 4} fill="#CDD4DD" className="font-mono text-[8px]">${Math.round(p * maxVal).toLocaleString()}</text>
                                  </g>
                                );
                              })}

                              {/* Render Area with Gradient */}
                              <path d={areaD} fill="url(#areaGrad)" />

                              {/* Render line path */}
                              <path d={pathD} fill="none" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" />

                              {/* Circles and Labels */}
                              {points.map((pt: any, i: number) => (
                                <g key={i}>
                                  <circle cx={pt.x} cy={pt.y} r="4" fill="#FF7A00" stroke="#121A1B" strokeWidth="1.5" />
                                  {pt.amount > 0 && (
                                    <text x={pt.x} y={pt.y - 8} fill="#white" textAnchor="middle" className="font-bold text-[8px] font-mono">${Math.round(pt.amount)}</text>
                                  )}
                                  <text x={pt.x} y={height - 5} fill="#CDD4DD" className="opacity-40 font-bold" textAnchor="middle">{pt.month}</text>
                                </g>
                              ))}
                            </svg>
                          );
                        })() : (
                          <div className="py-12 text-gray-500 font-medium">No paid invoices recorded this year.</div>
                        )}
                      </div>
                    </div>

                    {/* CRM Funnel Bar Chart */}
                    <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 shadow-md text-gray-300">
                      <h4 className="font-serif font-bold text-base text-white">Pipeline stage breakdown</h4>
                      <div className="space-y-4 pt-1">
                        {biData.leadsPipeline?.map((stage: any) => {
                          const pct = biData.pipelineValue > 0 ? (stage.value / biData.pipelineValue) * 100 : 0;
                          return (
                            <div key={stage.status} className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold uppercase tracking-wider text-[#CDD4DD]/60">{stage.status} ({stage.count})</span>
                                <span className="font-mono text-white font-bold">${(stage.value || 0).toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-[#121A1B] h-2.5 rounded-full overflow-hidden border border-[#CDD4DD]/5">
                                <div 
                                  className="bg-gradient-to-r from-[#FF7A00] to-amber-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>


                  {/* Executive CRM Insights Panel (Row 3) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Qualified Leads */}
                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 shadow-md text-gray-300">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-base text-white">Top Prospects</h4>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/20">Lead Score</span>
                      </div>
                      
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {leads
                          .filter(l => l.status !== "lead")
                          .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
                          .slice(0, 5)
                          .map((l) => {
                            const score = l.leadScore ?? 0;
                            let color = "text-gray-400 bg-gray-950/40 border-gray-500/20";
                            if (score >= 90) color = "text-purple-400 bg-purple-950/40 border-purple-500/20";
                            else if (score >= 75) color = "text-red-400 bg-red-950/40 border-red-500/20";
                            else if (score >= 60) color = "text-amber-400 bg-amber-950/40 border-amber-500/20";
                            else if (score >= 40) color = "text-blue-400 bg-blue-950/40 border-blue-500/20";

                            return (
                              <div key={l.id} className="flex justify-between items-center bg-[#121A1B] border border-[#CDD4DD]/5 p-3 rounded-xl hover:border-[#FF7A00]/25 transition-all">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-white text-[11px] truncate max-w-[150px]">{l.company}</div>
                                  <div className="text-[9px] text-[#CDD4DD]/50">{l.contactName} • {l.projectType || "Proposal"}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {Number(l.estimatedValue || 0) > 0 && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-400">${Number(l.estimatedValue).toLocaleString()}</span>
                                  )}
                                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${color}`}>
                                    {score}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        {leads.filter(l => l.status !== "lead").length === 0 && (
                          <div className="text-center py-8 text-gray-500 text-xs">No active CRM leads found.</div>
                        )}
                      </div>
                    </div>

                    {/* Upcoming Consultations */}
                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 shadow-md text-gray-300">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-base text-white">Upcoming Sessions</h4>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/20">Calendar</span>
                      </div>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {bookings
                          .filter(b => b.status === "confirmed" || b.status === "completed")
                          .sort((a, b) => new Date(`${a.date}T${a.time || "00:00"}`).getTime() - new Date(`${b.date}T${b.time || "00:00"}`).getTime())
                          .slice(0, 5)
                          .map((b) => {
                            const titleText = typeof b.serviceTitle === "object"
                              ? (b.serviceTitle.en || b.serviceTitle.fr || "Discovery Session")
                              : (b.serviceTitle || "Discovery Session");
                            return (
                              <div key={b.id} className="bg-[#121A1B] border border-[#CDD4DD]/5 p-3 rounded-xl hover:border-[#FF7A00]/25 transition-all space-y-1">
                                <div className="flex justify-between items-start">
                                  <span className="font-bold text-white text-[11px] truncate max-w-[150px]">{b.clientName}</span>
                                  <span className="text-[9px] font-mono text-amber-500 bg-[#FF7A00]/5 border border-[#FF7A00]/10 px-1.5 py-0.2 rounded font-bold">{b.time}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-[#CDD4DD]/50">
                                  <span>{b.date} ({b.timezone})</span>
                                  <span className="truncate max-w-[120px] italic">{titleText}</span>
                                </div>
                              </div>
                            );
                          })}
                        {bookings.filter(b => b.status === "confirmed" || b.status === "completed").length === 0 && (
                          <div className="text-center py-8 text-gray-500 text-xs">No upcoming sessions scheduled.</div>
                        )}
                      </div>
                    </div>

                    {/* Lead Sources Distribution */}
                    <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 shadow-md text-gray-300">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-base text-white">Lead Acquisition Sources</h4>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">Sources Breakdown</span>
                      </div>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 pt-1">
                        {(() => {
                          const counts: Record<string, number> = {};
                          leads.forEach((l) => {
                            const src = l.acquisitionSource || l.source || "Direct Contact";
                            counts[src] = (counts[src] || 0) + 1;
                          });
                          const total = Object.values(counts).reduce((s, c) => s + c, 0) || 1;
                          const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

                          return sorted.map(([source, count]) => {
                            const pct = Math.round((count / total) * 100);
                            return (
                              <div key={source} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="font-bold text-[#CDD4DD]/70 truncate max-w-[180px]">{source}</span>
                                  <span className="font-mono text-white font-bold">{count} ({pct}%)</span>
                                </div>
                                <div className="w-full bg-[#121A1B] h-2.5 rounded-full overflow-hidden border border-[#CDD4DD]/5">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                                    style={{ width: `${Math.max(pct, 5)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                        {leads.length === 0 && (
                          <div className="text-center py-8 text-gray-500 text-xs">No lead source statistics available.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Log Time Ledger */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Log form (Left) */}
                    <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 self-start shadow-md text-gray-300">
                      <div>
                        <span className="text-[8px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">TIME MANAGER</span>
                        <h4 className="font-serif font-bold text-base text-white">Log Consulting Hours</h4>
                      </div>

                      <form onSubmit={handleLogHours} className="space-y-3.5">
                        <div>
                          <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Select Client *</label>
                          <select
                            value={logClientId}
                            onChange={(e) => setLogClientId(e.target.value)}
                            required
                            className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                          >
                            <option value="">Choose Profile...</option>
                            {billingProfiles.map(p => (
                              <option key={p.id} value={p.id}>{p.companyName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Hours *</label>
                            <input
                              type="number"
                              step="0.25"
                              required
                              value={logHours}
                              onChange={(e) => setLogHours(e.target.value)}
                              placeholder="e.g. 4.5"
                              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Date *</label>
                            <input
                              type="date"
                              required
                              value={logDate}
                              onChange={(e) => setLogDate(e.target.value)}
                              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Activity / Notes</label>
                          <input
                            type="text"
                            value={logDesc}
                            onChange={(e) => setLogDesc(e.target.value)}
                            placeholder="e.g. API refactoring & DB setup"
                            className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#FF7A00] hover:bg-opacity-85 text-white font-bold uppercase rounded-xl border-0 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Submit Hours</span>
                        </button>
                      </form>
                    </div>

                    {/* Hours Log Ledger (Right) */}
                    <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 shadow-md text-gray-300">
                      <h4 className="font-serif font-bold text-base text-white">Consulting Telemetry Ledger</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[8px] tracking-wider">
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Client</th>
                              <th className="py-2.5 px-3">Hours</th>
                              <th className="py-2.5 px-3">Activity</th>
                              <th className="py-2.5 px-3 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#CDD4DD]/5">
                            {consultingLogs.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">No hours logged yet.</td>
                              </tr>
                            ) : (
                              consultingLogs.slice(0, 8).map((log: any) => {
                                const clientObj = billingProfiles.find(p => p.id === log.clientId);
                                return (
                                  <tr key={log.id} className="hover:bg-[#121A1B]/35">
                                    <td className="py-2.5 px-3 font-mono">{log.activityDate}</td>
                                    <td className="py-2.5 px-3 text-white font-bold">{clientObj?.companyName || "Unknown Client"}</td>
                                    <td className="py-2.5 px-3 font-bold text-amber-500 font-mono">{log.hoursLogged} hrs</td>
                                    <td className="py-2.5 px-3 truncate max-w-[200px]" title={log.description}>{log.description || "Consulting"}</td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button 
                                        onClick={() => handleDeleteLog(log.id)}
                                        className="text-red-400 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CRM Board */}
              {activeTab === "crm" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">SALES WORKFLOW</span>
                    <h3 className="font-serif font-bold text-xl text-white">CRM Prospect Pipeline</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
                    {pipelineColumns.map((col) => {
                      const colLeads = leads.filter((l) => l.status === col.id);
                      return (
                        <div key={col.id} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-4 rounded-3xl min-w-[200px] flex flex-col space-y-4">
                          <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-2">
                            <span className="font-bold text-[10px] tracking-wider uppercase text-[#CDD4DD]/70">{col.label}</span>
                            <span className="bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20 px-1.5 py-0.5 rounded text-[8px] font-bold">{colLeads.length}</span>
                          </div>

                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                            {colLeads.map((l) => {
                              const score = l.leadScore ?? 0;
                              const starsCount = score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1;
                              const starsStr = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);

                              let colorClass = "text-gray-400 bg-gray-950/40 border-gray-500/20";
                              let borderClass = "border-[#CDD4DD]/5 hover:border-gray-600";
                              if (score >= 90) {
                                colorClass = "text-purple-400 bg-purple-950/40 border-purple-500/20";
                                borderClass = "border-purple-500/10 hover:border-purple-500/30";
                              } else if (score >= 75) {
                                colorClass = "text-red-400 bg-red-950/40 border-red-500/20";
                                borderClass = "border-red-500/10 hover:border-red-500/30";
                              } else if (score >= 60) {
                                colorClass = "text-amber-400 bg-amber-950/40 border-amber-500/20";
                                borderClass = "border-amber-500/10 hover:border-amber-500/30";
                              } else if (score >= 40) {
                                colorClass = "text-blue-400 bg-blue-950/40 border-blue-500/20";
                                borderClass = "border-blue-500/10 hover:border-blue-500/30";
                              }

                              const estValue = Number(l.estimatedValue) || 0;
                              const probability = l.probabilityOfClosing ?? (score > 0 ? Math.round(score * 0.9 + 5) : 0);

                              return (
                                <div key={l.id} className={`bg-[#121A1B] border p-3.5 rounded-2xl space-y-3 relative group transition-all ${borderClass}`}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-bold text-white text-[11px] leading-tight truncate max-w-[120px]">{l.company}</p>
                                      <p className="text-[9px] text-[#CDD4DD]/40">{l.contactName}</p>
                                      <p className="text-[9px] text-[#CDD4DD]/40 truncate max-w-[120px]">{l.email}</p>
                                    </div>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold font-mono ${colorClass}`}>
                                      {score} / 100
                                    </span>
                                  </div>

                                  <div className="space-y-1 bg-[#1A2324]/40 p-2 rounded-xl border border-[#CDD4DD]/5 text-[9px] font-medium text-[#CDD4DD]/70">
                                    <div className="text-amber-400 font-bold tracking-wide">
                                      {starsStr} <span className="text-[7.5px] text-[#CDD4DD]/50 font-sans ml-1 uppercase">{l.priority || "Low Priority"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Est. Value:</span>
                                      <span className="text-emerald-400 font-bold font-mono">${estValue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Probability:</span>
                                      <span className="text-blue-400 font-bold font-mono">{probability}%</span>
                                    </div>
                                    {l.timeline && (
                                      <div className="flex justify-between text-[8px] text-[#CDD4DD]/40 border-t border-[#CDD4DD]/5 pt-1 mt-1 truncate">
                                        <span>Timeline: {l.timeline}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-between items-center pt-1 border-t border-[#CDD4DD]/5 text-[9px] font-sans">
                                    <button 
                                      onClick={() => handleUpdateEstimatedValue(l.id, estValue)}
                                      className="text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-bold"
                                    >
                                      Set Value
                                    </button>
                                    <button 
                                      onClick={() => handleLeadCycleStatus(l.id, l.status)} 
                                      className="text-[#FF7A00] hover:text-[#FF7A00]/80 hover:underline cursor-pointer font-bold"
                                    >
                                      Move Stage →
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* General Inquiries Section (Option 1) */}
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 shadow-md mt-8 space-y-4">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">INBOX REVIEW</span>
                      <h3 className="font-serif font-bold text-xl text-white">General Inquiries</h3>
                      <p className="text-[10px] text-[#CDD4DD]/50">General questions, business networking, or partnerships submitted through the contact form.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[8px] tracking-wider">
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Prospect</th>
                            <th className="py-2.5 px-3">Company</th>
                            <th className="py-2.5 px-3">Inquiry Reason</th>
                            <th className="py-2.5 px-3">Message</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {leads.filter((l) => l.status === "lead").length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-gray-500 font-medium">No general inquiries recorded yet.</td>
                            </tr>
                          ) : (
                            leads
                              .filter((l) => l.status === "lead")
                              .map((l) => (
                                <tr key={l.id} className="hover:bg-[#121A1B]/35">
                                  <td className="py-2.5 px-3 font-mono text-[#CDD4DD]/60">
                                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "N/A"}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-white">{l.contactName}</div>
                                    <a href={`mailto:${l.email}`} className="text-[#FF7A00] hover:underline text-[9px]">{l.email}</a>
                                  </td>
                                  <td className="py-2.5 px-3 text-[#CDD4DD]/80">
                                    {l.company || "N/A"} {l.country ? `(${l.country})` : ""}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="bg-[#CDD4DD]/5 text-[#CDD4DD]/80 px-2 py-0.5 rounded border border-[#CDD4DD]/10 text-[8px] font-bold">
                                      {l.reason || "General"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 max-w-[250px] truncate" title={l.notes}>
                                    {l.notes}
                                  </td>
                                  <td className="py-2.5 px-3 text-right space-x-2 shrink-0">
                                    <button
                                      onClick={() => handlePromoteToDiscovery(l.id)}
                                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                                    >
                                      Promote to CRM
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLead(l.id)}
                                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                                    >
                                      Archive
                                    </button>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Bookings */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">SCHEDULING CENTER</span>
                    <h3 className="font-serif font-bold text-xl text-white">Client Session Bookings</h3>
                  </div>

                  <div className="overflow-x-auto bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 shadow-md">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                          <th className="py-3 px-4">Client Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Package</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#CDD4DD]/5">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-[#121A1B]/35">
                            <td className="py-3 px-4 font-semibold text-white">{b.clientName}</td>
                            <td className="py-3 px-4 font-mono text-[#CDD4DD]/60">{b.clientEmail}</td>
                            <td className="py-3 px-4">
                              <span>{b.date}</span>
                              <span className="text-[9px] text-[#CDD4DD]/40 block">{b.time} ({b.timezone})</span>
                            </td>
                            <td className="py-3 px-4 capitalize text-[#CDD4DD]/80">{b.packageType}</td>
                            <td className="py-3 px-4 font-bold text-emerald-400">${b.amount}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[8px] uppercase px-2 py-0.5 rounded font-bold border ${
                                b.status === "confirmed" || b.status === "completed"
                                  ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                  : b.status === "cancelled"
                                  ? "bg-red-950/40 border-red-500/20 text-red-400"
                                  : "bg-amber-950/40 border-amber-500/20 text-amber-400"
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 flex items-center justify-end gap-2">
                              <a
                                href={getGoogleCalendarUrl(b)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#27187E]/30 hover:bg-[#27187E] text-amber-400 hover:text-white px-2 py-1 rounded text-[9px] font-bold border border-[#FF7A00]/20 transition-all flex items-center gap-1 cursor-pointer no-underline"
                                title="Add event to Google Calendar"
                              >
                                <Calendar className="w-3 h-3 text-[#FF7A00]" />
                                <span>Add to GCal</span>
                              </a>

                              {b.status === "pending" && (
                                <>
                                  <button onClick={() => handleBookingStatus(b.id, "confirmed")} className="text-emerald-400 hover:text-emerald-500 font-bold uppercase text-[9px] tracking-wider cursor-pointer">
                                    Approve
                                  </button>
                                  <span className="text-gray-600">|</span>
                                  <button onClick={() => handleBookingStatus(b.id, "cancelled")} className="text-red-400 hover:text-red-500 font-bold uppercase text-[9px] tracking-wider cursor-pointer">
                                    Cancel
                                  </button>
                                </>
                              )}
                              {b.status === "confirmed" && (
                                <button onClick={() => handleBookingStatus(b.id, "completed")} className="text-blue-400 hover:text-blue-500 font-bold uppercase text-[9px] tracking-wider cursor-pointer">
                                  Mark Completed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: Discovery Sessions */}
              {activeTab === "discoveries" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans">
                  {/* Left Side: List */}
                  <div className="lg:col-span-5 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">SUBMISSION FEED</span>
                        <h4 className="font-serif font-bold text-lg text-white">Discovery Submissions</h4>
                      </div>
                      <button onClick={handleExportCSV} className="bg-white/5 border border-white/10 hover:bg-white/10 p-2 rounded-xl text-gray-300 cursor-pointer">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {discoveries.map((disc) => (
                        <div
                          key={disc.id}
                          onClick={() => setSelectedDisc(disc)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                            selectedDisc?.id === disc.id
                              ? "bg-[#FF7A00]/10 border-[#FF7A00]/30"
                              : "bg-[#121A1B] border-[#CDD4DD]/5 hover:border-gray-700"
                          }`}
                        >
                          <p className="font-bold text-white text-[11px]">{disc.answers.companyName}</p>
                          <p className="text-[9px] text-[#CDD4DD]/40">Scoped: {new Date(disc.createdAt).toLocaleDateString()}</p>
                          <p className="text-[9px] text-gray-400 mt-1 capitalize">Types: {disc.answers.projectTypes?.join(", ")}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Details View */}
                  <div className="lg:col-span-7 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-5">
                    {selectedDisc ? (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">DISCOVERY CARD</span>
                            <h3 className="font-serif font-bold text-xl text-white">{selectedDisc.answers.companyName}</h3>
                            <span className="text-[9px] text-gray-500 font-mono">ID: {selectedDisc.id}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleConvertToLead(selectedDisc)} className="bg-emerald-950 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/35 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[9px] cursor-pointer">
                              Accept Prospect
                            </button>
                            <button onClick={() => handleDeleteDiscovery(selectedDisc.id)} className="bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-900/30 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[9px] cursor-pointer">
                              Archive
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#121A1B] p-4 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                          <h5 className="font-serif font-bold text-sm text-[#FF7A00]">Answers Summary</h5>
                          <div className="grid grid-cols-2 gap-3 text-[10px]">
                            <div><span className="text-gray-500">Industry:</span> <span className="font-bold">{selectedDisc.answers.industry}</span></div>
                            <div><span className="text-gray-500">Expected ROI:</span> <span className="font-bold">{selectedDisc.answers.expectedROI}</span></div>
                            <div><span className="text-gray-500">Timeline:</span> <span className="font-bold">{selectedDisc.answers.timeline}</span></div>
                            <div><span className="text-gray-500">Budget Range:</span> <span className="font-bold text-emerald-400">{selectedDisc.answers.budgetRange}</span></div>
                          </div>
                        </div>

                        <div className="bg-[#121A1B] p-4 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                          <h5 className="font-serif font-bold text-sm text-[#FF7A00]">Automated AI Recommendation</h5>
                          <div className="space-y-2">
                            <div>
                              <span className="text-[9px] font-bold text-[#CDD4DD]/40 block uppercase">Project Complexity</span>
                              <span className="bg-amber-950/40 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{selectedDisc.summary.complexity || "Medium"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-[#CDD4DD]/40 block uppercase">Recommended Services</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {selectedDisc.summary.recommendedServices?.map((srv: string) => (
                                  <span key={srv} className="bg-[#1A2324] text-white border border-[#CDD4DD]/10 px-2 py-0.5 rounded text-[9px] font-medium">{srv}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center py-20 text-[#CDD4DD]/30 border border-dashed border-[#CDD4DD]/10 rounded-2xl">
                        Select a scoping submission from the feed list.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: Payments Review */}
              {activeTab === "payments" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans animate-fadeIn">
                  {/* Left Form: Generate Invoice Payment Links */}
                  <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 self-start">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">INVOICE GENERATOR</span>
                      <h4 className="font-serif font-bold text-lg text-white">Generate Payment Link</h4>
                    </div>
                    <form onSubmit={handleGenerateLink} className="space-y-3.5 text-xs text-gray-300">
                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Client Name</label>
                        <input
                          type="text"
                          value={genClientName}
                          onChange={(e) => setGenClientName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Client Email</label>
                        <input
                          type="email"
                          value={genEmail}
                          onChange={(e) => setGenEmail(e.target.value)}
                          placeholder="e.g. client@domain.com"
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Currency</label>
                          <select
                            value={genCurrency}
                            onChange={(e) => setGenCurrency(e.target.value)}
                            className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="GDS">GDS (HTG)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Service Select</label>
                          <select
                            value={genServiceId}
                            onChange={(e) => setGenServiceId(e.target.value)}
                            className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                          >
                            <option value="">Choose Service...</option>
                            {consultingServices.map((cs) => (
                              <option key={cs.id} value={cs.id}>{cs.title?.en || cs.title}</option>
                            ))}
                            <option value="custom">Custom Service</option>
                          </select>
                        </div>
                      </div>

                      {genServiceId === "custom" && (
                        <div>
                          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Custom Service Title</label>
                          <input
                            type="text"
                            required
                            value={genCustomTitle}
                            onChange={(e) => setGenCustomTitle(e.target.value)}
                            placeholder="e.g. AI Integration Review"
                            className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Billing Amount</label>
                        <input
                          type="number"
                          required
                          value={genAmount}
                          onChange={(e) => setGenAmount(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                        />
                      </div>

                      <button type="submit" className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer">
                        Generate Invoice
                      </button>
                    </form>

                    {generatedLink && (
                      <div className="bg-[#121A1B] p-3 rounded-xl border border-[#CDD4DD]/10 space-y-2">
                        <span className="text-[8px] font-bold text-[#FF7A00] uppercase block">PRE-PAID SECURE LINK</span>
                        <input type="text" readOnly value={generatedLink} className="w-full bg-[#1A2324] text-[10px] text-gray-300 font-mono rounded px-2 py-1.5 border border-[#CDD4DD]/5 focus:outline-none" />
                        <button onClick={handleCopyLink} className="w-full py-2 bg-[#1A2324] hover:bg-[#FF7A00] hover:text-white rounded-lg text-[9px] font-bold tracking-wider uppercase border border-[#CDD4DD]/10 transition-colors cursor-pointer">
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Ledger Table */}
                  <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#CDD4DD]/40 tracking-widest uppercase block">PAYMENT LEDGER</span>
                      <h4 className="font-serif font-bold text-lg text-white">Submitted Transactions</h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                            <th className="py-3 px-4">Client Name / Email</th>
                            <th className="py-3 px-4">Service</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Method / Ref</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-[#121A1B]/30 align-top">
                              <td className="py-3 px-4">
                                <span className="font-semibold text-white block">{p.clientName || "Anonymous"}</span>
                                <span className="text-[9px] text-[#CDD4DD]/50 font-mono">{p.clientEmail}</span>
                              </td>
                              <td className="py-3 px-4 capitalize text-[#CDD4DD]/80">{p.service}</td>
                              <td className="py-3 px-4 font-bold text-white">
                                {p.currency === "GDS" ? `${p.amount} GDS` : `$${p.amount} USD`}
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px]">
                                <span className="text-gray-400 capitalize block">{p.paymentMethod || "None"}</span>
                                <span className="text-[#CDD4DD]/40 block text-[9px]">{p.paymentReference || "No Ref"}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-[8px] uppercase px-2 py-0.5 rounded font-bold border ${
                                  p.status === "paid"
                                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                    : p.status === "overdue"
                                    ? "bg-red-950/40 border-red-500/20 text-red-400"
                                    : "bg-amber-950/40 border-amber-500/20 text-amber-400"
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-y-1">
                                {p.invoiceUrl && (
                                  <a href={p.invoiceUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline block text-[10px]">
                                    View Receipt Image
                                  </a>
                                )}
                                {p.status === "pending" && (
                                  <div className="flex gap-1 justify-end mt-1">
                                    <button onClick={() => handleVerifyPayment(p.id)} className="bg-emerald-900 hover:bg-emerald-800 text-emerald-400 px-2 py-1 rounded text-[8px] font-bold uppercase transition-colors cursor-pointer border border-emerald-500/25">
                                      Confirm
                                    </button>
                                    <button onClick={() => handleRejectPayment(p.id)} className="bg-red-950/40 hover:bg-red-900/35 text-red-400 px-2 py-1 rounded text-[8px] font-bold uppercase transition-colors cursor-pointer border border-red-500/25">
                                      Reject
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

              {/* TAB: CMS Sections / Website Builder */}
              {activeTab === "cms_sections" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">HOMEPAGE ENGINE</span>
                    <h3 className="font-serif font-bold text-xl text-white">Dynamic Section Layout Builder</h3>
                  </div>
                  <WebsiteBuilder />
                </div>
              )}

              {/* TAB: CMS Case Studies */}
              {activeTab === "cms_case_studies" && (
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
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white border-0"
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
                            <th className="py-3 px-4">Status</th>
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
                                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                                  p.status === "published"
                                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                    : "bg-amber-950/40 border-amber-500/20 text-amber-400"
                                }`}>
                                  {p.status || "published"}
                                </span>
                              </td>
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
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProject(p.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
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

              {/* TAB: CMS Training Programs */}
              {activeTab === "cms_training" && (
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
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white border-0"
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
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {trainingPrograms.map((t) => (
                            <tr key={t.id} className="hover:bg-[#121A1B]/30">
                              <td className="py-3 px-4 font-semibold text-white">{t.title?.en || t.title}</td>
                              <td className="py-3 px-4 text-[#CDD4DD]/70">{t.duration || t.readingTime}</td>
                              <td className="py-3 px-4">
                                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                                  t.status === "published"
                                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                    : "bg-amber-950/40 border-amber-500/20 text-amber-400"
                                }`}>
                                  {t.status || "published"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 capitalize">{t.category}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTraining(t);
                                    setIsTrainingFormOpen(true);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTraining(t.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
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

              {/* TAB: CMS Consulting Services */}
              {activeTab === "cms_services" && (
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
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white border-0"
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
                            <th className="py-3 px-4">Status</th>
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
                              <td className="py-3 px-4">
                                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                                  s.status === "published"
                                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                                    : "bg-amber-950/40 border-amber-500/20 text-amber-400"
                                }`}>
                                  {s.status || "published"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 capitalize">{s.category}</td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedServiceCMS(s);
                                    setIsServiceFormOpen(true);
                                  }}
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteService(s.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
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

              {/* TAB: CMS FAQs */}
              {activeTab === "cms_faqs" && (
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
                        className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white border-0"
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
                                  className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFAQ(f.id)}
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
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

              {/* TAB: CMS Translations */}
              {activeTab === "cms_translations" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans">
                  {/* Left Form: Add Translation */}
                  <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 self-start animate-fadeIn">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">DICTIONARY REGISTRY</span>
                      <h4 className="font-serif font-bold text-lg text-white">Add Translation Key</h4>
                    </div>
                    <form onSubmit={handleAddTranslation} className="space-y-3.5 text-xs text-gray-300">
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
                        className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-sm"
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
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-colors cursor-pointer border-0"
                                        title="Save"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingTransKey(null)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 rounded transition-colors cursor-pointer border-0"
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
                                        className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer border-0 bg-transparent"
                                        title="Edit"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTranslation(t.key)}
                                        className="text-red-400 hover:text-red-500 transition-colors cursor-pointer border-0 bg-transparent"
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

              {/* TAB: CMS Media Library */}
              {activeTab === "cms_media" && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">MEDIA ASSETS</span>
                    <h3 className="font-serif font-bold text-xl text-white">External Asset Library Catalog</h3>
                  </div>
                  <MediaLibrary />
                </div>
              )}

              {/* TAB 7: Users Control */}
              {activeTab === "users" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans animate-fadeIn">
                  {/* Left Form: Add User */}
                  <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 self-start">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">AUTHENTICATION</span>
                      <h4 className="font-serif font-bold text-lg text-white">Create User Access</h4>
                    </div>

                    <form onSubmit={handleAddUser} className="space-y-3.5 text-xs text-gray-300">
                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Full Display Name</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="e.g. Marie Carmel"
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#27187E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Account Email Address</label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="user@domain.com"
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
                        className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-sm"
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
                                  className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer border-0 bg-transparent"
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

              {/* TAB 6: Settings Tab */}
              {activeTab === "settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans animate-fadeIn">
                  {/* Left Column: Settings Configuration */}
                  <div className="lg:col-span-6 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
                    <div>
                      <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">GLOBAL VALUES</span>
                      <h4 className="font-serif font-bold text-lg text-white">System Settings</h4>
                    </div>

                    <div className="space-y-3.5 text-xs text-gray-300">
                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Admin Secret Console Path</label>
                        <input
                          type="text"
                          value={siteSettings.adminPath}
                          onChange={(e) => setSiteSettings({ ...siteSettings, adminPath: e.target.value })}
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Profile Picture URL (Header Avatar)</label>
                        <input
                          type="text"
                          value={siteSettings.profileImageUrl}
                          onChange={(e) => setSiteSettings({ ...siteSettings, profileImageUrl: e.target.value })}
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 border-t border-[#CDD4DD]/5 space-y-3">
                        <span className="text-[8px] font-bold text-[#FF7A00] tracking-wider uppercase block">Social Handles Integration</span>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[8px] text-gray-500 mb-1">GitHub</label>
                            <input
                              type="text"
                              value={siteSettings.socialLinks?.github || ""}
                              onChange={(e) => setSiteSettings({
                                ...siteSettings,
                                socialLinks: { ...(siteSettings.socialLinks || {}), github: e.target.value } as any
                              })}
                              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-2.5 py-2 text-white focus:outline-none text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-gray-500 mb-1">LinkedIn</label>
                            <input
                              type="text"
                              value={siteSettings.socialLinks?.linkedin || ""}
                              onChange={(e) => setSiteSettings({
                                ...siteSettings,
                                socialLinks: { ...(siteSettings.socialLinks || {}), linkedin: e.target.value } as any
                              })}
                              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-2.5 py-2 text-white focus:outline-none text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-gray-500 mb-1">Twitter</label>
                            <input
                              type="text"
                              value={siteSettings.socialLinks?.twitter || ""}
                              onChange={(e) => setSiteSettings({
                                ...siteSettings,
                                socialLinks: { ...(siteSettings.socialLinks || {}), twitter: e.target.value } as any
                              })}
                              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-2.5 py-2 text-white focus:outline-none text-[10px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-3 border-t border-[#CDD4DD]/5">
                        <input
                          type="checkbox"
                          id="trainingEnabled"
                          checked={siteSettings.trainingEnabled}
                          onChange={(e) => setSiteSettings({ ...siteSettings, trainingEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00]"
                        />
                        <label htmlFor="trainingEnabled" className="font-bold text-[10px] text-[#CDD4DD]/80 uppercase select-none cursor-pointer">
                          Activate Academy Training Programs
                        </label>
                      </div>

                      <button onClick={handleSaveSettings} className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                        <Save className="w-4 h-4" />
                        <span>Save Configuration</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Payment Methods List */}
                  <div className="lg:col-span-6 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
                    <div className="flex justify-between items-start border-b border-[#CDD4DD]/10 pb-3">
                      <div>
                        <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">PAYMENT GATEWAYS</span>
                        <h4 className="font-serif font-bold text-lg text-white">Merchant Payment Routing</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const name = prompt("Enter the name of the new USD or local payment gateway (e.g. Zelle, Stripe, Bank Wire USD, PayPal):");
                          if (!name || !name.trim()) return;
                          const newId = name.toLowerCase().replace(/[^a-z0-9]/g, "_") || `gw_${Date.now()}`;
                          const newMethod = {
                            id: newId,
                            name: name.trim(),
                            type: "international" as const,
                            enabled: true,
                            logoUrl: "",
                            phoneNumber: "",
                            accountNumber: "",
                            accountHolder: "",
                            email: ""
                          };
                          setPaymentConfig({ methods: [...paymentConfig.methods, newMethod as any] });
                          showToast(`Added gateway "${newMethod.name}". Click "Save Configuration" to persist.`);
                        }}
                        className="bg-[#FF7A00] hover:bg-opacity-80 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 border-0 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Gateway (USD/Local)</span>
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {paymentConfig.methods.map((method, index) => (
                        <div key={method.id || index} className="bg-[#121A1B] p-4 rounded-2xl border border-[#CDD4DD]/5 flex flex-col space-y-3">
                          <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-white">{method.name}</span>
                              <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
                                {method.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded border font-bold ${
                                method.enabled ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" : "bg-red-950/40 border-red-500/20 text-red-400"
                              }`}>
                                {method.enabled ? "Active" : "Disabled"}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!confirm(`Are you sure you want to remove payment gateway "${method.name}"?`)) return;
                                  const updated = paymentConfig.methods.filter((_, i) => i !== index);
                                  setPaymentConfig({ methods: updated });
                                  showToast(`Removed gateway "${method.name}".`);
                                }}
                                className="text-red-400 hover:text-red-500 hover:bg-red-950/20 p-1 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                                title="Delete Gateway"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Configurations Inputs */}
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-gray-500 block text-[8px] uppercase">Gateway Name</span>
                              <input
                                type="text"
                                value={method.name || ""}
                                onChange={(e) => {
                                  const updatedMethods = [...paymentConfig.methods];
                                  updatedMethods[index].name = e.target.value;
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded px-2 py-1 text-white w-full focus:outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8px] uppercase">Category / Type</span>
                              <select
                                value={method.type || "international"}
                                onChange={(e) => {
                                  const updatedMethods = [...paymentConfig.methods];
                                  updatedMethods[index].type = e.target.value as any;
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded px-2 py-1 text-white w-full focus:outline-none"
                              >
                                <option value="international">USD / International</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="mobile">Mobile Money</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8px] uppercase">Gateway Email / Zelle / ID</span>
                              <input
                                type="text"
                                value={method.email || ""}
                                placeholder="e.g. pay@domain.com"
                                onChange={(e) => {
                                  const updatedMethods = [...paymentConfig.methods];
                                  updatedMethods[index].email = e.target.value;
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded px-2 py-1 text-white w-full focus:outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8px] uppercase">Account Number</span>
                              <input
                                type="text"
                                value={method.accountNumber || ""}
                                placeholder="e.g. 123456789"
                                onChange={(e) => {
                                  const updatedMethods = [...paymentConfig.methods];
                                  updatedMethods[index].accountNumber = e.target.value;
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded px-2 py-1 text-white w-full focus:outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8px] uppercase">Account Holder Name</span>
                              <input
                                type="text"
                                value={method.accountHolder || ""}
                                placeholder="e.g. Business Name Inc"
                                onChange={(e) => {
                                  const updatedMethods = [...paymentConfig.methods];
                                  updatedMethods[index].accountHolder = e.target.value;
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded px-2 py-1 text-white w-full focus:outline-none"
                              />
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[8px] uppercase">Phone Line</span>
                              <input
                                type="text"
                                value={method.phoneNumber || ""}
                                placeholder="e.g. +1 (305) 000-0000"
                                onChange={(e) => {
                                  const updatedMethods = [...paymentConfig.methods];
                                  updatedMethods[index].phoneNumber = e.target.value;
                                  setPaymentConfig({ methods: updatedMethods });
                                }}
                                className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded px-2 py-1 text-white w-full focus:outline-none"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-1">
                            <input
                              type="checkbox"
                              id={`enabled_${method.id}`}
                              checked={method.enabled}
                              onChange={(e) => {
                                const updatedMethods = [...paymentConfig.methods];
                                updatedMethods[index].enabled = e.target.checked;
                                setPaymentConfig({ methods: updatedMethods });
                              }}
                              className="w-3.5 h-3.5 text-[#FF7A00] rounded focus:ring-[#FF7A00]"
                            />
                            <label htmlFor={`enabled_${method.id}`} className="text-[9px] uppercase font-bold text-gray-400 select-none cursor-pointer">
                              Enable routing gateway
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Invoices & Quotes */}
              {activeTab === "cms_invoices" && (
                <div className="animate-fadeIn">
                  <InvoiceManager />
                </div>
              )}

              {/* TAB: Client Billing Profiles */}
              {activeTab === "cms_billing_profiles" && (
                <div className="animate-fadeIn">
                  <ClientBillingManager />
                </div>
              )}

              {/* TAB: Business Profile */}
              {activeTab === "cms_business_profile" && (
                <div className="animate-fadeIn">
                  <BusinessProfileForm />
                </div>
              )}

              {/* TAB: SEO Center */}
              {activeTab === "cms_seo" && (
                <div className="animate-fadeIn">
                  <SEOCenterForm />
                </div>
              )}

              {/* TAB: Brand Assets */}
              {activeTab === "cms_brand" && (
                <div className="animate-fadeIn">
                  <BrandAssetsForm />
                </div>
              )}

              {/* TAB: Testimonials */}
              {activeTab === "cms_testimonials" && (
                <div className="animate-fadeIn">
                  <TestimonialsManager />
                </div>
              )}

              {/* TAB: WhatsApp Templates */}
              {activeTab === "wa_templates" && (
                <div className="animate-fadeIn">
                  <WhatsAppTemplatesManager />
                </div>
              )}

              {/* TAB: WhatsApp History */}
              {activeTab === "wa_history" && (
                <div className="animate-fadeIn">
                  <WhatsAppHistoryTable />
                </div>
              )}

              {/* TAB: Shared Links */}
              {activeTab === "wa_shared_links" && (
                <div className="animate-fadeIn">
                  <SharedLinksManager />
                </div>
              )}

              {/* TAB: WhatsApp Analytics */}
              {activeTab === "wa_analytics" && (
                <div className="animate-fadeIn">
                  <WhatsAppAnalyticsDashboard />
                </div>
              )}

              {/* TAB: Client Messages */}
              {activeTab === "client_messages" && (
                <div className="animate-fadeIn bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-white">Client Portal Communications</h2>
                      <p className="text-xs text-slate-400">View and respond to secure client messages.</p>
                    </div>
                    <button
                      onClick={fetchAdminData}
                      className="p-2 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                      title="Refresh messages"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {(() => {
                    const uniqueClientsMap = new Map<string, { email: string; name: string; lastMessage: any; count: number }>();
                    portalMessages.forEach(m => {
                      const email = m.clientEmail?.toLowerCase().trim();
                      if (!email) return;

                      const profile = billingProfiles.find(p => p.email?.toLowerCase().trim() === email);
                      const name = profile?.primary_contact_name || profile?.company_name || email.split("@")[0];

                      const existing = uniqueClientsMap.get(email);
                      if (!existing) {
                        uniqueClientsMap.set(email, {
                          email,
                          name,
                          lastMessage: m,
                          count: 1
                        });
                      } else {
                        existing.count++;
                        if (new Date(m.timestamp) > new Date(existing.lastMessage.timestamp)) {
                          existing.lastMessage = m;
                        }
                      }
                    });

                    const uniqueClients = Array.from(uniqueClientsMap.values()).sort(
                      (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
                    );

                    const activeClientEmail = chatActiveEmail || uniqueClients[0]?.email;

                    const activeClientMessages = portalMessages
                      .filter(m => m.clientEmail?.toLowerCase().trim() === activeClientEmail)
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                    const activeClientName = uniqueClients.find(c => c.email === activeClientEmail)?.name || activeClientEmail || "";

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="border-r border-slate-800 bg-slate-950 overflow-y-auto flex flex-col h-full">
                          <div className="p-4 border-b border-slate-800">
                            <span className="text-[9px] font-sans font-bold text-indigo-400 tracking-widest uppercase block">CONVERSATIONS</span>
                          </div>
                          {uniqueClients.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-500 my-auto">No secure client messages found.</div>
                          ) : (
                            <div className="flex-1 divide-y divide-slate-900/50">
                              {uniqueClients.map(c => {
                                const isActive = c.email === activeClientEmail;
                                return (
                                  <button
                                    key={c.email}
                                    onClick={() => setChatActiveEmail(c.email)}
                                    className={`w-full text-left p-4 transition-colors flex flex-col gap-1 cursor-pointer ${
                                      isActive ? "bg-slate-900" : "hover:bg-slate-900/40"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-xs text-white truncate max-w-[150px]">{c.name}</span>
                                      <span className="text-[9px] text-slate-500 font-mono">
                                        {new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate pr-4">
                                      {c.lastMessage.sender === "amedee" ? "You: " : ""}{c.lastMessage.text}
                                    </p>
                                    <span className="text-[9px] text-slate-600 font-mono truncate">{c.email}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2 flex flex-col h-full bg-slate-900/60 relative">
                          {activeClientEmail ? (
                            <>
                              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                                <div>
                                  <span className="text-[9px] font-sans font-bold text-emerald-400 tracking-widest uppercase block">SECURE CHANNEL</span>
                                  <h3 className="font-bold text-xs text-white">{activeClientName}</h3>
                                  <span className="text-[9px] font-mono text-slate-500">{activeClientEmail}</span>
                                </div>
                              </div>

                              <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col bg-slate-950/20">
                                {activeClientMessages.map(m => {
                                  const isAdmin = m.sender === "amedee";
                                  return (
                                    <div
                                      key={m.id || m.timestamp}
                                      className={`flex flex-col max-w-[75%] ${isAdmin ? "self-end items-end" : "self-start items-start"}`}
                                    >
                                      <div
                                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                          isAdmin 
                                            ? "bg-indigo-600 text-white rounded-tr-none" 
                                            : "bg-slate-800 text-slate-100 rounded-tl-none"
                                        }`}
                                      >
                                        {m.text}
                                      </div>
                                      <span className="text-[8px] text-slate-500 font-mono mt-1 px-1">
                                        {new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  if (!chatInputText.trim()) return;
                                  const text = chatInputText;
                                  setChatInputText("");

                                  const payload = {
                                    clientEmail: activeClientEmail,
                                    sender: "amedee",
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
                                      const newMsg = await res.json();
                                      setPortalMessages(prev => [...prev, newMsg]);
                                    }
                                  } catch (err) {
                                    console.error("Failed to transmit reply:", err);
                                  }
                                }}
                                className="p-3 border-t border-slate-800 bg-slate-950/40 flex gap-2"
                              >
                                <input
                                  type="text"
                                  value={chatInputText}
                                  onChange={(e) => setChatInputText(e.target.value)}
                                  placeholder={`Reply to ${activeClientName}...`}
                                  className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-semibold"
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                                >
                                  Reply
                                </button>
                              </form>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                              Select a conversation on the left to start chatting.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB: Client Tasks */}
              {activeTab === "client_tasks" && (
                <div className="animate-fadeIn bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-white">Client Tasks & Assignments</h2>
                      <p className="text-xs text-slate-400">Manage tasks and view client assignments.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setTaskFormTitle("");
                        setTaskFormDesc("");
                        setTaskFormDeadline("");
                        setTaskFormAssignedTo("client");
                        setTaskFormClientEmail("");
                        setShowTaskModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center gap-2 font-bold"
                    >
                      <Plus className="w-4 h-4" /> Create Task
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/45 p-4 rounded-2xl border border-slate-800/40">
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned To</label>
                      <select
                        value={taskFilterAssignee}
                        onChange={(e) => setTaskFilterAssignee(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        <option value="all">All Assignees</option>
                        <option value="amedee">Assigned to Me (Amedee)</option>
                        <option value="client">Assigned to Client</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Filter by Client</label>
                      <select
                        value={taskFilterClient}
                        onChange={(e) => setTaskFilterClient(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        <option value="all">All Clients</option>
                        {billingProfiles.map(p => (
                          <option key={p.email} value={p.email}>{p.primary_contact_name || p.company_name || p.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                      <select
                        value={taskFilterStatus}
                        onChange={(e) => setTaskFilterStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                      >
                        <option value="all">All Statuses</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const filteredTasks = portalTasks.filter(t => {
                      if (taskFilterAssignee !== "all" && t.assignedTo !== taskFilterAssignee) return false;
                      if (taskFilterClient !== "all" && t.clientEmail?.toLowerCase().trim() !== taskFilterClient.toLowerCase().trim()) return false;
                      if (taskFilterStatus !== "all" && t.status !== taskFilterStatus) return false;
                      return true;
                    });

                    return filteredTasks.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 text-xs border border-slate-800/50 border-dashed rounded-2xl">
                        No tasks match the active filters.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTasks.map(t => {
                          const clientProfile = billingProfiles.find(p => p.email?.toLowerCase().trim() === t.clientEmail?.toLowerCase().trim());
                          const clientName = clientProfile?.primary_contact_name || clientProfile?.company_name || t.clientEmail?.split("@")[0];

                          return (
                            <div key={t.id} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider ${
                                    t.status === "done" 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                                      : t.status === "in_progress"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                      : "bg-slate-800 text-slate-400 border border-slate-700"
                                  }`}>
                                    {t.status === "done" ? "Done" : t.status === "in_progress" ? "In Progress" : "To Do"}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider ${
                                    t.assignedTo === "amedee" 
                                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/25" 
                                      : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                                  }`}>
                                    {t.assignedTo === "amedee" ? "Me (Amedee)" : "Client"}
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-white">{t.title?.en || t.title}</h4>
                                <p className="text-xs text-slate-400 line-clamp-3 font-medium">{t.description?.en || t.description}</p>
                              </div>

                              <div className="border-t border-slate-900 pt-4 flex flex-col gap-2">
                                <div className="flex justify-between text-[10px] text-slate-500">
                                  <span className="font-semibold text-slate-400">Client: {clientName}</span>
                                  <span className="font-mono">Due: {t.deadline}</span>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                  {t.status !== "done" && (
                                    <button
                                      onClick={async () => {
                                        const nextStatus = t.status === "todo" ? "in_progress" : "done";
                                        try {
                                          const res = await fetch(`/api/tasks/${t.id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ status: nextStatus })
                                          });
                                          if (res.ok) fetchAdminData();
                                        } catch (err) {
                                          console.error("Failed to update status:", err);
                                        }
                                      }}
                                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[9px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                                    >
                                      {t.status === "todo" ? "Start" : "Complete"}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setEditingTask(t);
                                      setTaskFormTitle(t.title?.en || t.title || "");
                                      setTaskFormDesc(t.description?.en || t.description || "");
                                      setTaskFormDeadline(t.deadline || "");
                                      setTaskFormAssignedTo(t.assignedTo || "client");
                                      setTaskFormClientEmail(t.clientEmail || "");
                                      setShowTaskModal(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm("Are you sure you want to delete this task?")) return;
                                      try {
                                        const res = await fetch(`/api/tasks/${t.id}`, { method: "DELETE" });
                                        if (res.ok) fetchAdminData();
                                      } catch (err) {
                                        console.error("Failed to delete task:", err);
                                      }
                                    }}
                                    className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB: Client Projects */}
              {activeTab === "client_projects" && (
                <div className="animate-fadeIn bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-white">Client Projects Registry</h2>
                      <p className="text-xs text-slate-400">Track milestones, status, progress, and review feedback loops.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setProjectFormClientEmail("");
                        setProjectFormTitle("");
                        setProjectFormDescText("");
                        setProjectFormStatus("not_started");
                        setProjectFormProgress(0);
                        setProjectFormStartDate("");
                        setProjectFormTargetLaunch("");
                        setProjectFormAdminFeedback("");
                        setProjectFormClientFeedback("");
                        setShowProjectModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer flex items-center gap-2 font-bold"
                    >
                      <Plus className="w-4 h-4" /> Create Project
                    </button>
                  </div>

                  {clientProjects.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs border border-slate-800/50 border-dashed rounded-2xl">
                      No active client projects found. Create one to begin tracking.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {clientProjects.map(p => {
                        const parsedDesc = parseProjectDesc(p.description);
                        const clientProfile = billingProfiles.find(bp => bp.email?.toLowerCase().trim() === p.clientEmail?.toLowerCase().trim());
                        const clientName = clientProfile?.primary_contact_name || clientProfile?.company_name || p.clientEmail?.split("@")[0];

                        return (
                          <div key={p.id} className="bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between gap-6">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <h3 className="font-bold text-base text-white">{p.title}</h3>
                                  <span className="text-[10px] text-slate-400 font-semibold">Client: {clientName} ({p.clientEmail})</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-wider ${
                                  p.status === "completed" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                                    : p.status === "review"
                                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/25 animate-pulse"
                                    : p.status === "in_progress"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                }`}>
                                  {p.status === "completed" ? "Completed" : p.status === "review" ? "In Review" : p.status === "in_progress" ? "In Progress" : "Not Started"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-900/30 p-3 rounded-xl border border-slate-900">{parsedDesc.text}</p>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-slate-400">Progress</span>
                                  <span className="text-white font-bold">{p.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500 bg-slate-900/20 p-3 rounded-xl">
                                <div>
                                  <span className="block text-[8px] uppercase tracking-wider text-slate-400">Start Date</span>
                                  <span className="font-bold text-slate-300">{p.startDate || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase tracking-wider text-slate-400">Target Launch</span>
                                  <span className="font-bold text-slate-300">{p.targetLaunch || "N/A"}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-indigo-400">Your Feedback (Amedee)</span>
                                  <p className="text-xs text-slate-300 italic font-medium leading-relaxed">
                                    {parsedDesc.adminFeedback || "No feedback logged yet."}
                                  </p>
                                </div>
                                <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60 space-y-1">
                                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-emerald-400">Client Feedback</span>
                                  <p className="text-xs text-slate-300 italic font-medium leading-relaxed">
                                    {parsedDesc.clientFeedback || "No feedback from client yet."}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-slate-900 pt-4 flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProject(p);
                                  setProjectFormClientEmail(p.clientEmail || "");
                                  setProjectFormTitle(p.title || "");
                                  setProjectFormDescText(parsedDesc.text || "");
                                  setProjectFormStatus(p.status || "not_started");
                                  setProjectFormProgress(p.progress || 0);
                                  setProjectFormStartDate(p.startDate || "");
                                  setProjectFormTargetLaunch(p.targetLaunch || "");
                                  setProjectFormAdminFeedback(parsedDesc.adminFeedback || "");
                                  setProjectFormClientFeedback(parsedDesc.clientFeedback || "");
                                  setShowProjectModal(true);
                                }}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold uppercase rounded-xl transition-colors cursor-pointer"
                              >
                                Edit Project
                              </button>
                              <button
                                onClick={() => handleDeleteClientProject(p.id)}
                                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Task Management Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {editingTask ? "Modify existing task details." : "Create and assign a task to a client profile."}
                  </p>
                </div>
                <button 
                  onClick={() => setShowTaskModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!taskFormTitle.trim() || !taskFormClientEmail) return;

                  const payload = {
                    clientEmail: taskFormClientEmail,
                    title: { en: taskFormTitle, fr: taskFormTitle },
                    description: { en: taskFormDesc, fr: taskFormDesc },
                    deadline: taskFormDeadline,
                    assignedTo: taskFormAssignedTo,
                    status: editingTask ? editingTask.status : "todo"
                  };

                  try {
                    let res;
                    if (editingTask) {
                      res = await fetch(`/api/tasks/${editingTask.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                      });
                    } else {
                      const newId = "t_" + crypto.randomUUID();
                      res = await fetch("/api/tasks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: newId, ...payload })
                      });
                    }

                    if (res.ok) {
                      setShowTaskModal(false);
                      fetchAdminData();
                    }
                  } catch (err) {
                    console.error("Failed to save task:", err);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Client</label>
                  <select
                    required
                    disabled={!!editingTask}
                    value={taskFormClientEmail}
                    onChange={(e) => setTaskFormClientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="" disabled>Choose client...</option>
                    {billingProfiles.map(p => (
                      <option key={p.email} value={p.email}>{p.primary_contact_name || p.company_name || p.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskFormTitle}
                    onChange={(e) => setTaskFormTitle(e.target.value)}
                    placeholder="Provide clean deliverables..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={taskFormDesc}
                    onChange={(e) => setTaskFormDesc(e.target.value)}
                    placeholder="Detail out tasks..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
                    <input
                      type="date"
                      required
                      value={taskFormDeadline}
                      onChange={(e) => setTaskFormDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned To</label>
                    <select
                      value={taskFormAssignedTo}
                      onChange={(e) => setTaskFormAssignedTo(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    >
                      <option value="client">Client</option>
                      <option value="amedee">Me (Amedee)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="w-1/2 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Management Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">
                    {editingProject ? "Edit Project" : "Create Client Project"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {editingProject ? "Modify project status, progress, or feedback." : "Initiate a portal project for a client."}
                  </p>
                </div>
                <button 
                  onClick={() => setShowProjectModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveClientProject} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Client</label>
                  <select
                    required
                    disabled={!!editingProject}
                    value={projectFormClientEmail}
                    onChange={(e) => setProjectFormClientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="" disabled>Choose client...</option>
                    {billingProfiles.map(p => (
                      <option key={p.email} value={p.email}>{p.primary_contact_name || p.company_name || p.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectFormTitle}
                    onChange={(e) => setProjectFormTitle(e.target.value)}
                    placeholder="E.g. Web Platform Overhaul"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    value={projectFormDescText}
                    onChange={(e) => setProjectFormDescText(e.target.value)}
                    placeholder="Summary of scope..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                    <select
                      value={projectFormStatus}
                      onChange={(e) => setProjectFormStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Progress ({projectFormProgress}%)</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={projectFormProgress}
                      onChange={(e) => setProjectFormProgress(Number(e.target.value))}
                      className="w-full h-8 accent-indigo-650"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={projectFormStartDate}
                      onChange={(e) => setProjectFormStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Launch</label>
                    <input
                      type="date"
                      value={projectFormTargetLaunch}
                      onChange={(e) => setProjectFormTargetLaunch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Feedback (Amedee)</label>
                  <textarea
                    rows={2}
                    value={projectFormAdminFeedback}
                    onChange={(e) => setProjectFormAdminFeedback(e.target.value)}
                    placeholder="Log progress, notes, or next steps..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold resize-none"
                  />
                </div>

                {editingProject && (
                  <div>
                    <label className="block text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest mb-1.5">Client Feedback (Read-Only)</label>
                    <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                      {projectFormClientFeedback || "No client feedback logged yet."}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="w-1/2 py-3 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-xl cursor-pointer transition-colors"
                  >
                    Save Project
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
