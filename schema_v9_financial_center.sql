-- ==========================================
-- INVICTUS PLATFORM — DATABASE SCHEMA MIGRATION V9
-- Author: Antigravity AI
-- Description: Sets up the Financial Center schema, including:
--              1. Related document linking on commercial_documents (Self-reference)
--              2. Payment method, consultant, and address fields on commercial_documents
--              3. Enriching portal_payments to support full transaction records
--              4. Add check constraints if desired, keeping backward compatibility.
-- ==========================================

-- 1. Extend commercial_documents table
ALTER TABLE commercial_documents
ADD COLUMN IF NOT EXISTS related_document_id UUID REFERENCES commercial_documents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100),
ADD COLUMN IF NOT EXISTS consultant VARCHAR(255) DEFAULT 'Amedee Erns Baptiste',
ADD COLUMN IF NOT EXISTS company_information JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add index for related documents to enable fast tree-like queries
CREATE INDEX IF NOT EXISTS idx_commercial_documents_related ON commercial_documents(related_document_id);

-- 2. Extend portal_payments table (transactions)
ALTER TABLE portal_payments
ADD COLUMN IF NOT EXISTS payment_number VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES client_billing_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES commercial_documents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS receipt_id UUID REFERENCES commercial_documents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_link TEXT,
ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for transaction keys
CREATE INDEX IF NOT EXISTS idx_portal_payments_client ON portal_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_payments_invoice ON portal_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_portal_payments_receipt ON portal_payments(receipt_id);
