-- ==========================================
-- INVICTUS PLATFORM V6 — ERP & BUSINESS PROFILE SCHEMAS
-- Author: Antigravity AI
-- Description: Creates business_profile, commercial_documents, commercial_document_items tables,
--              and patches client_billing_profiles with missing CRM & billing address columns.
-- ==========================================

-- 1. Business Profile (Company identity, bank information, branding for invoices)
CREATE TABLE IF NOT EXISTS business_profile (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'biz_default',

    -- Basic Information
    business_name VARCHAR(255),
    legal_name VARCHAR(255),
    address TEXT,
    country VARCHAR(100) DEFAULT 'Haiti',
    phone VARCHAR(100),
    email VARCHAR(255),
    website VARCHAR(255),

    -- Tax & Registration
    tax_number VARCHAR(100),
    registration_number VARCHAR(100),

    -- Financial & Branding (JSONB & Media)
    bank_information JSONB DEFAULT '{}'::jsonb,
    logo_url TEXT,
    signature_url TEXT,
    stamp_url TEXT,
    invoice_footer TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Client Billing Profiles Patch (Add missing CRM, address, and preference columns)
CREATE TABLE IF NOT EXISTS client_billing_profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    currency    VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    is_approved  BOOLEAN DEFAULT FALSE,
    approved_by  VARCHAR(100),
    approval_reason VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Haiti';
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS primary_contact_name VARCHAR(255);
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(100);
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS tax_number VARCHAR(100);
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'fr';
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS default_discount NUMERIC DEFAULT 0;
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS approval_reason VARCHAR(255);

-- 3. Commercial Documents (Invoices, Quotes, Proposals, Proformas)
CREATE TABLE IF NOT EXISTS commercial_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL, -- 'invoice', 'quote', 'proposal', 'proforma'
    document_number VARCHAR(100) NOT NULL,
    client_id UUID REFERENCES client_billing_profiles(id) ON DELETE SET NULL,
    project_id VARCHAR(100),
    consultation_id VARCHAR(100),
    issue_date VARCHAR(50),
    due_date VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'fr',
    template_style VARCHAR(50) DEFAULT 'modern',
    status VARCHAR(50) DEFAULT 'draft',
    payment_link TEXT,
    transaction_reference VARCHAR(255),
    discount_total NUMERIC DEFAULT 0,
    tax_total NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Commercial Document Line Items
CREATE TABLE IF NOT EXISTS commercial_document_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES commercial_documents(id) ON DELETE CASCADE,
    description JSONB NOT NULL,
    quantity NUMERIC DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    discount_percentage NUMERIC DEFAULT 0,
    tax_percentage NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_billing_profiles_email ON client_billing_profiles(email);
CREATE INDEX IF NOT EXISTS idx_commercial_documents_client ON commercial_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_commercial_documents_type ON commercial_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_commercial_document_items_doc ON commercial_document_items(document_id);

-- 5. Consulting Services Table & Schema Patch
CREATE TABLE IF NOT EXISTS consulting_services (
    id VARCHAR(100) PRIMARY KEY,
    title JSONB NOT NULL,
    description JSONB NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration INTEGER DEFAULT 60,
    features JSONB DEFAULT '{}'::jsonb,
    category VARCHAR(100) DEFAULT 'engineering',
    status VARCHAR(50) DEFAULT 'published',
    tiers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE consulting_services ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';
ALTER TABLE consulting_services ADD COLUMN IF NOT EXISTS tiers JSONB DEFAULT '[]'::jsonb;
