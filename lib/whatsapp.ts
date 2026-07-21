import { WhatsAppTemplate, WhatsAppInteraction, WhatsAppAnalyticsSummary } from "./types";

/**
 * Sanitizes phone numbers by stripping all non-numeric characters.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return "";
  // Keep numeric characters only
  return phone.replace(/\D/g, "");
}

/**
 * Validates a phone number for WhatsApp links.
 */
export function validatePhoneNumber(phone?: string): {
  isValid: boolean;
  cleanPhone: string;
  error?: string;
} {
  if (!phone || !phone.trim()) {
    return { isValid: false, cleanPhone: "", error: "No phone number provided." };
  }

  const cleanPhone = sanitizePhoneNumber(phone);

  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return {
      isValid: false,
      cleanPhone,
      error: "Phone number must contain between 7 and 15 digits.",
    };
  }

  return { isValid: true, cleanPhone };
}

/**
 * Generates a wa.me URL for WhatsApp Web / Mobile app with an encoded message text.
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const { cleanPhone } = validatePhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message || "");
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Replaces mustache template placeholders with dynamic values.
 * Placeholders: {{client_name}}, {{service_name}}, {{invoice_number}},
 * {{invoice_link}}, {{payment_link}}, {{amount}}, {{date}}, {{time}},
 * {{meeting_link}}, {{project_name}}, {{whatsapp_link}}
 */
export function replaceTemplateVariables(
  templateContent: string,
  variables: Record<string, string>
): string {
  if (!templateContent) return "";
  let result = templateContent;

  for (const key of Object.keys(variables)) {
    const val = variables[key] ?? "";
    const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
    result = result.replace(pattern, val);
  }

  return result;
}

/**
 * Default pre-seeded English and French WhatsApp templates.
 */
export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "tmpl_en_booking_confirm",
    name: "Booking Confirmation",
    language: "en",
    category: "booking_confirmation",
    active: true,
    content: `Hello {{client_name}},

Your booking for "{{service_name}}" has been confirmed.

Date: {{date}}
Time: {{time}}

Thank you for choosing Invictus.

— Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_en_invoice_avail",
    name: "Invoice Available",
    language: "en",
    category: "invoice_available",
    active: true,
    content: `Hello {{client_name}},

Your invoice #{{invoice_number}} is now available.

You can review it here:

{{invoice_link}}

