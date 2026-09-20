"use client";

import React, { useState, useMemo } from "react";
import { 
  Brain, Building2, Target, Cpu, Coins, Calendar, Clock, Globe, 
  FileText, CheckCircle2, Layers, ExternalLink, Copy, Check, Search, 
  Download, Archive, UserCheck, Sparkles, AlertCircle, ChevronDown, 
  ChevronUp, Mail, Phone, User, Users, Shield, Zap, RefreshCw
} from "lucide-react";
import { ProjectDiscovery } from "@/lib/types";

interface DiscoveryRoadmapManagerProps {
  discoveries: ProjectDiscovery[];
  onConvertLead: (disc: ProjectDiscovery) => void;
  onDeleteDiscovery: (id: string) => void;
  onRefresh?: () => void;
}

export default function DiscoveryRoadmapManager({
  discoveries,
  onConvertLead,
  onDeleteDiscovery,
  onRefresh,
}: DiscoveryRoadmapManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    discoveries.length > 0 ? discoveries[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [complexityFilter, setComplexityFilter] = useState("all");
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [expandedBlueprint, setExpandedBlueprint] = useState(true);

  // Available project types for filtering
  const allProjectTypes = useMemo(() => {
    const types = new Set<string>();
    discoveries.forEach((d) => {
      const pTypes = d.answers?.projectTypes;
      if (Array.isArray(pTypes)) {
        pTypes.forEach((t) => types.add(t));
      }
    });
    return Array.from(types);
  }, [discoveries]);

  // Filtered discoveries list
  const filteredDiscoveries = useMemo(() => {
    return discoveries.filter((disc) => {
      const a = disc.answers || ({} as any);
      const s = disc.summary || ({} as any);
      const company = (a.companyName || "").toLowerCase();
      const industry = (a.industry || "").toLowerCase();
      const notes = (a.notes || a.additionalInfo?.notes || "").toLowerCase();
      const challenges = (a.challenges || a.currentSituation?.challenges || "").toLowerCase();
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !search ||
        company.includes(search) ||
        industry.includes(search) ||
        notes.includes(search) ||
        challenges.includes(search);

      const matchesType =
        typeFilter === "all" ||
        (Array.isArray(a.projectTypes) && a.projectTypes.includes(typeFilter));

      const matchesComplexity =
        complexityFilter === "all" ||
        (s.complexity || "").toLowerCase() === complexityFilter.toLowerCase();

      return matchesSearch && matchesType && matchesComplexity;
    });
  }, [discoveries, searchQuery, typeFilter, complexityFilter]);

  // Selected item
  const selectedDisc = useMemo(() => {
    if (selectedId) {
      const found = discoveries.find((d) => d.id === selectedId);
      if (found) return found;
    }
    return filteredDiscoveries.length > 0 ? filteredDiscoveries[0] : null;
  }, [discoveries, selectedId, filteredDiscoveries]);

  // Copy blueprint markdown to clipboard
  const handleCopyBlueprint = () => {
    const markdown = selectedDisc?.summary?.overviewMarkdown;
    if (!markdown) return;
    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedBlueprint(true);
      setTimeout(() => setCopiedBlueprint(false), 2500);
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (discoveries.length === 0) return;
    const headers = [
      "ID",
      "Date",
      "Company",
      "Contact Name",
      "Contact Email",
      "Phone",
      "Industry",
      "Country",
      "Project Types",
      "Budget",
      "Timeline",
      "Complexity",
      "Challenges",
    ];

    const rows = discoveries.map((d) => {
      const a = d.answers || ({} as any);
      const org = a.organization || {};
      const s = d.summary || ({} as any);
      return [
        d.id,
        new Date(d.createdAt).toISOString().split("T")[0],
        `"${(a.companyName || org.companyName || "").replace(/"/g, '""')}"`,
        `"${(a.contactName || org.contactName || "").replace(/"/g, '""')}"`,
        `"${(a.contactEmail || org.contactEmail || "").replace(/"/g, '""')}"`,
        `"${(a.contactPhone || org.contactPhone || "").replace(/"/g, '""')}"`,
        `"${(a.industry || org.industry || "").replace(/"/g, '""')}"`,
        `"${(a.country || org.country || "").replace(/"/g, '""')}"`,
        `"${(Array.isArray(a.projectTypes) ? a.projectTypes.join(", ") : "").replace(/"/g, '""')}"`,
        `"${(a.budgetRange || a.budget?.range || "").replace(/"/g, '""')}"`,
        `"${(a.timeline || "").replace(/"/g, '""')}"`,
        `"${(s.complexity || "Medium").replace(/"/g, '""')}"`,
        `"${(a.challenges || a.currentSituation?.challenges || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `discovery_submissions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for safe nested extraction
  const a = selectedDisc?.answers || ({} as any);
  const org = a.organization || {};
  const currentSit = a.currentSituation || {};
  const targetAud = a.targetAudience || {};
  const techPref = a.technicalPreferences || {};
  const budget = a.budget || {};
  const lang = a.language || {};
  const addInfo = a.additionalInfo || {};
  const summary = selectedDisc?.summary || ({} as any);

  // Field values with fallbacks to nested structures
  const companyName = a.companyName || org.companyName || "Unnamed Organization";
  const contactName = a.contactName || org.contactName;
  const contactEmail = a.contactEmail || org.contactEmail;
  const contactPhone = a.contactPhone || org.contactPhone;
  const industry = a.industry || org.industry || "Not specified";
  const country = a.country || org.country || "Not specified";
  const orgType = a.orgType || org.orgType || "Not specified";
  const teamSize = a.teamSize || org.teamSize || "Not specified";
  const employeeCount = a.employeeCount || org.employeeCount;
  const website = a.website || org.website;
  const socialLinks = a.socialLinks || org.socialLinks;

  const projectTypes: string[] = Array.isArray(a.projectTypes) ? a.projectTypes : [];
  const customAnswers: Record<string, string> = a.customAnswers || {};

  const businessGoals: string[] = Array.isArray(a.businessGoals) ? a.businessGoals : [];
  const hasSoftware = a.hasSoftware || currentSit.hasSoftware || "No";
  const challenges = a.challenges || currentSit.challenges || "";
  const painPoints = a.painPoints || currentSit.painPoints || "";
  const limits = a.limits || currentSit.limits || "";

  const audienceTypes: string[] = Array.isArray(a.audienceTypes) 
    ? a.audienceTypes 
    : Array.isArray(targetAud.audienceTypes) 
    ? targetAud.audienceTypes 
    : [];
  const audienceLanguages = a.languages || targetAud.languages || "";
  const expectedUsers = a.expectedUsers || targetAud.expectedUsers || "";
  const growthExpectations = a.growthExpectations || targetAud.growthExpectations || "";

  const features: string[] = Array.isArray(a.features) ? a.features : [];
  const techStack = a.techStack || techPref.techStack || "";
  const cloudProvider = a.cloudProvider || techPref.cloudProvider || "";
  const compliance = a.compliance || techPref.compliance || "";
  const accessibility = a.accessibility || techPref.accessibility || "";

  const needsAI = a.needsAI ?? techPref.needsAI ?? false;
  const needsMigration = a.needsMigration ?? techPref.needsMigration ?? false;
  const needsAPI = a.needsAPI ?? techPref.needsAPI ?? false;
  const needsAutomation = a.needsAutomation ?? techPref.needsAutomation ?? false;

  const budgetRange = a.budgetRange || budget.range || "Not specified";
  const isDecisionMaker = a.isDecisionMaker || budget.isDecisionMaker || "";
  const isFundingAvailable = a.isFundingAvailable || budget.isFundingAvailable || "";
  const expectedROI = a.expectedROI || budget.expectedROI || "";

  const timeline = a.timeline || "Not specified";
  const preferredLanguage = a.preferredLanguage || lang.locale || "English";
  const timezone = a.timezone || lang.timezone || "EST";
  const meetingHours = a.meetingHours || lang.meetingHours || "";

  const links = a.links || addInfo.links || "";
  const notes = a.notes || addInfo.notes || "";

  return (
    <div className="space-y-6">
      {/* Top Header / Stats Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-3xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FF7A00]/15 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00]">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-white">Discovery Scoping Roadmaps</h3>
            <p className="text-[10px] text-[#CDD4DD]/50 uppercase tracking-widest font-mono">
              Full client project brief & AI architectural specifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-[#121A1B] hover:bg-black/40 border border-[#CDD4DD]/15 text-[#CDD4DD] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh submissions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="bg-[#121A1B] hover:bg-black/40 border border-[#CDD4DD]/15 text-[#CDD4DD] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Feed & Right Comprehensive Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans">
        
        {/* Left Panel: Submission Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">SUBMISSION FEED</span>
              <h4 className="font-serif font-bold text-lg text-white">
                Prospects ({filteredDiscoveries.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#CDD4DD]/40 bg-[#121A1B] px-2.5 py-1 rounded-full border border-[#CDD4DD]/10">
              Total: {discoveries.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, industry, challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#FF7A00] focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 text-[10px]">
            {allProjectTypes.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#121A1B] border border-[#CDD4DD]/10 rounded-lg px-2.5 py-1 text-gray-300 focus:outline-none"
              >
                <option value="all">All Project Types</option>
                {allProjectTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="bg-[#121A1B] border border-[#CDD4DD]/10 rounded-lg px-2.5 py-1 text-gray-300 focus:outline-none"
            >
              <option value="all">All Complexities</option>
              <option value="low">Low Complexity</option>
              <option value="medium">Medium Complexity</option>
              <option value="high">High Complexity</option>
              <option value="critical">Critical Complexity</option>
            </select>
          </div>

          {/* Feed List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredDiscoveries.length === 0 ? (
              <div className="text-center py-12 text-[#CDD4DD]/30 border border-dashed border-[#CDD4DD]/10 rounded-2xl">
                No matching discovery submissions found.
              </div>
            ) : (
              filteredDiscoveries.map((disc) => {
                const isSelected = selectedDisc?.id === disc.id;
                const dAns = disc.answers || ({} as any);
                const dSumm = disc.summary || ({} as any);
                const dCompany = dAns.companyName || dAns.organization?.companyName || "Unnamed";
                const dTypes: string[] = Array.isArray(dAns.projectTypes) ? dAns.projectTypes : [];
                const dComplexity = dSumm.complexity || "Medium";

                return (
                  <div
                    key={disc.id}
                    onClick={() => setSelectedId(disc.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#FF7A00]/10 border-[#FF7A00]/40 shadow-sm"
                        : "bg-[#121A1B] border-[#CDD4DD]/5 hover:border-[#CDD4DD]/20"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-bold text-white text-xs">{dCompany}</p>
                        <p className="text-[9px] text-[#CDD4DD]/40 mt-0.5 font-mono">
                          Scoped: {new Date(disc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                          dComplexity === "Critical"
                            ? "bg-red-950/60 text-red-400 border border-red-500/20"
                            : dComplexity === "High"
                            ? "bg-amber-950/60 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {dComplexity}
                      </span>
                    </div>

                    {dTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {dTypes.map((t) => (
                          <span
                            key={t}
                            className="bg-[#1A2324] text-[9px] text-gray-300 px-2 py-0.5 rounded border border-[#CDD4DD]/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[#CDD4DD]/5 text-[9px] text-[#CDD4DD]/50">
                      <span>{dAns.industry || "General Industry"}</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {dAns.budgetRange || dAns.budget?.range || "Under $2k"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Full Scoping Inspection (7 Cols) */}
        <div className="lg:col-span-7 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-6">
          {selectedDisc ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Executive Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#CDD4DD]/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase">
                      DISCOVERY SPECIFICATION CARD
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">ID: {selectedDisc.id}</span>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-white mt-0.5 flex items-center gap-2">
                    <span>{companyName}</span>
                    {website && (
                      <a
                        href={website.startsWith("http") ? website : `https://${website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF7A00] hover:text-white transition-colors"
                        title="Open client website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </h3>
                  <p className="text-[10px] text-[#CDD4DD]/50 font-mono mt-0.5">
                    Scoped on {new Date(selectedDisc.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onConvertLead(selectedDisc)}
                    className="bg-emerald-950 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Promote into CRM Active Pipeline"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Accept Prospect</span>
                  </button>

                  <button
                    onClick={handleCopyBlueprint}
                    className="bg-[#121A1B] border border-[#CDD4DD]/15 text-gray-300 hover:text-white hover:border-[#FF7A00]/40 px-3 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5 transition-colors"
                    title="Copy complete AI Architectural Blueprint"
                  >
                    {copiedBlueprint ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Blueprint</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteDiscovery(selectedDisc.id)}
                    className="bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-900/30 px-3 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5 transition-colors"
                    title="Archive this submission"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>

              {/* 1. Client & Organization Profile */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <Building2 className="w-4 h-4" />
                  <h5 className="font-serif font-bold text-sm text-white">Client & Organization Profile</h5>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-[11px] pt-1">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Company</span>
                    <strong className="text-white font-medium">{companyName}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Industry</span>
                    <strong className="text-white font-medium">{industry}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Country</span>
                    <strong className="text-white font-medium">{country}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Organization Type</span>
                    <strong className="text-white font-medium">{orgType}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Team Size</span>
                    <strong className="text-white font-medium">{teamSize}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Contact Person</span>
                    <strong className="text-white font-medium">{contactName || "Not provided"}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Contact Email</span>
                    {contactEmail ? (
                      <a href={`mailto:${contactEmail}`} className="text-[#FF7A00] hover:underline font-mono">
                        {contactEmail}
                      </a>
                    ) : (
                      <span className="text-gray-500 font-mono">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Phone / WhatsApp</span>
                    {contactPhone ? (
                      <a href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-mono">
                        {contactPhone}
                      </a>
                    ) : (
                      <span className="text-gray-500 font-mono">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Website</span>
                    {website ? (
                      <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noreferrer" className="text-[#FF7A00] hover:underline font-mono truncate block max-w-[150px]">
                        {website}
                      </a>
                    ) : (
                      <span className="text-gray-500 font-mono">None</span>
                    )}
                  </div>
                </div>

                {socialLinks && (
                  <div className="pt-2 border-t border-[#CDD4DD]/5 text-[10px]">
                    <span className="text-gray-500 font-mono">Social / References: </span>
                    <span className="text-gray-300">{socialLinks}</span>
                  </div>
                )}
              </div>

              {/* 2. Project Scope & Custom Specific Questions */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <Layers className="w-4 h-4" />
                  <h5 className="font-serif font-bold text-sm text-white">Project Scope & Custom Answers</h5>
                </div>

                {projectTypes.length > 0 ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {projectTypes.map((pt) => (
                        <span key={pt} className="bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {pt}
                        </span>
                      ))}
                    </div>

                    {/* Custom answers submitted per project type */}
                    {Object.keys(customAnswers).length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#CDD4DD]/5">
                        <span className="text-[9px] font-mono text-gray-500 uppercase block">Dynamic Questionnaire Answers:</span>
                        {Object.entries(customAnswers).map(([typeKey, ansVal]) => (
                          <div key={typeKey} className="bg-[#1A2324] p-3 rounded-xl border border-[#CDD4DD]/5 text-[11px]">
                            <span className="text-[#FF7A00] font-bold block mb-1">[{typeKey}] Context Specification:</span>
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{ansVal || "No custom note provided."}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No project types specified.</p>
                )}
              </div>

              {/* 3. Strategic Goals & Operational Context */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <Target className="w-4 h-4" />
                  <h5 className="font-serif font-bold text-sm text-white">Strategic Goals & Operational Challenges</h5>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Business Goals */}
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono mb-1.5">Target Business Goals</span>
                    <div className="flex flex-wrap gap-1.5">
                      {businessGoals.length > 0 ? (
                        businessGoals.map((g) => (
                          <span key={g} className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded text-[10px] font-medium">
                            ✓ {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">None declared</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                    <div className="bg-[#1A2324] p-3 rounded-xl border border-[#CDD4DD]/5">
                      <span className="text-gray-500 block text-[9px] uppercase font-mono mb-1">Has Existing Software?</span>
                      <strong className="text-white">{hasSoftware}</strong>
                    </div>

                    <div className="bg-[#1A2324] p-3 rounded-xl border border-[#CDD4DD]/5">
                      <span className="text-gray-500 block text-[9px] uppercase font-mono mb-1">Current Limits & Bottlenecks</span>
                      <strong className="text-white">{limits || "Standard SME thresholds"}</strong>
                    </div>
                  </div>

                  {challenges && (
                    <div className="bg-[#1A2324] p-3 rounded-xl border border-[#CDD4DD]/5 text-[11px]">
                      <span className="text-amber-400 font-bold block mb-1">Operational Challenges:</span>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{challenges}</p>
                    </div>
                  )}

                  {painPoints && (
                    <div className="bg-[#1A2324] p-3 rounded-xl border border-[#CDD4DD]/5 text-[11px]">
                      <span className="text-red-400 font-bold block mb-1">Known Pain Points:</span>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{painPoints}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Target Audience & Market Scale */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <Users className="w-4 h-4" />
                  <h5 className="font-serif font-bold text-sm text-white">Target Audience & Market Scale</h5>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Languages</span>
                    <strong className="text-white">{audienceLanguages || "Not specified"}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Expected Users</span>
                    <strong className="text-white">{expectedUsers || "Initial phase scale"}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Growth Projection</span>
                    <strong className="text-white">{growthExpectations || "Steady scaling"}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Audience Profile</span>
                    <strong className="text-white">
                      {audienceTypes.length > 0 ? audienceTypes.join(", ") : "General public / B2B"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 5. Technical Specifications & Features */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <Cpu className="w-4 h-4" />
                  <h5 className="font-serif font-bold text-sm text-white">Technical Preferences & Features</h5>
                </div>

                <div className="space-y-3 pt-1 text-[11px]">
                  {/* Selected Features from Catalog */}
                  {features.length > 0 && (
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase font-mono mb-1.5">Selected Features Catalog</span>
                      <div className="flex flex-wrap gap-1.5">
                        {features.map((f) => (
                          <span key={f} className="bg-[#1A2324] text-white border border-[#CDD4DD]/15 px-2.5 py-0.5 rounded text-[10px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Architecture Flags */}
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono mb-1.5">Architecture Flags</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className={`p-2.5 rounded-xl border text-center font-bold text-[10px] ${needsAI ? "bg-purple-950/40 border-purple-500/30 text-purple-300" : "bg-[#1A2324] border-[#CDD4DD]/5 text-gray-500"}`}>
                        {needsAI ? "✓ Needs AI / LLMs" : "✗ No AI"}
                      </div>
                      <div className={`p-2.5 rounded-xl border text-center font-bold text-[10px] ${needsAPI ? "bg-blue-950/40 border-blue-500/30 text-blue-300" : "bg-[#1A2324] border-[#CDD4DD]/5 text-gray-500"}`}>
                        {needsAPI ? "✓ External APIs" : "✗ No 3rd-party API"}
                      </div>
                      <div className={`p-2.5 rounded-xl border text-center font-bold text-[10px] ${needsMigration ? "bg-amber-950/40 border-amber-500/30 text-amber-300" : "bg-[#1A2324] border-[#CDD4DD]/5 text-gray-500"}`}>
                        {needsMigration ? "✓ Data Migration" : "✗ No Migration"}
                      </div>
                      <div className={`p-2.5 rounded-xl border text-center font-bold text-[10px] ${needsAutomation ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300" : "bg-[#1A2324] border-[#CDD4DD]/5 text-gray-500"}`}>
                        {needsAutomation ? "✓ Operations Automation" : "✗ No Automation"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase font-mono">Preferred Tech Stack</span>
                      <strong className="text-white">{techStack || "Consultant recommended"}</strong>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-[9px] uppercase font-mono">Cloud Provider</span>
                      <strong className="text-white">{cloudProvider || "Cloud agnostic / Vercel"}</strong>
                    </div>

                    {compliance && (
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-mono">Compliance Mandates</span>
                        <strong className="text-white">{compliance}</strong>
                      </div>
                    )}

                    {accessibility && (
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-mono">Accessibility Standards</span>
                        <strong className="text-white">{accessibility}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Commercial Parameters & Financial Readiness */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <Coins className="w-4 h-4" />
                  <h5 className="font-serif font-bold text-sm text-white">Commercial & Financial Readiness</h5>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-[11px] pt-1">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Budget Range</span>
                    <strong className="text-emerald-400 font-mono text-sm">{budgetRange}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Decision Maker?</span>
                    <strong className="text-white">{isDecisionMaker || "Yes"}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Funding Status</span>
                    <strong className="text-white">{isFundingAvailable || "Allocated"}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Expected ROI / Metric</span>
                    <strong className="text-white">{expectedROI || "Not provided"}</strong>
                  </div>
                </div>
              </div>

              {/* 7. Engagement Logistics & Availability */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <Calendar className="w-4 h-4" />
                  <h5 className="font-serif font-bold text-sm text-white">Engagement Logistics & Collaboration</h5>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Delivery Timeline</span>
                    <strong className="text-white">{timeline}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Preferred Language</span>
                    <strong className="text-white">{preferredLanguage}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Client Timezone</span>
                    <strong className="text-white">{timezone}</strong>
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Meeting Hours</span>
                    <strong className="text-white">{meetingHours || "09:00 - 13:00"}</strong>
                  </div>
                </div>
              </div>

              {/* 8. Client Notes & Reference Links */}
              {(notes || links) && (
                <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
                  <div className="flex items-center gap-2 text-[#FF7A00]">
                    <FileText className="w-4 h-4" />
                    <h5 className="font-serif font-bold text-sm text-white">Client Notes & External References</h5>
                  </div>

                  {links && (
                    <div className="text-[11px]">
                      <span className="text-gray-500 block text-[9px] uppercase font-mono mb-1">External Links (GitHub, Figma, Docs)</span>
                      <a href={links.startsWith("http") ? links : `https://${links}`} target="_blank" rel="noreferrer" className="text-[#FF7A00] hover:underline font-mono break-all">
                        {links}
                      </a>
                    </div>
                  )}

                  {notes && (
                    <div className="text-[11px]">
                      <span className="text-gray-500 block text-[9px] uppercase font-mono mb-1">Client Notes / Specifications</span>
                      <p className="text-gray-200 bg-[#1A2324] p-3 rounded-xl border border-[#CDD4DD]/5 leading-relaxed whitespace-pre-wrap">
                        {notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 9. AI Architectural Recommendation & Blueprint */}
              <div className="bg-[#121A1B] p-5 rounded-2xl border border-[#CDD4DD]/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#FF7A00]">
                    <Sparkles className="w-4 h-4" />
                    <h5 className="font-serif font-bold text-sm text-white">Automated AI Architecture Blueprint</h5>
                  </div>
                  <button
                    onClick={() => setExpandedBlueprint(!expandedBlueprint)}
                    className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>{expandedBlueprint ? "Collapse" : "Expand"}</span>
                    {expandedBlueprint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold text-[#CDD4DD]/40 block uppercase font-mono">Assessed Project Complexity</span>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                      summary.complexity === "Critical"
                        ? "bg-red-950/40 border-red-500/20 text-red-400"
                        : summary.complexity === "High"
                        ? "bg-amber-950/40 border-amber-500/20 text-amber-400"
                        : "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {summary.complexity || "Medium"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#CDD4DD]/40 block uppercase font-mono">Preparation Status</span>
                    <span className="inline-block mt-1 bg-[#1A2324] text-white border border-[#CDD4DD]/10 px-2.5 py-0.5 rounded text-[10px] font-mono">
                      {summary.preparationStatus || "Ready"}
                    </span>
                  </div>
                </div>

                {/* Recommended Services */}
                {Array.isArray(summary.recommendedServices) && summary.recommendedServices.length > 0 && (
                  <div>
                    <span className="text-[9px] font-bold text-[#CDD4DD]/40 block uppercase font-mono mb-1.5">Recommended Consulting Services</span>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.recommendedServices.map((srv: string) => (
                        <span key={srv} className="bg-[#1A2324] text-white border border-[#CDD4DD]/10 px-2.5 py-1 rounded-lg text-[10px] font-medium">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Features */}
                {Array.isArray(summary.recommendedFeatures) && summary.recommendedFeatures.length > 0 && (
                  <div>
                    <span className="text-[9px] font-bold text-[#CDD4DD]/40 block uppercase font-mono mb-1.5">Architectural Deliverables / Features</span>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.recommendedFeatures.map((f: string) => (
                        <span key={f} className="bg-[#1A2324] text-[#CDD4DD] border border-[#CDD4DD]/10 px-2.5 py-1 rounded-lg text-[10px]">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Markdown Roadmap Preview */}
                {expandedBlueprint && summary.overviewMarkdown && (
                  <div className="pt-3 border-t border-[#CDD4DD]/10 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                      <span>Full Architectural Blueprint Output:</span>
                      <button
                        onClick={handleCopyBlueprint}
                        className="text-[#FF7A00] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBlueprint ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBlueprint ? "Copied" : "Copy Markdown"}</span>
                      </button>
                    </div>

                    <div className="bg-[#1A2324] p-4 rounded-xl border border-[#CDD4DD]/10 text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {summary.overviewMarkdown}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center py-24 text-[#CDD4DD]/30 border border-dashed border-[#CDD4DD]/10 rounded-2xl">
              Select a scoping submission from the feed list.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
