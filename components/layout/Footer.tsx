"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Github, Linkedin, Twitter, ArrowUp, Heart } from "lucide-react";

interface FooterProps {
  socialLinks?: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

export default function Footer({ socialLinks }: FooterProps) {
  const t = useTranslations("nav");

  const githubUrl = socialLinks?.github || "https://github.com";
  const linkedinUrl = socialLinks?.linkedin || "https://linkedin.com";
  const twitterUrl = socialLinks?.twitter || "https://twitter.com";

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-[var(--color-brand-dark)] text-white/70 py-16 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <span className="font-serif font-bold text-lg text-white tracking-wide">
              Amedee Erns Baptiste
            </span>
            <p className="text-xs text-white/50 max-w-sm leading-relaxed font-medium">
              Senior Software Architect & Digital Transformation Leader. Specializing in high-throughput enterprise systems, robust database caching frameworks, and AI product integration strategy.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[var(--color-brand-primary)] hover:text-white transition-all">
                <Github className="w-4.5 h-4.5" />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[var(--color-brand-primary)] hover:text-white transition-all">
                <Linkedin className="w-4.5 h-4.5" />
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-full hover:bg-[var(--color-brand-primary)] hover:text-white transition-all">
                <Twitter className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-[10px] font-sans font-bold tracking-widest text-white uppercase mb-4">Navigation</h4>
            <div className="flex flex-col space-y-2.5 text-xs font-semibold">
              {(["about", "services", "projects", "training", "blog"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => handleNavClick(key)}
                  className="text-left hover:text-white transition-colors cursor-pointer"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-[10px] font-sans font-bold tracking-widest text-white uppercase mb-4">Get In Touch</h4>
            <div className="flex flex-col space-y-2.5 text-xs font-semibold">
              <button onClick={() => handleNavClick("contact")} className="text-left hover:text-white transition-colors cursor-pointer">
                {t("contact")}
              </button>
              <a href="mailto:contact@amedeeerns.com" className="hover:text-white transition-colors">
                contact@amedeeerns.com
              </a>
              <span className="text-white/40 font-normal">Available for high-stakes projects globally</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-white/40 font-medium">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} Amedee Erns Baptiste. All rights reserved.</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> globally
            </span>
          </div>

          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
}
