"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Copy, CheckCircle, Trash2, 
  Video, FileText, Image as ImageIcon, Link as LinkIcon, 
  ExternalLink, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  mediaUrl: string;
  altText?: string;
  tags?: string[];
  createdAt: string;
}

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Images");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [tags, setTags] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data || []);
      }
    } catch (err) {
      console.error("Failed to load media catalog:", err);
    }
  };

  const handleCopy = (id: string, url: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate HTTPS protocol strictly
    if (!mediaUrl.startsWith("https://")) {
      setErrorMsg("URL validation failed: External URLs must use the secure HTTPS protocol.");
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedTags = tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        name,
        category,
        description,
        mediaUrl,
        altText,
        tags: parsedTags
      };

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to register media item.");
      }

      const newItem = await res.json();
      setMediaList([newItem, ...mediaList]);
      
      // Reset form
      setName("");
      setMediaUrl("");
      setDescription("");
      setAltText("");
      setTags("");
      
      setToastMsg("Media item cataloged successfully.");
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while cataloging media.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item from the catalog?")) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMediaList(mediaList.filter(item => item.id !== id));
        setToastMsg("Media item removed from catalog.");
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
    }
  };

  // Helper to detect if URL is image, youtube or general vimeo link
  const getMediaType = (url: string) => {
    if (!url) return "unknown";
    if (url.match(/\.(webp|jpg|jpeg|gif|png|svg)/i)) {
      return "image";
    }
    if (url.match(/(youtube\.com|youtu\.be|vimeo\.com)/i)) {
      return "video";
    }
    return "file";
  };

  // Helper to extract YouTube embed link
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("v=")) {
        videoId = url.split("v=")[1]?.split("&")[0] || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes("vimeo.com")) {
      const vimeoId = url.split("vimeo.com/")[1]?.split("?")[0] || "";
      return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;
    }
    return url;
  };

  // Filter items
  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 bg-emerald-950 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-400 font-bold z-50 flex items-center space-x-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left panel: Add Media catalog form */}
      <div className="lg:col-span-4 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4 self-start">
        <div>
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">ASSETS VAULT</span>
          <h4 className="font-serif font-bold text-lg text-white">Catalog External Media</h4>
          <p className="text-[10px] text-[#CDD4DD]/50">Reference secure Cloudinary, Supabase or other HTTPS assets.</p>
        </div>

        <form onSubmit={handleAddMedia} className="space-y-3.5 text-xs text-gray-300">
          <div>
            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Asset Display Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hero Banner Background"
              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              >
                <option value="Images">Images</option>
                <option value="Videos">Videos</option>
                <option value="Logos">Logos</option>
                <option value="Documents">Documents</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Alt Text</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Illustration of AI"
                className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Secure HTTPS URL *</label>
            <input
              type="url"
              required
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://cdn.example.com/image.webp"
              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF7A00] font-mono text-[10px]"
            />
          </div>

          {/* Conditional Live Preview Player */}
          {mediaUrl.startsWith("https://") && (
            <div className="bg-[#121A1B] p-3 rounded-xl border border-[#CDD4DD]/5 space-y-1">
              <span className="text-[8px] font-bold text-[#FF7A00] uppercase block">Live Preview</span>
              <div className="w-full overflow-hidden flex items-center justify-center bg-[#1A2324] rounded-lg p-2 min-h-24">
                {getMediaType(mediaUrl) === "image" && (
                  <img src={mediaUrl} alt="Preview" className="max-h-32 object-contain rounded" onError={(e) => { (e.target as any).style.display = "none"; }} />
                )}
                {getMediaType(mediaUrl) === "video" && (
                  <iframe src={getEmbedUrl(mediaUrl)} className="w-full aspect-video rounded border-0" allowFullScreen />
                )}
                {getMediaType(mediaUrl) === "file" && (
                  <div className="text-center p-4 text-[#CDD4DD]/40 space-y-1">
                    <FileText className="w-8 h-8 mx-auto text-[#FF7A00]" />
                    <span className="block text-[10px]">Secure Document / Link</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this media used for?"
              rows={2}
              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[8px] font-bold text-[#CDD4DD]/40 tracking-wider mb-1 uppercase">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. hero, background, marketing"
              className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/20 p-3 rounded-xl text-red-400 text-[10px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#FF7A00] hover:bg-[#121A1B] hover:border-[#FF7A00] hover:text-[#FF7A00] border border-transparent text-white font-bold tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? "Cataloging..." : "Add to Library"}</span>
          </button>
        </form>
      </div>

      {/* Right panel: Media Catalog Browser */}
      <div className="lg:col-span-8 bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-serif font-bold text-lg text-white">Media Asset Catalog</h4>
            <p className="text-[10px] text-[#CDD4DD]/50">Search and copy registered HTTPS links for website builders.</p>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-[#CDD4DD]/40">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets or tags..."
              className="bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7A00] w-full sm:w-48"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 border-b border-[#CDD4DD]/5 pb-3">
          {["all", "Images", "Videos", "Logos", "Documents", "Others"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium text-[10px] tracking-wider uppercase transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-[#FF7A00]/10 border-[#FF7A00] text-[#FF7A00]"
                  : "bg-transparent border-[#CDD4DD]/10 text-[#CDD4DD]/50 hover:border-gray-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredMedia.length === 0 ? (
            <div className="col-span-full text-center py-20 text-[#CDD4DD]/30 border border-dashed border-[#CDD4DD]/10 rounded-2xl">
              No media assets registered in this category.
            </div>
          ) : (
            filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-[#121A1B] border border-[#CDD4DD]/5 p-4 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-[#FF7A00]/30 transition-all duration-300 relative overflow-hidden"
              >
                {/* Media Thumbnail Container */}
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-[#1A2324] border border-[#CDD4DD]/5 flex items-center justify-center relative">
                  {getMediaType(item.mediaUrl) === "image" && (
                    <img src={item.mediaUrl} alt={item.name} className="w-full h-full object-cover" />
                  )}
                  {getMediaType(item.mediaUrl) === "video" && (
                    <div className="text-center space-y-1">
                      <Video className="w-8 h-8 text-[#FF7A00] mx-auto animate-pulse" />
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Video Embed Link</span>
                    </div>
                  )}
                  {getMediaType(item.mediaUrl) === "file" && (
                    <div className="text-center space-y-1">
                      <FileText className="w-8 h-8 text-[#FF7A00] mx-auto" />
                      <span className="text-[8px] font-bold text-gray-500 uppercase">Document Asset</span>
                    </div>
                  )}

                  {/* External Hover Indicator */}
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 bg-black/75 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF7A00]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-serif font-bold text-sm text-white truncate max-w-[180px]">{item.name}</span>
                    <span className="bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/20 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[10px] text-gray-400 line-clamp-2">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="bg-[#1A2324] text-[9px] text-[#CDD4DD]/50 border border-[#CDD4DD]/5 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#CDD4DD]/5">
                  <button
                    onClick={() => handleCopy(item.id, item.mediaUrl)}
                    className="flex-grow py-2 bg-[#1A2324] hover:bg-[#FF7A00] hover:text-white rounded-lg border border-[#CDD4DD]/10 text-gray-300 font-bold uppercase tracking-wider text-[9px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400 animate-bounce" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-2 bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
