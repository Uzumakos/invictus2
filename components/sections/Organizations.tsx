"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Organization } from "@/lib/types";

interface OrganizationsProps {
  organizations: Organization[];
}

export default function Organizations({ organizations }: OrganizationsProps) {
  const t = useTranslations("organizations");

  // Filter out any organizations that might be disabled or invalid
  const validOrgs = organizations && organizations.length > 0 ? organizations : [];

  return (
    <section id="organizations" className="py-12 bg-white border-b border-[var(--color-brand-neutral)]/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[10px] font-sans font-bold tracking-widest text-[var(--color-brand-muted)] uppercase mb-8">
          {t("title")}
        </p>

        {/* Mobile View: Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center justify-center md:hidden">
          {validOrgs.map((org) => (
            <div key={org.id} className="flex flex-col items-center justify-center p-4 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300">
              {org.logoUrl ? (
                <img
                  src={org.logoUrl}
                  alt={org.name}
                  referrerPolicy="no-referrer"
                  className="max-h-10 max-w-full object-contain"
                  onError={(e) => {
                    // Fall back to clean stylized typography
                    e.currentTarget.style.display = "none";
                    const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = "block";
                  }}
                />
              ) : null}
              <span 
                className="font-serif italic font-semibold text-xs text-[var(--color-brand-primary)] tracking-widest uppercase"
                style={{ display: org.logoUrl ? "none" : "block" }}
              >
                {org.name}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop View: Infinite Marquee */}
        <div className="hidden md:flex relative w-full overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-20 before:bg-gradient-to-r before:from-white before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:bottom-0 after:w-20 after:bg-gradient-to-l after:from-white after:to-transparent after:z-10">
          <div className="flex gap-16 whitespace-nowrap animate-marquee">
            {/* Loop 3 times to ensure seamless scrolling width */}
            {[...Array(3)].map((_, loopIdx) => (
              <div key={loopIdx} className="flex gap-16 items-center justify-around min-w-full">
                {validOrgs.map((org) => (
                  <div key={`${org.id}-${loopIdx}`} className="flex items-center justify-center min-w-[150px] grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        referrerPolicy="no-referrer"
                        className="max-h-12 max-w-[120px] object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                          if (sibling) sibling.style.display = "block";
                        }}
                      />
                    ) : null}
                    <span 
                      className="font-serif italic font-bold text-base text-[var(--color-brand-primary)] tracking-widest uppercase"
                      style={{ display: org.logoUrl ? "none" : "block" }}
                    >
                      {org.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
