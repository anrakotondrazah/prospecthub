-- Migration: Tickets System
-- Description: Tables for support tickets and comments

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open', -- open, pending, in_progress, resolved, closed
  priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, urgent
  category VARCHAR(100),
  source VARCHAR(50) DEFAULT 'manual', -- manual, email, phone, chat, web
  resolution TEXT,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TICKET COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs public responses
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tickets_organization ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_lead ON tickets(lead_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company ON tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "tickets_org" ON tickets;
DROP POLICY IF EXISTS "ticket_comments_access" ON ticket_comments;

-- Tickets: Organization-based access
CREATE POLICY "tickets_org" ON tickets FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Ticket Comments: Access based on ticket ownership
CREATE POLICY "ticket_comments_access" ON ticket_comments FOR ALL
  USING (ticket_id IN (
    SELECT id FROM tickets WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tickets_updated_at ON tickets;
CREATE TRIGGER trigger_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_tickets_updated_at();
