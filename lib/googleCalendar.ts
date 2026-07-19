import { Booking } from "@/lib/types";

/**
 * Generates a 1-click Google Calendar event link.
 * Opens Google Calendar directly pre-filled with:
 * - Session Title & Client Name
 * - Date, Time & Timezone
 * - Client Email added as attendee
 * - Questionnaire details & meeting notes
 */
export function getGoogleCalendarUrl(booking: {
  serviceTitle: string | { en: string; fr: string };
  clientName: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "14:00" or "02:00 PM"
  timezone?: string;
  packageType?: string;
  amount?: number;
  questionnaire?: {
    goals?: string;
    context?: string;
    expectations?: string;
    techStack?: string;
  };
}): string {
  const titleText = typeof booking.serviceTitle === "object"
    ? (booking.serviceTitle.en || booking.serviceTitle.fr || "Consultation Session")
    : (booking.serviceTitle || "Consultation Session");

  // Parse start date & time
  const dateParts = (booking.date || "").split("-").map(Number);
  const year = dateParts[0] || new Date().getFullYear();
  const month = (dateParts[1] || 1) - 1;
  const day = dateParts[2] || 1;

  let hours = 10;
  let minutes = 0;
  if (booking.time) {
    const timeClean = booking.time.trim();
    if (timeClean.includes(":")) {
      const parts = timeClean.split(":");
      hours = parseInt(parts[0], 10) || 10;
      if (parts[1]) {
        minutes = parseInt(parts[1].replace(/[^0-9]/g, ""), 10) || 0;
        if (timeClean.toLowerCase().includes("pm") && hours < 12) hours += 12;
        if (timeClean.toLowerCase().includes("am") && hours === 12) hours = 0;
      }
    }
  }

  // Session Duration: 60 mins
  const startDate = new Date(Date.UTC(year, month, day, hours, minutes));
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(`Consultation: ${titleText} — ${booking.clientName}`);
  
  const notes = [
    `Client: ${booking.clientName} (${booking.clientEmail})`,
    `Service: ${titleText}`,
    `Package: ${booking.packageType || "Standard"} ($${booking.amount || 0})`,
    `Timezone: ${booking.timezone || "UTC"}`,
    booking.questionnaire?.goals ? `Goals: ${booking.questionnaire.goals}` : "",
    booking.questionnaire?.context ? `Context: ${booking.questionnaire.context}` : "",
  ].filter(Boolean).join("\n\n");

  const details = encodeURIComponent(notes);
  const dates = `${formatUtc(startDate)}/${formatUtc(endDate)}`;
  const add = encodeURIComponent(booking.clientEmail);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&add=${add}`;
}

/**
 * Generates an iCalendar (.ics) string for Outlook, Apple Calendar, or Google Calendar import.
 */
export function generateICSContent(booking: {
  id: string;
  serviceTitle: string | { en: string; fr: string };
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  timezone?: string;
}): string {
  const titleText = typeof booking.serviceTitle === "object"
    ? (booking.serviceTitle.en || booking.serviceTitle.fr || "Consultation Session")
    : (booking.serviceTitle || "Consultation Session");

  const dateParts = (booking.date || "").split("-").map(Number);
  const year = dateParts[0] || new Date().getFullYear();
  const month = (dateParts[1] || 1) - 1;
  const day = dateParts[2] || 1;

  let hours = 10;
  let minutes = 0;
  if (booking.time) {
    const parts = booking.time.trim().split(":");
    hours = parseInt(parts[0], 10) || 10;
    if (parts[1]) minutes = parseInt(parts[1], 10) || 0;
  }

  const startDate = new Date(Date.UTC(year, month, day, hours, minutes));
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const formatUtc = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invictus Platform//Consultation Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@invictus.com`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(startDate)}`,
    `DTEND:${formatUtc(endDate)}`,
    `SUMMARY:Consultation: ${titleText} with ${booking.clientName}`,
    `DESCRIPTION:Consultation session with ${booking.clientName} (${booking.clientEmail}).`,
    `ATTENDEE;CN=${booking.clientName}:mailto:${booking.clientEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
