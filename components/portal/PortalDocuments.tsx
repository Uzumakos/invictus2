"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FileText, Download, Shield } from "lucide-react";
import { PortalDocument } from "@/lib/types";

interface PortalDocumentsProps {
  documents: PortalDocument[];
}

export default function PortalDocuments({ documents }: PortalDocumentsProps) {
  const t = useTranslations("portal");

  const handleDownload = (doc: PortalDocument) => {
    alert(`Downloading securely vaulted document: "${doc.title}"...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/20 pb-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
            {t("documents")}
          </h3>
          <p className="text-[11px] text-[var(--color-brand-muted)] font-medium mt-1">
            Access contracts, proposals, audit deliverables, and technical blue prints.
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Shield className="w-3.5 h-3.5" />
          Secure Vault
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {documents.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white border border-dashed border-[var(--color-brand-neutral)]/20 rounded-3xl text-xs text-[var(--color-brand-muted)] font-mono">
            No document vault records found in this workspace.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-[var(--color-brand-neutral)]/20 p-6 rounded-3xl glow-card flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="p-3 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] rounded-xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[8px] font-mono text-[var(--color-brand-primary)] font-bold uppercase tracking-wider block">
                    {doc.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[var(--color-brand-dark)] truncate">
                    {doc.title}
                  </h4>
                  <div className="text-[10px] font-mono text-[var(--color-brand-muted)]">
                    <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    {doc.size && <span> • {doc.size}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(doc)}
                className="p-2 border border-[var(--color-brand-neutral)] hover:border-[var(--color-brand-primary)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] rounded-xl transition-all cursor-pointer shadow-3xs hover:bg-[var(--color-brand-bg)]"
                title="Download secure document"
              >
                <Download className="w-4.5 h-4.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
