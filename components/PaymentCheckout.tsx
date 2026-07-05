"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  Shield, Upload, CheckCircle2, AlertCircle, Loader2, 
  DollarSign, FileText, ArrowRight, RefreshCw, Image as ImageIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { consultingOffers } from "@/lib/data";
import { uploadReceiptScreenshot } from "@/lib/storage";

interface PaymentMethod {
  id: string;
  name: string;
  type: "mobile" | "bank" | "international";
  enabled: boolean;
  logo_url?: string;
  phone_number?: string;
  account_number?: string;
  account_holder?: string;
  email?: string;
}

interface PaymentCheckoutProps {
  initialServiceId?: string;
  initialAmount?: string;
  initialEmail?: string;
  initialClientName?: string;
  initialCurrency?: string;
  paymentMethods: PaymentMethod[];
  locale: "en" | "fr";
}

export default function PaymentCheckout({
  initialServiceId = "",
  initialAmount = "",
  initialEmail = "",
  initialClientName = "",
  initialCurrency = "USD",
  paymentMethods = [],
  locale = "en"
}: PaymentCheckoutProps) {
  const t = useTranslations("payments");

  // Form States
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialClientName);
  const [currency, setCurrency] = useState(initialCurrency);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [customServiceTitle, setCustomServiceTitle] = useState("");
  const [amount, setAmount] = useState(initialAmount);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [reference, setReference] = useState("");

  const isPreFilled = !!initialServiceId || !!initialAmount;

  // Reset selected method when currency changes to avoid showing stale selection
  useEffect(() => {
    setSelectedMethodId("");
  }, [currency]);
  
  // File Upload State
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // UI Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const [servicesList, setServicesList] = useState<any[]>(consultingOffers);

  // Load dynamic services on mount
  useEffect(() => {
    fetch("/api/consulting-services")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setServicesList(data);
        }
      })
      .catch(() => {});
  }, []);

  // Sync state from query parameters on load
  useEffect(() => {
    if (initialServiceId) {
      const selected = servicesList.find(s => s.id === initialServiceId);
      if (selected) {
        setSelectedServiceId(initialServiceId);
        setAmount(String(selected.price));
      } else {
        // If it's a custom service title generated from admin dashboard
        setSelectedServiceId("custom");
        setCustomServiceTitle(initialServiceId);
        if (initialAmount) {
          setAmount(initialAmount);
        }
      }
    } else if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialServiceId, initialAmount, servicesList]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    if (serviceId === "custom") {
      setAmount("");
    } else {
      const selected = servicesList.find(s => s.id === serviceId);
      if (selected) {
        setAmount(String(selected.price));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(locale === "fr" ? "La taille du fichier ne doit pas dépasser 5 Mo." : "File size must be under 5MB.");
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const getActiveServiceTitle = () => {
    if (selectedServiceId === "custom") {
      return customServiceTitle || (locale === "fr" ? "Service personnalisé" : "Custom Service");
    }
    const selected = servicesList.find(s => s.id === selectedServiceId);
    return selected ? (selected.title[locale] || selected.title["en"]) : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!name || !selectedServiceId || !amount || !selectedMethodId || !reference) {
      setError(locale === "fr" ? "Veuillez remplir tous les champs obligatoires." : "Please fill in all required fields.");
      return;
    }

    if (selectedServiceId === "custom" && !customServiceTitle) {
      setError(locale === "fr" ? "Veuillez spécifier le titre du service." : "Please specify the service title.");
      return;
    }

    if (!screenshotFile) {
      setError(
        locale === "fr" 
          ? "La capture d'écran du paiement est obligatoire pour vérification." 
          : "Payment screenshot is required for verification."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload receipt to Supabase Storage
      const fileExt = screenshotFile.name.split(".").pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const screenshotUrl = await uploadReceiptScreenshot(screenshotFile, uniqueFileName);

      const serviceTitle = getActiveServiceTitle();

      // 2. Post payment data to dynamic resource endpoint
      const payload = {
        client_email: email,
        client_name: name,
        amount: parseFloat(amount),
        currency: currency,
        service: serviceTitle,
        date: new Date().toISOString().split("T")[0],
        status: "pending",
        invoice_url: screenshotUrl, // Store upload URL in invoice_url column
        payment_method: selectedMethodId,
        payment_reference: reference
      };

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to log payment transaction record.");
      }

      const responseData = await response.json();
      setSubmittedData({
        ...payload,
        id: responseData.id
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (locale === "fr" ? "Une erreur est survenue lors de la soumission." : "An error occurred during submission."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter payment methods based on selected currency
  const filteredMethods = paymentMethods.filter((method) => {
    const idLower = method.id.toLowerCase();
    if (currency === "GDS") {
      return (
        idLower === "moncash" ||
        idLower === "natcash" ||
        idLower === "unibank" ||
        idLower === "sogebank"
      );
    } else {
      return idLower === "paypal" || idLower === "wise";
    }
  });

  const activeMethod = filteredMethods.find(m => m.id === selectedMethodId);

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-[var(--color-brand-neutral)]/20 shadow-xl">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="checkout-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <div className="text-center mb-8">
              <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase block mb-3 font-bold">
                {t("title")}
              </span>
              <h2 className="font-serif font-medium text-2xl text-[var(--color-brand-dark)] tracking-tight">
                {locale === "fr" ? "Valider votre Paiement" : "Verify Your Payment"}
              </h2>
              <p className="text-xs text-[var(--color-brand-muted)] mt-2 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                    {t("clientName")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)]"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                    {t("clientEmail")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)]"
                    placeholder="client@company.com"
                  />
                </div>
              </div>

              {/* Service & Amount: Editable if not pre-filled, otherwise show a clean summary card */}
              {isPreFilled ? (
                <div className="bg-[var(--color-brand-panel)] p-5 rounded-xl border border-[var(--color-brand-neutral)]/10 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--color-brand-neutral)]/10">
                    <span className="text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">
                      Service
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-brand-dark)]">
                      {getActiveServiceTitle()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">
                      {locale === "fr" ? "Montant à Payer" : "Amount to Pay"}
                    </span>
                    <span className="text-xl font-bold font-serif text-[var(--color-brand-primary)]">
                      {currency === "USD" ? `$${amount} USD` : `${amount} GDS`}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Service Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                      {t("selectService")} *
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)]"
                    >
                      <option value="">-- Select --</option>
                      {servicesList.map((service) => (
                        <option key={service.id} value={service.id}>
                          {(service.title[locale] || service.title["en"] || service.title) as string} (${service.price})
                        </option>
                      ))}
                      <option value="custom">
                        {locale === "fr" ? "Montant personnalisé / Facture d'administration" : "Custom Amount / Admin Invoice"}
                      </option>
                    </select>
                  </div>

                  {/* Custom Service Fields */}
                  {selectedServiceId === "custom" && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      <div className="sm:col-span-8">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                          {locale === "fr" ? "Nom du Service / Facture" : "Service Name / Invoice Title"} *
                        </label>
                        <input
                          type="text"
                          required
                          value={customServiceTitle}
                          onChange={(e) => setCustomServiceTitle(e.target.value)}
                          className="w-full bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)]"
                          placeholder="e.g. CTO Advisory - Q3 Project Planning"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                          {currency === "USD" 
                            ? (locale === "fr" ? "Montant (USD)" : "Amount (USD)") 
                            : (locale === "fr" ? "Montant (GDS)" : "Amount (GDS)")} *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-xs text-[var(--color-brand-muted)]">
                            {currency === "USD" ? "$" : "GDS "}
                          </span>
                          <input
                            type="number"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`w-full bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/30 rounded-lg pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)] ${
                              currency === "USD" ? "pl-7" : "pl-14"
                            }`}
                            placeholder="500"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preset Price Display */}
                  {selectedServiceId && selectedServiceId !== "custom" && (
                    <div className="bg-[var(--color-brand-panel)] p-4 rounded-xl border border-[var(--color-brand-neutral)]/10 flex justify-between items-center">
                      <span className="text-xs font-bold text-[var(--color-brand-muted)] uppercase tracking-wider">
                        {locale === "fr" ? "Montant Final" : "Total Cost"}
                      </span>
                      <span className="text-xl font-bold font-serif text-[var(--color-brand-primary)]">
                        {currency === "USD" ? `$${amount} USD` : `${amount} GDS`}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                  {t("paymentMethod")} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`p-3 rounded-lg border text-left flex flex-col items-center justify-center transition-all ${
                        selectedMethodId === method.id
                          ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 shadow-xs"
                          : "border-[var(--color-brand-neutral)]/30 hover:border-[var(--color-brand-primary)]/50"
                      }`}
                    >
                      {method.logo_url ? (
                        <img src={method.logo_url} alt={method.name} className="h-6 object-contain mb-1.5" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center mb-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-[var(--color-brand-dark)]">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Instructions */}
              {activeMethod && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-[var(--color-brand-primary)]/5 p-5 rounded-xl border border-[var(--color-brand-primary)]/20 space-y-2.5 text-xs leading-relaxed"
                >
                  <h4 className="font-bold text-[var(--color-brand-primary)] uppercase tracking-wider">
                    {locale === "fr" ? "Instructions de Paiement" : "Payment Instructions"} ({activeMethod.name})
                  </h4>
                  
                  {activeMethod.type === "mobile" && (
                    <p>
                      {t("moncashInstructions") || "Please transfer the amount to:"}{" "}
                      <strong className="text-sm font-mono text-[var(--color-brand-dark)]">{activeMethod.phone_number}</strong>
                    </p>
                  )}

                  {activeMethod.type === "bank" && (
                    <div className="space-y-1">
                      <p>{t("bankInstructions") || "Please transfer to our Bank Account:"}</p>
                      <p>🏦 <strong>{activeMethod.name}</strong></p>
                      <p>🔢 {locale === "fr" ? "Numéro de Compte" : "Account Number"}: <strong className="font-mono">{activeMethod.account_number}</strong></p>
                      <p>👤 {locale === "fr" ? "Titulaire" : "Holder Name"}: <strong>{activeMethod.account_holder}</strong></p>
                    </div>
                  )}

                  {activeMethod.type === "international" && (
                    <div className="space-y-1">
                      <p>{locale === "fr" ? "Veuillez envoyer le paiement à :" : "Please send payment to:"}</p>
                      <p>📧 Email: <strong className="font-mono text-[var(--color-brand-dark)]">{activeMethod.email}</strong></p>
                    </div>
                  )}

                  <p className="text-[10px] text-[var(--color-brand-muted)] border-t border-[var(--color-brand-neutral)]/20 pt-2 flex items-center gap-1 mt-1">
                    <Shield className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
                    <span>{locale === "fr" ? "Remarque : Téléchargez ensuite la capture d'écran du reçu final." : "Notice: Remember to upload the screenshot of the confirmation message below."}</span>
                  </p>
                </motion.div>
              )}

              {/* Reference ID & Screenshot Upload */}
              {selectedMethodId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                      {t("referenceNumber")} ({locale === "fr" ? "Optionnel" : "Optional"})
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/30 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-brand-primary)]"
                      placeholder="e.g. Transaction ID, Batch ID, Reference number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-brand-dark)] mb-2">
                      {t("uploadScreenshot")} *
                    </label>
                    
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[var(--color-brand-neutral)]/30 rounded-xl cursor-pointer bg-[var(--color-brand-panel)] hover:bg-[var(--color-brand-neutral)]/5 transition-colors relative overflow-hidden">
                        {!screenshotPreview ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <Upload className="w-8 h-8 text-[var(--color-brand-muted)] mb-2" />
                            <p className="text-xs text-[var(--color-brand-muted)] font-medium">
                              {t("screenshotLabel")}
                            </p>
                            <p className="text-[10px] text-[var(--color-brand-muted)]/70 mt-1">
                              PNG, JPG, JPEG (Max. 5MB)
                            </p>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5 group">
                            <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-bold flex items-center gap-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                {locale === "fr" ? "Remplacer l'image" : "Change Screenshot"}
                              </span>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Feedback Message */}
              {error && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedMethodId}
                className="w-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("submit")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-receipt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-xl text-[var(--color-brand-dark)]">
                {t("successTitle") || "Receipt Uploaded!"}
              </h3>
              <p className="text-xs text-[var(--color-brand-muted)] mt-2 leading-relaxed px-4">
                {t("successDesc") || "Amedee will verify the payment screenshot and send your receipt shortly."}
              </p>
            </div>

            {/* Receipt Summary Details */}
            {submittedData && (
              <div className="bg-[var(--color-brand-panel)] border border-[var(--color-brand-neutral)]/20 p-5 rounded-xl text-left text-xs space-y-2.5 max-w-sm mx-auto font-sans shadow-xs">
                <div className="flex justify-between border-b border-[var(--color-brand-neutral)]/10 pb-2 mb-2 font-bold text-[10px] text-[var(--color-brand-muted)] uppercase tracking-wider">
                  <span>{locale === "fr" ? "Détails du Reçu" : "Receipt Summary"}</span>
                  <span className="text-[var(--color-brand-primary)]">Pending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-brand-muted)]">{locale === "fr" ? "Client" : "Client Name"}:</span>
                  <span className="font-medium text-[var(--color-brand-dark)]">{submittedData.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-brand-muted)]">Email:</span>
                  <span className="font-medium text-[var(--color-brand-dark)]">{submittedData.client_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-brand-muted)]">Service:</span>
                  <span className="font-medium text-[var(--color-brand-dark)] text-right max-w-[200px] truncate">{submittedData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-brand-muted)]">{locale === "fr" ? "Mode de Paiement" : "Payment Method"}:</span>
                  <span className="font-bold text-[var(--color-brand-dark)] uppercase">{submittedData.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-brand-muted)]">{locale === "fr" ? "Référence" : "Reference ID"}:</span>
                  <span className="font-mono text-[var(--color-brand-dark)]">{submittedData.payment_reference}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--color-brand-neutral)]/10 pt-2 font-bold text-[var(--color-brand-dark)] text-sm">
                  <span>{locale === "fr" ? "Montant" : "Total Paid"}:</span>
                  <span className="text-[var(--color-brand-primary)]">
                    {submittedData.currency === "GDS" ? `${submittedData.amount} GDS` : `$${submittedData.amount} USD`}
                  </span>
                </div>

                <div className="pt-2 flex justify-center">
                  <a
                    href={submittedData.invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-primary)] hover:underline"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{locale === "fr" ? "Voir la capture d'écran" : "View Uploaded Screenshot"}</span>
                  </a>
                </div>
              </div>
            )}

            <div className="pt-4">
              <a
                href={`/${locale}`}
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--color-brand-primary)] hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
              >
                <span>{locale === "fr" ? "Visiter la plateforme" : "Visit the Platform"}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
