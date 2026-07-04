import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Amedee Erns Baptiste — Senior Software Engineer & Digital Transformation Consultant",
    template: "%s | Amedee Erns Baptiste",
  },
  description:
    "Senior Software Engineer, AI Product Strategist, and Digital Transformation Consultant. Building scalable digital products, AI-powered solutions, and consulting for startups, NGOs, and enterprises worldwide.",
  keywords: [
    "Software Engineer",
    "AI Product Strategy",
    "Digital Transformation",
    "Consulting",
    "Next.js",
    "React",
    "Haiti",
    "Caribbean Tech",
  ],
  authors: [{ name: "Amedee Erns Baptiste" }],
  creator: "Amedee Erns Baptiste",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR"],
    siteName: "Amedee Erns Baptiste",
    title: "Amedee Erns Baptiste — Senior Software Engineer",
    description:
      "Building scalable digital products, AI-powered solutions & digital transformation strategies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amedee Erns Baptiste — Senior Software Engineer",
    description:
      "Building scalable digital products, AI-powered solutions & digital transformation strategies.",
  },
  robots: { index: true, follow: true },
};

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
