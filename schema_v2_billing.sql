-- ==========================================
-- INVICTUS PLATFORM V2 — CLIENT BILLING PROFILES
-- Author: Antigravity AI
-- Description: Client CRM & billing identity table.
--   This table MUST be created before schema_v3.sql because:
--   - client_milestones, client_digital_scores, consulting_hours
--     all have FOREIGN KEY → client_billing_profiles(id)
--   - schema_v5_security_patch.sql ALTERs this table (adds approval columns)
--   - The portal auth system, commercial documents, and PDF export all
--     query this table for client identity & billing info.
-- ==========================================

CREATE TABLE IF NOT EXISTS client_billing_profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity & Contact
    email       VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255),

    -- Billing Preferences
    currency    VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100) DEFAULT 'Net 30',

    -- Portal Access Control (also patched in schema_v5_security_patch.sql via IF NOT EXISTS)
    is_approved  BOOLEAN DEFAULT FALSE,
    approved_by  VARCHAR(100),
    approval_reason VARCHAR(255),

    -- Timestamps
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_billing_profiles_email
    ON client_billing_profiles(email);

CREATE INDEX IF NOT EXISTS idx_client_billing_profiles_approval
    ON client_billing_profiles(email, is_approved);
