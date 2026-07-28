"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { 
  DollarSign, Download, CreditCard, Shield, AlertCircle, CheckCircle, 
  Clock, FileText, ChevronRight, Check, X, Printer, Loader2, Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PortalPaymentsProps {
  payments: any[];
  documents: any[];
  onReload?: () => void;
}

export default function PortalPayments({ payments = [], documents = [], onReload }: PortalPaymentsProps) {
  const t = useTranslations("portal");
  const [activeSubTab, setActiveSubTab] = useState<"unpaid" | "quotes" | "receipts" | "ledger">("unpaid");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Document Filters
  const quotes = documents.filter(d => d.documentType === "quote");
  const invoices = documents.filter(d => d.documentType === "invoice");
  const receipts = documents.filter(d => d.documentType === "receipt");

  const unpaidInvoices = invoices.filter(i => i.status !== "paid" && i.status !== "cancelled");
  const paidInvoices = invoices.filter(i => i.status === "paid");

  // Accept/Decline Quote handlers
  const handleQuoteStatusChange = async (quoteId: string, newStatus: "accepted" | "declined") => {
    if (!confirm(`Are you sure you want to ${newStatus === "accepted" ? "accept" : "decline"} this quotation?`)) return;
    setSubmittingId(quoteId);
    try {
      const res = await fetch(`/api/documents/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onReload?.();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update quotation status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handlePayNow = (invId: string) => {
    window.location.href = `/payments?invoiceId=${invId}`;
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/20 pb-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
            {t("payments")}
          </h3>
          <p className="text-[11px] text-[var(--color-brand-muted)] font-medium mt-1">
            Access secure invoicing, quotations, payment links, and transactional receipts.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shrink-0">
          <Shield className="w-3.5 h-3.5" />
          PCI Secure
        </div>
      </div>

      {/* Sub-tabs Nav */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-brand-neutral)]/10 pb-2">
        {[
          { id: "unpaid", label: `Unpaid Invoices (${unpaidInvoices.length})`, icon: DollarSign },
          { id: "quotes", label: `Quotations (${quotes.length})`, icon: FileText },
          { id: "receipts", label: `Official Receipts (${receipts.length})`, icon: CheckCircle },
          { id: "ledger", label: "Ledger History", icon: Landmark }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                isActive
                  ? "bg-[var(--color-brand-primary)]/5 border-[var(--color-brand-primary)]/45 text-[var(--color-brand-primary)]"
                  : "bg-transparent border-transparent text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeSubTab === "unpaid" && (
          <div className="space-y-4">
            {unpaidInvoices.length === 0 ? (
              <div className="p-10 text-center bg-white border border-dashed border-[var(--color-brand-neutral)]/20 rounded-3xl text-xs text-[var(--color-brand-muted)] font-mono">
                You have no outstanding invoices. All milestones are fully funded!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {unpaidInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white border border-amber-200/80 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
                          inv.status === "overdue"
                            ? "bg-red-50 border-red-100 text-red-700 animate-pulse"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}>
                          {inv.status}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--color-brand-muted)]">INV: {inv.documentNumber}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[var(--color-brand-dark)] leading-snug truncate">
                        {inv.items?.[0]?.description?.fr || inv.items?.[0]?.description?.en || "Consulting Services"}
                      </h4>
                      <p className="text-[10px] text-[var(--color-brand-muted)]">
                        Issue Date: {inv.issueDate} &middot; Due: {inv.dueDate || "Upon Receipt"}
                      </p>
                    </div>

                    <div className="border-t border-[var(--color-brand-neutral)]/10 pt-4 flex justify-between items-center">
                      <div>
                        <span className="block text-[8px] font-sans font-bold text-[var(--color-brand-muted)] uppercase">Amount Due</span>
                        <span className="text-base font-serif font-bold text-[var(--color-brand-primary)]">
                          ${inv.totalAmount?.toLocaleString()} {inv.currency}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/api/documents/${inv.id}/export`}
                          className="p-2 border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] rounded-xl transition-all"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handlePayNow(inv.id)}
                          className="px-4 py-2 bg-[var(--color-brand-primary)] hover:bg-opacity-90 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer border-0 flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "quotes" && (
          <div className="space-y-4">
            {quotes.length === 0 ? (
              <div className="p-10 text-center bg-white border border-dashed border-[var(--color-brand-neutral)]/20 rounded-3xl text-xs text-[var(--color-brand-muted)] font-mono">
                No active quotation proposals found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quotes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white border border-[var(--color-brand-neutral)]/20 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
                          q.status === "accepted" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                          q.status === "declined" ? "bg-red-50 border-red-100 text-red-700" :
                          "bg-blue-50 border-blue-100 text-blue-700"
                        }`}>
                          {q.status}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--color-brand-muted)]">Quote: {q.documentNumber}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[var(--color-brand-dark)] leading-snug truncate">
                        {q.items?.[0]?.description?.fr || q.items?.[0]?.description?.en || "Consulting Proposal"}
                      </h4>
                      <p className="text-[10px] text-[var(--color-brand-muted)]">
                        Proposal Date: {q.issueDate} &middot; Exp: {q.dueDate || "30 days"}
                      </p>
                    </div>

                    <div className="border-t border-[var(--color-brand-neutral)]/10 pt-4 flex justify-between items-center">
                      <div>
                        <span className="block text-[8px] font-sans font-bold text-[var(--color-brand-muted)] uppercase">Quote Total</span>
                        <span className="text-base font-serif font-bold text-[var(--color-brand-dark)]">
                          ${q.totalAmount?.toLocaleString()} {q.currency}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <a
                          href={`/api/documents/${q.id}/export`}
                          className="p-2 border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] rounded-xl transition-all"
                          title="Download Quote PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {q.status === "sent" && (
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleQuoteStatusChange(q.id, "declined")}
                              disabled={submittingId === q.id}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer border border-red-200"
                              title="Reject Proposal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleQuoteStatusChange(q.id, "accepted")}
                              disabled={submittingId === q.id}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer border-0 flex items-center gap-1 font-bold text-[10px] uppercase"
                            >
                              {submittingId === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Accept</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "receipts" && (
          <div className="space-y-4">
            {receipts.length === 0 ? (
              <div className="p-10 text-center bg-white border border-dashed border-[var(--color-brand-neutral)]/20 rounded-3xl text-xs text-[var(--color-brand-muted)] font-mono">
                No payment receipts found in this workspace registry. Receipts are auto-compiled upon invoice checkout.
              </div>
            ) : (
              <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl overflow-hidden divide-y divide-[var(--color-brand-neutral)]/15">
                {receipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[var(--color-brand-bg)]/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-serif font-bold text-[var(--color-brand-dark)] block">
                        Payment Receipt {rec.documentNumber}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-[var(--color-brand-muted)]">
                        <span>Paid on: {rec.issueDate}</span>
                        <span>•</span>
                        {rec.paymentMethod && <span className="uppercase">Gateway: {rec.paymentMethod}</span>}
                        <span>•</span>
                        {rec.transactionReference && <span className="text-[9px] truncate max-w-[120px]">Ref: {rec.transactionReference}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div>
                        <span className="block text-[8px] font-sans font-bold text-[var(--color-brand-muted)] text-right">Amount Paid</span>
                        <span className="text-sm font-mono font-bold text-emerald-600">
                          ${rec.totalAmount?.toLocaleString()} {rec.currency}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <a
                          href={`/api/documents/${rec.id}/export`}
                          className="p-2 border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] rounded-xl transition-all shadow-3xs"
                          title="Download Receipt PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <a
                          href={`/api/documents/${rec.id}/export`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] rounded-xl transition-all shadow-3xs"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "ledger" && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="p-10 text-center bg-white border border-dashed border-[var(--color-brand-neutral)]/20 rounded-3xl text-xs text-[var(--color-brand-muted)] font-mono">
                No submitted transactions in the payment ledger.
              </div>
            ) : (
              <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl overflow-hidden divide-y divide-[var(--color-brand-neutral)]/15 font-mono text-xs">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[var(--color-brand-dark)]">
                          {p.payment_number || p.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-[8px] font-sans font-bold uppercase px-1.5 py-0.2 rounded border ${
                          p.status === "paid" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                          "bg-amber-50 border-amber-100 text-amber-700"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-sans block mt-1">{p.service}</span>
                      <span className="text-[9px] text-gray-400 block">Date: {p.date} &middot; Method: <span className="uppercase">{p.payment_method || p.gateway}</span></span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-[8px] font-sans font-bold text-gray-400 uppercase">Transaction Total</span>
                      <span className={`font-bold ${p.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                        ${p.amount?.toLocaleString()} {p.currency || "USD"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
