"use client";

import React, { useState, useEffect } from "react";
import { Link2, Copy, ExternalLink, Check, Search, Share2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsAppInteraction } from "@/lib/types";

export default function SharedLinksManager() {
  const [interactions, setInteractions] = useState<WhatsAppInteraction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/whatsapp-interactions");
      if (res.ok) {
        const data: WhatsAppInteraction[] = await res.json();
        setInteractions(data.reverse());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filtered = interactions.filter(
    (item) =>
      item.generatedLink &&
      ((item.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.templateName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.generatedLink || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            Shareable WhatsApp Links Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate and copy shareable links for emails, invoices, and client portal messages.
          </p>
        </div>
      </div>

      {/* Embedded Use Case Snippet Helper */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-indigo-200 text-xs space-y-2">
        <h4 className="font-semibold text-indigo-300 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>How to use Shareable WhatsApp Links in Invoices & Portals</span>
        </h4>
        <p className="text-indigo-300/80 leading-relaxed">
          Insert <code className="bg-indigo-900/80 px-1.5 py-0.5 rounded text-indigo-200 font-mono">{"{{whatsapp_link}}"}</code> into invoice footer notes or email templates. When clicked by the client, it opens WhatsApp automatically with your prefilled message.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search links by client or template..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* Links List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-sm hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-emerald-400">
                {item.templateName}
              </span>
              <span className="text-xs text-slate-400">
                {item.clientName || "Client"}
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{item.generatedLink}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[10px]">
                {item.copied && (
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-500/30 rounded">
                    Copied
                  </span>
                )}
                {item.opened && (
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded">
                    Opened
                  </span>
                )}
                {item.shared && (
                  <span className="px-2 py-0.5 bg-purple-950 text-purple-400 border border-purple-500/30 rounded">
                    Shared
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(item.generatedLink);
                    showToast("Link copied to clipboard!");
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copy</span>
                </button>

                <a
                  href={item.generatedLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                  title="Test Open Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
}
