"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, Save, X, Globe, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BillingProfile {
  id: string;
  clientId?: string;
  companyName: string;
  billingAddress: string;
  country: string;
  primaryContactName: string;
  email: string;
  phone?: string;
  taxNumber?: string;
  currency: string;
  preferredLanguage: string;
  paymentTerms: string;
  defaultDiscount: number;
  notes?: string;
  createdAt?: string;
  isApproved?: boolean;
  approvalReason?: string;
}

export default function ClientBillingManager() {
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProfile, setEditingProfile] = useState<BillingProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [country, setCountry] = useState("Haiti");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [preferredLanguage, setPreferredLanguage] = useState("fr");
  const [paymentTerms, setPaymentTerms] = useState("NET_30");
  const [defaultDiscount, setDefaultDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/client-billing-profiles");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (p: BillingProfile) => {
    setEditingProfile(p);
    setCompanyName(p.companyName || "");
    setBillingAddress(p.billingAddress || "");
    setCountry(p.country || "Haiti");
    setPrimaryContactName(p.primaryContactName || "");
    setEmail(p.email || "");
    setPhone(p.phone || "");
    setTaxNumber(p.taxNumber || "");
    setCurrency(p.currency || "USD");
    setPreferredLanguage(p.preferredLanguage || "fr");
    setPaymentTerms(p.paymentTerms || "NET_30");
    setDefaultDiscount(p.defaultDiscount || 0);
    setNotes(p.notes || "");
    setIsApproved(p.isApproved || false);
    setApprovalReason(p.approvalReason || "");
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingProfile(null);
    resetForm();
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setCompanyName("");
    setBillingAddress("");
    setCountry("Haiti");
    setPrimaryContactName("");
    setEmail("");
    setPhone("");
    setTaxNumber("");
    setCurrency("USD");
    setPreferredLanguage("fr");
    setPaymentTerms("NET_30");
    setDefaultDiscount(0);
    setNotes("");
    setIsApproved(false);
    setApprovalReason("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        clientId: editingProfile?.clientId || "00000000-0000-0000-0000-000000000000", // Default dummy UUID
        companyName,
        billingAddress,
        country,
        primaryContactName,
        email,
        phone,
        taxNumber,
        currency,
        preferredLanguage,
        paymentTerms,
        defaultDiscount: Number(defaultDiscount),
        notes,
        isApproved,
        approvalReason
      };

      const url = editingProfile ? `/api/client-billing-profiles/${editingProfile.id}` : "/api/client-billing-profiles";
      const method = editingProfile ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to save billing profile.");
      }

      setToastMsg(editingProfile ? "Billing profile updated." : "Billing profile created.");
      setTimeout(() => setToastMsg(null), 3000);
      setIsFormOpen(false);
      resetForm();
      fetchProfiles();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this billing profile?")) return;

    try {
      const res = await fetch(`/api/client-billing-profiles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProfiles(profiles.filter(p => p.id !== id));
        setToastMsg("Billing profile deleted.");
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primaryContactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs font-sans">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 bg-emerald-950 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-400 font-bold z-50 flex items-center space-x-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">CLIENT LEDGER</span>
          <h3 className="font-serif font-bold text-xl text-white">Client Workspace Registry</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#CDD4DD]/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7A00]"
            />
          </div>
          <button
            onClick={handleCreateClick}
            className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Profile</span>
          </button>
        </div>
      </div>

      {isFormOpen ? (
        <form onSubmit={handleSaveProfile} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
            <h4 className="font-serif font-bold text-base text-white">
              {editingProfile ? "Modify Billing Profile" : "Register Billing Profile"}
            </h4>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Company / Client Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Primary Contact Name *</label>
              <input
                type="text"
                required
                value={primaryContactName}
                onChange={(e) => setPrimaryContactName(e.target.value)}
                placeholder="e.g. Jean Dupont"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Billing Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. accounting@acme.com"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Billing Address *</label>
              <input
                type="text"
                required
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="e.g. 45, Rue des Miracles"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Haiti"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Phone Line</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+509 3700-0000"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Tax / NIF ID Number</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="e.g. 000-123-456-7"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Currency Preference</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="GDS">GDS (HTG)</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="fr">French (FR)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="Immediate">Due On Receipt</option>
                <option value="NET_15">NET 15</option>
                <option value="NET_30">NET 30</option>
                <option value="NET_60">NET 60</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Default Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={defaultDiscount}
                onChange={(e) => setDefaultDiscount(Number(e.target.value))}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Internal Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Billing preferences or notes..."
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Portal Approved</label>
              <select
                value={isApproved ? "true" : "false"}
                onChange={(e) => setIsApproved(e.target.value === "true")}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="false">Pending Approval (No Access)</option>
                <option value="true">Approved (Portal Access Granted)</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Approval Reason</label>
              <input
                type="text"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder="e.g. after_booking, discovery_accepted"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[#CDD4DD]/5 pt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer flex items-center gap-1.5 border-0"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Terms</th>
                  <th className="py-3 px-4">Default Disc</th>
                  <th className="py-3 px-4">Preference</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CDD4DD]/5">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                      No client billing profiles registered yet.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-[#121A1B]/35">
                      <td className="py-3 px-4 font-semibold text-white">
                        {p.companyName}
                        <span className="block text-[9px] text-[#CDD4DD]/40">{p.billingAddress}, {p.country}</span>
                      </td>
                      <td className="py-3 px-4 text-white font-bold">{p.primaryContactName}</td>
                      <td className="py-3 px-4 font-mono text-[#CDD4DD]/70">{p.email}</td>
                      <td className="py-3 px-4 font-mono text-[#CDD4DD]/60 uppercase">{p.paymentTerms}</td>
                      <td className="py-3 px-4 font-bold text-amber-500">{p.defaultDiscount}%</td>
                      <td className="py-3 px-4 flex items-center space-x-1.5 py-4">
                        <span className="bg-blue-950 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" />
                          <span>{p.currency}</span>
                        </span>
                        <span className="bg-purple-950 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <Globe className="w-2.5 h-2.5" />
                          <span>{p.preferredLanguage}</span>
                        </span>
                        {p.isApproved ? (
                          <span className="bg-emerald-950 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5" title={p.approvalReason ? `Reason: ${p.approvalReason}` : undefined}>
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="bg-amber-950 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="text-purple-400 hover:text-purple-300 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
