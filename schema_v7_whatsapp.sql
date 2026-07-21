-- ==========================================
-- INVICTUS PLATFORM V7 MIGRATIONS — WHATSAPP INTEGRATION & INTERACTION HISTORY
-- Author: Antigravity AI
-- Description: Extends clients, adds whatsapp_templates and whatsapp_interactions tables.
-- ==========================================

-- 1. Clients Table (Creates if missing, or patches with WhatsApp fields)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(100),
    whatsapp_number VARCHAR(100),
    country_code VARCHAR(10) DEFAULT 'US',
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Patch client_billing_profiles to ensure alignment with clients table
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(100);
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US';

-- 2. WhatsApp Templates Table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default English & French templates
INSERT INTO whatsapp_templates (id, name, language, category, content, active)
VALUES 
(
    'tmpl_en_booking_confirm',
    'Booking Confirmation (EN)',
    'en',
    'booking_confirmation',
    'Hello {{client_name}},

Your booking for "{{service_name}}" has been confirmed.

Date: {{date}}
Time: {{time}}

Thank you for choosing Invictus.

— Amedee Erns Baptiste',
    TRUE
),
(
    'tmpl_en_invoice_avail',
    'Invoice Available (EN)',
    'en',
    'invoice_available',
    'Hello {{client_name}},

Your invoice #{{invoice_number}} is now available.

You can review it here:

{{invoice_link}}

Best regards,

Amedee Erns Baptiste',
    TRUE
),
(
    'tmpl_en_payment_remind',
    'Payment Reminder (EN)',
    'en',
    'payment_reminder',
    'Hello {{client_name}},

This is a friendly reminder regarding invoice #{{invoice_number}}.

Amount due: {{amount}}

Payment link:

{{payment_link}}

Thank you.',
    TRUE
),
(
    'tmpl_en_discovery_remind',
    'Discovery Call Reminder (EN)',
    'en',
    'discovery_call_reminder',
    'Hello {{client_name}},

This is a reminder that your Strategic Discovery Call is scheduled for:

{{date}}
{{time}}

Meeting link:

{{meeting_link}}

See you soon.',
    TRUE
),
(
    'tmpl_fr_booking_confirm',
    'Confirmation de réservation (FR)',
    'fr',
    'booking_confirmation',
    'Bonjour {{client_name}},

Votre réservation pour le service « {{service_name}} » a bien été confirmée.

Date : {{date}}
Heure : {{time}}

Merci pour votre confiance.

— Amedee Erns Baptiste',
    TRUE
),
(
    'tmpl_fr_invoice_avail',
    'Facture disponible (FR)',
    'fr',
    'invoice_available',
    'Bonjour {{client_name}},

Votre facture n°{{invoice_number}} est désormais disponible.

Vous pouvez la consulter ici :

{{invoice_link}}

Cordialement,

Amedee Erns Baptiste',
    TRUE
),
(
    'tmpl_fr_payment_remind',
    'Rappel de paiement (FR)',
    'fr',
    'payment_reminder',
    'Bonjour {{client_name}},

Nous vous rappelons que la facture n°{{invoice_number}} est toujours en attente de paiement.

Montant dû :

{{amount}}

Lien de paiement :

{{payment_link}}

Merci.',
    TRUE
),
(
    'tmpl_fr_discovery_remind',
    'Rappel de session stratégique (FR)',
    'fr',
    'discovery_call_reminder',
    'Bonjour {{client_name}},

Nous vous rappelons que votre session de découverte stratégique est prévue le :

{{date}}
{{time}}

Lien de réunion :

{{meeting_link}}

À très bientôt.',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 3. WhatsApp Interaction History Table
CREATE TABLE IF NOT EXISTS whatsapp_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    generated_by VARCHAR(255),
    template_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    generated_message TEXT NOT NULL,
    generated_link TEXT NOT NULL,
    copied BOOLEAN DEFAULT FALSE,
    opened BOOLEAN DEFAULT FALSE,
    shared BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wa_interactions_client ON whatsapp_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_wa_interactions_created ON whatsapp_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wa_interactions_category ON whatsapp_interactions(category);
