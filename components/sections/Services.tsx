"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Smartphone,
  Building,
  Globe,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, Booking, PaymentMethod, PaymentConfig, Language } from "@/lib/types";
import { consultingOffers } from "@/lib/data";
import { useRouter } from "@/lib/i18n/navigation";

interface ServicesProps {
  onSectionChange?: (sectionId: string) => void;
}

export default function Services({ onSectionChange }: ServicesProps) {
  const t = useTranslations("services");
  const currentLanguage = useLocale() as Language;
  const router = useRouter();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingStep, setBookingStep] = useState<"none" | "package" | "datetime" | "questionnaire" | "payment" | "success">("none");
  const [chosenTier, setChosenTier] = useState<{ name: string; multiplier: number; extraFeatures: string[] } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicesList, setServicesList] = useState<Service[]>(consultingOffers);

  // Form states
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingTimezone, setBookingTimezone] = useState("EST");
  const [bookingLang, setBookingLang] = useState<Language>(currentLanguage);
  const [qGoals, setQGoals] = useState("");
  const [qContext, setQContext] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");

  // Payment settings fetched from server
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ methods: [] });
  const [generatedBookingId, setGeneratedBookingId] = useState("");
  const [linkedDiscoveryId, setLinkedDiscoveryId] = useState<string | undefined>(undefined);

  // Fetch payment config and consulting services on mount
  useEffect(() => {
    fetch("/api/payment-config")
      .then((res) => res.json())
      .then((data) => {
        setPaymentConfig(data);
        // Default to first enabled payment method
        const firstEnabled = data.methods?.find((m: any) => m.enabled);
        if (firstEnabled) setSelectedPaymentId(firstEnabled.id);
      })
      .catch((err) => console.error("Error loading payment config:", err));

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

  // Listen for auto-fill event from Project Discovery Engine
  useEffect(() => {
    const handleDiscoveryBooking = () => {
      try {
        const payloadStr = localStorage.getItem("discovery_booking_payload");
        if (payloadStr) {
          const payload = JSON.parse(payloadStr);
          
          setClientName(payload.clientName || "");
          setClientEmail(payload.clientEmail || "");
          setQGoals(payload.goals || "");
          setQContext(payload.context || "");
          if (payload.discoveryId) {
            setLinkedDiscoveryId(payload.discoveryId);
          }
          
          // Match consulting offer
          const matchedOffer = servicesList.find(
            (o) => o.id === payload.serviceId || (o.title?.en ?? "").toLowerCase().includes((payload.serviceTitle || "").toLowerCase())
          ) || servicesList[0];
          
          setSelectedService(matchedOffer);
          setChosenTier(getServiceTiers(matchedOffer)[0]);
          setBookingStep("datetime");
          
          // Clean up payload
          localStorage.removeItem("discovery_booking_payload");
        }
      } catch (err) {
        console.error("Failed to restore discovery booking payload:", err);
      }
    };

    window.addEventListener("discovery_book_consultation", handleDiscoveryBooking);
    return () => {
      window.removeEventListener("discovery_book_consultation", handleDiscoveryBooking);
    };
  }, []);

  // Interactive Calendar states
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((prev) => prev - 1);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((prev) => prev + 1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  const generateCalendarDays = () => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
    const daysArray: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  };

  const isDatePast = (day: number) => {
    const dateToCompare = new Date(calYear, calMonth, day);
    const currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    return dateToCompare < currentDate;
  };

  const defaultTiers = [
    {
      name: "Strategic Sprint",
      multiplier: 1.0,
      extraFeatures: [
        "1-on-1 Interactive Call",
        "Direct email summaries",
        "Video recording access",
      ],
    },
    {
      name: "Architectural Blueprint",
      multiplier: 1.5,
      extraFeatures: [
        "1-on-1 Interactive Call",
        "Direct email summaries + Full Blueprint document",
        "Visual diagram design schemas",
        "Follow-up QA review call (15 mins)",
      ],
    },
    {
      name: "Continuous Enterprise Support",
      multiplier: 2.8,
      extraFeatures: [
        "All Blueprint assets",
        "Dedicated Private Slack Channel (1 Month)",
        "Priority architectural review response",
        "30-day emergency technical backup",
      ],
    },
  ];

  const getServiceTiers = (service: Service | null) => {
    if (service && service.tiers && service.tiers.length > 0) {
      return service.tiers;
    }
    return defaultTiers;
  };

  const handleOpenBooking = (service: Service) => {
    setSelectedService(service);
    const activeTiers = getServiceTiers(service);
    // Generate static reference code for this checkout flow
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
    setGeneratedBookingId(`b_${timestamp}${randomHex}`);
    setBookingStep("package");
    setChosenTier(activeTiers[0]);
    setError(null);
  };

  const handleCloseBooking = () => {
    setSelectedService(null);
    setBookingStep("none");
    setError(null);
  };

  const calculateFinalPrice = () => {
    if (!selectedService || !chosenTier) return 0;
    return Math.round(selectedService.price * chosenTier.multiplier);
  };

  const activePaymentMethods = paymentConfig.methods?.filter((m) => m.enabled) || [];
  const currentPaymentMethod = activePaymentMethods.find((m) => m.id === selectedPaymentId);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !chosenTier) return;

    if (!clientName || !clientEmail || !bookingDate || !bookingTime || !selectedPaymentId) {
      setError("Please fill all required parameters and select a payment method.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const bookingPayload = {
      id: generatedBookingId,
      clientName,
      clientEmail,
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      packageType: `${chosenTier.name} Tier`,
      language: bookingLang,
      date: bookingDate,
      time: bookingTime,
      timezone: bookingTimezone,
      questionnaire: {
        goals: qGoals,
        technical_context: qContext,
      },
      amount: calculateFinalPrice(),
      paymentMethod: selectedPaymentId,
      paymentReference: generatedBookingId,
      discoveryId: linkedDiscoveryId,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to register consultation booking");
      }

      setBookingStep("success");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while securing booking slot.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="services" className="py-24 bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-brand-primary)]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-[0.25em] uppercase block mb-3 font-bold">
            {t("title")}
          </span>
          <h2 className="font-serif font-medium text-3xl sm:text-4xl tracking-tight text-[var(--color-brand-dark)]">
            {t("subtitle")}
          </h2>
          <div className="w-16 h-[1px] bg-[var(--color-brand-primary)] mx-auto mt-5" />
        </div>

        {/* Services Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {servicesList.map((service) => (
            <motion.div
              key={service.id}
              className="bg-white border border-[var(--color-brand-neutral)]/20 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-2xs"
              whileHover={{ 
                y: -6,
                borderColor: "var(--color-brand-primary)",
                boxShadow: "0 20px 40px -20px rgba(0,0,0,0.06)"
              }}
              transition={{ duration: 0.25 }}
            >
              <div>
                <div className="w-8 h-[2px] bg-[var(--color-brand-primary)] mb-6"></div>
                <h3 className="font-serif font-bold text-xl leading-snug text-[var(--color-brand-dark)] mb-3">
                  {service.title[currentLanguage] || service.title["en"]}
                </h3>
                <p className="text-xs text-[var(--color-brand-muted)] mb-6 leading-relaxed">
                  {service.description[currentLanguage] || service.description["en"]}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-[var(--color-brand-muted)] font-sans font-bold uppercase mb-6">
                  <Clock className="w-4 h-4 text-[var(--color-brand-primary)]" />
                  <span>{service.duration} mins Session</span>
                </div>
              </div>

              <div>
                <div className="border-t border-[var(--color-brand-neutral)]/25 pt-6 mt-6 mb-6">
                  <span className="text-[10px] text-[var(--color-brand-muted)] block font-sans font-bold uppercase">STARTING AT</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold font-serif text-[var(--color-brand-dark)]">${service.price}</span>
                    <span className="text-xs text-[var(--color-brand-muted)] font-sans font-bold">/ USD</span>
                  </div>
                </div>

                <motion.button
                  onClick={() => handleOpenBooking(service)}
                  className="w-full py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase text-white bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] transition-all cursor-pointer block text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t("bookNow")}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Booking slide-over panel */}
        <AnimatePresence>
          {bookingStep !== "none" && selectedService && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-brand-dark)]/60 backdrop-blur-xs"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className="bg-white border border-[var(--color-brand-neutral)]/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative"
              >
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-brand-neutral)]/20 bg-[var(--color-brand-bg)]">
                  <div>
                    <span className="text-[10px] font-sans text-[var(--color-brand-primary)] tracking-wider uppercase block font-bold">SECURE RESERVATION</span>
                    <h3 className="font-serif font-bold text-lg text-[var(--color-brand-dark)]">
                      {selectedService.title[currentLanguage] || selectedService.title["en"]}
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseBooking}
                    className="p-1 rounded-full text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] hover:bg-[var(--color-brand-bg)] cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Step indicator (6 Steps now) */}
                <div className="grid grid-cols-6 text-center border-b border-[var(--color-brand-neutral)]/20 bg-[var(--color-brand-bg)] text-[8px] font-sans tracking-wider uppercase text-[var(--color-brand-muted)] relative font-bold">
                  {(["package", "datetime", "questionnaire", "payment", "success"] as const).map((step, idx) => {
                    const isCurrent = bookingStep === step;
                    const labels = ["1. Tier", "2. Timing", "3. Brief", "4. Pay", "5. Confirmed"];
                    if (step === "success" && bookingStep !== "success") return null;
                    return (
                      <span 
                        key={step}
                        className={`py-3 border-r border-[var(--color-brand-neutral)]/15 transition-all ${
                          isCurrent 
                            ? "text-[var(--color-brand-primary)] bg-white" 
                            : ""
                        }`}
                      >
                        {labels[idx]}
                      </span>
                    );
                  })}
                </div>

                {/* Step content */}
                <div className="p-6">
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* Step 1: Package choosing */}
                    {bookingStep === "package" && (
                      <motion.div 
                        key="package"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <h4 className="font-sans font-bold text-xs text-[var(--color-brand-primary)] tracking-wider uppercase">
                          {t("packages")}
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {getServiceTiers(selectedService).map((tier) => {
                            const isSelected = chosenTier?.name === tier.name;
                            const p = Math.round(selectedService.price * tier.multiplier);
                            return (
                              <div
                                key={tier.name}
                                onClick={() => setChosenTier(tier)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                                  isSelected
                                    ? "bg-[var(--color-brand-panel)]/50 border-[var(--color-brand-primary)] shadow-2xs"
                                    : "bg-white border-[var(--color-brand-neutral)]/65 hover:border-[var(--color-brand-primary)]/40"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-serif font-bold text-[var(--color-brand-dark)] text-base">{tier.name}</span>
                                  <span className="font-mono text-[var(--color-brand-primary)] font-bold text-base">${p} USD</span>
                                </div>
                                <ul className="space-y-1.5 text-xs text-[var(--color-brand-muted)] pl-4 list-disc font-medium">
                                  {tier.extraFeatures.map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => setBookingStep("datetime")}
                            className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-1.5 cursor-pointer"
                          >
                            <span>{t("next")}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Date & Time selector */}
                    {bookingStep === "datetime" && (
                      <motion.div 
                        key="datetime"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <h4 className="font-sans font-bold text-xs text-[var(--color-brand-primary)] tracking-wider uppercase">
                          RESERVATION TIME & DETAILS
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">{t("yourName")} *</label>
                            <input
                              type="text"
                              required
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              placeholder="Your Name"
                              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-sm text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">{t("yourEmail")} *</label>
                            <input
                              type="email"
                              required
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              placeholder="your.email@domain.com"
                              className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-sm text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Calendar Picker Column */}
                          <div className="bg-[var(--color-brand-bg)] p-4 rounded-2xl border border-[var(--color-brand-neutral)]/20 space-y-3 shadow-2xs">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-sans font-bold text-[var(--color-brand-primary)] tracking-wider uppercase">{t("chooseDate")} *</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={handlePrevMonth}
                                  className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="font-serif font-bold text-xs text-[var(--color-brand-dark)] min-w-[90px] text-center">
                                  {monthNames[calMonth]} {calYear}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleNextMonth}
                                  className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-7 text-center text-[8px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider border-b border-[var(--color-brand-neutral)]/30 pb-1.5">
                              {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map(d => (
                                <span key={d}>{d}</span>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                              {generateCalendarDays().map((day, idx) => {
                                if (day === null) return <div key={`empty-${idx}`} />;

                                const isPast = isDatePast(day);
                                const formattedMonth = String(calMonth + 1).padStart(2, "0");
                                const formattedDay = String(day).padStart(2, "0");
                                const dateStr = `${calYear}-${formattedMonth}-${formattedDay}`;
                                const isSelected = bookingDate === dateStr;

                                return (
                                  <button
                                    key={`day-${day}`}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => setBookingDate(dateStr)}
                                    className={`py-1.5 text-xs font-mono rounded-lg transition-all ${
                                      isSelected
                                        ? "bg-[var(--color-brand-primary)] text-white font-bold scale-105"
                                        : isPast
                                        ? "text-gray-300 cursor-not-allowed opacity-30"
                                        : "hover:bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-dark)] cursor-pointer"
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Timeslots Column */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-2 uppercase">{t("chooseTime")} *</label>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { raw: "09:00", label: "09:00 AM" },
                                  { raw: "10:30", label: "10:30 AM" },
                                  { raw: "13:00", label: "01:00 PM" },
                                  { raw: "14:30", label: "02:30 PM" },
                                  { raw: "16:00", label: "04:00 PM" },
                                  { raw: "17:30", label: "05:30 PM" },
                                ].map((slot) => {
                                  const isSelected = bookingTime === slot.raw;
                                  return (
                                    <button
                                      key={slot.raw}
                                      type="button"
                                      onClick={() => setBookingTime(slot.raw)}
                                      className={`py-2 text-xs font-mono font-bold border rounded-xl transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)] scale-[1.02] shadow-2xs"
                                          : "bg-white border-[var(--color-brand-neutral)]/45 hover:border-[var(--color-brand-primary)]/50 text-[var(--color-brand-dark)]"
                                      }`}
                                    >
                                      {slot.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">{t("timezone")}</label>
                              <select
                                value={bookingTimezone}
                                onChange={(e) => setBookingTimezone(e.target.value)}
                                className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-sm text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                              >
                                <option value="EST">EST (Haiti / East Coast)</option>
                                <option value="PST">PST (Pacific Coast)</option>
                                <option value="GMT">GMT (London / Europe)</option>
                                <option value="CET">CET (Central Europe)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">{t("language")}</label>
                          <div className="flex space-x-3">
                            {[
                              { id: Language.EN, label: "English" },
                              { id: Language.FR, label: "Français" },
                            ].map((lang) => (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => setBookingLang(lang.id)}
                                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                  bookingLang === lang.id
                                    ? "bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)] text-white"
                                    : "bg-white border-[var(--color-brand-neutral)]/40 text-[var(--color-brand-muted)] hover:border-[var(--color-brand-primary)]"
                                }`}
                              >
                                {lang.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-[var(--color-brand-neutral)]/20">
                          <button
                            type="button"
                            onClick={() => setBookingStep("package")}
                            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]"
                          >
                            {t("back")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!clientName || !clientEmail || !bookingDate || !bookingTime) {
                                setError("Please provide your name, email, date and time.");
                                return;
                              }
                              setError(null);
                              setBookingStep("questionnaire");
                            }}
                            className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-1.5 cursor-pointer"
                          >
                            <span>{t("next")}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Questionnaire */}
                    {bookingStep === "questionnaire" && (
                      <motion.div 
                        key="questionnaire"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <h4 className="font-sans font-bold text-xs text-[var(--color-brand-primary)] tracking-wider uppercase">
                          {t("questionnaire")}
                        </h4>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">
                            {t("goals")} *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={qGoals}
                            onChange={(e) => setQGoals(e.target.value)}
                            placeholder="E.g., Review legacy databases, optimize microtransactions, or plan RAG integrations."
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-sm text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] tracking-wider mb-1.5 uppercase">
                            {t("context")}
                          </label>
                          <textarea
                            rows={3}
                            value={qContext}
                            onChange={(e) => setQContext(e.target.value)}
                            placeholder="E.g., PostgreSQL with Redis caching on AWS."
                            className="w-full bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/40 rounded-xl px-4 py-3 text-sm text-[var(--color-brand-dark)] focus:border-[var(--color-brand-primary)] focus:outline-none"
                          />
                        </div>

                        <div className="flex justify-between pt-4 border-t border-[var(--color-brand-neutral)]/20">
                          <button
                            type="button"
                            onClick={() => setBookingStep("datetime")}
                            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]"
                          >
                            {t("back")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!qGoals) {
                                setError("Goals description is required.");
                                return;
                              }
                              setError(null);
                              setBookingStep("payment");
                            }}
                            className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white px-6 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center space-x-1.5 cursor-pointer"
                          >
                            <span>{t("next")}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Payment selection */}
                    {bookingStep === "payment" && (
                      <motion.div 
                        key="payment"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <div>
                          <h4 className="font-sans font-bold text-xs text-[var(--color-brand-primary)] tracking-wider uppercase mb-1">
                            {t("paymentTitle")}
                          </h4>
                          <p className="text-[11px] text-[var(--color-brand-muted)]">
                            {t("paymentSubtitle")}
                          </p>
                        </div>

                        {activePaymentMethods.length === 0 ? (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                            <span>No payment options have been configured by the admin yet. Please check back later.</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {activePaymentMethods.map((method) => {
                              const isSelected = selectedPaymentId === method.id;
                              return (
                                <button
                                  key={method.id}
                                  type="button"
                                  onClick={() => setSelectedPaymentId(method.id)}
                                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                                    isSelected
                                      ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-panel)]/40 font-bold"
                                      : "border-[var(--color-brand-neutral)]/45 bg-white hover:border-[var(--color-brand-primary)]/40"
                                  }`}
                                >
                                  {method.logoUrl ? (
                                    <img
                                      src={method.logoUrl}
                                      alt={method.name}
                                      className="w-10 h-7 object-contain"
                                    />
                                  ) : (
                                    <Coins className="w-7 h-7 text-[var(--color-brand-muted)] shrink-0" />
                                  )}
                                  <div>
                                    <span className="block text-xs text-[var(--color-brand-dark)] font-bold uppercase">{method.name}</span>
                                    <span className="block text-[9px] text-[var(--color-brand-muted)] uppercase tracking-wide">
                                      {method.type === "mobile" && t("mobileMoney")}
                                      {method.type === "bank" && t("bankTransfer")}
                                      {method.type === "international" && t("international")}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Interactive dynamic details panel based on selected method */}
                        {currentPaymentMethod && (
                          <motion.div
                            key={currentPaymentMethod.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/20 p-5 rounded-2xl space-y-4"
                          >
                            <div className="flex items-center gap-3">
                              {currentPaymentMethod.logoUrl && (
                                <img
                                  src={currentPaymentMethod.logoUrl}
                                  alt={currentPaymentMethod.name}
                                  className="w-12 h-8 object-contain"
                                />
                              )}
                              <div>
                                <span className="block text-[9px] font-sans font-bold text-[var(--color-brand-muted)] uppercase">INSTRUCTIONS</span>
                                <span className="block text-sm text-[var(--color-brand-dark)] font-bold">{currentPaymentMethod.name} Checkout</span>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs font-mono text-[var(--color-brand-muted)] border-t border-[var(--color-brand-neutral)]/20 pt-3">
                              <div className="flex justify-between">
                                <span>{t("amount")}:</span>
                                <span className="text-[var(--color-brand-dark)] font-bold">${calculateFinalPrice()} USD</span>
                              </div>

                              {currentPaymentMethod.email && (
                                <div className="flex justify-between">
                                  <span>{t("paymentEmail") || "Gateway Email / ID"}:</span>
                                  <span className="text-[var(--color-brand-primary)] font-bold">{currentPaymentMethod.email}</span>
                                </div>
                              )}

                              {currentPaymentMethod.phoneNumber && (
                                <div className="flex justify-between">
                                  <span>{t("paymentPhone") || "Phone Line"}:</span>
                                  <span className="text-[var(--color-brand-primary)] font-bold">{currentPaymentMethod.phoneNumber}</span>
                                </div>
                              )}

                              {currentPaymentMethod.accountNumber && (
                                <div className="flex justify-between">
                                  <span>{t("paymentAccount") || "Account Number"}:</span>
                                  <span className="text-[var(--color-brand-dark)] font-bold">{currentPaymentMethod.accountNumber}</span>
                                </div>
                              )}

                              {currentPaymentMethod.accountHolder && (
                                <div className="flex justify-between">
                                  <span>{t("paymentHolder") || "Account Holder"}:</span>
                                  <span className="text-[var(--color-brand-dark)] font-bold">{currentPaymentMethod.accountHolder}</span>
                                </div>
                              )}

                              {currentPaymentMethod.id === "paypal" ? (
                                <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed italic bg-white/70 p-3 rounded-lg border border-[var(--color-brand-neutral)]/30 font-sans mt-2">
                                  {t("paypalNote")}
                                </p>
                              ) : (
                                <>
                                  <div className="flex justify-between">
                                    <span>{t("paymentRef")}:</span>
                                    <span className="text-[var(--color-brand-accent)] font-bold">{generatedBookingId}</span>
                                  </div>
                                  <p className="text-[10px] text-[var(--color-brand-muted)] leading-relaxed pt-2 border-t border-[var(--color-brand-neutral)]/10 font-sans">
                                    {t("paymentNote")}
                                  </p>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}

                        <div className="flex justify-between pt-4 border-t border-[var(--color-brand-neutral)]/20">
                          <button
                            type="button"
                            onClick={() => setBookingStep("questionnaire")}
                            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]"
                          >
                            {t("back")}
                          </button>
                          <motion.button
                            onClick={handleSubmitBooking}
                            type="button"
                            disabled={submitting || activePaymentMethods.length === 0}
                            className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white px-8 py-3 rounded-xl text-xs font-bold tracking-widest uppercase shadow-xs disabled:opacity-50 flex items-center space-x-2 transition-colors cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>{submitting ? t("submitting") : t("submit")}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 5: Success confirmation */}
                    {bookingStep === "success" && (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center py-8 space-y-6"
                      >
                        <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4 animate-bounce">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-serif font-bold text-2xl text-[var(--color-brand-dark)]">
                          {t("successTitle")}
                        </h3>
                        <p className="text-xs text-[var(--color-brand-muted)] max-w-md mx-auto leading-relaxed">
                          {t("successMsg")} Reference instructions have been sent to <span className="text-[var(--color-brand-dark)] font-bold">{clientEmail}</span>.
                        </p>
                        
                        <div className="p-4 bg-[var(--color-brand-bg)] border border-[var(--color-brand-neutral)]/20 rounded-2xl text-xs max-w-sm mx-auto text-[var(--color-brand-muted)] space-y-1.5 font-mono text-left shadow-2xs">
                          <div className="flex justify-between"><span>DATE:</span><span className="text-[var(--color-brand-dark)] font-bold">{bookingDate}</span></div>
                          <div className="flex justify-between"><span>TIME:</span><span className="text-[var(--color-brand-dark)] font-bold">{bookingTime} {bookingTimezone}</span></div>
                          <div className="flex justify-between"><span>PACKAGE:</span><span className="text-[var(--color-brand-primary)] font-bold">{chosenTier?.name}</span></div>
                          <div className="flex justify-between"><span>METHOD:</span><span className="text-[var(--color-brand-primary)] font-bold uppercase">{selectedPaymentId}</span></div>
                          <div className="flex justify-between"><span>REFERENCE:</span><span className="text-[var(--color-brand-accent)] font-bold">{generatedBookingId}</span></div>
                          <div className="flex justify-between"><span>TOTAL AMOUNT:</span><span className="text-green-700 font-bold">${calculateFinalPrice()} USD</span></div>
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                          <button
                            onClick={handleCloseBooking}
                            className="w-full sm:w-auto bg-[var(--color-brand-panel)] hover:bg-[var(--color-brand-neutral)] border border-[var(--color-brand-neutral)]/40 text-[var(--color-brand-dark)] px-6 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                          >
                            {t("close")}
                          </button>
                          
                          <button
                            onClick={() => {
                              localStorage.setItem("portal_autologin_email", clientEmail);
                              localStorage.setItem("portal_autologin_name", clientName);
                              window.dispatchEvent(new Event("portal_autologin"));
                              
                              if (onSectionChange) {
                                onSectionChange("portal");
                              } else {
                                router.push("/portal");
                              }
                              handleCloseBooking();
                            }}
                            className="w-full sm:w-auto bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-dark)] text-white px-6 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Open Secure Client Portal</span>
                            <span>→</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
