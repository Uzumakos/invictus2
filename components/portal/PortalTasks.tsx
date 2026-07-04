"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle2, Circle, Clock, Plus, X, AlertCircle } from "lucide-react";
import { PortalTask, Language } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";

interface PortalTasksProps {
  tasks: PortalTask[];
  onToggleTask: (task: PortalTask) => Promise<void>;
  onCreateTask: (title: string, description: string, deadline: string, assignedTo: "client" | "amedee") => Promise<void>;
}

export default function PortalTasks({ tasks, onToggleTask, onCreateTask }: PortalTasksProps) {
  const t = useTranslations("portal");
  const locale = useLocale() as Language;

  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newAssignee, setNewAssignee] = useState<"client" | "amedee">("client");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDeadline) return;

    setSubmitting(true);
    try {
      await onCreateTask(newTitle, newDesc, newDeadline, newAssignee);
      setNewTitle("");
      setNewDesc("");
      setNewDeadline("");
      setNewAssignee("client");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
          {t("tasks")}
        </h3>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold uppercase rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Action Item
        </button>
      </div>

      <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-2xl overflow-hidden shadow-2xs divide-y divide-[var(--color-brand-neutral)]/15">
        {tasks.length === 0 ? (
          <div className="p-10 text-center text-[var(--color-brand-muted)] font-medium">
            No action items assigned to your workspace.
          </div>
        ) : (
          tasks.map((task) => {
            const title = task.title[locale] || task.title["en"];
            const desc = task.description[locale] || task.description["en"];
            const isDone = task.status === "done";

            return (
              <div key={task.id} className="p-6 flex items-start gap-4 hover:bg-[var(--color-brand-bg)]/20 transition-colors">
                <button
                  onClick={() => onToggleTask(task)}
                  className="mt-1 text-[var(--color-brand-primary)] hover:scale-105 transition-all shrink-0 cursor-pointer"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--color-brand-neutral)]" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <h4 className={`text-sm font-semibold text-[var(--color-brand-dark)] ${isDone ? "line-through opacity-50" : ""}`}>
                    {title}
                  </h4>
                  <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed font-medium pr-10">
                    {desc}
                  </p>

                  <div className="flex flex-wrap gap-4 items-center pt-2 text-[10px] font-mono text-[var(--color-brand-muted)] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 font-bold"><Clock className="w-3.5 h-3.5" />Deadline: {task.deadline}</span>
                    <span className="bg-[var(--color-brand-panel)] px-2 py-0.5 rounded text-[9px] font-bold text-[var(--color-brand-primary)]">
                      Assignee: {task.assignedTo === "client" ? "You" : "Amedee"}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                      task.status === "done"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : task.status === "review"
                        ? "bg-purple-50 border-purple-100 text-purple-700 animate-pulse"
                        : task.status === "in_progress"
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}>
                      {t(`status.${task.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-brand-dark)]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[var(--color-brand-neutral)]/20">
                <h4 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">Add Action Item</h4>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-full text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-bg)] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">TITLE *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Provide database credentials"
                    className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Add detailed task context here..."
                    className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">DEADLINE *</label>
                    <input
                      type="date"
                      required
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1 uppercase">ASSIGNEE</label>
                    <select
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value as "client" | "amedee")}
                      className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/45 rounded-xl px-4 py-2.5 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
                    >
                      <option value="client">You (Client)</option>
                      <option value="amedee">Amedee</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-brand-neutral)]/20">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)]">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {submitting ? "..." : "Add Item"}
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
