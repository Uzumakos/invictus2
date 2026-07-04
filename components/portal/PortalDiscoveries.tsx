"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, ChevronRight, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { ProjectDiscovery } from "@/lib/types";

interface PortalDiscoveriesProps {
  discoveries: ProjectDiscovery[];
}

export default function PortalDiscoveries({ discoveries }: PortalDiscoveriesProps) {
  const t = useTranslations("portal");
  const [selectedDisc, setSelectedDisc] = useState<ProjectDiscovery | null>(null);

  const handleDownload = (disc: ProjectDiscovery) => {
    alert(`Downloading securely generated project discovery roadmap for: "${disc.summary.title}"...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--color-brand-neutral)]/20 pb-4">
        <div>
          <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
            Project Roadmaps & Discoveries
          </h3>
          <p className="text-[11px] text-[var(--color-brand-muted)] font-medium mt-1">
            Access roadmaps, requirements scoping lists, and complexity analysis from the Smart Discovery Engine.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Shield className="w-3.5 h-3.5" />
          AI Audit Locked
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="font-serif font-bold text-base text-[var(--color-brand-dark)] uppercase tracking-wider">
            Scoping Submissions
          </h4>

          <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl overflow-hidden shadow-2xs divide-y divide-[var(--color-brand-neutral)]/15">
            {discoveries.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-brand-muted)] font-mono">
                No past project discovery submissions found.
              </div>
            ) : (
              discoveries.map((disc) => {
                const isSelected = selectedDisc?.id === disc.id;
                return (
                  <button
                    key={disc.id}
                    onClick={() => setSelectedDisc(disc)}
                    className={`w-full text-left p-5 flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-[var(--color-brand-primary)]/5 border-l-4 border-l-[var(--color-brand-primary)]" 
                        : "hover:bg-[var(--color-brand-bg)]/20"
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <span className="text-[9px] font-mono text-[var(--color-brand-primary)] font-bold uppercase tracking-wider block">ROADMAP</span>
                      <strong className="font-serif font-bold text-sm text-[var(--color-brand-dark)] block mt-0.5 truncate">{disc.summary.title}</strong>
                      <span className="text-[10px] text-[var(--color-brand-muted)] font-mono uppercase">Submitted: {new Date(disc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-brand-muted)] shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-7">
          {selectedDisc ? (
            <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[var(--color-brand-neutral)]/15 pb-4 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[9px] font-sans font-bold text-[var(--color-brand-primary)] tracking-widest uppercase block">ROADMAP BLUEPRINT</span>
                  <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                    {selectedDisc.summary.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDownload(selectedDisc)}
                  className="px-4 py-2 border border-[var(--color-brand-neutral)]/45 text-xs font-bold uppercase rounded-lg hover:border-[var(--color-brand-primary)]/45 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-primary)] transition-all cursor-pointer shadow-3xs"
                >
                  Download PDF
                </button>
              </div>

              {/* Discovery Summary Attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[var(--color-brand-muted)]">
                <div className="bg-[var(--color-brand-bg)] p-3 rounded-lg border border-[var(--color-brand-neutral)]/30">
                  <span className="block text-[8px] font-sans font-bold uppercase">Estimated Complexity</span>
                  <strong className={`block text-sm font-serif ${
                    selectedDisc.summary.complexity === "Critical" ? "text-red-600" :
                    selectedDisc.summary.complexity === "High" ? "text-amber-600" : "text-[var(--color-brand-primary)]"
                  }`}>{selectedDisc.summary.complexity}</strong>
                </div>

                <div className="bg-[var(--color-brand-bg)] p-3 rounded-lg border border-[var(--color-brand-neutral)]/30">
                  <span className="block text-[8px] font-sans font-bold uppercase">Preparation Status</span>
                  <strong className="block text-sm font-serif text-emerald-600">{selectedDisc.summary.preparationStatus}</strong>
                </div>
              </div>

              {/* Recommended Services */}
              {selectedDisc.summary.recommendedServices && selectedDisc.summary.recommendedServices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-sans font-bold text-[var(--color-brand-primary)] tracking-wider uppercase">Recommended Services</h4>
                  <ul className="space-y-1.5 text-xs text-[var(--color-brand-muted)] pl-4 list-disc font-medium">
                    {selectedDisc.summary.recommendedServices.map((service, idx) => (
                      <li key={idx} className="font-bold text-[var(--color-brand-dark)]/90">{service}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Markdown content */}
              <div className="space-y-4">
                <h4 className="text-xs font-sans font-bold text-[var(--color-brand-muted)] tracking-wider uppercase">Executive Overview & Specifications</h4>
                <div className="prose prose-slate max-w-none text-xs text-[var(--color-brand-muted)] leading-relaxed font-semibold bg-[var(--color-brand-bg)] p-6 rounded-2xl border border-[var(--color-brand-neutral)]/35 space-y-4">
                  {selectedDisc.summary.overviewMarkdown.split("\n\n").map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-white border border-[var(--color-brand-neutral)]/20 border-dashed rounded-2xl">
              <div className="text-center text-[var(--color-brand-muted)] max-w-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto opacity-55 text-[var(--color-brand-primary)]" />
                <p className="text-xs font-semibold">Select a past scoping project roadmap on the left to read complexity rankings, services mapping, and engineering specifications.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
