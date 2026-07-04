-- ==========================================
-- INVICTUS PLATFORM — POSTGRESQL / SUPABASE SCHEMA
-- Author: Amedee Erns Baptiste
-- Description: Core table schemas, indexes, check constraints, and seed data.
-- ==========================================

-- Enable pgcrypto for UUID generation (if preferred over custom prefixes)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. SITE SETTINGS & CONFIGURATION ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    training_enabled BOOLEAN DEFAULT TRUE,
    profile_image_url TEXT,
    admin_path VARCHAR(255) DEFAULT '/admin',
    social_links JSONB DEFAULT '{"github": "", "linkedin": "", "twitter": ""}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial settings
INSERT INTO site_settings (training_enabled, profile_image_url, admin_path, social_links)
VALUES (
    TRUE,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    '/admin',
    '{"github": "https://github.com", "linkedin": "https://linkedin.com", "twitter": "https://twitter.com"}'::jsonb
) ON CONFLICT DO NOTHING;


-- ── 2. PAYMENT CONFIGURATIONS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mobile', 'bank', 'international')),
    enabled BOOLEAN DEFAULT TRUE,
    logo_url TEXT,
    phone_number VARCHAR(100),
    account_number VARCHAR(100),
    account_holder VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default methods
INSERT INTO payment_methods (id, name, type, enabled, logo_url, phone_number, account_number, account_holder, email)
VALUES 
('moncash', 'MonCash', 'mobile', TRUE, '', '+509 3700 0000', NULL, NULL, NULL),
('natcash', 'NatCash', 'mobile', TRUE, '', '+509 4600 0000', NULL, NULL, NULL),
('unibank', 'Unibank', 'bank', TRUE, '', NULL, '123-456-789', 'Amedee Erns Baptiste', NULL),
('sogebank', 'Sogebank', 'bank', TRUE, '', NULL, '987-654-321', 'Amedee Erns Baptiste', NULL),
('wise', 'Wise', 'international', TRUE, '', NULL, NULL, NULL, 'wise@amedee.com'),
('paypal', 'PayPal', 'international', FALSE, '', NULL, NULL, NULL, 'paypal@amedee.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;


-- ── 3. CONSULTATION BOOKINGS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(100) PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    goals TEXT,
    context TEXT,
    package_type VARCHAR(100) NOT NULL,
    service_id VARCHAR(100) NOT NULL,
    service_title JSONB NOT NULL, -- {"en": "...", "fr": "..."}
    date DATE NOT NULL,
    time VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    language VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'awaiting_payment')),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),
    questionnaire JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);


-- ── 4. CRM LEADS & PIPELINE ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(100) PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    budget VARCHAR(100),
    notes TEXT,
    source VARCHAR(100) DEFAULT 'Contact Form',
    status VARCHAR(50) DEFAULT 'lead' CHECK (status IN ('lead', 'discovery', 'proposal', 'negotiation', 'won', 'lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);


-- ── 5. CLIENT PORTAL TASKS (CHECKLIST) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_tasks (
    id VARCHAR(100) PRIMARY KEY,
    client_email VARCHAR(255) NOT NULL,
    title JSONB NOT NULL, -- {"en": "...", "fr": "..."}
    description JSONB,   -- {"en": "...", "fr": "..."}
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    assigned_to VARCHAR(50) NOT NULL CHECK (assigned_to IN ('client', 'amedee')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_email ON portal_tasks(client_email);


-- ── 6. CLIENT PORTAL DOCUMENTS VAULT ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_documents (
    id VARCHAR(100) PRIMARY KEY,
    client_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_email ON portal_documents(client_email);


-- ── 7. CLIENT PORTAL SECURE MESSAGES ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_messages (
    id VARCHAR(100) PRIMARY KEY,
    client_email VARCHAR(255) NOT NULL,
    sender VARCHAR(50) NOT NULL CHECK (sender IN ('client', 'amedee')),
    text TEXT NOT NULL,
    attachment JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_email ON portal_messages(client_email);


-- ── 8. CLIENT PORTAL ACTIVE PROJECTS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_projects (
    id VARCHAR(100) PRIMARY KEY,
    client_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    start_date DATE,
    target_launch DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_email ON portal_projects(client_email);


-- ── 9. CLIENT PORTAL PAYMENTS LEDGER ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_payments (
    id VARCHAR(100) PRIMARY KEY,
    client_email VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    service VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    invoice_url TEXT,
    payment_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_email ON portal_payments(client_email);


-- ── 10. CLIENT PORTAL NOTIFICATIONS / ALERTS ──────────────────────────────

CREATE TABLE IF NOT EXISTS portal_notifications (
    id VARCHAR(100) PRIMARY KEY,
    client_email VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'alert' CHECK (type IN ('meeting', 'document', 'payment', 'task', 'alert')),
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_email ON portal_notifications(client_email);


-- ── 11. SMART PROJECT DISCOVERIES ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discoveries (
    id VARCHAR(100) PRIMARY KEY,
    answers JSONB NOT NULL,
    summary JSONB NOT NULL,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ── 12. RECOMMENDATION RULES ENGINE ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS recommendation_rules (
    id VARCHAR(100) PRIMARY KEY,
    conditions JSONB NOT NULL,
    condition_operator VARCHAR(10) DEFAULT 'AND' CHECK (condition_operator IN ('AND', 'OR')),
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default recommendation rules (from db.json seeds)
INSERT INTO recommendation_rules (id, conditions, condition_operator, actions, priority, enabled)
VALUES 
(
  'rule_saas_scale',
  '[{"field": "projectTypes", "operator": "includes", "value": "SaaS"}, {"field": "expectedUsers", "operator": "equals", "value": "50,000+"}]'::jsonb,
  'AND',
  '[{"type": "recommend_service", "value": "Software Architecture & System Design"}, {"type": "recommend_feature", "value": "Distributed Database Sharding Schema"}, {"type": "set_complexity", "value": "Critical"}, {"type": "add_note", "value": "High load SaaS environment requires Redis cache cluster."}]'::jsonb,
  10,
  TRUE
),
(
  'rule_government',
  '[{"field": "orgType", "operator": "equals", "value": "Government"}]'::jsonb,
  'AND',
  '[{"type": "recommend_service", "value": "Technical Audit & Security Assessment"}, {"type": "recommend_feature", "value": "RBAC Audit Logs & Policy Design"}, {"type": "set_complexity", "value": "High"}, {"type": "add_note", "value": "Government portal requires strict GDPR/HIPAA container structures."}]'::jsonb,
  8,
  TRUE
)
ON CONFLICT (id) DO NOTHING;
