-- Migration 013: Sequences module
-- Automated email sequences for prospection

-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main sequences table
CREATE TABLE IF NOT EXISTS sequences (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, archived
  trigger_type VARCHAR(50) DEFAULT 'manual', -- manual, lead_created, deal_stage_changed
  settings JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{"sent": 0, "opened": 0, "replied": 0, "bounced": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence steps (emails, delays, tasks)
CREATE TABLE IF NOT EXISTS sequence_steps (
  id SERIAL PRIMARY KEY,
  sequence_id INT NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_type VARCHAR(20) NOT NULL, -- email, task, delay
  delay_days INT DEFAULT 0,
  delay_hours INT DEFAULT 0,
  template_id INT REFERENCES message_templates(id) ON DELETE SET NULL,
  subject VARCHAR(255),
  body TEXT,
  task_title VARCHAR(255),
  task_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, step_order)
);

-- Enrollments (leads in sequences)
CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id SERIAL PRIMARY KEY,
  sequence_id INT NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, paused, unenrolled, bounced
  current_step INT DEFAULT 1,
  next_step_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  unenrolled_at TIMESTAMPTZ,
  unenroll_reason TEXT,
  UNIQUE(sequence_id, lead_id)
);

-- Execution log for tracking sent emails
CREATE TABLE IF NOT EXISTS sequence_execution_log (
  id SERIAL PRIMARY KEY,
  enrollment_id INT NOT NULL REFERENCES sequence_enrollments(id) ON DELETE CASCADE,
  step_id INT NOT NULL REFERENCES sequence_steps(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent', -- sent, opened, clicked, replied, bounced, failed
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sequences_org ON sequences(organization_id);
CREATE INDEX IF NOT EXISTS idx_sequences_status ON sequences(status);
CREATE INDEX IF NOT EXISTS idx_sequence_steps_seq ON sequence_steps(sequence_id, step_order);
CREATE INDEX IF NOT EXISTS idx_enrollments_seq ON sequence_enrollments(sequence_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_lead ON sequence_enrollments(lead_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON sequence_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_next_step ON sequence_enrollments(next_step_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_execution_log_enrollment ON sequence_execution_log(enrollment_id);

-- Enable Row Level Security
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_execution_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sequences
CREATE POLICY "sequences_select" ON sequences FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "sequences_insert" ON sequences FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "sequences_update" ON sequences FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "sequences_delete" ON sequences FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for sequence_steps
CREATE POLICY "sequence_steps_select" ON sequence_steps FOR SELECT
  USING (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "sequence_steps_insert" ON sequence_steps FOR INSERT
  WITH CHECK (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "sequence_steps_update" ON sequence_steps FOR UPDATE
  USING (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "sequence_steps_delete" ON sequence_steps FOR DELETE
  USING (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

-- RLS Policies for sequence_enrollments
CREATE POLICY "sequence_enrollments_select" ON sequence_enrollments FOR SELECT
  USING (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "sequence_enrollments_insert" ON sequence_enrollments FOR INSERT
  WITH CHECK (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "sequence_enrollments_update" ON sequence_enrollments FOR UPDATE
  USING (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "sequence_enrollments_delete" ON sequence_enrollments FOR DELETE
  USING (sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())));

-- RLS Policies for sequence_execution_log
CREATE POLICY "sequence_execution_log_select" ON sequence_execution_log FOR SELECT
  USING (enrollment_id IN (SELECT id FROM sequence_enrollments WHERE sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))));

CREATE POLICY "sequence_execution_log_insert" ON sequence_execution_log FOR INSERT
  WITH CHECK (enrollment_id IN (SELECT id FROM sequence_enrollments WHERE sequence_id IN (SELECT id FROM sequences WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))));

-- Trigger to update updated_at on sequences
CREATE OR REPLACE FUNCTION update_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sequences_updated_at ON sequences;
CREATE TRIGGER trigger_sequences_updated_at
  BEFORE UPDATE ON sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_sequences_updated_at();

-- Function to update sequence stats
CREATE OR REPLACE FUNCTION update_sequence_stats()
RETURNS TRIGGER AS $$
DECLARE
  seq_id INT;
  sent_count INT;
  opened_count INT;
  replied_count INT;
  bounced_count INT;
BEGIN
  -- Get sequence_id from enrollment
  SELECT sequence_id INTO seq_id
  FROM sequence_enrollments
  WHERE id = NEW.enrollment_id;

  -- Calculate stats
  SELECT
    COUNT(*) FILTER (WHERE status = 'sent'),
    COUNT(*) FILTER (WHERE status = 'opened'),
    COUNT(*) FILTER (WHERE status = 'replied'),
    COUNT(*) FILTER (WHERE status = 'bounced')
  INTO sent_count, opened_count, replied_count, bounced_count
  FROM sequence_execution_log
  WHERE enrollment_id IN (SELECT id FROM sequence_enrollments WHERE sequence_id = seq_id);

  -- Update sequence stats
  UPDATE sequences
  SET stats = jsonb_build_object(
    'sent', sent_count,
    'opened', opened_count,
    'replied', replied_count,
    'bounced', bounced_count
  )
  WHERE id = seq_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sequence_stats ON sequence_execution_log;
CREATE TRIGGER trigger_update_sequence_stats
  AFTER INSERT OR UPDATE ON sequence_execution_log
  FOR EACH ROW
  EXECUTE FUNCTION update_sequence_stats();
