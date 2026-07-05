"use client";

import React, { useState } from "react";

export function ProjectEditForm({ project, onSave, onCancel }: { project: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(project?.id || "");
  const [title, setTitle] = useState(project?.title || "");
  const [image, setImage] = useState(project?.image || "");
  const [technologies, setTechnologies] = useState(project?.technologies?.join(", ") || "");
  
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
    <form onSubmit={handleSubmit} className="space-y-6 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Category (EN)</label>
          <input
            type="text"
            required
            value={categoryEn}
            onChange={(e) => setCategoryEn(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Category (FR)</label>
          <input
            type="text"
            required
            value={categoryFr}
            onChange={(e) => setCategoryFr(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#CDD4DD]/5 pt-4">
        <div className="space-y-4">
          <h5 className="font-bold text-[#FF7A00] uppercase text-[9px]">English Content</h5>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Description (EN)</label>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">The Problem / Challenge (EN)</label>
            <textarea value={probEn} onChange={(e) => setProbEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Research & Discovery (EN)</label>
            <textarea value={resEn} onChange={(e) => setResEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Architecture & Stack (EN)</label>
            <textarea value={archEn} onChange={(e) => setArchEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Technical Challenges (EN)</label>
            <textarea value={challEn} onChange={(e) => setChallEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Engineering Solution (EN)</label>
            <textarea value={solEn} onChange={(e) => setSolEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Business Impact & Results (EN)</label>
            <textarea value={resulEn} onChange={(e) => setResulEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Lessons Learned (EN)</label>
            <textarea value={lessEn} onChange={(e) => setLessEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
        </div>

        <div className="space-y-4 border-l border-[#CDD4DD]/5 pl-4">
          <h5 className="font-bold text-[#FF7A00] uppercase text-[9px]">French Content</h5>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Description (FR)</label>
            <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">The Problem / Challenge (FR)</label>
            <textarea value={probFr} onChange={(e) => setProbFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Research & Discovery (FR)</label>
            <textarea value={resFr} onChange={(e) => setResFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Architecture & Stack (FR)</label>
            <textarea value={archFr} onChange={(e) => setArchFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Technical Challenges (FR)</label>
            <textarea value={challFr} onChange={(e) => setChallFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
          <div>
            <label className="block text-[8px] text-gray-400 mb-1">Engineering Solution (FR)</label>
            <textarea value={solFr} onChange={(e) => setSolFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
          </div>
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

export function TrainingEditForm({ program, onSave, onCancel }: { program: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(program?.id || "");
  const [titleEn, setTitleEn] = useState(program?.title?.en || "");
  const [titleFr, setTitleFr] = useState(program?.title?.fr || "");
  const [duration, setDuration] = useState(program?.duration || "");
  const [category, setCategory] = useState(program?.category || "marketing");
  const [syllabus, setSyllabus] = useState(program?.syllabus?.join("\n") || "");
  
  const [audienceEn, setAudienceEn] = useState(program?.audience?.en || "");
  const [audienceFr, setAudienceFr] = useState(program?.audience?.fr || "");
  const [descEn, setDescEn] = useState(program?.description?.en || "");
  const [descFr, setDescFr] = useState(program?.description?.fr || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const syllabusArray = syllabus.split("\n").map((s: string) => s.trim()).filter(Boolean);

    onSave({
      id: id || undefined,
      title: { en: titleEn, fr: titleFr },
      duration,
      category,
      syllabus: syllabusArray,
      audience: { en: audienceEn, fr: audienceFr },
      description: { en: descEn, fr: descFr }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Unique ID Key (e.g. prompt-engineering)</label>
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
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Duration (e.g. 6 weeks, 2 days)</label>
          <input
            type="text"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (EN)</label>
          <input type="text" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (FR)</label>
          <input type="text" required value={titleFr} onChange={(e) => setTitleFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Audience (EN)</label>
          <input type="text" value={audienceEn} onChange={(e) => setAudienceEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Audience (FR)</label>
          <input type="text" value={audienceFr} onChange={(e) => setAudienceFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description / Overview (EN)</label>
          <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={4} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description / Overview (FR)</label>
          <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={4} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
      </div>

      <div>
        <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Syllabus Curriculum (One item per line)</label>
        <textarea
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
          placeholder="Module 1: Search Optimization&#10;Module 2: Conversion attribution"
          rows={5}
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

export function ServiceEditForm({ service, onSave, onCancel }: { service: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(service?.id || "");
  const [titleEn, setTitleEn] = useState(service?.title?.en || "");
  const [titleFr, setTitleFr] = useState(service?.title?.fr || "");
  const [price, setPrice] = useState(service?.price || "");
  const [duration, setDuration] = useState(service?.duration || "60");
  const [category, setCategory] = useState(service?.category || "engineering");
  
  const [descEn, setDescEn] = useState(service?.description?.en || "");
  const [descFr, setDescFr] = useState(service?.description?.fr || "");
  
  const [featuresEn, setFeaturesEn] = useState(service?.features?.en?.join("\n") || "");
  const [featuresFr, setFeaturesFr] = useState(service?.features?.fr?.join("\n") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featEnArray = featuresEn.split("\n").map((f: string) => f.trim()).filter(Boolean);
    const featFrArray = featuresFr.split("\n").map((f: string) => f.trim()).filter(Boolean);

    onSave({
      id: id || undefined,
      title: { en: titleEn, fr: titleFr },
      price: Number(price),
      duration: Number(duration),
      category,
      description: { en: descEn, fr: descFr },
      features: { en: featEnArray, fr: featFrArray }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Unique Service ID Key (e.g. Software-architecture)</label>
          <input
            type="text"
            required
            disabled={!!service}
            value={id}
            onChange={(e) => setId(e.target.value)}
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
            className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
          />
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
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (EN)</label>
          <input type="text" required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Title (FR)</label>
          <input type="text" required value={titleFr} onChange={(e) => setTitleFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description (EN)</label>
          <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Description (FR)</label>
          <textarea value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={3} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Features Included (EN - One per line)</label>
          <textarea value={featuresEn} onChange={(e) => setFeaturesEn(e.target.value)} placeholder="1-Hour Interactive Session&#10;Architecture Blueprint Diagram" rows={4} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Features Included (FR - One per line)</label>
          <textarea value={featuresFr} onChange={(e) => setFeaturesFr(e.target.value)} placeholder="Session interactive de 1 heure&#10;Schéma d'architecture détaillé" rows={4} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#CDD4DD]/5 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2.5 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer">Save Service</button>
      </div>
    </form>
  );
}

export function FAQEditForm({ faq, onSave, onCancel }: { faq: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [id, setId] = useState(faq?.id || "");
  const [questEn, setQuestEn] = useState(faq?.question?.en || "");
  const [questFr, setQuestFr] = useState(faq?.question?.fr || "");
  const [ansEn, setAnsEn] = useState(faq?.answer?.en || "");
  const [ansFr, setAnsFr] = useState(faq?.answer?.fr || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: id || undefined,
      question: { en: questEn, fr: questFr },
      answer: { en: ansEn, fr: ansFr }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs bg-[#121A1B] p-6 rounded-2xl border border-[#CDD4DD]/10">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Question (EN)</label>
          <input type="text" required value={questEn} onChange={(e) => setQuestEn(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Question (FR)</label>
          <input type="text" required value={questFr} onChange={(e) => setQuestFr(e.target.value)} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-xs text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Answer (EN)</label>
          <textarea value={ansEn} onChange={(e) => setAnsEn(e.target.value)} rows={4} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
        <div>
          <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">Answer (FR)</label>
          <textarea value={ansFr} onChange={(e) => setAnsFr(e.target.value)} rows={4} className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-xs text-white" />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-[#CDD4DD]/5 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white cursor-pointer">Cancel</button>
        <button type="submit" className="px-5 py-2.5 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer">Save FAQ</button>
      </div>
    </form>
  );
}
