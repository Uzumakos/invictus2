"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, Save, X, 
  ArrowRight, FileText, Check, DollarSign, Mail, Download, Loader2,
  TrendingUp, BarChart3, Receipt, Link, User, Settings, Copy, ExternalLink,
  ChevronRight, Calendar, Landmark, CheckSquare, Printer, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ClientBillingManager from "./ClientBillingManager";
import { BusinessProfileForm } from "./CMSForms";

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
  documentType: "quote" | "invoice" | "receipt";
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
  relatedDocumentId?: string;
  paymentMethod?: string;
  paidAt?: string;
  client?: BillingProfile;
  items?: DocumentItem[];
}

interface TransactionRecord {
  id: string;
  clientEmail: string;
  clientName: string;
  amount: number;
  currency: string;
  service: string;
  date: string;
  status: string;
  invoiceUrl?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentNumber?: string;
  clientId?: string;
  invoiceId?: string;
  receiptId?: string;
  gateway?: string;
  paidAt?: string;
}

export default function FinancialCenter() {
  const [subTab, setSubTab] = useState<"dashboard" | "quotes" | "invoices" | "receipts" | "transactions" | "links" | "clients" | "business">("dashboard");
  const [documents, setDocuments] = useState<CommercialDocument[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [clients, setClients] = useState<BillingProfile[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // BI Data
  const [biData, setBiData] = useState<any>({
    mtdRevenue: 0,
    ytdRevenue: 0,
    outstandingCount: 0,
    outstandingAmount: 0,
    paidCount: 0,
    paidAmount: 0,
    overdueCount: 0,
    overdueAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    averageInvoiceValue: 0,
    averagePaymentDelay: 0,
    topClients: [],
    revenueByMonth: [],
    financialForecast: [],
    recentTransactions: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CommercialDocument | null>(null);

  // Form Fields - Master Document
  const [documentType, setDocumentType] = useState<"quote" | "invoice" | "receipt">("quote");
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
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [itemLangTab, setItemLangTab] = useState<"en" | "fr">("fr");
  const [selectedPaymentGatewayId, setSelectedPaymentGatewayId] = useState("");

  // Payment Link Generator State
  const [genEmail, setGenEmail] = useState("");
  const [genClientName, setGenClientName] = useState("");
  const [genCurrency, setGenCurrency] = useState("USD");
  const [genServiceTitle, setGenServiceTitle] = useState("");
  const [genAmount, setGenAmount] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  // Manual Payment Dialog
  const [payRecordDoc, setPayRecordDoc] = useState<CommercialDocument | null>(null);
  const [payGateway, setPayGateway] = useState("bank_transfer");
  const [payRef, setPayRef] = useState("");

  // UI Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchTransactions();
    fetchClients();
    fetchPaymentMethods();
    fetchBiData();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (err) {
      console.error("Documents fetch failed:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error("Payments fetch failed:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/client-billing-profiles");
      if (res.ok) {
        setClients(await res.json());
      }
    } catch (err) {
      console.error("Clients fetch failed:", err);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/payment-config");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data?.methods?.filter((m: any) => m.enabled) || []);
      }
    } catch (err) {
      console.error("Payment Config fetch failed:", err);
    }
  };

  const fetchBiData = async () => {
    try {
      const res = await fetch("/api/analytics/bi");
      if (res.ok) {
        setBiData(await res.json());
      }
    } catch (err) {
      console.error("BI Analytics fetch failed:", err);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Convert Quote to Invoice
  const handleConvertQuote = async (quote: CommercialDocument) => {
    if (!confirm(`Are you sure you want to convert quote "${quote.documentNumber}" into a new Invoice?`)) return;
    try {
      const res = await fetch(`/api/documents/${quote.id}/convert`, { method: "POST" });
      if (res.ok) {
        const newInvoice = await res.json();
        showToast(`Converted successfully! Invoice "${newInvoice.documentNumber}" created.`);
        fetchDocuments();
        fetchBiData();
      } else {
        const data = await res.json();
        alert(`Conversion failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatch Email Document
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

  // Generate Payment Link
  const handleGenerateLink = () => {
    if (!genEmail || !genAmount) {
      alert("Please provide client email and amount.");
      return;
    }
    const origin = window.location.origin;
    const serviceParam = encodeURIComponent(genServiceTitle || "Consulting Hours");
    const link = `${origin}/payments?amount=${genAmount}&email=${encodeURIComponent(genEmail)}&clientName=${encodeURIComponent(genClientName)}&currency=${genCurrency}&serviceId=${serviceParam}`;
    setGeneratedLink(link);
    showToast("Checkout link compiled successfully.");
  };

  // Record Manual Payment (Triggers Paid Workflow)
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payRecordDoc) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/documents/${payRecordDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paymentMethod: payGateway,
          transactionReference: payRef
        })
      });
      if (res.ok) {
        showToast(`Invoice ${payRecordDoc.documentNumber} marked as PAID. Receipt & transaction logs generated.`);
        setPayRecordDoc(null);
        setPayRef("");
        fetchDocuments();
        fetchTransactions();
        fetchBiData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to mark invoice as paid.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create empty Line detail item
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
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
  };

  const handleCreateClick = (type: "quote" | "invoice") => {
    setEditingDoc(null);
    setDocumentType(type);
    
    // Sequence placeholder
    const year = new Date().getFullYear();
    setDocumentNumber(type === "quote" ? `Q-${year}-PLACEHOLDER` : `INV-${year}-PLACEHOLDER`);
    
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
      const res = await fetch(`/api/documents/${doc.id}`);
      if (!res.ok) throw new Error("Failed to load document details.");
      
      const fullDoc: CommercialDocument = await res.json();
      setEditingDoc(fullDoc);
      setDocumentType(fullDoc.documentType as any);
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
      alert(err.message);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Document deleted successfully.");
        fetchDocuments();
        fetchBiData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setCurrency(client.currency);
      setLanguage(client.preferredLanguage);
      if (items.length === 1 && items[0].unitPrice === 0) {
        const updated = [...items];
        updated[0].discountPercentage = client.defaultDiscount;
        setItems(updated);
      }
    }
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

    const qty = Number(row.quantity) || 0;
    const price = Number(row.unitPrice) || 0;
    const discPct = Number(row.discountPercentage) || 0;
    const taxPct = Number(row.taxPercentage) || 0;

    const rowSub = qty * price;
    const discVal = rowSub * (discPct / 100);
    const afterDisc = rowSub - discVal;
    const taxVal = afterDisc * (taxPct / 100);
    
    row.subtotal = Number(rowSub.toFixed(2));
    row.total = Number((afterDisc + taxVal).toFixed(2));
    setItems(updated);
  };

  const calculateTotals = () => {
    let sub = 0;
    let disc = 0;
    let tax = 0;
    let total = 0;
    items.forEach(i => {
      const rowSub = i.quantity * i.unitPrice;
      const rowDisc = rowSub * (i.discountPercentage / 100);
      const rowTax = (rowSub - rowDisc) * (i.taxPercentage / 100);
      sub += rowSub;
      disc += rowDisc;
      tax += rowTax;
      total += (rowSub - rowDisc + rowTax);
    });
    return {
      subtotal: Number(sub.toFixed(2)),
      discountTotal: Number(disc.toFixed(2)),
      taxTotal: Number(tax.toFixed(2)),
      totalAmount: Number(total.toFixed(2))
    };
  };

  const totals = calculateTotals();

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert("Please select a client billing profile.");
      return;
    }
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
        const err = await res.json();
        throw new Error(err.error || "Save document failed");
      }

      showToast(editingDoc ? "Document updated successfully." : "Document created successfully.");
      setIsEditorOpen(false);
      setEditingDoc(null);
      fetchDocuments();
      fetchBiData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPaymentGateway = (gatewayId: string) => {
    const method = paymentMethods.find((m: any) => m.id === gatewayId);
    if (!method) return;
    let lines = [`Payment Details (${method.name}):`];
    if (method.accountNumber) lines.push(`Account Number: ${method.accountNumber}`);
    if (method.accountHolder) lines.push(`Account Holder: ${method.accountHolder}`);
    if (method.email) lines.push(`Gateway Email / Account: ${method.email}`);
    if (method.phoneNumber) lines.push(`Phone / Transfer: ${method.phoneNumber}`);
    
    setTermsConditions((prev) => prev ? `${prev.trim()}\n\n${lines.join("\n")}` : lines.join("\n"));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Checkout Link copied to clipboard!");
  };

  // Filter helpers
  const quotes = documents.filter(d => d.documentType === "quote");
  const invoices = documents.filter(d => d.documentType === "invoice");
  const receipts = documents.filter(d => d.documentType === "receipt");

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.client?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.client?.primaryContactName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = i.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.client?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.client?.primaryContactName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = r.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.client?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredTransactions = transactions.filter(t => {
    return t.paymentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.paymentReference?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 text-xs text-gray-300 font-sans">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 bg-emerald-950 border border-emerald-500/25 px-4 py-3 rounded-xl text-emerald-400 font-bold z-50 flex items-center space-x-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Payment Dialog Modal */}
      <AnimatePresence>
        {payRecordDoc && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
                <h3 className="font-serif font-bold text-base text-white">Record Manual Payment</h3>
                <button type="button" onClick={() => setPayRecordDoc(null)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
                <div>
                  <span className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Invoice Details</span>
                  <p className="text-white font-bold">{payRecordDoc.documentNumber} ({payRecordDoc.client?.companyName})</p>
                  <p className="text-emerald-500 text-sm font-bold mt-1">${payRecordDoc.totalAmount?.toLocaleString()} {payRecordDoc.currency}</p>
                </div>

                <div>
                  <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Payment Gateway / Method *</label>
                  <select
                    value={payGateway}
                    onChange={(e) => setPayGateway(e.target.value)}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="stripe">Stripe Gateway</option>
                    <option value="moncash">MonCash</option>
                    <option value="natcash">NatCash</option>
                    <option value="cash">Cash Payment</option>
                    <option value="manual">Other Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Transaction Reference / Reference ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN-98471-BANK"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayRecordDoc(null)}
                    className="px-4 py-2 border border-[#CDD4DD]/15 text-white text-xs font-bold rounded-xl bg-transparent hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Confirm Payment</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#CDD4DD]/10 pb-4">
        <div>
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">FINANCIAL OFFICE</span>
          <h2 className="font-serif font-bold text-2xl text-white">Financial Center</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
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
          <button
            onClick={async () => {
              fetchDocuments();
              fetchTransactions();
              fetchBiData();
              showToast("Financial Center data reloaded.");
            }}
            className="p-2 border border-[#CDD4DD]/10 rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Top Workspace Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#CDD4DD]/10 pb-3">
        {[
          { id: "dashboard", label: "Executive Reports", icon: BarChart3 },
          { id: "quotes", label: "Quotations", icon: FileText },
          { id: "invoices", label: "Invoices", icon: DollarSign },
          { id: "receipts", label: "Receipts", icon: Receipt },
          { id: "transactions", label: "Transactions", icon: Landmark },
          { id: "links", label: "Payment Links", icon: Link },
          { id: "clients", label: "Workspace Registry", icon: User },
          { id: "business", label: "Business Config", icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setSubTab(tab.id as any);
                setSearchQuery("");
                setFilterStatus("all");
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                isActive
                  ? "bg-[#FF7A00]/15 border border-[#FF7A00]/40 text-[#FF7A00]"
                  : "bg-transparent border border-transparent text-gray-500 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="mt-4">
        {isEditorOpen ? (
          /* Document Editor (Drafting Quotes & Invoices) */
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
                  required
                >
                  <option value="">Select Billing Profile...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.primaryContactName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Document Number (Sequence auto)</label>
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  disabled={!editingDoc}
                  placeholder="Auto-generated sequence"
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
                  <option value="HTG">HTG (Gourdes)</option>
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
                  {documentType === "quote" ? (
                    <>
                      <option value="accepted">Accepted (Approved)</option>
                      <option value="declined">Rejected</option>
                      <option value="expired">Expired</option>
                    </>
                  ) : documentType === "receipt" ? (
                    <>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending Payment</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Document Line Items */}
            <div className="pt-4 border-t border-[#CDD4DD]/5 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-[#FF7A00] tracking-wider uppercase">Line Detail Items</span>
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
                      <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Item Description ({itemLangTab.toUpperCase()}) *</label>
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
                      <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Unit Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => handleItemFieldChange(idx, "unitPrice", Number(e.target.value))}
                        className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white text-right focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-1.5">
                      <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Disc %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercentage}
                        onChange={(e) => handleItemFieldChange(idx, "discountPercentage", Number(e.target.value))}
                        className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-2 py-2 text-white text-center focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-1.5">
                      <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Tax %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxPercentage}
                        onChange={(e) => handleItemFieldChange(idx, "taxPercentage", Number(e.target.value))}
                        className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-2 py-2 text-white text-center focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-1.5 text-right font-mono font-bold text-white pb-2.5">
                      ${item.total?.toLocaleString()}
                    </div>
                    <div className="md:col-span-0.5 pb-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={items.length === 1}
                        className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="mt-2 bg-[#121A1B] hover:bg-white/5 border border-dashed border-[#CDD4DD]/15 w-full py-2.5 rounded-xl font-bold text-gray-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item Line Detail</span>
              </button>
            </div>

            {/* Terms and Layout Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-[#CDD4DD]/5">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase">Payment Instructions / Terms</label>
                    <select
                      value={selectedPaymentGatewayId}
                      onChange={(e) => {
                        setSelectedPaymentGatewayId(e.target.value);
                        handleApplyPaymentGateway(e.target.value);
                      }}
                      className="bg-[#121A1B] border border-[#CDD4DD]/10 rounded-lg px-2 py-1 text-[9px] text-[#FF7A00] focus:outline-none cursor-pointer"
                    >
                      <option value="">Attach Gateway Instructions...</option>
                      {paymentMethods.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    rows={4}
                    value={termsConditions}
                    onChange={(e) => setTermsConditions(e.target.value)}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white text-xs resize-none focus:outline-none"
                    placeholder="Enter payment instructions, bank info, routing guidelines, MonCash phone numbers..."
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase mb-1">Public Notes (Shown on PDF)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white text-xs resize-none focus:outline-none"
                    placeholder="Thank you for your business! Note: quotes expire in 30 days."
                  />
                </div>
              </div>

              {/* Totals Summary Panel */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Financial Summary</span>
                
                <div className="space-y-2.5 font-mono text-gray-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white">${totals.subtotal.toLocaleString()}</span>
                  </div>
                  {totals.discountTotal > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Total Discounts:</span>
                      <span>-${totals.discountTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.taxTotal > 0 && (
                    <div className="flex justify-between">
                      <span>Total Taxes:</span>
                      <span className="text-white">+${totals.taxTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-sm border-t border-[#CDD4DD]/10 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-[#FF7A00]">${totals.totalAmount.toLocaleString()} {currency}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#CDD4DD]/5 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-5 py-2.5 border border-[#CDD4DD]/15 text-white text-xs font-bold rounded-xl bg-transparent hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#FF7A00] hover:bg-opacity-90 text-white text-xs font-bold rounded-xl cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    {isSubmitting ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                    <span>Save {documentType}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* Sub-tabs Render */
          <>
            {subTab === "dashboard" && (
              /* Reports Dashboard */
              <div className="space-y-6 animate-fadeIn">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Revenue (MTD)", value: biData.mtdRevenue, prefix: "$", color: "text-emerald-500" },
                    { label: "Revenue (YTD)", value: biData.ytdRevenue, prefix: "$", color: "text-[#FF7A00]" },
                    { label: "Outstanding Invoices", value: biData.outstandingAmount, prefix: "$", sub: `${biData.outstandingCount} invoices`, color: "text-amber-500" },
                    { label: "Overdue Invoices", value: biData.overdueAmount, prefix: "$", sub: `${biData.overdueCount} overdue`, color: "text-red-500" }
                  ].map((metric, idx) => (
                    <div key={idx} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-1 glow-card">
                      <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">{metric.label}</span>
                      <p className={`text-xl font-bold font-mono ${metric.color}`}>
                        {metric.prefix}{metric.value?.toLocaleString()}
                      </p>
                      {metric.sub && <span className="block text-[9px] text-gray-500">{metric.sub}</span>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Average Invoice Value", value: biData.averageInvoiceValue, prefix: "$" },
                    { label: "Average Payment Delay", value: biData.averagePaymentDelay, suffix: " Days" },
                    { label: "Active CRM Pipeline", value: biData.pipelineValue, prefix: "$" },
                    { label: "Total Billable Hours", value: biData.consultingHours, suffix: " Hrs" }
                  ].map((metric, idx) => (
                    <div key={idx} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl space-y-1">
                      <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">{metric.label}</span>
                      <p className="text-lg font-bold font-mono text-white">
                        {metric.prefix}{metric.value?.toLocaleString()}{metric.suffix}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Cash Flow Chart & Top Clients */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Monthly Cash Flow chart */}
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl md:col-span-2 space-y-4">
                    <h3 className="font-serif font-bold text-sm text-white">Monthly Cash Flow</h3>
                    
                    <div className="h-48 flex items-end justify-between pt-4 pb-2 border-b border-[#CDD4DD]/5 font-mono text-[9px] text-gray-500">
                      {biData.revenueByMonth?.length === 0 ? (
                        <div className="w-full text-center text-gray-500">No cash flow recorded this year.</div>
                      ) : (
                        biData.revenueByMonth.map((bar: any, idx: number) => {
                          // Find max to scale
                          const maxVal = Math.max(...biData.revenueByMonth.map((b: any) => b.amount), 1);
                          const pct = (bar.amount / maxVal) * 100;
                          return (
                            <div key={idx} className="flex flex-col items-center space-y-2 flex-grow group">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[#FF7A00] -translate-y-1">
                                ${Math.round(bar.amount)}
                              </span>
                              <div className="w-8 bg-[#1E2E30] rounded-t-lg relative flex items-end overflow-hidden" style={{ height: "120px" }}>
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${pct}%` }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="w-full bg-[#FF7A00]" 
                                />
                              </div>
                              <span className="text-[8px] uppercase tracking-wider font-bold">{bar.month}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Top Clients */}
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
                    <h3 className="font-serif font-bold text-sm text-white">Top Clients by Revenue</h3>
                    <div className="space-y-4">
                      {biData.topClients?.length === 0 ? (
                        <p className="text-gray-500 text-center font-mono">No customer billing accounts recorded.</p>
                      ) : (
                        biData.topClients.map((client: any, idx: number) => {
                          const maxRev = biData.topClients[0]?.totalPaid || 1;
                          const barPct = (client.totalPaid / maxRev) * 100;
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-white truncate max-w-[120px]">{client.companyName}</span>
                                <span className="font-mono text-[#FF7A00] font-bold">${client.totalPaid?.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-[#121A1B] h-2 rounded-full overflow-hidden border border-[#CDD4DD]/5">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${barPct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Forecast & Recent Transactions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Financial Forecast */}
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
                    <h3 className="font-serif font-bold text-sm text-white">Financial Forecast</h3>
                    <p className="text-gray-500 leading-relaxed text-[10px]">
                      Historical cash flow averages projected for the next 3 months, assuming a standard 5% baseline expansion coefficient:
                    </p>
                    <div className="space-y-3 pt-2 font-mono">
                      {biData.financialForecast?.map((f: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-[#121A1B] p-3.5 rounded-xl border border-[#CDD4DD]/5">
                          <div>
                            <span className="text-gray-500 uppercase tracking-widest text-[8px] font-bold block">Projected for</span>
                            <span className="text-white font-bold">{f.month}</span>
                          </div>
                          <span className="text-emerald-500 font-bold text-sm">${f.projected?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl md:col-span-2 space-y-4">
                    <h3 className="font-serif font-bold text-sm text-white">Recent Transactions</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="border-b border-[#CDD4DD]/5 text-gray-500 text-[8px] uppercase tracking-wider">
                            <th className="pb-2.5">PAY ID</th>
                            <th className="pb-2.5">Client</th>
                            <th className="pb-2.5">Service</th>
                            <th className="pb-2.5">Gateway</th>
                            <th className="pb-2.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#CDD4DD]/5">
                          {biData.recentTransactions?.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-gray-500">No payment logs found.</td>
                            </tr>
                          ) : (
                            biData.recentTransactions.map((tx: any, idx: number) => (
                              <tr key={tx.id || idx} className="text-[10px]">
                                <td className="py-2.5 font-bold text-white">{tx.payment_number || tx.id?.substring(0, 8)}</td>
                                <td className="py-2.5 text-gray-400">{tx.client_name}</td>
                                <td className="py-2.5 text-gray-400 truncate max-w-[140px]">{tx.service}</td>
                                <td className="py-2.5 text-gray-500 text-[9px] uppercase">{tx.payment_method || tx.gateway}</td>
                                <td className="py-2.5 text-right font-bold text-emerald-500">${tx.amount?.toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {subTab === "quotes" && (
              /* Quotations Tab */
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center gap-3">
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search Quotes by client or document number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl overflow-hidden shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121A1B] border-b border-[#CDD4DD]/10 text-gray-500 text-[8px] uppercase tracking-wider">
                        <th className="p-4">Number</th>
                        <th className="p-4">Client Company</th>
                        <th className="p-4">Primary Contact</th>
                        <th className="p-4">Issue Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CDD4DD]/5 text-[11px]">
                      {filteredQuotes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">No quotation documents found.</td>
                        </tr>
                      ) : (
                        filteredQuotes.map((q) => (
                          <tr key={q.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 font-mono font-bold text-white">{q.documentNumber}</td>
                            <td className="p-4 text-gray-300 font-semibold">{q.client?.companyName || "N/A"}</td>
                            <td className="p-4 text-gray-400">{q.client?.primaryContactName || "N/A"}</td>
                            <td className="p-4 text-gray-400">{q.issueDate}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-sans uppercase font-bold border ${
                                q.status === "accepted" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" :
                                q.status === "declined" ? "bg-red-950/40 border-red-500/20 text-red-400" :
                                q.status === "expired" ? "bg-gray-900 border-gray-700 text-gray-400" :
                                q.status === "sent" ? "bg-blue-950/40 border-blue-500/20 text-blue-400" :
                                "bg-zinc-950 border-zinc-700 text-zinc-400"
                              }`}>
                                {q.status}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-white">${q.totalAmount?.toLocaleString()} {q.currency}</td>
                            <td className="p-4 flex justify-center items-center gap-2">
                              <button onClick={() => handleEditClick(q)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded" title="Edit quote">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <a href={`/api/documents/${q.id}/export`} className="p-1.5 text-gray-400 hover:text-[#FF7A00] hover:bg-white/5 rounded" title="Download PDF">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => handleSendEmail(q)} disabled={sendingEmailId === q.id} className="p-1.5 text-gray-400 hover:text-[#FF7A00] hover:bg-white/5 rounded disabled:opacity-30" title="Email Quote">
                                {sendingEmailId === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                              </button>
                              {q.status === "accepted" && (
                                <button onClick={() => handleConvertQuote(q)} className="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-white/5 rounded" title="Convert to Invoice">
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteDoc(q.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-white/5 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
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

            {subTab === "invoices" && (
              /* Invoices Tab */
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center gap-3">
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search Invoices by client or document number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl overflow-hidden shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121A1B] border-b border-[#CDD4DD]/10 text-gray-500 text-[8px] uppercase tracking-wider">
                        <th className="p-4">Number</th>
                        <th className="p-4">Client Company</th>
                        <th className="p-4">Issue Date</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CDD4DD]/5 text-[11px]">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">No invoice documents found.</td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 font-mono font-bold text-white">{inv.documentNumber}</td>
                            <td className="p-4 text-gray-300 font-semibold">{inv.client?.companyName || "N/A"}</td>
                            <td className="p-4 text-gray-400">{inv.issueDate}</td>
                            <td className="p-4 text-gray-400">{inv.dueDate || "Upon Receipt"}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-sans uppercase font-bold border ${
                                inv.status === "paid" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" :
                                inv.status === "overdue" ? "bg-red-950/40 border-red-500/20 text-red-400" :
                                inv.status === "pending" ? "bg-amber-950/40 border-amber-500/20 text-amber-400" :
                                inv.status === "cancelled" ? "bg-gray-900 border-gray-700 text-gray-400" :
                                "bg-zinc-950 border-zinc-700 text-zinc-400"
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-white">${inv.totalAmount?.toLocaleString()} {inv.currency}</td>
                            <td className="p-4 flex justify-center items-center gap-2">
                              <button onClick={() => handleEditClick(inv)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded" title="Edit invoice">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <a href={`/api/documents/${inv.id}/export`} className="p-1.5 text-gray-400 hover:text-[#FF7A00] hover:bg-white/5 rounded" title="Download PDF">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => handleSendEmail(inv)} disabled={sendingEmailId === inv.id} className="p-1.5 text-gray-400 hover:text-[#FF7A00] hover:bg-white/5 rounded disabled:opacity-30" title="Email invoice">
                                {sendingEmailId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                              </button>
                              {inv.status !== "paid" && inv.status !== "cancelled" && (
                                <button onClick={() => setPayRecordDoc(inv)} className="px-2 py-1 bg-emerald-600/10 border border-emerald-500/35 hover:bg-emerald-600/35 rounded text-emerald-400 font-bold font-sans text-[8px] uppercase tracking-wider cursor-pointer" title="Record Manual Payment">
                                  Pay Invoice
                                </button>
                              )}
                              <button onClick={() => handleDeleteDoc(inv.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-white/5 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
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

            {subTab === "receipts" && (
              /* Receipts Tab */
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center gap-3">
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search Receipts by number, company, or transaction..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl overflow-hidden shadow-md">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#121A1B] border-b border-[#CDD4DD]/10 text-gray-500 text-[8px] uppercase tracking-wider">
                        <th className="p-4">Receipt Number</th>
                        <th className="p-4">Client Company</th>
                        <th className="p-4">Payment Date</th>
                        <th className="p-4">Payment Method</th>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4 text-right">Amount Paid</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CDD4DD]/5 text-[11px]">
                      {filteredReceipts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">No payment receipts generated.</td>
                        </tr>
                      ) : (
                        filteredReceipts.map((rec) => (
                          <tr key={rec.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 font-mono font-bold text-white">{rec.documentNumber}</td>
                            <td className="p-4 text-gray-300 font-semibold">{rec.client?.companyName || "N/A"}</td>
                            <td className="p-4 text-gray-400">{rec.issueDate}</td>
                            <td className="p-4 text-gray-500 uppercase text-[9px] font-bold">{rec.paymentMethod || "manual"}</td>
                            <td className="p-4 text-gray-400 font-mono text-[9px]">{rec.transactionReference || "N/A"}</td>
                            <td className="p-4 text-right font-mono font-bold text-emerald-500">${rec.totalAmount?.toLocaleString()} {rec.currency}</td>
                            <td className="p-4 flex justify-center items-center gap-2">
                              <button onClick={() => handleEditClick(rec)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded" title="Edit Receipt">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <a href={`/api/documents/${rec.id}/export`} className="p-1.5 text-gray-400 hover:text-[#FF7A00] hover:bg-white/5 rounded" title="Download PDF">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => handleSendEmail(rec)} disabled={sendingEmailId === rec.id} className="p-1.5 text-gray-400 hover:text-[#FF7A00] hover:bg-white/5 rounded disabled:opacity-30" title="Email receipt">
                                {sendingEmailId === rec.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                              </button>
                              <a href={`/api/documents/${rec.id}/export`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-[#FF7A00] hover:bg-white/5 rounded" title="Print Receipt">
                                <Printer className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => handleDeleteDoc(rec.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-white/5 rounded" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
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

            {subTab === "transactions" && (
              /* Transactions Tab */
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center gap-3">
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search transactions by PAY ID, client, or reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl overflow-hidden shadow-md">
                  <table className="w-full text-left border-collapse font-mono">
                    <thead>
                      <tr className="bg-[#121A1B] border-b border-[#CDD4DD]/10 text-gray-500 text-[8px] uppercase tracking-wider">
                        <th className="p-4">PAY ID</th>
                        <th className="p-4 font-sans">Client Name</th>
                        <th className="p-4 font-sans">Description</th>
                        <th className="p-4">Paid On</th>
                        <th className="p-4">Gateway</th>
                        <th className="p-4">Ref Reference</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CDD4DD]/5 text-[11px]">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-500 font-sans">No transactions ledger logs found.</td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                            <td className="p-4 font-bold text-white">{tx.paymentNumber || tx.id.substring(0,8)}</td>
                            <td className="p-4 font-sans font-semibold text-gray-300">{tx.clientName}</td>
                            <td className="p-4 font-sans text-gray-400 max-w-[150px] truncate">{tx.service}</td>
                            <td className="p-4 text-gray-400">{tx.date}</td>
                            <td className="p-4 text-gray-500 uppercase text-[9px] font-bold">{tx.paymentMethod || tx.gateway}</td>
                            <td className="p-4 text-gray-400 text-[10px]">{tx.paymentReference || "N/A"}</td>
                            <td className="p-4 text-right font-bold text-emerald-500">${tx.amount?.toLocaleString()} {tx.currency || "USD"}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-sans uppercase font-bold border ${
                                tx.status === "paid" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" :
                                "bg-zinc-950 border-zinc-700 text-zinc-400"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subTab === "links" && (
              /* Payment Links Generator */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-[#FF7A00]" />
                    <span>Generate Secure Checkout Link</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Billing Client Profile</label>
                      <select
                        onChange={(e) => {
                          const cli = clients.find(c => c.id === e.target.value);
                          if (cli) {
                            setGenEmail(cli.email);
                            setGenClientName(cli.primaryContactName || cli.companyName);
                            setGenCurrency(cli.currency);
                          } else {
                            setGenEmail("");
                            setGenClientName("");
                          }
                        }}
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                      >
                        <option value="">Select Existing Client...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.companyName} ({c.primaryContactName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Client Email (Prefill) *</label>
                      <input
                        type="email"
                        required
                        placeholder="client.email@domain.com"
                        value={genEmail}
                        onChange={(e) => setGenEmail(e.target.value)}
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Service Title / Milestone *</label>
                        <input
                          type="text"
                          placeholder="e.g. Milestone 1 kickoff"
                          value={genServiceTitle}
                          onChange={(e) => setGenServiceTitle(e.target.value)}
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Currency</label>
                        <select
                          value={genCurrency}
                          onChange={(e) => setGenCurrency(e.target.value)}
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="HTG">HTG (Gourdes)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Billing Amount *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="e.g. 1500"
                        value={genAmount}
                        onChange={(e) => setGenAmount(e.target.value)}
                        className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none text-right font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateLink}
                      className="w-full py-3 bg-[#FF7A00] hover:bg-opacity-90 border-0 rounded-xl text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Generate Secure URL
                    </button>
                  </div>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl flex flex-col justify-between">
                  <h3 className="font-serif font-bold text-sm text-white">Generated Payment Checkout Link</h3>
                  
                  {generatedLink ? (
                    <div className="space-y-4 pt-2">
                      <div className="bg-[#121A1B] border border-[#CDD4DD]/5 p-4 rounded-2xl break-all font-mono text-gray-400 relative">
                        <p className="text-[10px] pr-8">{generatedLink}</p>
                        <button
                          onClick={() => copyToClipboard(generatedLink)}
                          className="absolute right-3.5 top-3.5 p-1.5 bg-white/5 border border-transparent hover:border-[#CDD4DD]/10 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={generatedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-grow py-3 bg-[#121A1B] hover:bg-white/5 border border-[#CDD4DD]/10 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <ExternalLink className="w-4 h-4 text-[#FF7A00]" />
                          <span>Test Checkout Link</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 font-mono flex flex-col items-center justify-center flex-grow">
                      <Landmark className="w-12 h-12 mb-3 text-gray-600 opacity-60" />
                      <span>Generate a payment checkout link to share with clients for mobile money, bank transfer, or international wire instructions.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {subTab === "clients" && (
              /* Client Workspace Registry */
              <div className="animate-fadeIn">
                <ClientBillingManager />
              </div>
            )}

            {subTab === "business" && (
              /* Business Profile Config */
              <div className="animate-fadeIn">
                <BusinessProfileForm />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
