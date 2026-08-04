-- =========================================================================
-- INVICTUS PLATFORM — DATABASE SCHEMA MIGRATION V10
-- Author: Antigravity AI
-- Description: Sets up the Business Intelligence & Financial Planning Hub schema, including:
--              1. Revenues (Income tracking with category details)
--              2. Expenses (Cost tracking with categories and frequencies)
--              3. Subscriptions (Recurring SaaS tools and billing status)
--              4. Budgets (Monthly budget limits per expense category)
--              5. Funding Goals (Asset planning and funding strategies)
--              6. Funding Contributions (Contribution history log)
--              7. Asset Registry (Track owned assets, warranty, depreciation)
-- =========================================================================

-- 1. revenues table
CREATE TABLE IF NOT EXISTS revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES client_billing_profiles(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    project_id UUID REFERENCES portal_projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- Software Development, AI Consulting, Digital Transformation, Discovery Calls, Training, Speaking, Digital Products, Affiliate, Maintenance Contracts, Other
    invoice_id UUID REFERENCES commercial_documents(id) ON DELETE SET NULL,
    receipt_id UUID REFERENCES commercial_documents(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(100),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'paid', -- paid, pending
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_revenues_client ON revenues(client_id);
CREATE INDEX IF NOT EXISTS idx_revenues_date ON revenues(date);

-- 2. expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Software, AI Tools, Cloud Services, Hosting, Domains, Marketing, Advertising, Travel, Education, Office, Equipment, Legal, Accounting, Taxes, Bank Fees, Miscellaneous
    vendor VARCHAR(255),
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    recurring BOOLEAN DEFAULT FALSE,
    frequency VARCHAR(50), -- monthly, yearly, etc.
    payment_method VARCHAR(100),
    invoice_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 3. subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    vendor VARCHAR(255),
    monthly_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    yearly_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    renewal_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    website TEXT,
    payment_method VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active', -- active, paused, cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, -- Marketing, AI, Cloud, Travel, Office, Software, Equipment, Training
    allocated_budget NUMERIC(15, 2) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL, -- 1 to 12
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, year, month)
);

-- 5. funding_goals table
CREATE TABLE IF NOT EXISTS funding_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    vendor VARCHAR(255),
    purchase_url TEXT,
    media_url TEXT,
    target_cost NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    current_savings NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    desired_purchase_date DATE,
    priority VARCHAR(50) DEFAULT 'Medium', -- High, Medium, Low
    status VARCHAR(50) DEFAULT 'Planned', -- Planned, Saving, Ready to Purchase, Purchased, Paused, Cancelled
    funding_strategy VARCHAR(100) NOT NULL, -- percentage_revenue, fixed_revenue, monthly_fixed, manual, one_time
    strategy_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. funding_contributions table
CREATE TABLE IF NOT EXISTS funding_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES funding_goals(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(255) NOT NULL,
    revenue_id UUID REFERENCES revenues(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contributions_goal ON funding_contributions(goal_id);

-- 7. asset_registry table
CREATE TABLE IF NOT EXISTS asset_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purchase_cost NUMERIC(15, 2) NOT NULL,
    vendor VARCHAR(255),
    invoice_reference VARCHAR(255),
    warranty_expiration DATE,
    serial_number VARCHAR(100),
    condition VARCHAR(50) DEFAULT 'New', -- New, Good, Fair, Poor
    assigned_user VARCHAR(255),
    maintenance_schedule TEXT,
    depreciation_period INTEGER, -- in months
    replacement_estimate NUMERIC(15, 2),
    status VARCHAR(50) DEFAULT 'Active', -- Active, Maintenance, Retired, Disposed
    media_url TEXT,
    notes TEXT,
    goal_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
