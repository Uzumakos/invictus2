"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BrandAssets {
  id?: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  brandPrimary: string;
  brandSecondary: string;
  typography: {
    headingsFont: string;
    bodyFont: string;
  };
}

export default function BrandAssetsForm() {
  const [assetId, setAssetId] = useState<string | null>(null);
  
  // Fields state
  const [logoLightUrl, setLogoLightUrl] = useState("");
  const [logoDarkUrl, setLogoDarkUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [brandPrimary, setBrandPrimary] = useState("#FF7A00");
  const [brandSecondary, setBrandSecondary] = useState("#121A1B");
  const [headingsFont, setHeadingsFont] = useState("Outfit");
  const [bodyFont, setBodyFont] = useState("Inter");

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchBrandAssets();
  }, []);

  const fetchBrandAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand-assets");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const cfg = data[0] as BrandAssets;
          setAssetId(cfg.id || null);
          setLogoLightUrl(cfg.logoLightUrl || "");
          setLogoDarkUrl(cfg.logoDarkUrl || "");
          setFaviconUrl(cfg.faviconUrl || "");
          setBrandPrimary(cfg.brandPrimary || "#FF7A00");
          setBrandSecondary(cfg.brandSecondary || "#121A1B");
          setHeadingsFont(cfg.typography?.headingsFont || "Outfit");
          setBodyFont(cfg.typography?.bodyFont || "Inter");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSave = async (updatedFields: Partial<BrandAssets>) => {
    setSaveStatus("saving");
    setErrorMsg("");

    // Read latest overall values
    const payload = {
      logoLightUrl: updatedFields.logoLightUrl !== undefined ? updatedFields.logoLightUrl : logoLightUrl,
      logoDarkUrl: updatedFields.logoDarkUrl !== undefined ? updatedFields.logoDarkUrl : logoDarkUrl,
      faviconUrl: updatedFields.faviconUrl !== undefined ? updatedFields.faviconUrl : faviconUrl,
      brandPrimary: updatedFields.brandPrimary !== undefined ? updatedFields.brandPrimary : brandPrimary,
      brandSecondary: updatedFields.brandSecondary !== undefined ? updatedFields.brandSecondary : brandSecondary,
      typography: {
        headingsFont: updatedFields.typography?.headingsFont !== undefined ? updatedFields.typography.headingsFont : headingsFont,
        bodyFont: updatedFields.typography?.bodyFont !== undefined ? updatedFields.typography.bodyFont : bodyFont,
      }
    };

    try {
      const method = assetId ? "PATCH" : "POST";
      const url = assetId ? `/api/brand-assets/${assetId}` : "/api/brand-assets";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to save brand config.");
      }

      const saved = await res.json();
      if (!assetId && saved.id) {
        setAssetId(saved.id);
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);

      // Trigger ISR cache revalidation
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/[locale]", type: "layout" })
      }).catch(() => {});

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to auto-save parameters.");
      setSaveStatus("error");
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-300">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">BRAND IDENTITY</span>
          <h3 className="font-serif font-bold text-xl text-white">Brand Assets Editor</h3>
        </div>

        {/* Auto-Save telemetry bar */}
        <div className="flex items-center gap-2 font-mono text-[9px]">
          {saveStatus === "saving" && (
            <span className="text-amber-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === "success" && (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle className="w-3 h-3" /> Saved Live
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Error saving
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl text-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-[#FF7A00] mx-auto mb-2" />
          <p className="font-mono text-[9px] text-[#CDD4DD]/40 uppercase tracking-widest">Loading visual tokens...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Logo & Favicon Assets */}
          <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
            <h4 className="font-serif font-bold text-base text-white">Logotypes & Assets</h4>
            
            <div className="space-y-3.5">
              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Logo Light Theme (URL)</label>
                <input
                  type="text"
                  value={logoLightUrl}
                  onChange={(e) => setLogoLightUrl(e.target.value)}
                  onBlur={() => handleFieldSave({ logoLightUrl })}
                  placeholder="https://yourdomain.com/assets/logo-light.png"
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Logo Dark Theme (URL)</label>
                <input
                  type="text"
                  value={logoDarkUrl}
                  onChange={(e) => setLogoDarkUrl(e.target.value)}
                  onBlur={() => handleFieldSave({ logoDarkUrl })}
                  placeholder="https://yourdomain.com/assets/logo-dark.png"
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Favicon Asset (URL)</label>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  onBlur={() => handleFieldSave({ faviconUrl })}
                  placeholder="https://yourdomain.com/favicon.ico"
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Asset Previews Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#CDD4DD]/5">
              <div className="bg-[#121A1B]/50 p-4 rounded-2xl border border-[#CDD4DD]/5 flex flex-col items-center justify-center text-center">
                <span className="block text-[7px] text-[#CDD4DD]/40 uppercase font-bold mb-2">Light Logo</span>
                {logoLightUrl ? (
                  <img src={logoLightUrl} alt="Logo Light" className="max-h-8 object-contain" />
                ) : (
                  <span className="text-[9px] text-gray-600">No Asset</span>
                )}
              </div>
              <div className="bg-[#121A1B]/50 p-4 rounded-2xl border border-[#CDD4DD]/5 flex flex-col items-center justify-center text-center">
                <span className="block text-[7px] text-[#CDD4DD]/40 uppercase font-bold mb-2">Dark Logo</span>
                {logoDarkUrl ? (
                  <img src={logoDarkUrl} alt="Logo Dark" className="max-h-8 object-contain" />
                ) : (
                  <span className="text-[9px] text-gray-600">No Asset</span>
                )}
              </div>
              <div className="bg-[#121A1B]/50 p-4 rounded-2xl border border-[#CDD4DD]/5 flex flex-col items-center justify-center text-center">
                <span className="block text-[7px] text-[#CDD4DD]/40 uppercase font-bold mb-2">Favicon Icon</span>
                {faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-[9px] text-gray-600">No Asset</span>
                )}
              </div>
            </div>
          </div>

          {/* Color Tokens & Typography */}
          <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
            <h4 className="font-serif font-bold text-base text-white">Visual Palette</h4>

            <div className="space-y-4">
              {/* Primary Color */}
              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Brand Primary</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandPrimary}
                    onChange={(e) => setBrandPrimary(e.target.value)}
                    onBlur={() => handleFieldSave({ brandPrimary })}
                    className="w-10 h-9 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                  />
                  <input
                    type="text"
                    value={brandPrimary}
                    onChange={(e) => setBrandPrimary(e.target.value)}
                    onBlur={() => handleFieldSave({ brandPrimary })}
                    placeholder="#FF7A00"
                    className="flex-1 bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-1.5 text-white font-mono text-center focus:outline-none"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Brand Secondary</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandSecondary}
                    onChange={(e) => setBrandSecondary(e.target.value)}
                    onBlur={() => handleFieldSave({ brandSecondary })}
                    className="w-10 h-9 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                  />
                  <input
                    type="text"
                    value={brandSecondary}
                    onChange={(e) => setBrandSecondary(e.target.value)}
                    onBlur={() => handleFieldSave({ brandSecondary })}
                    placeholder="#121A1B"
                    className="flex-1 bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-1.5 text-white font-mono text-center focus:outline-none"
                  />
                </div>
              </div>

              {/* Typography tokens */}
              <div className="pt-2 border-t border-[#CDD4DD]/5 space-y-3">
                <h5 className="font-serif font-bold text-xs text-white">Google Typography</h5>
                
                <div>
                  <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Headings Font</label>
                  <select
                    value={headingsFont}
                    onChange={(e) => {
                      setHeadingsFont(e.target.value);
                      handleFieldSave({ typography: { headingsFont: e.target.value, bodyFont } });
                    }}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Outfit">Outfit</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Syne">Syne</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Inter">Inter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider mb-1">Body Font</label>
                  <select
                    value={bodyFont}
                    onChange={(e) => {
                      setBodyFont(e.target.value);
                      handleFieldSave({ typography: { headingsFont, bodyFont: e.target.value } });
                    }}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/40 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
