"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, AlertCircle, Save, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Testimonial {
  id: string;
  clientName: string;
  role?: string;
  company?: string;
  photoUrl?: string;
  rating: number;
  content: {
    en: string;
    fr: string;
  };
  createdAt?: string;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [rating, setRating] = useState(5);
  const [contentEn, setContentEn] = useState("");
  const [contentFr, setContentFr] = useState("");

  const [langTab, setLangTab] = useState<"en" | "fr">("en");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        setTestimonials(await res.json());
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
    setClientName("");
    setRole("");
    setCompany("");
    setPhotoUrl("");
    setRating(5);
    setContentEn("");
    setContentFr("");
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  const handleEditClick = (item: Testimonial) => {
    setEditingItem(item);
    setClientName(item.clientName || "");
    setRole(item.role || "");
    setCompany(item.company || "");
    setPhotoUrl(item.photoUrl || "");
    setRating(item.rating || 5);
    setContentEn(item.content?.en || "");
    setContentFr(item.content?.fr || "");
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) {
      setErrorMsg("Client name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      clientName,
      role,
      company,
      photoUrl,
      rating: Number(rating),
      content: {
        en: contentEn,
        fr: contentFr
      }
    };

    try {
      const method = editingItem ? "PATCH" : "POST";
      const url = editingItem ? `/api/testimonials/${editingItem.id}` : "/api/testimonials";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save testimonial.");
      }

      showToast(editingItem ? "Testimonial updated successfully." : "Testimonial created successfully.");
      setIsEditorOpen(false);
      fetchTestimonials();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id));
        showToast("Testimonial deleted successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = testimonials.filter(t => 
    t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.company?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">SOCIAL PROOF</span>
          <h3 className="font-serif font-bold text-xl text-white">Testimonials Manager</h3>
        </div>
        
        <button
          onClick={handleCreateClick}
          className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {isEditorOpen ? (
        <form onSubmit={handleSave} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
            <h4 className="font-serif font-bold text-base text-white">
              {editingItem ? "Edit Testimonial" : "Add Testimonial"}
            </h4>
            <button type="button" onClick={() => setIsEditorOpen(false)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Client Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Role / Job Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Chief Technology Officer"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Zenith Solutions"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Photo URL (HTTPS)</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Rating Rating (1-5 stars)</label>
              <div className="flex items-center gap-1.5 mt-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="bg-transparent border-0 cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${num <= rating ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider uppercase">Review Content</label>
              <div className="flex bg-[#121A1B] p-0.5 rounded-lg border border-[#CDD4DD]/10">
                <button
                  type="button"
                  onClick={() => setLangTab("en")}
                  className={`px-3 py-1 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                    langTab === "en" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLangTab("fr")}
                  className={`px-3 py-1 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                    langTab === "fr" ? "bg-[#FF7A00] text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  French
                </button>
              </div>
            </div>

            {langTab === "en" ? (
              <textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="Write the English testimonial text..."
                rows={4}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl p-3 text-white focus:outline-none"
              />
            ) : (
              <textarea
                value={contentFr}
                onChange={(e) => setContentFr(e.target.value)}
                placeholder="Écrire le texte du témoignage en français..."
                rows={4}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl p-3 text-white focus:outline-none"
              />
            )}
          </div>

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
              <span>{isSubmitting ? "Saving..." : "Save Testimonial"}</span>
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
                placeholder="Search testimonials..."
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
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Content Preview (EN)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDD4DD]/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">Loading testimonials...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">No testimonials found.</td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-[#121A1B]/35 align-top">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          {item.photoUrl && (
                            <img src={item.photoUrl} alt={item.clientName} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" />
                          )}
                          <span>{item.clientName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="block font-semibold text-white">{item.role || "N/A"}</span>
                          <span className="text-[9px] text-[#CDD4DD]/40">{item.company}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <Star key={num} className={`w-3 h-3 ${num <= item.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"}`} />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 truncate max-w-xs text-gray-400" title={item.content?.en}>
                          {item.content?.en || "No English translation"}
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
