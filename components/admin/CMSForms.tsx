"use client";

import React, { useState } from "react";
import { AlertCircle, Save, X } from "lucide-react";

// Tab selector sub-component for reusable forms
function FormLanguageTabs({ active, onChange }: { active: "en" | "fr"; onChange: (lang: "en" | "fr") => void }) {
  return (
    <div className="flex border-b border-[#CDD4DD]/10 mb-4">
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-4 py-2 text-[10px] font-bold uppercase border-b-2 transition-all ${
          active === "en" ? "border-[#FF7A00] text-white" : "border-transparent text-gray-500 hover:text-gray-300"
        }`}
      >
        English Copy (EN)
      </button>
      <button
        type="button"
        onClick={() => onChange("fr")}
        className={`px-4 py-2 text-[10px] font-bold uppercase border-b-2 transition-all ${
          active === "fr" ? "border-[#FF7A00] text-white" : "border-transparent text-gray-500 hover:text-gray-300"
        }`}
      >
        French Copy (FR)
      </button>
    </div>
  );
}

// 1. PROJECT / CASE STUDY FORM
export function ProjectEditForm({ project, onSave, onCancel }: { project: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(project?.id || "");
  const [title, setTitle] = useState(project?.title || "");
  const [image, setImage] = useState(project?.image || "");
  const [status, setStatus] = useState(project?.status || "draft");
  const [technologies, setTechnologies] = useState(project?.technologies?.join(", ") || "");
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"en" | "fr">("en");

  // Category EN/FR
  const [categoryEn, setCategoryEn] = useState(project?.category?.en || "");
  const [categoryFr, setCategoryFr] = useState(project?.category?.fr || "");
  
  // JSONB sections
  const [descEn, setDescEn] = useState(project?.description?.en || "");
  const [descFr, setDescFr] = useState(project?.description?.fr || "");
  const [probEn, setProbEn] = useState(project?.problem?.en || "");
  const [probFr, setProbFr] = useState(project?.problem?.fr || "");
  const [resEn, setResEn] = useState(project?.research?.en || "");
  const [resFr, setResFr] = useState(project?.research?.fr || "");
  const [archEn, setArchEn] = useState(project?.architecture?.en || "");
  const [archFr, setArchFr] = useState(project?.architecture?.fr || "");
  const [challEn, setChallEn] = useState(project?.challenges?.en || "");
  const [challFr, setChallFr] = useState(project?.challenges?.fr || "");
  const [solEn, setSolEn] = useState(project?.solutions?.en || "");
  const [solFr, setSolFr] = useState(project?.solutions?.fr || "");
  const [resulEn, setResulEn] = useState(project?.results?.en || "");
  const [resulFr, setResulFr] = useState(project?.results?.fr || "");
  const [lessEn, setLessEn] = useState(project?.lessons?.en || "");
  const [lessFr, setLessFr] = useState(project?.lessons?.fr || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const techArray = technologies.split(",").map((t: string) => t.trim()).filter(Boolean);
    
    onSave({
      id: id || undefined,
      title,
      image,
      status,
      technologies: techArray,
      category: { en: categoryEn, fr: categoryFr },
      description: { en: descEn, fr: descFr },
      problem: { en: probEn, fr: probFr },
      research: { en: resEn, fr: resFr },
      architecture: { en: archEn, fr: archFr },
      challenges: { en: challEn, fr: challFr },
      solutions: { en: solEn, fr: solFr },
      results: { en: resulEn, fr: resulFr },
      lessons: { en: lessEn, fr: lessFr }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Unique ID key (e.g. nexa-games)</label>
          <input
            type="text"
            required
            disabled={!!project}
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Project Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Publishing Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="draft">Draft (Private)</option>
            <option value="published">Published (Public)</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Image Link URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Technologies Used (comma separated)</label>
          <input
            type="text"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="React, Solidity, Postgres"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Language tab switcher */}
      <FormLanguageTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "en" ? (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1.5 uppercase">Category (EN)</label>
            <input
              type="text"
              required={activeTab === "en"}
              value={categoryEn}
              onChange={(e) => setCategoryEn(e.target.value)}
              className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Description (EN)</label>
              <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">The Problem / Challenge (EN)</label>
              <textarea value={probEn} onChange={(e) => setProbEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Research & Discovery (EN)</label>
              <textarea value={resEn} onChange={(e) => setResEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Architecture & Stack (EN)</label>
              <textarea value={archEn} onChange={(e) => setArchEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Technical Challenges (EN)</label>
              <textarea value={challEn} onChange={(e) => setChallEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Engineering Solution (EN)</label>
              <textarea value={solEn} onChange={(e) => setSolEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Business Impact & Results (EN)</label>
              <textarea value={resulEn} onChange={(e) => setResulEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Lessons Learned (EN)</label>
              <textarea value={lessEn} onChange={(e) => setLessEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1.5 uppercase">Category (FR)</label>
            <input
              type="text"
              required={activeTab === "fr"}
              value={categoryFr}
              onChange={(e) => setCategoryFr(e.target.value)}
              className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Description (FR)</label>
              <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">The Problem / Challenge (FR)</label>
              <textarea value={probFr} onChange={(e) => setProbFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Research & Discovery (FR)</label>
              <textarea value={resFr} onChange={(e) => setResFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Architecture & Stack (FR)</label>
              <textarea value={archFr} onChange={(e) => setArchFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Technical Challenges (FR)</label>
              <textarea value={challFr} onChange={(e) => setChallFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Engineering Solution (FR)</label>
              <textarea value={solFr} onChange={(e) => setSolFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Business Impact & Results (FR)</label>
              <textarea value={resulFr} onChange={(e) => setResulFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[8px] text-gray-400 mb-1">Lessons Learned (FR)</label>
              <textarea value={lessFr} onChange={(e) => setLessFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-[#CDD4DD]/5 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer"
        >
          Save Case Study
        </button>
      </div>
    </form>
  );
}

// 2. TRAINING PROGRAM FORM
export function TrainingEditForm({ program, onSave, onCancel }: { program: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(program?.id || "");
  const [duration, setDuration] = useState(program?.duration || "");
  const [category, setCategory] = useState(program?.category || "marketing");
  const [status, setStatus] = useState(program?.status || "draft");
  const [syllabus, setSyllabus] = useState(program?.syllabus?.join("\n") || "");
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"en" | "fr">("en");

  // Localized fields
  const [titleEn, setTitleEn] = useState(program?.title?.en || "");
  const [titleFr, setTitleFr] = useState(program?.title?.fr || "");
  const [audienceEn, setAudienceEn] = useState(program?.audience?.en || "");
  const [audienceFr, setAudienceFr] = useState(program?.audience?.fr || "");
  const [descEn, setDescEn] = useState(program?.description?.en || "");
  const [descFr, setDescFr] = useState(program?.description?.fr || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const syllabusArray = syllabus.split("\n").map((s: string) => s.trim()).filter(Boolean);

    onSave({
      id: id || undefined,
      duration,
      category,
      status,
      syllabus: syllabusArray,
      title: { en: titleEn, fr: titleFr },
      audience: { en: audienceEn, fr: audienceFr },
      description: { en: descEn, fr: descFr }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Unique ID Key</label>
          <input
            type="text"
            required
            disabled={!!program}
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Duration (e.g. 6 weeks)</label>
          <input
            type="text"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Program Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="marketing">Digital Marketing</option>
            <option value="ai">AI Product Engineering</option>
            <option value="strategy">Tech Leadership</option>
          </select>
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="draft">Draft (Private)</option>
            <option value="published">Published (Public)</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Language tab switcher */}
      <FormLanguageTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "en" ? (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (EN)</label>
            <input type="text" required={activeTab === "en"} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Audience (EN)</label>
            <input type="text" value={audienceEn} onChange={(e) => setAudienceEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description / Overview (EN)</label>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (FR)</label>
            <input type="text" required={activeTab === "fr"} value={titleFr} onChange={(e) => setTitleFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Audience (FR)</label>
            <input type="text" value={audienceFr} onChange={(e) => setAudienceFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description / Overview (FR)</label>
            <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Syllabus Curriculum (One item per line)</label>
        <textarea
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
          placeholder="Module 1: Search Optimization&#10;Module 2: Conversion attribution"
          rows={4}
          className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-[#CDD4DD]/5 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2.5 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer">Save Program</button>
      </div>
    </form>
  );
}

// 3. CONSULTING SERVICE FORM
export function ServiceEditForm({ service, onSave, onCancel }: { service: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(service?.id || "");
  const [price, setPrice] = useState(service?.price || "");
  const [duration, setDuration] = useState(service?.duration || "60");
  const [category, setCategory] = useState(service?.category || "engineering");
  const [status, setStatus] = useState(service?.status || "published");
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"en" | "fr">("en");

  // Localized fields
  const [titleEn, setTitleEn] = useState(service?.title?.en || service?.title || "");
  const [titleFr, setTitleFr] = useState(service?.title?.fr || service?.title || "");
  const [descEn, setDescEn] = useState(service?.description?.en || service?.description || "");
  const [descFr, setDescFr] = useState(service?.description?.fr || service?.description || "");
  const [featuresEn, setFeaturesEn] = useState(Array.isArray(service?.features?.en) ? service.features.en.join("\n") : "");
  const [featuresFr, setFeaturesFr] = useState(Array.isArray(service?.features?.fr) ? service.features.fr.join("\n") : "");

  // Tiers state
  const initialTiers = service?.tiers || [
    {
      name: "Strategic Sprint",
      multiplier: 1.0,
      extraFeatures: [
        "1-on-1 Interactive Call",
        "Direct email summaries",
        "Video recording access",
      ],
    },
    {
      name: "Architectural Blueprint",
      multiplier: 1.5,
      extraFeatures: [
        "1-on-1 Interactive Call",
        "Direct email summaries + Full Blueprint document",
        "Visual diagram design schemas",
        "Follow-up QA review call (15 mins)",
      ],
    },
    {
      name: "Continuous Enterprise Support",
      multiplier: 2.8,
      extraFeatures: [
        "All Blueprint assets",
        "Dedicated Private Slack Channel (1 Month)",
        "Priority architectural review response",
        "30-day emergency technical backup",
      ],
    },
  ];

  const [tiers, setTiers] = useState(
    initialTiers.map((t: any) => ({
      name: t.name || "",
      multiplier: t.multiplier || 1,
      extraFeaturesStr: Array.isArray(t.extraFeatures) ? t.extraFeatures.join("\n") : (t.extraFeatures || "")
    }))
  );

  const handleTierChange = (index: number, field: string, value: any) => {
    const nextTiers = [...tiers];
    nextTiers[index] = { ...nextTiers[index], [field]: value };
    setTiers(nextTiers);
  };

  const handleAddTier = () => {
    setTiers([...tiers, { name: "Custom Tier", multiplier: 1.2, extraFeaturesStr: "" }]);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_: any, i: number) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featEnArray = featuresEn.split("\n").map((f: string) => f.trim()).filter(Boolean);
    const featFrArray = featuresFr.split("\n").map((f: string) => f.trim()).filter(Boolean);

    const formattedTiers = tiers.map((t: any) => ({
      name: t.name,
      multiplier: Number(t.multiplier) || 1,
      extraFeatures: t.extraFeaturesStr.split("\n").map((f: string) => f.trim()).filter(Boolean)
    }));

    const cleanId = (id || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");

    onSave({
      id: cleanId || undefined,
      price: Number(price),
      duration: Number(duration),
      category,
      status,
      title: { en: titleEn, fr: titleFr },
      description: { en: descEn, fr: descFr },
      features: { en: featEnArray, fr: featFrArray },
      tiers: formattedTiers
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Unique Service Key</label>
          <input
            type="text"
            required
            disabled={!!service}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. software-architecture"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Price in USD ($)</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="350"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Duration (minutes)</label>
          <input
            type="number"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="published">Published (Public)</option>
            <option value="draft">Draft (Private)</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          >
            <option value="engineering">Engineering</option>
            <option value="strategy">Strategy</option>
            <option value="marketing">Marketing</option>
            <option value="training">Training</option>
          </select>
        </div>
      </div>

      {/* Language tab switcher */}
      <FormLanguageTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "en" ? (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (EN)</label>
            <input type="text" required={activeTab === "en"} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description (EN)</label>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Features Included (EN - One per line)</label>
            <textarea value={featuresEn} onChange={(e) => setFeaturesEn(e.target.value)} placeholder="1-Hour Interactive Session&#10;Architecture Blueprint Diagram" rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (FR)</label>
            <input type="text" required={activeTab === "fr"} value={titleFr} onChange={(e) => setTitleFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description (FR)</label>
            <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Features Included (FR - One per line)</label>
            <textarea value={featuresFr} onChange={(e) => setFeaturesFr(e.target.value)} placeholder="Session interactive de 1 heure&#10;Schéma d'architecture détaillé" rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
        </div>
      )}

      {/* Custom Service Tiers Section */}
      <div className="space-y-3 border-t border-[#CDD4DD]/10 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-wider uppercase block">RESERVATION TIERS</span>
            <h4 className="font-serif font-bold text-sm text-white">Service Tiers & Pricing Multipliers</h4>
          </div>
          <button
            type="button"
            onClick={handleAddTier}
            className="text-[10px] font-bold text-[#FF7A00] hover:underline cursor-pointer"
          >
            + Add Package Tier
          </button>
        </div>

        <div className="space-y-3">
          {tiers.map((t: any, idx: number) => (
            <div key={idx} className="bg-[#1A2324] p-4 rounded-xl border border-[#CDD4DD]/10 space-y-3">
              <div className="flex justify-between items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[8px] text-gray-400 mb-1 uppercase">Tier Name</label>
                  <input
                    type="text"
                    required
                    value={t.name}
                    onChange={(e) => handleTierChange(idx, "name", e.target.value)}
                    placeholder="e.g. Strategic Sprint"
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-[8px] text-gray-400 mb-1 uppercase">Price Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={t.multiplier}
                    onChange={(e) => handleTierChange(idx, "multiplier", e.target.value)}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    className="text-red-400 hover:text-red-500 text-xs mt-4 font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[8px] text-gray-400 mb-1 uppercase">Included Tier Features (One per line)</label>
                <textarea
                  value={t.extraFeaturesStr}
                  onChange={(e) => handleTierChange(idx, "extraFeaturesStr", e.target.value)}
                  rows={2}
                  placeholder="1-on-1 Interactive Call&#10;Direct email summaries"
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#CDD4DD]/5 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2.5 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer">Save Service</button>
      </div>
    </form>
  );
}

// 4. FAQ ITEM FORM
export function FAQEditForm({ faq, onSave, onCancel }: { faq: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(faq?.id || "");
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"en" | "fr">("en");

  // Localized fields
  const [questEn, setQuestEn] = useState(faq?.question?.en || "");
  const [questFr, setQuestFr] = useState(faq?.question?.fr || "");
  const [ansEn, setAnsEn] = useState(faq?.answer?.en || "");
  const [ansFr, setAnsFr] = useState(faq?.answer?.fr || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = (id || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
    onSave({
      id: cleanId || undefined,
      question: { en: questEn, fr: questFr },
      answer: { en: ansEn, fr: ansFr }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
      <div>
        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Unique FAQ Key/ID (e.g. faq-consultation-process)</label>
        <input
          type="text"
          required
          disabled={!!faq}
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
        />
      </div>

      {/* Language tab switcher */}
      <FormLanguageTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "en" ? (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Question (EN)</label>
            <input type="text" required={activeTab === "en"} value={questEn} onChange={(e) => setQuestEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Answer (EN)</label>
            <textarea value={ansEn} onChange={(e) => setAnsEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Question (FR)</label>
            <input type="text" required={activeTab === "fr"} value={questFr} onChange={(e) => setQuestFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Answer (FR)</label>
            <textarea value={ansFr} onChange={(e) => setAnsFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-[#CDD4DD]/5 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2.5 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer">Save FAQ</button>
      </div>
    </form>
  );
}

// ==========================================
// 5. BUSINESS PROFILE FORM (ERP)
// ==========================================
export function BusinessProfileForm() {
  const [profileId, setProfileId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("Haiti");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankSwift, setBankSwift] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [stampUrl, setStampUrl] = useState("");
  const [invoiceFooter, setInvoiceFooter] = useState("");

  const [statusText, setStatusText] = useState<"saved" | "saving" | "error" | "idle">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/business-profile")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const profile = data[0];
          setProfileId(profile.id);
          setBusinessName(profile.businessName || "");
          setLegalName(profile.legalName || "");
          setAddress(profile.address || "");
          setCountry(profile.country || "Haiti");
          setPhone(profile.phone || "");
          setEmail(profile.email || "");
          setWebsite(profile.website || "");
          setTaxNumber(profile.taxNumber || "");
          setRegistrationNumber(profile.registrationNumber || "");
          const bank = profile.bankInformation || {};
          setBankName(bank.bankName || "");
          setBankAccount(bank.bankAccount || "");
          setBankSwift(bank.bankSwift || "");
          setLogoUrl(profile.logoUrl || "");
          setSignatureUrl(profile.signatureUrl || "");
          setStampUrl(profile.stampUrl || "");
          setInvoiceFooter(profile.invoiceFooter || "");
        }
      })
      .catch(err => console.error(err));
  }, []);

  const saveProfile = async (overrides = {}) => {
    setStatusText("saving");
    setErrorMsg(null);
    try {
      const payload = {
        businessName,
        legalName,
        address,
        country,
        phone,
        email,
        website,
        taxNumber,
        registrationNumber,
        bankInformation: {
          bankName,
          bankAccount,
          bankSwift
        },
        logoUrl,
        signatureUrl,
        stampUrl,
        invoiceFooter,
        ...overrides
      };

      const url = profileId ? `/api/business-profile/${profileId}` : "/api/business-profile";
      const method = profileId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to auto-save business settings.");
      }
      
      const saved = await res.json();
      if (!profileId && saved.id) {
        setProfileId(saved.id);
      }
      setStatusText("saved");
      setTimeout(() => setStatusText("idle"), 2500);
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatusText("error");
    }
  };

  const handleBlur = () => {
    saveProfile();
  };

  return (
    <div className="space-y-6 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10 text-gray-300">
      <div className="flex justify-between items-center border-b border-[#CDD4DD]/10 pb-3">
        <div>
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">PLATFORM SETTINGS</span>
          <h3 className="font-serif font-bold text-lg text-white">Business Settings Profile</h3>
        </div>
        <div className="flex items-center gap-2">
          {statusText === "saving" && (
            <span className="text-gray-500 font-mono text-[9px] uppercase animate-pulse">Auto-saving...</span>
          )}
          {statusText === "saved" && (
            <span className="text-emerald-400 font-bold font-mono text-[9px] uppercase">All Changes Saved</span>
          )}
          {statusText === "error" && (
            <span className="text-red-400 font-bold font-mono text-[9px] uppercase">Error Saving</span>
          )}
          <button
            type="button"
            onClick={() => saveProfile()}
            className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-white font-bold cursor-pointer border-0 flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Business Name *</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. Invictus Consulting"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Legal Name</label>
          <input
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. Amedee Erns Baptiste Consulting E.I.R.L."
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. contact@invictus.com"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Address *</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. 100 Rue de la Paix"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Country *</label>
          <input
            type="text"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. Haiti"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={handleBlur}
            placeholder="+509 3700-0000"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onBlur={handleBlur}
            placeholder="https://www.invictus.com"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Tax Number / NIF</label>
          <input
            type="text"
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. 000-123-456-7"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Registration / Patente No.</label>
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. Reg-789012"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Company Logo URL</label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            onBlur={handleBlur}
            placeholder="https://.../logo.png"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#CDD4DD]/5">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. Sogebank"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Account Number (IBAN)</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. HT45 SOGE 0012 3456 7890"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">SWIFT / BIC Code</label>
          <input
            type="text"
            value={bankSwift}
            onChange={(e) => setBankSwift(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. SOGEHTPP"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#CDD4DD]/5">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Signature Image URL</label>
          <input
            type="text"
            value={signatureUrl}
            onChange={(e) => setSignatureUrl(e.target.value)}
            onBlur={handleBlur}
            placeholder="https://.../signature.png"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Stamp Image URL</label>
          <input
            type="text"
            value={stampUrl}
            onChange={(e) => setStampUrl(e.target.value)}
            onBlur={handleBlur}
            placeholder="https://.../stamp.png"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase font-bold">Default Document Footer</label>
          <input
            type="text"
            value={invoiceFooter}
            onChange={(e) => setInvoiceFooter(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. Thank you for your business!"
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