Best regards,

Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_en_payment_remind",
    name: "Payment Reminder",
    language: "en",
    category: "payment_reminder",
    active: true,
    content: `Hello {{client_name}},

This is a friendly reminder regarding invoice #{{invoice_number}}.

Amount due: {{amount}}

Payment link:

{{payment_link}}

Thank you.`,
  },
  {
    id: "tmpl_en_discovery_remind",
    name: "Discovery Call Reminder",
    language: "en",
    category: "discovery_call_reminder",
    active: true,
    content: `Hello {{client_name}},

This is a reminder that your Strategic Discovery Call is scheduled for:

{{date}}
{{time}}

Meeting link:

{{meeting_link}}

See you soon.`,
  },
  {
    id: "tmpl_en_payment_confirm",
    name: "Payment Confirmation",
    language: "en",
    category: "payment_confirmation",
    active: true,
    content: `Hello {{client_name}},

We have received your payment for invoice #{{invoice_number}}. Thank you for your business!

Best regards,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_en_consultation_followup",
    name: "Consultation Follow-Up",
    language: "en",
    category: "consultation_follow_up",
    active: true,
    content: `Hello {{client_name}},

Thank you for taking the time to speak today regarding {{service_name}}. Action items have been updated in your portal.

Best regards,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_en_testimonial_req",
    name: "Testimonial Request",
    language: "en",
    category: "testimonial_request",
    active: true,
    content: `Hello {{client_name}},

We would love to hear your feedback on working with Invictus! If you have 2 minutes, please leave us a short review.

Thank you,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_en_project_update",
    name: "Project Update",
    language: "en",
    category: "project_update",
    active: true,
    content: `Hello {{client_name}},

Here is a quick update on {{project_name}}: we are making great progress! You can view the details in your client portal.

Best regards,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_en_custom_message",
    name: "Custom Message",
    language: "en",
    category: "custom_message",
    active: true,
    content: `Hello {{client_name}},

`,
  },
  // French Templates
  {
    id: "tmpl_fr_booking_confirm",
    name: "Confirmation de réservation",
    language: "fr",
    category: "booking_confirmation",
    active: true,
    content: `Bonjour {{client_name}},

Votre réservation pour le service « {{service_name}} » a bien été confirmée.

Date : {{date}}
Heure : {{time}}

Merci pour votre confiance.

— Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_fr_invoice_avail",
    name: "Facture disponible",
    language: "fr",
    category: "invoice_available",
    active: true,
    content: `Bonjour {{client_name}},

Votre facture n°{{invoice_number}} est désormais disponible.

Vous pouvez la consulter ici :

{{invoice_link}}

Cordialement,

Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_fr_payment_remind",
    name: "Rappel de paiement",
    language: "fr",
    category: "payment_reminder",
    active: true,
    content: `Bonjour {{client_name}},

Nous vous rappelons que la facture n°{{invoice_number}} est toujours en attente de paiement.

Montant dû :

{{amount}}

Lien de paiement :

{{payment_link}}

Merci.`,
  },
  {
    id: "tmpl_fr_discovery_remind",
    name: "Rappel de session stratégique",
    language: "fr",
    category: "discovery_call_reminder",
    active: true,
    content: `Bonjour {{client_name}},

Nous vous rappelons que votre session de découverte stratégique est prévue le :

{{date}}
{{time}}

Lien de réunion :

{{meeting_link}}

À très bientôt.`,
  },
  {
    id: "tmpl_fr_payment_confirm",
    name: "Confirmation de paiement",
    language: "fr",
    category: "payment_confirmation",
    active: true,
    content: `Bonjour {{client_name}},

Nous avons bien reçu votre paiement pour la facture n°{{invoice_number}}. Merci pour votre confiance !

Cordialement,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_fr_consultation_followup",
    name: "Suivi de consultation",
    language: "fr",
    category: "consultation_follow_up",
    active: true,
    content: `Bonjour {{client_name}},

Merci pour notre échange d'aujourd'hui concernant {{service_name}}. Les points d'action ont été mis à jour dans votre espace.

Cordialement,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_fr_testimonial_req",
    name: "Demande de témoignage",
    language: "fr",
    category: "testimonial_request",
    active: true,
    content: `Bonjour {{client_name}},

Votre avis compte beaucoup pour nous. Auriez-vous 2 minutes pour nous laisser un témoignage sur votre expérience avec Invictus ?

Merci d'avance,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_fr_project_update",
    name: "Mise à jour du projet",
    language: "fr",
    category: "project_update",
    active: true,
    content: `Bonjour {{client_name}},

Voici des nouvelles de votre projet {{project_name}} : le travail avance comme prévu. Retrouvez les détails sur votre portail.

Cordialement,
Amedee Erns Baptiste`,
  },
  {
    id: "tmpl_fr_custom_message",
    name: "Message personnalisé",
    language: "fr",
    category: "custom_message",
    active: true,
    content: `Bonjour {{client_name}},

`,
  },
];

/**
 * Saves a new WhatsApp interaction record via API endpoint.
 */
export async function saveWhatsAppInteraction(
  payload: Partial<WhatsAppInteraction>
): Promise<WhatsAppInteraction | null> {
  try {
    const res = await fetch("/api/whatsapp-interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        createdAt: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to save WhatsApp interaction:", err);
  }
  return null;
}

/**
 * Updates an existing WhatsApp interaction status (e.g. copied, opened, shared).
 */
export async function updateWhatsAppInteraction(
  id: string,
  patch: Partial<WhatsAppInteraction>
): Promise<boolean> {
  try {
    const res = await fetch(`/api/whatsapp-interactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to update WhatsApp interaction:", err);
    return false;
  }
}

/**
 * Computes summary analytics metrics from an array of interactions.
 */
export function calculateWhatsAppAnalytics(
  interactions: WhatsAppInteraction[]
): WhatsAppAnalyticsSummary {
  const totalGenerated = interactions.length;
  let copiedCount = 0;
  let openedCount = 0;
  let sharedCount = 0;
  const templateCounts: Record<string, number> = {};
  const clientCounts: Record<string, number> = {};
  let enCount = 0;
  let frCount = 0;
  const monthlyCounts: Record<string, number> = {};

  for (const item of interactions) {
    if (item.copied) copiedCount++;
    if (item.opened) openedCount++;
    if (item.shared) sharedCount++;

    if (item.templateName) {
      templateCounts[item.templateName] = (templateCounts[item.templateName] || 0) + 1;
    }

    const clientKey = item.clientName || item.clientEmail || item.clientId || "Unknown";
    clientCounts[clientKey] = (clientCounts[clientKey] || 0) + 1;

    if (item.language === "fr") {
      frCount++;
    } else {
      enCount++;
    }

    if (item.createdAt) {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    }
  }

  // Find most used template
  let mostUsedTemplate = "N/A";
  let maxTmplCount = 0;
  for (const [tmpl, count] of Object.entries(templateCounts)) {
    if (count > maxTmplCount) {
      maxTmplCount = count;
      mostUsedTemplate = tmpl;
    }
  }

  // Find most contacted client
  let mostContactedClient = "N/A";
  let maxClientCount = 0;
  for (const [cli, count] of Object.entries(clientCounts)) {
    if (count > maxClientCount) {
      maxClientCount = count;
      mostContactedClient = cli;
    }
  }

  const monthlyActivity = Object.entries(monthlyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
    totalGenerated,
    mostUsedTemplate,
    mostContactedClient,
    messagesByLanguage: { en: enCount, fr: frCount },
    copiedCount,
    openedCount,
    sharedCount,
    monthlyActivity,
  };
}
