"use client";

import React, { useState } from "react";
import { MessageSquare, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  validatePhoneNumber,
  generateWhatsAppLink,
  saveWhatsAppInteraction,
} from "@/lib/whatsapp";

export interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  templateName?: string;
  category?: string;
  language?: "en" | "fr" | string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost" | "icon";
  disabled?: boolean;
  onOpened?: (url: string) => void;
}

export default function WhatsAppButton({
  phone,
  message = "",
  templateName = "Direct Contact",
  category = "custom_message",
  language = "en",
  clientId,
  clientName,
  clientEmail,
  className = "",
  size = "md",
  variant = "default",
  disabled = false,
  onOpened,
}: WhatsAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { isValid, cleanPhone, error } = validatePhoneNumber(phone);
  const isDisabled = disabled || !isValid;

  const handleClick = async () => {
    if (isDisabled) return;
    setIsLoading(true);

    try {
      const link = generateWhatsAppLink(phone!, message);

      // Record interaction log
      await saveWhatsAppInteraction({
        clientId,
        clientName,
        clientEmail,
        templateName,
        category,
        language,
        generatedMessage: message,
        generatedLink: link,
        opened: true,
        copied: false,
        shared: false,
      });

      setToast("Opening WhatsApp...");
      setTimeout(() => setToast(null), 3000);

      window.open(link, "_blank", "noopener,noreferrer");
      if (onOpened) onOpened(link);
    } catch (err) {
      console.error("WhatsApp open error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  }[size];

  // Variant classes
  const variantClasses = {
    default:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-500/25 border border-emerald-500/30",
    outline:
      "bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400",
    ghost:
      "bg-transparent hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300",
    icon: "p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg",
  }[variant];

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        title={
          isDisabled
            ? error || "No valid WhatsApp number available"
            : "Open WhatsApp conversation"
        }
        className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ${sizeClasses} ${variantClasses} ${
          isDisabled ? "opacity-50 cursor-not-allowed filter grayscale" : "cursor-pointer"
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <WhatsAppSVG className="w-4 h-4 text-current" />
        )}

        {variant !== "icon" && (
          <span>{isLoading ? "Opening..." : "Open WhatsApp"}</span>
        )}
      </motion.button>

      {/* Floating Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-emerald-400 text-xs rounded-md border border-emerald-500/40 whitespace-nowrap shadow-lg z-50 flex items-center gap-1.5"
        >
          <ExternalLink className="w-3 h-3" />
          <span>{toast}</span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * High quality SVG for WhatsApp Brand Icon
 */
export function WhatsAppSVG({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
