"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Send, FileText, Lock, MessageSquare } from "lucide-react";
import { PortalMessage } from "@/lib/types";

interface PortalMessagesProps {
  messages: PortalMessage[];
  onSendMessage: (text: string) => Promise<void>;
}

export default function PortalMessages({ messages, onSendMessage }: PortalMessagesProps) {
  const t = useTranslations("portal");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat feed
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      await onSendMessage(text);
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl overflow-hidden shadow-2xs flex flex-col h-[65vh]">
      {/* Feed Header */}
      <div className="p-4 border-b border-[var(--color-brand-neutral)]/15 bg-[var(--color-brand-bg)] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--color-brand-primary)]" />
          <div>
            <h3 className="text-sm font-bold text-[var(--color-brand-dark)] uppercase tracking-wide">
              {t("messages")}
            </h3>
            <span className="block text-[8px] font-mono text-[var(--color-brand-muted)] uppercase tracking-wider">Amedee Erns Baptiste Direct Link</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-sans font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <Lock className="w-3 h-3" />
          Encrypted
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[var(--color-brand-muted)] font-mono">
            No messages in this chat stream yet. Type below to send a secure message.
          </div>
        ) : (
          messages.map((msg) => {
            const isClient = msg.sender === "client";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-3xs ${
                    isClient
                      ? "bg-[var(--color-brand-primary)] text-white rounded-tr-none"
                      : "bg-white border border-[var(--color-brand-neutral)]/40 text-[var(--color-brand-dark)] rounded-tl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[8px] font-mono text-[var(--color-brand-muted)] mt-1 px-1">
                  {isClient ? "You" : "Amedee"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--color-brand-neutral)]/20 bg-white flex gap-3 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send secure message to Amedee..."
          className="flex-1 bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-xs text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none font-semibold"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="p-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shadow-3xs shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
