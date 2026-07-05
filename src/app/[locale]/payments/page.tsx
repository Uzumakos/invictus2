import React from "react";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import PaymentCheckout from "../../../../components/PaymentCheckout";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ serviceId?: string; amount?: string; email?: string; clientName?: string; currency?: string }>;
}

export default async function PaymentsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { serviceId, amount, email, clientName, currency } = await searchParams;

  // Fetch enabled payment methods from Supabase using admin client to bypass RLS
  const { data: methods } = await getSupabaseAdmin()
    .from("payment_methods")
    .select("*")
    .eq("enabled", true);

  // Fetch settings for footer social links using admin client to bypass RLS
  const { data: settingsData } = await getSupabaseAdmin()
    .from("site_settings")
    .select("social_links")
    .single();

  const socialLinks = settingsData?.social_links || { github: "", linkedin: "", twitter: "" };

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />
      
      <main className="flex-grow pt-32 pb-24 flex items-center justify-center">
        <div className="max-w-xl w-full px-4 sm:px-6">
          <PaymentCheckout
            initialServiceId={serviceId}
            initialAmount={amount}
            initialEmail={email}
            initialClientName={clientName}
            initialCurrency={currency}
            paymentMethods={methods || []}
            locale={locale as "en" | "fr"}
          />
        </div>
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
