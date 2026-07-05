import React from "react";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Projects from "@/components/sections/Projects";
import { loadDB } from "@/lib/db";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CaseStudiesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch projects dynamically from Supabase database
  const db = (await loadDB()) as any;
  const projects = db.projects || [];
  const settings = db.settings;
  const socialLinks = settings?.socialLinks || {};

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />
      
      <main className="flex-grow pt-32 pb-24">
        <Projects projects={projects} />
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
