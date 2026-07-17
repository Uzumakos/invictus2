-- ==========================================
-- INVICTUS PLATFORM V3 MIGRATIONS (ERP & telemetry)
-- Author: Antigravity AI
-- Description: Timeline roadmap, localized Scorecards, and consulting hours logging.
-- ==========================================

-- 1. Client Milestone Roadmap (Timeline)
CREATE TABLE IF NOT EXISTS client_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES client_billing_profiles(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'planned')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Client Digital Transformation Scorecard
-- Strictly enforces standard i18n localization structure for recommendations JSONB:
-- { "fr": ["recommandation 1"], "en": ["recommendation 1"] }
CREATE TABLE IF NOT EXISTS client_digital_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES client_billing_profiles(id) ON DELETE CASCADE,
    score_value INT CHECK (score_value BETWEEN 0 AND 100),
    category VARCHAR(100) NOT NULL,
    recommendations JSONB DEFAULT '{"en": [], "fr": []}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Telemetry Update: Consulting Hours Logger
CREATE TABLE IF NOT EXISTS consulting_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES client_billing_profiles(id) ON DELETE CASCADE,
    project_id VARCHAR(100),
    hours_logged NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
