"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, Save, X, Globe, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SEOMetadata {
  id: string;
  pagePath: string;
  metaTitle: {
    en: string;
    fr: string;
  };
  metaDescription: {
    en: string;
    fr: string;
  };
  keywords?: string;
  ogImageUrl?: string;
  robotsIndex: string;
  updatedAt?: string;
}

export default function SEOCenterForm() {
  const [seoList, setSeoList] = useState<SEOMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SEOMetadata | null>(null);

  // Form Fields
  const [pagePath, setPagePath] = useState("");
  const [metaTitleEn, setMetaTitleEn] = useState("");
  const [metaTitleFr, setMetaTitleFr] = useState("");
  const [metaDescEn, setMetaDescEn] = useState("");
  const [metaDescFr, setMetaDescFr] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [robotsIndex, setRobotsIndex] = useState("index, follow");

  const [langTab, setLangTab] = useState<"en" | "fr">("en");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSEOMetadata();
  }, []);

  const fetchSEOMetadata = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo-metadata");
      if (res.ok) {
        setSeoList(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    setPagePath("");
    setMetaTitleEn("");
    setMetaTitleFr("");
    setMetaDescEn("");
    setMetaDescFr("");
    setKeywords("");
    setOgImageUrl("");
    setRobotsIndex("index, follow");
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  const handleEditClick = (item: SEOMetadata) => {
    setEditingItem(item);
    setPagePath(item.pagePath || "");
    setMetaTitleEn(item.metaTitle?.en || "");
    setMetaTitleFr(item.metaTitle?.fr || "");
    setMetaDescEn(item.metaDescription?.en || "");
    setMetaDescFr(item.metaDescription?.fr || "");
    setKeywords(item.keywords || "");
    setOgImageUrl(item.ogImageUrl || "");
    setRobotsIndex(item.robotsIndex || "index, follow");
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagePath) {
      setErrorMsg("Page path is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      pagePath,
      metaTitle: {
        en: metaTitleEn,
        fr: metaTitleFr
      },
      metaDescription: {
        en: metaDescEn,
        fr: metaDescFr
      },
      keywords,
      ogImageUrl,
      robotsIndex
    };

    try {
      const method = editingItem ? "PATCH" : "POST";
      const url = editingItem ? `/api/seo-metadata/${editingItem.id}` : "/api/seo-metadata";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save SEO metadata.");
      }

      showToast(editingItem ? "SEO Metadata updated." : "SEO Metadata created.");
      setIsEditorOpen(false);
      fetchSEOMetadata();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO metadata?")) return;
    try {
      const res = await fetch(`/api/seo-metadata/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSeoList(seoList.filter(s => s.id !== id));
        showToast("SEO Metadata deleted successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = seoList.filter(s => 
    s.pagePath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs text-gray-300">
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
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">OPTIMIZATION</span>
          <h3 className="font-serif font-bold text-xl text-white">SEO Center</h3>
        </div>
        
        <button
          onClick={handleCreateClick}
          className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Page Metadata</span>
        </button>
      </div>

      {isEditorOpen ? (
        <form onSubmit={handleSave} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
            <h4 className="font-serif font-bold text-base text-white">
              {editingItem ? `Edit SEO: ${pagePath}` : "Configure New Page SEO"}
            </h4>
            <button type="button" onClick={() => setIsEditorOpen(false)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Page Route / Path *</label>
              <input
                type="text"
                required
                disabled={!!editingItem}
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
                placeholder="e.g. /about or /capabilities"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Robots Crawl Index</label>
              <select
                value={robotsIndex}
                onChange={(e) => setRobotsIndex(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="index, follow">Index, Follow (Standard)</option>
                <option value="noindex, follow">No-Index, Follow (Hidden Pages)</option>
                <option value="noindex, nofollow">No-Index, No-Follow (Secret/Draft)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider uppercase">Meta Title & Description</label>
              <div className="flex bg-[#121A1B] p-0.5 rounded-lg border border-[#CDD4DD]/10">
                <button
                  type="button"
                  onClick={() => setLangTab("en")}
                  className={`px-3 py-1 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                    langTab === "en" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  English Content
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab("fr")}
                  className={`px-3 py-1 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                    langTab === "fr" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  French Content
                </button>
              </div>
            </div>

            <div className="bg-[#121A1B] p-4 rounded-2xl border border-[#CDD4DD]/5 space-y-3">
              {langTab === "en" ? (
                <>
                  <div>
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Meta Title (EN)</label>
                    <input
                      type="text"
                      value={metaTitleEn}
                      onChange={(e) => setMetaTitleEn(e.target.value)}
                      placeholder="Zenith Tech | Strategic Software Audit"
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Meta Description (EN)</label>
                    <textarea
                      value={metaDescEn}
                      onChange={(e) => setMetaDescEn(e.target.value)}
                      placeholder="Detailed page description for search engine result snips..."
                      rows={2}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Meta Title (FR)</label>
                    <input
                      type="text"
                      value={metaTitleFr}
                      onChange={(e) => setMetaTitleFr(e.target.value)}
                      placeholder="Zenith Tech | Audit Logiciel Stratégique"
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 mb-1 uppercase font-bold">Meta Description (FR)</label>
                    <textarea
                      value={metaDescFr}
                      onChange={(e) => setMetaDescFr(e.target.value)}
                      placeholder="Description détaillée de la page pour les snippets..."
                      rows={2}
                      className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Keywords (comma-separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="software audit, Next.js optimization, consulting"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">OpenGraph Image (URL)</label>
              <input
                type="text"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                placeholder="https://yourdomain.com/assets/og-card.png"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* OG Image Preview */}
          {ogImageUrl && (
            <div className="pt-2 border-t border-[#CDD4DD]/5">
              <span className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Social OG Preview Card
              </span>
              <div className="bg-[#121A1B] p-2 rounded-2xl border border-[#CDD4DD]/5 max-w-sm">
                <img src={ogImageUrl} alt="Social Card" className="rounded-xl w-full h-auto object-cover max-h-36" />
              </div>
            </div>
          )}

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
              className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#FF7A00] hover:bg-opacity-80 rounded-xl text-white font-bold cursor-pointer border-0 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save SEO Config"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-4 rounded-3xl flex justify-between items-center shadow-sm">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#CDD4DD]/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search page routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7A00] w-48"
              />
            </div>
          </div>

          <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#CDD4DD]/10 text-[#CDD4DD]/40 uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Page Path</th>
                    <th className="py-3 px-4">Meta Title (EN)</th>
                    <th className="py-3 px-4">Robots</th>
                    <th className="py-3 px-4">OG Image Card</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDD4DD]/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">Loading metadata registry...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">No SEO page configs recorded.</td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-[#121A1B]/35 align-top">
                        <td className="py-3 px-4 font-mono font-bold text-[#FF7A00]">{item.pagePath}</td>
                        <td className="py-3 px-4 text-white font-medium max-w-xs truncate" title={item.metaTitle?.en}>
                          {item.metaTitle?.en || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold border ${
                            item.robotsIndex.includes("noindex")
                              ? "bg-red-950/40 border-red-500/20 text-red-400"
                              : "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                          }`}>
                            {item.robotsIndex}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.ogImageUrl ? (
                            <img src={item.ogImageUrl} alt="OG Card" className="w-12 h-6 object-cover rounded ring-1 ring-white/10" />
                          ) : (
                            <span className="text-gray-600 font-mono text-[9px]">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-[#FF7A00] hover:underline bg-transparent border-0 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:underline bg-transparent border-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
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
