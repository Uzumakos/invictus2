"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, Save, X, 
  ArrowRight, FileText, Check, ShieldAlert, Languages, RefreshCcw, DollarSign,
  Mail, Download, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BillingProfile {
  id: string;
  companyName: string;
  billingAddress: string;
  country: string;
  primaryContactName: string;
  email: string;
  currency: string;
  preferredLanguage: string;
  paymentTerms: string;
  defaultDiscount: number;
}

interface DocumentItem {
  description: {
    en: string;
    fr: string;
  };
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxPercentage: number;
  subtotal: number;
  total: number;
}

interface CommercialDocument {
  id: string;
  documentType: "quote" | "invoice";
  documentNumber: string;
  clientId: string;
  projectId?: string;
  consultationId?: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  language: string;
  templateStyle: string;
  status: string;
  paymentLink?: string;
  transactionReference?: string;
  discountTotal: number;
  taxTotal: number;
  subtotal: number;
  totalAmount: number;
  notes?: string;
  termsConditions?: string;
  client?: BillingProfile;
  items?: DocumentItem[];
}

export default function InvoiceManager() {
  const [documents, setDocuments] = useState<CommercialDocument[]>([]);
  const [clients, setClients] = useState<BillingProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "quote" | "invoice">("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CommercialDocument | null>(null);

  // Form Fields - Master Document
  const [documentType, setDocumentType] = useState<"quote" | "invoice">("quote");
  const [documentNumber, setDocumentNumber] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("fr");
  const [templateStyle, setTemplateStyle] = useState("modern");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [termsConditions, setTermsConditions] = useState("");

  // Items Form Fields
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [itemLangTab, setItemLangTab] = useState<"en" | "fr">("fr");

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchClients();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/client-billing-profiles");
      if (res.ok) {
        const data = await res.json();
        setClients(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateClick = (type: "quote" | "invoice") => {
    setEditingDoc(null);
    setDocumentType(type);
    
    // Auto-generate document sequence temporary placeholder
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    setDocumentNumber(type === "quote" ? `QT-${year}-${rand}` : `INV-${year}-${rand}`);
    
    setSelectedClientId("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setCurrency("USD");
    setLanguage("fr");
    setTemplateStyle("modern");
    setStatus("draft");
    setNotes("");
    setTermsConditions("");
    setItems([createEmptyItem()]);
    setIsEditorOpen(true);
  };

  const handleEditClick = async (doc: CommercialDocument) => {
    try {
      // Fetch full document with associated items
      const res = await fetch(`/api/documents/${doc.id}`);
      if (!res.ok) throw new Error("Failed to load document details.");
      
      const fullDoc: CommercialDocument = await res.json();
      setEditingDoc(fullDoc);
      setDocumentType(fullDoc.documentType);
      setDocumentNumber(fullDoc.documentNumber);
      setSelectedClientId(fullDoc.clientId);
      setIssueDate(fullDoc.issueDate);
      setDueDate(fullDoc.dueDate);
      setCurrency(fullDoc.currency);
      setLanguage(fullDoc.language);
      setTemplateStyle(fullDoc.templateStyle);
      setStatus(fullDoc.status);
      setNotes(fullDoc.notes || "");
      setTermsConditions(fullDoc.termsConditions || "");
      setItems(fullDoc.items || [createEmptyItem()]);
      setIsEditorOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load document.");
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setCurrency(client.currency);
      setLanguage(client.preferredLanguage);
      
      // Auto apply client default discount to existing first item if it is empty
      if (items.length === 1 && items[0].unitPrice === 0) {
        const updated = [...items];
        updated[0].discountPercentage = client.defaultDiscount;
        setItems(updated);
      }
    }
  };

  const createEmptyItem = (): DocumentItem => ({
    description: { en: "", fr: "" },
    quantity: 1,
    unitPrice: 0,
    discountPercentage: 0,
    taxPercentage: 0,
    subtotal: 0,
    total: 0
  });

  const handleAddItemRow = () => {
    setItems([...items, createEmptyItem()]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemFieldChange = (idx: number, field: keyof DocumentItem | "desc_en" | "desc_fr", value: any) => {
    const updated = [...items];
    const row = updated[idx];

    if (field === "desc_en") {
      row.description.en = value;
    } else if (field === "desc_fr") {
      row.description.fr = value;
    } else {
      (row as any)[field] = value;
    }

    // Calculations
    const qty = Number(row.quantity) || 0;
    const price = Number(row.unitPrice) || 0;
    const discPct = Number(row.discountPercentage) || 0;
    const taxPct = Number(row.taxPercentage) || 0;

    const rowSubtotal = qty * price;
    const discountVal = rowSubtotal * (discPct / 100);
    const afterDiscount = rowSubtotal - discountVal;
    const taxVal = afterDiscount * (taxPct / 100);
    const rowTotal = afterDiscount + taxVal;

    row.subtotal = Number(rowSubtotal.toFixed(2));
    row.total = Number(rowTotal.toFixed(2));

    setItems(updated);
  };

  // Compute Totals
  const calculateTotals = () => {
    let subtotalTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    let grandTotal = 0;

    items.forEach(item => {
      const rowSub = item.quantity * item.unitPrice;
      const rowDisc = rowSub * (item.discountPercentage / 100);
      const rowTax = (rowSub - rowDisc) * (item.taxPercentage / 100);
      
      subtotalTotal += rowSub;
      discountTotal += rowDisc;
      taxTotal += rowTax;
      grandTotal += (rowSub - rowDisc + rowTax);
    });

    return {
      subtotal: Number(subtotalTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      totalAmount: Number(grandTotal.toFixed(2))
    };
  };

  const totals = calculateTotals();

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      setErrorMsg("Please select a client billing profile.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        documentType,
        documentNumber,
        clientId: selectedClientId,
        issueDate,
        dueDate,
        currency,
        language,
        templateStyle,
        status,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        subtotal: totals.subtotal,
        totalAmount: totals.totalAmount,
        notes,
        termsConditions,
        items
      };

      const url = editingDoc ? `/api/documents/${editingDoc.id}` : "/api/documents";
      const method = editingDoc ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save commercial document.");
      }

      showToast(editingDoc ? "Document updated successfully." : "Document created successfully.");
      setIsEditorOpen(false);
      setEditingDoc(null);
      fetchDocuments();
      
      // Trigger ISR cache revalidation
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/[locale]", type: "layout" })
      }).catch(() => {});

    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        showToast("Document deleted successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertQuote = async (quote: CommercialDocument) => {
    if (!confirm(`Are you sure you want to convert quote "${quote.documentNumber}" into a new Invoice?`)) return;

    try {
      const res = await fetch(`/api/documents/${quote.id}/convert`, { method: "POST" });
      if (res.ok) {
        const newInvoice = await res.json();
        showToast(`Converted successfully! Invoice "${newInvoice.documentNumber}" created.`);
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(`Conversion failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmail = async (doc: CommercialDocument) => {
    setSendingEmailId(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: doc.language || "en" })
      });
      if (res.ok) {
        showToast("Email dispatched to client successfully.");
      } else {
        const data = await res.json();
        alert(`Failed to send email: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while sending the email.");
    } finally {
      setSendingEmailId(null);
    }
  };

  // Filter list
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.client?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.documentType === filterType;
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">COMMERCIAL LEDGER</span>
          <h3 className="font-serif font-bold text-xl text-white">Invoice Center</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCreateClick("quote")}
            className="bg-[#1A2324] hover:bg-white/5 border border-[#CDD4DD]/10 px-4 py-2 rounded-xl text-xs font-bold text-[#FF7A00] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quote</span>
          </button>
          <button
            onClick={() => handleCreateClick("invoice")}
            className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {isEditorOpen ? (
        <form onSubmit={handleSaveDoc} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-5 animate-fadeIn text-gray-300">
          <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
            <h4 className="font-serif font-bold text-base text-white capitalize">
              {editingDoc ? `Edit ${documentType}` : `Create ${documentType}`}
            </h4>
            <button type="button" onClick={() => setIsEditorOpen(false)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Client Profile *</label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="">Select Billing Profile...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName} ({c.primaryContactName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Document Number *</label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Issue Date *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Currency</label>
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
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Language (PDF print)</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="fr">French (FR)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Template Style</label>
              <select
                value={templateStyle}
                onChange={(e) => setTemplateStyle(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="modern">Modern Layout</option>
                <option value="corporate">Corporate Classic</option>
                <option value="minimal">Minimalist Clean</option>
                <option value="premium">Premium Glass</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                {documentType === "quote" ? (
                  <>
                    <option value="accepted">Accepted (Approved)</option>
                    <option value="declined">Declined</option>
                    <option value="expired">Expired</option>
                  </>
                ) : (
                  <>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="refunded">Refunded</option>
                  </>
                )}
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Document Line Items */}
          <div className="pt-4 border-t border-[#CDD4DD]/5 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-[#FF7A00] tracking-wider uppercase">Line Detail Items</span>
              
              {/* Language Editor tab for line item descriptions */}
              <div className="flex bg-[#121A1B] p-0.5 rounded-lg border border-[#CDD4DD]/10">
                <button
                  type="button"
                  onClick={() => setItemLangTab("en")}
                  className={`px-3 py-1 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                    itemLangTab === "en" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  EN Descriptions
                </button>
                <button
                  type="button"
                  onClick={() => setItemLangTab("fr")}
                  className={`px-3 py-1 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                    itemLangTab === "fr" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  FR Descriptions
                </button>
              </div>
            </div>

            <div className="space-y-3.5">
              {items.map((item, idx) => (
                <div key={idx} className="bg-[#121A1B] p-4 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end border border-[#CDD4DD]/5">
                  <div className="md:col-span-4">
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">
                      Item Description ({itemLangTab.toUpperCase()}) *
                    </label>
                    <input
                      type="text"
                      required
                      value={itemLangTab === "en" ? item.description.en : item.description.fr}
                      onChange={(e) => handleItemFieldChange(idx, itemLangTab === "en" ? "desc_en" : "desc_fr", e.target.value)}
                      placeholder={itemLangTab === "en" ? "e.g. Next.js Web Development" : "e.g. Développement Web Next.js"}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Qty</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemFieldChange(idx, "quantity", Number(e.target.value))}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-2 py-2 text-white text-center focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Unit Price ({currency})</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => handleItemFieldChange(idx, "unitPrice", Number(e.target.value))}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-1.5 md:col-span-2">
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Disc %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={item.discountPercentage}
                      onChange={(e) => handleItemFieldChange(idx, "discountPercentage", Number(e.target.value))}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-2 py-2 text-white text-center focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-1.5 md:col-span-2">
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Tax %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={item.taxPercentage}
                      onChange={(e) => handleItemFieldChange(idx, "taxPercentage", Number(e.target.value))}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-2 py-2 text-white text-center focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-between items-center gap-2">
                    <div className="text-left font-mono">
                      <span className="block text-[7px] text-gray-500 uppercase font-sans">Row Total</span>
                      <span className="font-bold text-white text-[11px]">
                        {currency === "GDS" ? `${item.total} HTG` : `$${item.total}`}
                      </span>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-950/20 p-2 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItemRow}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          {/* Summary footer & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 border-t border-[#CDD4DD]/5">
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Payment Terms & Conditions</label>
                <textarea
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  placeholder="Terms, bank information, check details, Swish, wire info..."
                  rows={3}
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Client Remarks / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes shown on invoice/quote..."
                  rows={2}
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-5 bg-[#121A1B] p-5 rounded-2xl space-y-3 h-fit border border-[#CDD4DD]/5 text-right font-mono">
              <span className="text-[8px] font-sans font-bold text-[#FF7A00] tracking-wider uppercase block mb-1">Totals Calculation</span>
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Subtotal:</span>
                <span>{currency === "GDS" ? `${totals.subtotal} HTG` : `$${totals.subtotal.toLocaleString()}`}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between items-center text-[10px] text-red-400">
                  <span>Discounts Applied:</span>
                  <span>-{currency === "GDS" ? `${totals.discountTotal} HTG` : `$${totals.discountTotal.toLocaleString()}`}</span>
                </div>
              )}
              {totals.taxTotal > 0 && (
                <div className="flex justify-between items-center text-[10px] text-amber-500">
                  <span>Taxes Calculated:</span>
                  <span>+{currency === "GDS" ? `${totals.taxTotal} HTG` : `$${totals.taxTotal.toLocaleString()}`}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-white border-t border-[#CDD4DD]/10 pt-2 font-sans">
                <span>Grand Total:</span>
                <span className="text-[#FF7A00] font-mono text-base">
                  {currency === "GDS" ? `${totals.totalAmount} HTG` : `$${totals.totalAmount.toLocaleString()}`}
                </span>
              </div>
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
              onClick={() => setIsEditorOpen(false)}
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
              <span>{isSubmitting ? "Saving..." : "Save Document"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex border border-[#CDD4DD]/10 rounded-xl p-0.5 bg-[#121A1B]">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === "all" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("quote")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === "quote" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Quotes
                </button>
                <button
                  onClick={() => setFilterType("invoice")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === "invoice" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Invoices
                </button>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="all">Any Status...</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#CDD4DD]/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doc number or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7A00] w-full sm:w-48"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Doc No.</th>
                    <th className="py-3 px-4">Client / Contact</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDD4DD]/5">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500 font-medium">
                        No quotes or invoices found matching filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#121A1B]/35 align-top">
                        <td className="py-3 px-4 font-mono font-bold text-white">{doc.documentNumber}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block">{doc.client?.companyName || "Anonymous"}</span>
                          <span className="text-[9px] text-[#CDD4DD]/50">{doc.client?.primaryContactName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                            doc.documentType === "quote"
                              ? "bg-blue-950/40 border-blue-500/20 text-blue-400"
                              : "bg-purple-950/40 border-purple-500/20 text-purple-400"
                          }`}>
                            {doc.documentType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="block">Issued: {doc.issueDate}</span>
                          <span className="text-[9px] text-[#CDD4DD]/40 block">Due: {doc.dueDate}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white font-mono">
                          {doc.currency === "GDS" ? `${doc.totalAmount} HTG` : `$${doc.totalAmount}`}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                            doc.status === "paid" || doc.status === "accepted"
                              ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                              : doc.status === "overdue" || doc.status === "declined"
                              ? "bg-red-950/40 border-red-500/20 text-red-400"
                              : doc.status === "sent"
                              ? "bg-blue-950/40 border-blue-500/20 text-blue-400"
                              : "bg-amber-950/40 border-amber-500/20 text-amber-400"
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {doc.documentType === "quote" && doc.status === "accepted" && (
                            <button
                              onClick={() => handleConvertQuote(doc)}
                              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[8px] font-bold uppercase cursor-pointer"
                              title="Convert to Invoice"
                            >
                              Convert to Inv
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/api/documents/${doc.id}/export?lang=${doc.language || "en"}`, "_blank")}
                            className="bg-blue-950/40 hover:bg-blue-950 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-[8px] font-bold uppercase cursor-pointer inline-flex items-center gap-1"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={() => handleSendEmail(doc)}
                            disabled={sendingEmailId === doc.id}
                            className="bg-purple-950/40 hover:bg-purple-950 border border-purple-500/20 text-purple-400 px-2 py-1 rounded text-[8px] font-bold uppercase cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                            title="Send Email"
                          >
                            {sendingEmailId === doc.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            <span>{sendingEmailId === doc.id ? "Sending" : "Email"}</span>
                          </button>
                          <button
                            onClick={() => handleEditClick(doc)}
                            className="text-gray-400 hover:text-white font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-red-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-wider cursor-pointer border-0 bg-transparent"
                            title="Delete"
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
        </div>
      )}
    </div>
  );
}
