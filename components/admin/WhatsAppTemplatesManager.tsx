"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Globe,
  Sparkles,
  Save,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsAppTemplate, WhatsAppCategory } from "@/lib/types";
import { DEFAULT_WHATSAPP_TEMPLATES } from "@/lib/whatsapp";

const PLACEHOLDER_TAGS = [
  "{{client_name}}",
  "{{service_name}}",
  "{{invoice_number}}",
  "{{invoice_link}}",
  "{{payment_link}}",
  "{{amount}}",
  "{{date}}",
  "{{time}}",
  "{{meeting_link}}",
  "{{project_name}}",
  "{{whatsapp_link}}"
];

const CATEGORY_OPTIONS: { label: string; value: WhatsAppCategory }[] = [
  { label: "Booking Confirmation", value: "booking_confirmation" },
  { label: "Discovery Call Reminder", value: "discovery_call_reminder" },
  { label: "Invoice Available", value: "invoice_available" },
  { label: "Payment Reminder", value: "payment_reminder" },
  { label: "Payment Confirmation", value: "payment_confirmation" },
  { label: "Consultation Follow-Up", value: "consultation_follow_up" },
  { label: "Testimonial Request", value: "testimonial_request" },
  { label: "Project Update", value: "project_update" },
  { label: "Custom Message", value: "custom_message" },
];

export default function WhatsAppTemplatesManager() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"all" | "en" | "fr">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [category, setCategory] = useState<string>("booking_confirmation");
  const [content, setContent] = useState("");
  const [active, setActive] = useState(true);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/whatsapp-templates");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }
    // Fallback to defaults
    setTemplates(DEFAULT_WHATSAPP_TEMPLATES);
  };

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setName("");
    setLanguage("en");
    setCategory("booking_confirmation");
    setContent("");
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: WhatsAppTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setLanguage(t.language);
    setCategory(t.category);
    setContent(t.content);
    setActive(t.active);
    setIsModalOpen(true);
  };

  const handleInsertPlaceholder = (tag: string) => {
    setContent((prev) => prev + " " + tag);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const payload: WhatsAppTemplate = {
      id: editingTemplate ? editingTemplate.id : `tmpl_${Date.now()}`,
      name,
      language,
      category,
      content,
      active,
    };

    try {
      const url = editingTemplate
        ? `/api/whatsapp-templates/${editingTemplate.id}`
        : "/api/whatsapp-templates";
      const method = editingTemplate ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback update local state
        if (editingTemplate) {
          setTemplates((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
        } else {
          setTemplates((prev) => [...prev, payload]);
        }
      } else {
        await fetchTemplates();
      }

      showToast(editingTemplate ? "Template updated." : "Template created.");
      setIsModalOpen(false);
    } catch (err) {
      // Local state fallback
      if (editingTemplate) {
        setTemplates((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
      } else {
        setTemplates((prev) => [...prev, payload]);
      }
      showToast(editingTemplate ? "Template updated locally." : "Template created locally.");
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await fetch(`/api/whatsapp-templates/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }

    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Template deleted.");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLanguage === "all" || t.language === selectedLanguage;
    const matchesCat = selectedCategory === "all" || t.category === selectedCategory;
    return matchesQuery && matchesLang && matchesCat;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            WhatsApp Message Templates
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage reusable WhatsApp response templates in English and French.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setSelectedLanguage("all")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedLanguage === "all"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Languages
          </button>
          <button
            onClick={() => setSelectedLanguage("en")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedLanguage === "en"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            English (EN)
          </button>
          <button
            onClick={() => setSelectedLanguage("fr")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
              selectedLanguage === "fr"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            French (FR)
          </button>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((t) => (
          <div
            key={t.id}
            className="p-5 bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl flex flex-col justify-between transition-all duration-200 shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                      t.language === "fr"
                        ? "bg-blue-950 text-blue-400 border border-blue-500/30"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {t.language}
                  </span>
                  <h3 className="font-semibold text-slate-100 text-base">{t.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                    title="Edit Template"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="inline-block px-2.5 py-1 text-[11px] bg-slate-950 text-slate-400 rounded-md border border-slate-800/60 mb-3">
                Category: <span className="text-slate-200">{t.category}</span>
              </div>

              <pre className="text-xs text-slate-300 font-mono bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/60 whitespace-pre-wrap leading-relaxed">
                {t.content}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Popup */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-emerald-400 text-sm font-medium rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden text-slate-100"
            >
              <form onSubmit={handleSave}>
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {editingTemplate ? "Edit Template" : "New WhatsApp Template"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Booking Confirmation (EN)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="en">English (EN)</option>
                        <option value="fr">French (FR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Placeholder Insert Helper Chips */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Click to insert dynamic variables:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PLACEHOLDER_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertPlaceholder(tag)}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded text-xs font-mono transition"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Template Content Text
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your template text here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-600/20"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
