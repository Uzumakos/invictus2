"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Copy,
  ExternalLink,
  Check,
  Filter,
  Calendar,
  User,
  MessageSquare,
  FileText,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsAppInteraction } from "@/lib/types";

export default function WhatsAppHistoryTable() {
  const [interactions, setInteractions] = useState<WhatsAppInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [langFilter, setLangFilter] = useState<"all" | "en" | "fr">("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<WhatsAppInteraction | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/whatsapp-interactions");
      if (res.ok) {
        const data: WhatsAppInteraction[] = await res.json();
        setInteractions(data.reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter logic
  const filteredInteractions = interactions.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (item.clientName || "").toLowerCase().includes(q) ||
      (item.clientEmail || "").toLowerCase().includes(q) ||
      (item.templateName || "").toLowerCase().includes(q) ||
      (item.generatedMessage || "").toLowerCase().includes(q);

    const matchesLang = langFilter === "all" || item.language === langFilter;

    if (!matchesSearch || !matchesLang) return false;

    if (dateFilter !== "all" && item.createdAt) {
      const createdDate = new Date(item.createdAt);
      const now = new Date();

      if (dateFilter === "today") {
        return createdDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return createdDate >= oneWeekAgo;
      }
      if (dateFilter === "month") {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return createdDate >= oneMonthAgo;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            WhatsApp Communication History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of all generated WhatsApp messages and shareable links.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
        >
          <span>Refresh History</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search client, message, template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setDateFilter("all")}
            className={`flex-1 py-1.5 font-medium rounded-lg transition ${
              dateFilter === "all" ? "bg-amber-600 text-white shadow" : "text-slate-400"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter("today")}
            className={`flex-1 py-1.5 font-medium rounded-lg transition ${
              dateFilter === "today" ? "bg-amber-600 text-white shadow" : "text-slate-400"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter("week")}
            className={`flex-1 py-1.5 font-medium rounded-lg transition ${
              dateFilter === "week" ? "bg-amber-600 text-white shadow" : "text-slate-400"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateFilter("month")}
            className={`flex-1 py-1.5 font-medium rounded-lg transition ${
              dateFilter === "month" ? "bg-amber-600 text-white shadow" : "text-slate-400"
            }`}
          >
            This Month
          </button>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setLangFilter("all")}
            className={`flex-1 py-1.5 font-medium rounded-lg transition ${
              langFilter === "all" ? "bg-emerald-600 text-white shadow" : "text-slate-400"
            }`}
          >
            All Lang
          </button>
          <button
            onClick={() => setLangFilter("en")}
            className={`flex-1 py-1.5 font-medium rounded-lg transition ${
              langFilter === "en" ? "bg-emerald-600 text-white shadow" : "text-slate-400"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLangFilter("fr")}
            className={`flex-1 py-1.5 font-medium rounded-lg transition ${
              langFilter === "fr" ? "bg-emerald-600 text-white shadow" : "text-slate-400"
            }`}
          >
            FR
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>Loading communication history...</span>
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-slate-600" />
            <p className="text-sm">No matching history records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Lang</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Message Snippet</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInteractions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-medium text-slate-100">
                      <div>{item.clientName || "Client"}</div>
                      <div className="text-[11px] text-slate-400">{item.clientEmail}</div>
                    </td>

                    <td className="px-4 py-3 text-emerald-400 font-medium">
                      {item.templateName}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">
                        {(item.language || "en").toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                        {!item.copied && !item.opened && !item.shared && (
                          <span className="text-slate-500 text-[11px]">Generated</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs truncate font-mono text-slate-400">
                      {item.generatedMessage}
                    </td>

                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : "N/A"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPreviewItem(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition"
                        >
                          View
                        </button>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(item.generatedLink);
                            showToast("Link copied!");
                          }}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded transition"
                          title="Copy wa.me link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
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

      {/* Full Message Preview Modal */}
      <AnimatePresence>
        {selectedPreviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-emerald-400">
                  {selectedPreviewItem.templateName}
                </h3>
                <button
                  onClick={() => setSelectedPreviewItem(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>Client: {selectedPreviewItem.clientName || "N/A"}</div>
                <div>Date: {selectedPreviewItem.createdAt}</div>
              </div>

              <pre className="text-xs text-slate-200 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedPreviewItem.generatedMessage}
              </pre>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] font-mono text-emerald-400 truncate max-w-xs">
                  {selectedPreviewItem.generatedLink}
                </div>

                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      selectedPreviewItem.generatedLink
                    );
                    showToast("Link copied!");
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                >
                  Copy Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
