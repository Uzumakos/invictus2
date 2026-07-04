"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar, Clock, ChevronRight, FileText, CheckCircle2, Circle } from "lucide-react";
import { PortalConsultation, Booking, Language } from "@/lib/types";

interface PortalConsultationsProps {
  consultations: PortalConsultation[];
  bookings: Booking[];
}

export default function PortalConsultations({ consultations, bookings }: PortalConsultationsProps) {
  const t = useTranslations("portal");
  const locale = useLocale() as Language;

  const [selectedCon, setSelectedCon] = useState<PortalConsultation | null>(null);

  // Active bookings list
  const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending" || b.status === "awaiting_payment");

  return (
    <div className="space-y-8">
      {/* Top Section: Scheduled Bookings */}
      <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="font-serif font-bold text-lg text-[var(--color-brand-primary)] uppercase tracking-wider flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[var(--color-brand-primary)]" />
          <span>{t("meetings")}</span>
        </h3>

        {activeBookings.length === 0 ? (
          <p className="text-xs text-[var(--color-brand-muted)] font-mono py-4 text-center">No active scheduled consultations.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBookings.map((b) => (
              <div key={b.id} className="bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 rounded-2xl p-5 flex flex-col justify-between hover:border-[var(--color-brand-primary)]/20 transition-all">
                <div className="space-y-1.5 mb-4">
                  <span className="text-[8px] font-mono text-[var(--color-brand-muted)] uppercase tracking-wider block">CONSULTATION SLIDE</span>
                  <span className="font-serif font-bold text-[var(--color-brand-dark)] text-base block">
                    {b.serviceTitle[locale] || b.serviceTitle["en"]}
                  </span>
                  <span className="text-[10px] text-[var(--color-brand-primary)] font-bold">{b.packageType}</span>
                </div>

                <div className="flex justify-between items-end border-t border-[var(--color-brand-neutral)]/10 pt-4 mt-2">
                  <div className="font-mono text-xs text-[var(--color-brand-muted)]">
                    <div className="font-bold text-[var(--color-brand-dark)]">{b.date}</div>
                    <div>{b.time} ({b.timezone})</div>
                  </div>
                  <span className={`text-[8px] font-sans font-bold uppercase px-2 py-0.5 rounded border ${
                    b.status === "confirmed" 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                      : "bg-amber-50 border-amber-100 text-amber-700 animate-pulse"
                  }`}>
                    {b.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Past Audits and Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Past list */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[var(--color-brand-dark)] uppercase tracking-wider mb-2">
            Archived Syntheses
          </h3>

          <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl overflow-hidden shadow-2xs divide-y divide-[var(--color-brand-neutral)]/15">
            {consultations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-brand-muted)] font-mono">
                No past session summaries archived yet.
              </div>
            ) : (
              consultations.map((con) => {
                const isSelected = selectedCon?.id === con.id;
                return (
                  <button
                    key={con.id}
                    onClick={() => setSelectedCon(con)}
                    className={`w-full text-left p-5 flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-[var(--color-brand-primary)]/5 border-l-4 border-l-[var(--color-brand-primary)]" 
                        : "hover:bg-[var(--color-brand-bg)]/20"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-[var(--color-brand-primary)] font-bold uppercase tracking-wider block">SYNTHESIS</span>
                      <strong className="font-serif font-bold text-sm text-[var(--color-brand-dark)] block mt-0.5">Session Summary - {con.date}</strong>
                      <span className="text-[10px] text-[var(--color-brand-muted)] font-mono uppercase">Duration: {con.duration}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-brand-muted)] shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Details Panel */}
        <div className="lg:col-span-7">
          {selectedCon ? (
            <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[var(--color-brand-neutral)]/15 pb-4">
                <span className="text-[9px] font-sans font-bold text-[var(--color-brand-primary)] tracking-widest uppercase block">SECURE DOCUMENT</span>
                <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                  Consultation Summary ({selectedCon.date})
                </h3>
              </div>

              {/* MDX/Markdown notes preview */}
              <div className="space-y-4">
                <h4 className="text-xs font-sans font-bold text-[var(--color-brand-primary)] tracking-wider uppercase">Executive Overview</h4>
                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium bg-[var(--color-brand-bg)] p-4 rounded-xl border border-[var(--color-brand-neutral)]/25">
                  {selectedCon.notes}
                </p>
              </div>

              {/* Action items */}
              {selectedCon.actionItems && selectedCon.actionItems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-sans font-bold text-[var(--color-brand-dark)] tracking-wider uppercase">Strategic Action Items</h4>
                  <div className="space-y-3">
                    {selectedCon.actionItems.map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5">
                        {act.status === "done" ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-[var(--color-brand-neutral)] shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs font-medium text-[var(--color-brand-dark)] ${act.status === "done" ? "line-through text-[var(--color-brand-muted)]" : ""}`}>
                          {act.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl border-dashed">
              <div className="text-center text-[var(--color-brand-muted)] max-w-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto opacity-55 text-[var(--color-brand-primary)]" />
                <p className="text-xs font-semibold">Select a past session synthesis on the left to read notes, milestones, and strategic action plans.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
