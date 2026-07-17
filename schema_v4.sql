-- ==========================================
-- INVICTUS PLATFORM V4 MIGRATIONS (testimonials, brand, SEO)
-- Author: Antigravity AI
-- Description: Dynamic database tables for Testimonials, Brand Assets, and SEO Center.
-- ==========================================

-- 1. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    photo_url TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    content JSONB NOT NULL DEFAULT '{"en": "", "fr": ""}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Brand Assets Config Table (Single-row configuration)
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_light_url TEXT,
    logo_dark_url TEXT,
    favicon_url TEXT,
    brand_primary VARCHAR(50) DEFAULT '#FF7A00',
    brand_secondary VARCHAR(50) DEFAULT '#121A1B',
    typography JSONB DEFAULT '{"headingsFont": "Outfit", "bodyFont": "Inter"}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial configuration row
INSERT INTO brand_assets (logo_light_url, logo_dark_url, favicon_url, brand_primary, brand_secondary)
VALUES ('', '', '', '#FF7A00', '#121A1B')
ON CONFLICT DO NOTHING;

-- 3. Dynamic Page SEO Metadata Table
CREATE TABLE IF NOT EXISTS seo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path VARCHAR(255) UNIQUE NOT NULL,
    meta_title JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb,
    meta_description JSONB DEFAULT '{"en": "", "fr": ""}'::jsonb,
    keywords TEXT,
    og_image_url TEXT,
    robots_index VARCHAR(50) DEFAULT 'index, follow',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
