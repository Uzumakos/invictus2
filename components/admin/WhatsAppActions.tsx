"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Copy,
  ExternalLink,
  History,
  Sparkles,
  Check,
  X,
  Send,
  Loader2,
  FileText,
  Globe,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Client, WhatsAppTemplate, WhatsAppInteraction } from "@/lib/types";
import {
  validatePhoneNumber,
  generateWhatsAppLink,
  replaceTemplateVariables,
  saveWhatsAppInteraction,
  updateWhatsAppInteraction,
  DEFAULT_WHATSAPP_TEMPLATES,
} from "@/lib/whatsapp";
import WhatsAppButton from "./WhatsAppButton";

export interface WhatsAppActionsProps {
  client?: Partial<Client> & {
    whatsapp_number?: string;
    full_name?: string;
    country_code?: string;
    preferred_language?: string;
    company_name?: string;
  };
  templateCategory?: string;
  initialVariables?: Record<string, string>;
  className?: string;
}

export default function WhatsAppActions({
  client,
  templateCategory,
  initialVariables = {},
  className = "",
}: WhatsAppActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Client Data
  const rawPhone = client?.whatsappNumber || client?.whatsapp_number || client?.phone || "";
  const clientName = client?.fullName || client?.full_name || "Client";
  const clientEmail = client?.email || "";
  const clientLang = (client?.preferredLanguage || client?.preferred_language || "en").toLowerCase();

  const { isValid, cleanPhone, error: phoneError } = validatePhoneNumber(rawPhone);

  // Templates & Selected State
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(DEFAULT_WHATSAPP_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, string>>({
    client_name: clientName,
    service_name: "Strategic Consulting",
    invoice_number: "INV-2026-001",
    invoice_link: "https://invictus.dev/portal/invoices",
    payment_link: "https://invictus.dev/pay/INV-2026-001",
    amount: "$1,500.00 USD",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM EST",
    meeting_link: "https://meet.google.com/invictus-discovery",
    project_name: "Enterprise System Modernization",
    ...initialVariables,
  });

  // Action States & History
  const [history, setHistory] = useState<WhatsAppInteraction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);

  // Fetch templates from API if available
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
        }
      }
    } catch (err) {
      // Fallback to default templates
    }
  };

  // Select initial template
  useEffect(() => {
    const matchingTemplates = templates.filter(
      (t) => t.language === (clientLang === "fr" ? "fr" : "en")
    );

    let initialTmpl: WhatsAppTemplate | undefined;

    if (templateCategory) {
      initialTmpl = matchingTemplates.find((t) => t.category === templateCategory);
    }

    if (!initialTmpl && matchingTemplates.length > 0) {
      initialTmpl = matchingTemplates[0];
    }

    if (initialTmpl) {
      setSelectedTemplateId(initialTmpl.id);
      const rendered = replaceTemplateVariables(initialTmpl.content, variables);
      setCustomMessage(rendered);
    }
  }, [templates, clientLang, templateCategory]);

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      const rendered = replaceTemplateVariables(tmpl.content, variables);
      setCustomMessage(rendered);
    }
  };

  const handleVariableChange = (key: string, val: string) => {
    const updatedVars = { ...variables, [key]: val };
    setVariables(updatedVars);

    const tmpl = templates.find((t) => t.id === selectedTemplateId);
    if (tmpl) {
      setCustomMessage(replaceTemplateVariables(tmpl.content, updatedVars));
    }
  };

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);
  const generatedLink = isValid ? generateWhatsAppLink(rawPhone, customMessage) : "";

  // Copy Link Action
  const handleCopyLink = async () => {
    if (!isValid || !generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      showToast("WhatsApp link copied successfully.");

      // Record or update interaction
      const created = await saveWhatsAppInteraction({
        clientId: client?.id,
        clientName,
        clientEmail,
        templateName: currentTemplate?.name || "Custom Link",
        category: currentTemplate?.category || "custom_message",
        language: clientLang,
        generatedMessage: customMessage,
        generatedLink,
        copied: true,
        shared: true,
        opened: false,
      });

      if (created) {
        setActiveInteractionId(created.id);
      }
    } catch (err) {
      console.error("Copy link error:", err);
    }
  };

  // Open WhatsApp Action
  const handleOpenWhatsApp = async () => {
    if (!isValid || !generatedLink) return;

    showToast("Opening WhatsApp...");

    const created = await saveWhatsAppInteraction({
      clientId: client?.id,
      clientName,
      clientEmail,
      templateName: currentTemplate?.name || "Direct Message",
      category: currentTemplate?.category || "custom_message",
      language: clientLang,
      generatedMessage: customMessage,
      generatedLink,
      opened: true,
      copied: false,
      shared: false,
    });

    if (created) {
      setActiveInteractionId(created.id);
    }

    window.open(generatedLink, "_blank", "noopener,noreferrer");
  };

  // Fetch History for Client
  const fetchClientHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/whatsapp-interactions");
      if (res.ok) {
        const data: WhatsAppInteraction[] = await res.json();
        const clientLogs = data.filter(
          (item) =>
            (client?.id && item.clientId === client.id) ||
            (clientEmail && item.clientEmail === clientEmail) ||
            (clientName && item.clientName === clientName)
        );
        setHistory(clientLogs.reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    fetchClientHistory();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* 1. Open WhatsApp Direct Button */}
      <WhatsAppButton
        phone={rawPhone}
        message={customMessage}
        templateName={currentTemplate?.name}
        category={currentTemplate?.category}
        language={clientLang}
        clientId={client?.id}
        clientName={clientName}
        clientEmail={clientEmail}
        disabled={!isValid}
      />

      {/* 2. Copy Link Button */}
      <button
        onClick={handleCopyLink}
        disabled={!isValid}
        title={isValid ? "Copy WhatsApp Link" : "No WhatsApp number"}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isValid
            ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600"
            : "bg-slate-900/50 text-slate-500 border border-slate-800/50 cursor-not-allowed"
        }`}
      >
        <Copy className="w-4 h-4 text-emerald-400" />
        <span>Copy Link</span>
      </button>

      {/* 3. Generate Custom Message Modal Trigger */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 transition-all duration-200"
      >
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>Generate Message</span>
      </button>

      {/* 4. View Client WhatsApp History */}
      <button
        onClick={handleOpenHistory}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all duration-200"
      >
        <History className="w-4 h-4 text-amber-400" />
        <span>History</span>
      </button>

      {/* Toast Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-emerald-400 text-sm font-medium rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Generate Message & Template Editor */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-100">
                      Generate WhatsApp Message
                    </h3>
                    <p className="text-xs text-slate-400">
                      Client: <span className="text-emerald-400">{clientName}</span> (
                      {rawPhone || "No number"})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
                {!isValid && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      {phoneError || "Client does not have a valid WhatsApp phone number."}
                    </span>
                  </div>
                )}

                {/* Template Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.language.toUpperCase()}] {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variable Auto-Fill Adjustments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Dynamic Variables
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {Object.keys(variables).map((key) => (
                      <div key={key}>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {`{{${key}}}`}
                        </label>
                        <input
                          type="text"
                          value={variables[key]}
                          onChange={(e) => handleVariableChange(key, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Content Preview & Editor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Message Preview & Manual Edit
                  </label>
                  <textarea
                    rows={6}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                  />
                </div>

                {/* Generated Link Box */}
                {isValid && generatedLink && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Generated wa.me Link
                    </label>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between gap-2">
                      <span className="truncate">{generatedLink}</span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md shrink-0 flex items-center gap-1 text-xs"
                      >
                        <Copy className="w-3 h-3 text-emerald-400" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCopyLink}
                  disabled={!isValid}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={handleOpenWhatsApp}
                  disabled={!isValid}
                  className="px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: WhatsApp History for Client */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-100"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-semibold text-slate-100">WhatsApp History</h3>
                    <p className="text-xs text-slate-400">{clientName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* History List */}
              <div className="p-5 flex-1 overflow-y-auto space-y-3">
                {isLoadingHistory ? (
                  <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                    <span>Loading history...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <p className="text-sm">No WhatsApp interaction history found.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-medium text-emerald-400">
                          {item.templateName}
                        </span>
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      <p className="text-slate-300 line-clamp-3 font-mono text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
                        {item.generatedMessage}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {item.copied && (
                            <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-500/30 rounded text-[10px]">
                              Copied
                            </span>
                          )}
                          {item.opened && (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                              Opened
                            </span>
                          )}
                          {item.shared && (
                            <span className="px-2 py-0.5 bg-purple-950 text-purple-400 border border-purple-500/30 rounded text-[10px]">
                              Shared
                            </span>
                          )}
                        </div>

                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(item.generatedLink);
                            showToast("Link copied!");
                          }}
                          className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 text-[11px]"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
