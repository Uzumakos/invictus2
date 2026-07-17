-- ==========================================
-- INVICTUS PLATFORM V5 SECURITY SCHEMAS PATCH
-- Author: Antigravity AI
-- Description: Adds client portal access control fields (is_approved, approved_by, approval_reason) to client_billing_profiles.
-- ==========================================

-- 1. Add approval columns to client_billing_profiles if they do not exist
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
ALTER TABLE client_billing_profiles ADD COLUMN IF NOT EXISTS approval_reason VARCHAR(255);

-- 2. Add an index for quick lookup
CREATE INDEX IF NOT EXISTS idx_client_billing_profiles_approval ON client_billing_profiles(email, is_approved);
