"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { DollarSign, Download, CreditCard, Shield, AlertCircle } from "lucide-react";
import { PortalPayment } from "@/lib/types";

interface PortalPaymentsProps {
  payments: PortalPayment[];
}

export default function PortalPayments({ payments }: PortalPaymentsProps) {
  const t = useTranslations("portal");

  const handleDownload = (pay: PortalPayment) => {
    alert(`Downloading securely generated invoice receipt for: "${pay.service}"...`);
  };

  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "overdue");
  const paidPayments = payments.filter((p) => p.status === "paid");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/20 pb-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
            {t("payments")}
          </h3>
          <p className="text-[11px] text-[var(--color-brand-muted)] font-medium mt-1">
            Review milestones invoices, receipts, and payment statuses.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Shield className="w-3.5 h-3.5" />
          PCI Audit Clear
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="p-10 text-center bg-white border border-dashed border-[var(--color-brand-neutral)]/20 rounded-3xl text-xs text-[var(--color-brand-muted)] font-mono">
          No billing ledger history found in this workspace.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Action Required Panel (Pending or Overdue) */}
          {pendingPayments.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-sans font-bold text-amber-700 tracking-wider uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Action Required — Unpaid Invoices
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="bg-white border border-amber-200/80 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
                          pay.status === "overdue"
                            ? "bg-red-50 border-red-100 text-red-700 animate-pulse"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}>
                          {pay.status}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--color-brand-muted)]">Invoice Date: {pay.date}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[var(--color-brand-dark)] leading-snug">
                        {pay.service}
                      </h4>
                    </div>

                    <div className="border-t border-[var(--color-brand-neutral)]/10 pt-4 flex justify-between items-center">
                      <div>
                        <span className="block text-[8px] font-sans font-bold text-[var(--color-brand-muted)] uppercase">Amount Due</span>
                        <span className="text-lg font-serif font-bold text-[var(--color-brand-primary)]">${pay.amount.toLocaleString()} USD</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(pay)}
                          className="p-2 border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] rounded-xl transition-all cursor-pointer"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paid History Panel */}
          {paidPayments.length > 0 && (
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-sans font-bold text-emerald-700 tracking-wider uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Receipts & Paid Invoices
              </h4>

              <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl overflow-hidden shadow-2xs divide-y divide-[var(--color-brand-neutral)]/15">
                {paidPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[var(--color-brand-bg)]/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-serif font-bold text-[var(--color-brand-dark)] block">
                        {pay.service}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-[var(--color-brand-muted)]">
                        <span>Paid on: {pay.date}</span>
                        <span>•</span>
                        {pay.paymentMethod && <span className="uppercase">Method: {pay.paymentMethod}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div>
                        <span className="block text-[8px] font-sans font-bold text-[var(--color-brand-muted)] text-right">Amount Paid</span>
                        <span className="text-sm font-mono font-bold text-emerald-600">${pay.amount.toLocaleString()} USD</span>
                      </div>
                      <button
                        onClick={() => handleDownload(pay)}
                        className="p-2 border border-[var(--color-brand-neutral)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] rounded-xl transition-all cursor-pointer shadow-3xs"
                        title="Download Receipt PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline fallback since CheckCircle2 is imported, let's keep it robust
function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
