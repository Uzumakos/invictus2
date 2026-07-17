-- ==========================================
-- INVICTUS PLATFORM V4 SCHEMAS PATCH
-- Author: Antigravity AI
-- Description: Adds missing localized columns to the projects table to support Case Studies.
-- ==========================================

-- 1. Add missing case study columns if they do not exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS problem JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS research JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS challenges JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS solutions JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lessons JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb;

-- 2. Convert description column to JSONB if it's currently a text column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' 
          AND column_name = 'description' 
          AND (data_type = 'character varying' OR data_type = 'text')
    ) THEN
        ALTER TABLE projects ALTER COLUMN description TYPE JSONB USING jsonb_build_object('en', description, 'fr', '');
    END IF;
END $$;
