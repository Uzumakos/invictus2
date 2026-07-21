"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  MessageSquare,
  Copy,
  ExternalLink,
  Users,
  Globe,
  TrendingUp,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { WhatsAppInteraction, WhatsAppAnalyticsSummary } from "@/lib/types";
import { calculateWhatsAppAnalytics } from "@/lib/whatsapp";

export default function WhatsAppAnalyticsDashboard() {
  const [interactions, setInteractions] = useState<WhatsAppInteraction[]>([]);
  const [analytics, setAnalytics] = useState<WhatsAppAnalyticsSummary | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/whatsapp-interactions");
      if (res.ok) {
        const data: WhatsAppInteraction[] = await res.json();
        setInteractions(data);
        const computed = calculateWhatsAppAnalytics(data);
        setAnalytics(computed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!analytics) {
    return (
      <div className="py-12 text-center text-slate-400">
        Loading WhatsApp Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            WhatsApp Communication Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time insights on message volume, template performance, client engagement, and language split.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
        >
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Messages Generated</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {analytics.totalGenerated}
          </div>
          <p className="text-[11px] text-slate-500">
            Recorded in platform history
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Most Used Template</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-indigo-300 truncate">
            {analytics.mostUsedTemplate}
          </div>
          <p className="text-[11px] text-slate-500">Top performing message model</p>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Most Contacted Client</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300 truncate">
            {analytics.mostContactedClient}
          </div>
          <p className="text-[11px] text-slate-500">Highest interaction volume</p>
        </div>

        {/* Card 4 */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Copied / Shared Links</span>
            <Copy className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">
            {analytics.copiedCount + analytics.sharedCount}
          </div>
          <p className="text-[11px] text-slate-500">
            {analytics.openedCount} direct conversation opens
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Split */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Messages by Preferred Language</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">English (EN)</span>
                <span className="font-mono text-emerald-400">
                  {analytics.messagesByLanguage.en} msgs
                </span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${
                      analytics.totalGenerated > 0
                        ? (analytics.messagesByLanguage.en / analytics.totalGenerated) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300">French (FR)</span>
                <span className="font-mono text-blue-400">
                  {analytics.messagesByLanguage.fr} msgs
                </span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${
                      analytics.totalGenerated > 0
                        ? (analytics.messagesByLanguage.fr / analytics.totalGenerated) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Activity Timeline */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Monthly Generation Volume</span>
          </h3>

          {analytics.monthlyActivity.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {analytics.monthlyActivity.map((item) => (
                <div
                  key={item.month}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60"
                >
                  <span className="font-mono text-slate-300">{item.month}</span>
                  <span className="font-bold text-amber-400">{item.count} msgs</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
