"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, TrendingUp, DollarSign, Users, Calendar, ArrowRight, 
  RefreshCw, Layers, Check, X, AlertCircle, Search, Filter, 
  Download, Brain, Clipboard, ChevronRight, Cpu, Building2, Trash2,
  Settings, Image, Globe, CheckCircle2, Save, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Booking, CRMLead, ProjectDiscovery, PaymentMethod, PaymentConfig, SiteSettings } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "crm" | "bookings" | "discoveries" | "settings" | "users">("analytics");

  // Server state data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [discoveries, setDiscoveries] = useState<ProjectDiscovery[]>([]);
  const [users, setUsers] = useState<any[]>([]);

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
      const [bookingsRes, leadsRes, discoveriesRes, settingsRes, paymentRes, usersRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/leads"),
        fetch("/api/discoveries"),
        fetch("/api/settings"),
        fetch("/api/payment-config"),
        fetch("/api/users")
      ]);

      if (bookingsRes.ok && leadsRes.ok && discoveriesRes.ok && settingsRes.ok && paymentRes.ok && usersRes.ok) {
        setBookings(await bookingsRes.json());
        setLeads(await leadsRes.json());
        setDiscoveries(await discoveriesRes.json());
        setSiteSettings(await settingsRes.json());
        setPaymentConfig(await paymentRes.json());
        setUsers(await usersRes.json());
      } else {
        throw new Error("Failed to load secure datasets.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sync databases.");
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
            { id: "settings", label: "5. Console Settings" },
            { id: "users", label: "6. User Control" },
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
        </div>

      </div>
    </section>
  );
}
