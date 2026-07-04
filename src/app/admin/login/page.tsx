"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success — redirect to dashboard
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121A1B] flex items-center justify-center p-4">
      {/* Decorative ambient background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#27187E]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#1A2324] border border-[#CDD4DD]/10 p-8 sm:p-10 rounded-3xl relative z-10 shadow-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-[#27187E]/25 text-[#FF7A00] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#FF7A00]/20">
            <Lock className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="font-serif font-medium text-2xl text-white">
            Security Control Console
          </h2>
          <p className="text-xs text-[#CDD4DD]/50 leading-relaxed max-w-xs mx-auto">
            Authorized administrator access keys required to authenticate console endpoints.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">ADMINISTRATOR EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#CDD4DD]/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domain.com"
                className="w-full bg-[#121A1B]/55 border border-[#CDD4DD]/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-[#27187E] focus:outline-none font-semibold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-sans font-bold text-[#CDD4DD]/40 tracking-wider mb-1.5 uppercase">PASSKEY CREDENTIALS</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#CDD4DD]/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#121A1B]/55 border border-[#CDD4DD]/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-[#27187E] focus:outline-none font-semibold font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#27187E] hover:bg-[#121A1B] text-white text-xs font-bold tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate Console"}
          </button>
        </form>

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-[10px] font-bold text-[#CDD4DD]/30 hover:text-white uppercase tracking-wider transition-colors"
          >
            ← Return to public platform
          </a>
        </div>
      </div>
    </div>
  );
}
