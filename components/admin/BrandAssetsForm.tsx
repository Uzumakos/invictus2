"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, RefreshCw, Save, Image as ImageIcon, ExternalLink, Check, AlertTriangle } from "lucide-react";
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

  // Image load verification states
  const [lightImgValid, setLightImgValid] = useState<boolean | null>(null);
  const [darkImgValid, setDarkImgValid] = useState<boolean | null>(null);
  const [faviconValid, setFaviconValid] = useState<boolean | null>(null);

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

  const handleFieldSave = async (updatedFields?: Partial<BrandAssets>) => {
    setSaveStatus("saving");
    setErrorMsg("");

    // Read latest overall values
    const payload = {
      logoLightUrl: updatedFields?.logoLightUrl !== undefined ? updatedFields.logoLightUrl : logoLightUrl,
      logoDarkUrl: updatedFields?.logoDarkUrl !== undefined ? updatedFields.logoDarkUrl : logoDarkUrl,
      faviconUrl: updatedFields?.faviconUrl !== undefined ? updatedFields.faviconUrl : faviconUrl,
      brandPrimary: updatedFields?.brandPrimary !== undefined ? updatedFields.brandPrimary : brandPrimary,
      brandSecondary: updatedFields?.brandSecondary !== undefined ? updatedFields.brandSecondary : brandSecondary,
      typography: {
        headingsFont: updatedFields?.typography?.headingsFont !== undefined ? updatedFields.typography.headingsFont : headingsFont,
        bodyFont: updatedFields?.typography?.bodyFont !== undefined ? updatedFields.typography.bodyFont : bodyFont,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">BRAND IDENTITY & ASSETS</span>
          <h3 className="font-serif font-bold text-xl text-white">Brand Assets & Logo Manager</h3>
          <p className="text-xs text-[#CDD4DD]/50 mt-1">
            Configure your site logo via external image URL, dark mode logo, favicon, and core brand color tokens.
          </p>
        </div>

        {/* Action & Auto-Save telemetry bar */}
        <div className="flex items-center gap-3 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => handleFieldSave()}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF7A00] hover:bg-[#ff8a1e] text-white font-sans font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {saveStatus === "saving" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveStatus === "saving" ? "Saving..." : "Save Brand Assets"}</span>
          </button>

          {saveStatus === "success" && (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Saved Live
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Error saving
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
          <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-base text-white">Logotypes & Assets</h4>
                <p className="text-[11px] text-[#CDD4DD]/40 mt-0.5">
                  Paste the direct image link (PNG, SVG, WEBP, or JPG) for your logo.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-[#CDD4DD]/60">
                Direct URL Integration
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[9px] font-bold text-[#CDD4DD]/60 uppercase tracking-wider">
                    Site Logo Light Theme (URL)
                  </label>
                  {logoLightUrl && (
                    <span className="text-[8px] font-mono">
                      {lightImgValid === true && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Link Active</span>}
                      {lightImgValid === false && <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Cannot preview link</span>}
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={logoLightUrl}
                  onChange={(e) => {
                    setLogoLightUrl(e.target.value);
                    setLightImgValid(null);
                  }}
                  onBlur={() => handleFieldSave({ logoLightUrl })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFieldSave({ logoLightUrl });
                  }}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
                <p className="text-[10px] text-[#CDD4DD]/40 mt-1">
                  Primary navbar logo displayed on public website header and admin navigation.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[9px] font-bold text-[#CDD4DD]/60 uppercase tracking-wider">
                    Logo Dark Theme (URL) (Optional)
                  </label>
                  {logoDarkUrl && (
                    <span className="text-[8px] font-mono">
                      {darkImgValid === true && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Link Active</span>}
                      {darkImgValid === false && <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Cannot preview link</span>}
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={logoDarkUrl}
                  onChange={(e) => {
                    setLogoDarkUrl(e.target.value);
                    setDarkImgValid(null);
                  }}
                  onBlur={() => handleFieldSave({ logoDarkUrl })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFieldSave({ logoDarkUrl });
                  }}
                  placeholder="https://example.com/logo-dark.png"
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
                <p className="text-[10px] text-[#CDD4DD]/40 mt-1">
                  Inverted / contrasting logo for dark surfaces and email templates.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[9px] font-bold text-[#CDD4DD]/60 uppercase tracking-wider">
                    Favicon Asset (URL)
                  </label>
                  {faviconUrl && (
                    <span className="text-[8px] font-mono">
                      {faviconValid === true && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-2.5 h-2.5" /> Link Active</span>}
                      {faviconValid === false && <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Cannot preview link</span>}
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={faviconUrl}
                  onChange={(e) => {
                    setFaviconUrl(e.target.value);
                    setFaviconValid(null);
                  }}
                  onBlur={() => handleFieldSave({ faviconUrl })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFieldSave({ faviconUrl });
                  }}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
              </div>
            </div>

            {/* Asset Previews Grid */}
            <div className="pt-4 border-t border-[#CDD4DD]/5 space-y-2">
              <span className="block text-[8px] font-bold text-[#CDD4DD]/40 uppercase tracking-wider">
                Live Asset Previews
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#121A1B]/70 p-4 rounded-2xl border border-[#CDD4DD]/5 flex flex-col items-center justify-center text-center min-h-[90px]">
                  <span className="block text-[7px] text-[#CDD4DD]/40 uppercase font-bold mb-2">Main Site Logo</span>
                  {logoLightUrl ? (
                    <img
                      src={logoLightUrl}
                      alt="Logo Light"
                      className="max-h-10 max-w-[120px] object-contain"
                      onLoad={() => setLightImgValid(true)}
                      onError={() => setLightImgValid(false)}
                    />
                  ) : (
                    <span className="text-[9px] text-gray-600">Default SVG Logo</span>
                  )}
                </div>

                <div className="bg-[#121A1B]/70 p-4 rounded-2xl border border-[#CDD4DD]/5 flex flex-col items-center justify-center text-center min-h-[90px]">
                  <span className="block text-[7px] text-[#CDD4DD]/40 uppercase font-bold mb-2">Dark Surface Logo</span>
                  {logoDarkUrl ? (
                    <img
                      src={logoDarkUrl}
                      alt="Logo Dark"
                      className="max-h-10 max-w-[120px] object-contain"
                      onLoad={() => setDarkImgValid(true)}
                      onError={() => setDarkImgValid(false)}
                    />
                  ) : (
                    <span className="text-[9px] text-gray-600">No Dark Logo Set</span>
                  )}
                </div>

                <div className="bg-[#121A1B]/70 p-4 rounded-2xl border border-[#CDD4DD]/5 flex flex-col items-center justify-center text-center min-h-[90px]">
                  <span className="block text-[7px] text-[#CDD4DD]/40 uppercase font-bold mb-2">Browser Favicon</span>
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt="Favicon"
                      className="w-7 h-7 object-contain"
                      onLoad={() => setFaviconValid(true)}
                      onError={() => setFaviconValid(false)}
                    />
                  ) : (
                    <span className="text-[9px] text-gray-600">Default Favicon</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => handleFieldSave()}
                disabled={saveStatus === "saving"}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#FF7A00] hover:bg-[#ff8a1e] text-white font-sans font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Logo & Brand Assets</span>
              </button>
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
