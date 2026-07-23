-- ==========================================
-- INVICTUS PLATFORM — DATABASE SCHEMA MIGRATION V8
-- Author: Amedee Erns Baptiste
-- Description: Adds lead scoring, CRM tracking, and project proposal fields to the leads table.
-- Run this in the Supabase SQL Editor.
-- ==========================================

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority VARCHAR(100) DEFAULT 'Low Priority',
ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(12, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS probability_of_closing INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS acquisition_source VARCHAR(100) DEFAULT 'Contact Form',
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_action VARCHAR(255) DEFAULT 'Review lead',
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assigned_consultant VARCHAR(255) DEFAULT 'Amedee Erns Baptiste',
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS country VARCHAR(255),
ADD COLUMN IF NOT EXISTS timeline VARCHAR(100),
ADD COLUMN IF NOT EXISTS project_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS expected_deliverables TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50),
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS company_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS previous_relationship VARCHAR(100),
ADD COLUMN IF NOT EXISTS reason VARCHAR(255);

-- Create index on lead_score to help priority queries
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
