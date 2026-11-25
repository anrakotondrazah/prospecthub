-- ProspectHub CRM - Supabase Schema
-- Multi-tenant SaaS with HubSpot-like RBAC

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0.00,
  price_yearly DECIMAL(10,2) DEFAULT 0.00,
  max_users INT DEFAULT 1,
  max_leads INT DEFAULT 100,
  max_companies INT DEFAULT 50,
  max_deals INT DEFAULT 10,
  max_emails_month INT DEFAULT 100,
  has_api_access BOOLEAN DEFAULT false,
  has_automation BOOLEAN DEFAULT false,
  has_reporting BOOLEAN DEFAULT false,
  has_enrichment BOOLEAN DEFAULT false,
  has_sequences BOOLEAN DEFAULT false,
  has_custom_fields BOOLEAN DEFAULT false,
  has_integrations BOOLEAN DEFAULT false,
  has_support_priority BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZATIONS (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  domain VARCHAR(255),
  logo_url VARCHAR(500),
  website VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(20) DEFAULT '1-10',
  country VARCHAR(2) DEFAULT 'FR',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  locale VARCHAR(10) DEFAULT 'fr_FR',
  currency VARCHAR(3) DEFAULT 'EUR',
  billing_email VARCHAR(255),
  billing_address TEXT,
  vat_number VARCHAR(50),
  settings JSONB,
  onboarding_completed BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id INT NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'trialing',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROLES
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  hierarchy_level INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 5. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  requires_plan VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROLE_PERMISSIONS
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- 7. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id INT REFERENCES organizations(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  job_title VARCHAR(150),
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  locale VARCHAR(10) DEFAULT 'fr_FR',
  two_factor_enabled BOOLEAN DEFAULT false,
  is_owner BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 9. SHARED_COMPANIES (Base entreprises France)
CREATE TABLE IF NOT EXISTS shared_companies (
  id SERIAL PRIMARY KEY,
  siret VARCHAR(14) NOT NULL UNIQUE,
  siren VARCHAR(9) NOT NULL,
  nic VARCHAR(5) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  legal_form VARCHAR(100),
  naf_code VARCHAR(10),
  naf_label VARCHAR(255),
  address_street VARCHAR(255),
  address_postal_code VARCHAR(10),
  address_city VARCHAR(100),
  address_country VARCHAR(2) DEFAULT 'FR',
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  creation_date DATE,
  employees_range VARCHAR(50),
  employees_count INT,
  capital DECIMAL(15,2),
  revenue_range VARCHAR(50),
  revenue DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  is_rge BOOLEAN DEFAULT false,
  rge_domains JSONB,
  enriched_at TIMESTAMPTZ,
  enrichment_source VARCHAR(50),
  enrichment_data JSONB,
  quality_score SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LEADS
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shared_company_id INT REFERENCES shared_companies(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  job_title VARCHAR(150),
  company_name VARCHAR(255),
  company_siret VARCHAR(14),
  company_website VARCHAR(255),
  company_industry VARCHAR(100),
  company_size VARCHAR(50),
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_postal_code VARCHAR(10),
  address_country VARCHAR(2) DEFAULT 'FR',
  source VARCHAR(100),
  source_detail VARCHAR(255),
  status VARCHAR(20) DEFAULT 'new',
  score SMALLINT DEFAULT 0,
  score_factors JSONB,
  is_hot BOOLEAN DEFAULT false,
  estimated_value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  last_contacted_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_to_deal_id INT,
  tags JSONB,
  custom_fields JSONB,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 11. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shared_company_id INT REFERENCES shared_companies(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  siret VARCHAR(14),
  industry VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_postal_code VARCHAR(10),
  address_country VARCHAR(2) DEFAULT 'FR',
  employees_count INT,
  revenue DECIMAL(15,2),
  type VARCHAR(20) DEFAULT 'prospect',
  lifecycle_stage VARCHAR(50),
  parent_company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  tags JSONB,
  custom_fields JSONB,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 12. PIPELINE_STAGES
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  probability SMALLINT DEFAULT 0,
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 13. DEALS
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_id INT NOT NULL REFERENCES pipeline_stages(id),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  value DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  probability SMALLINT DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  closed_won BOOLEAN,
  close_reason VARCHAR(255),
  priority VARCHAR(10) DEFAULT 'medium',
  deal_type VARCHAR(50),
  source VARCHAR(100),
  tags JSONB,
  custom_fields JSONB,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 14. ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(20) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  outcome VARCHAR(100),
  duration_minutes INT,
  activity_date TIMESTAMPTZ DEFAULT NOW(),
  associated_lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
  associated_company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  associated_deal_id INT REFERENCES deals(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 15. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(20) DEFAULT 'todo',
  priority VARCHAR(10) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  associated_lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
  associated_company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  associated_deal_id INT REFERENCES deals(id) ON DELETE CASCADE,
  reminder_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 16. TAGS
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  entity_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 17. ACTIVITY_LOGS (Audit)
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for organization-scoped tables
CREATE POLICY "Users can view their organization's leads"
  ON leads FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert leads in their organization"
  ON leads FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads in their organization"
  ON leads FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Similar policies for companies
CREATE POLICY "Users can view their organization's companies"
  ON companies FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert companies in their organization"
  ON companies FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update companies in their organization"
  ON companies FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Similar policies for deals
CREATE POLICY "Users can view their organization's deals"
  ON deals FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert deals in their organization"
  ON deals FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update deals in their organization"
  ON deals FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Seed default subscription plans
INSERT INTO subscription_plans (code, name, description, price_monthly, price_yearly, max_users, max_leads, max_companies, max_deals, max_emails_month, has_api_access, has_automation, has_reporting, has_enrichment, has_sequences, has_custom_fields, has_integrations, has_support_priority, display_order) VALUES
('free', 'Free', 'Decouvrez ProspectHub gratuitement', 0, 0, 2, 100, 50, 10, 100, false, false, false, false, false, false, false, false, 1),
('starter', 'Starter', 'Pour les petites equipes', 29.00, 290.00, 5, 1000, 500, 100, 1000, false, false, true, true, false, true, false, false, 2),
('pro', 'Pro', 'Pour les equipes en croissance', 79.00, 790.00, 15, 10000, 5000, 1000, 10000, true, true, true, true, true, true, true, false, 3),
('enterprise', 'Enterprise', 'Pour les grandes organisations', 199.00, 1990.00, 0, 0, 0, 0, 0, true, true, true, true, true, true, true, true, 4);

-- Seed default roles
INSERT INTO roles (organization_id, code, name, description, is_system, is_default, hierarchy_level) VALUES
(NULL, 'super_admin', 'Super Admin', 'Acces complet a toutes les fonctionnalites', true, false, 100),
(NULL, 'admin', 'Admin', 'Administration de lorganisation', true, false, 90),
(NULL, 'manager', 'Manager', 'Gestion des equipes et des donnees', true, false, 70),
(NULL, 'sales_rep', 'Commercial', 'Acces aux leads et deals', true, true, 50),
(NULL, 'marketing', 'Marketing', 'Acces aux campagnes et analytics', true, false, 50),
(NULL, 'viewer', 'Lecteur', 'Acces en lecture seule', true, false, 10);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
