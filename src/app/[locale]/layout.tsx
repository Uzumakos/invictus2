import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { supabase } from "@/lib/supabaseClient";
import "../globals.css";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  let title = "Amedee Erns Baptiste — Senior Technology Consultant & Digital Transformation Advisor";
  let description = "Senior Technology Consultant, AI Product Strategist, and Digital Transformation Leader delivering international excellence.";
  let keywordsStr = "Technology Consultant, Software Architecture, CTO Advisor, AI Integration, Cloud Migration, Digital Transformation";

  try {
    const { data } = await supabase
      .from("translations")
      .select("key, en, fr")
      .in("key", ["seo.title", "seo.description", "seo.keywords"]);

    if (data && data.length > 0) {
      const titleRow = data.find((r) => r.key === "seo.title");
      const descRow = data.find((r) => r.key === "seo.description");
      const keyRow = data.find((r) => r.key === "seo.keywords");

      if (titleRow) title = locale === "fr" ? titleRow.fr : titleRow.en;
      if (descRow) description = locale === "fr" ? descRow.fr : descRow.en;
      if (keyRow) keywordsStr = locale === "fr" ? keyRow.fr : keyRow.en;
    }
  } catch (err) {
    console.warn("⚠️ Failed to load dynamic SEO metadata from Supabase, using defaults.");
  }

  const keywords = keywordsStr.split(",").map((k) => k.trim()).filter(Boolean);

  return {
    title: {
      default: title,
      template: `%s | Amedee Erns Baptiste`
    },
    description,
    keywords,
    authors: [{ name: "Amedee Erns Baptiste" }],
    creator: "Amedee Erns Baptiste",
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      siteName: "Amedee Erns Baptiste",
      title,
      description
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    robots: { index: true, follow: true }
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Amedee Erns Baptiste",
    "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://amedee.consulting"}#professional-service`,
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://amedee.consulting",
    "telephone": "+50937000000",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Port-au-Prince",
      "addressCountry": "HT"
    },
    "sameAs": [
      "https://github.com",
      "https://linkedin.com"
    ],
    "description": locale === "fr"
      ? "Conseiller CTO et Consultant Principal en Technologie offrant l'excellence internationale en Architecture Logicielle, Systèmes d'IA et Migration Cloud."
      : "CTO Advisor and Senior Technology Consultant delivering international excellence in Software Architecture, AI Systems, and Cloud Migration."
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NODE_ENV === "development" && (
          <style dangerouslySetInnerHTML={{ __html: `
            nextjs-portal,
            [data-nextjs-dialog-overlay],
            [data-nextjs-toast] {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          ` }} />
        )}
      </head>
      <body className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] font-sans antialiased" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
