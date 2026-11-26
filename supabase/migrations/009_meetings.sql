-- ProspectHub CRM - Meetings Feature
-- Meeting scheduling and management

-- 1. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Meeting details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_type VARCHAR(50) DEFAULT 'call', -- 'call', 'video', 'in_person', 'demo', 'discovery', 'closing'

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time)) / 60) STORED,
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  all_day BOOLEAN DEFAULT false,

  -- Location/Link
  location VARCHAR(500), -- physical address or meeting link
  video_link VARCHAR(500), -- Zoom, Meet, Teams link
  dial_in_number VARCHAR(50),
  dial_in_pin VARCHAR(20),

  -- Organizer
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Associations
  associated_lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  associated_company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  associated_deal_id INT REFERENCES deals(id) ON DELETE SET NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  outcome VARCHAR(50), -- 'successful', 'follow_up_needed', 'rescheduled', 'cancelled', 'no_response'
  outcome_notes TEXT,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule VARCHAR(255), -- iCal RRULE format
  parent_meeting_id INT REFERENCES meetings(id) ON DELETE SET NULL,

  -- Reminders
  reminder_before_minutes INT DEFAULT 15, -- 15 min default reminder
  reminder_sent BOOLEAN DEFAULT false,

  -- External sync
  external_id VARCHAR(255), -- Google Calendar, Outlook ID
  external_source VARCHAR(50), -- 'google', 'outlook', 'calendly'
  sync_enabled BOOLEAN DEFAULT true,

  -- Metadata
  color VARCHAR(7) DEFAULT '#0066FF',
  tags JSONB,
  custom_fields JSONB,
  notes TEXT,

  -- Timestamps
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 2. MEETING_ATTENDEES TABLE
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id SERIAL PRIMARY KEY,
  meeting_id INT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,

  -- Internal attendee (profile)
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- External attendee (contact)
  lead_id INT REFERENCES leads(id) ON DELETE CASCADE,

  -- Direct contact info (for external attendees without lead record)
  email VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),

  -- Response
  response_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'tentative'
  response_time TIMESTAMPTZ,
  response_note TEXT,

  -- Role
  is_organizer BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either user_id OR lead_id OR email must be set
  CONSTRAINT attendee_identity CHECK (
    user_id IS NOT NULL OR lead_id IS NOT NULL OR email IS NOT NULL
  ),
  -- Prevent duplicate attendees
  UNIQUE(meeting_id, user_id),
  UNIQUE(meeting_id, lead_id),
  UNIQUE(meeting_id, email)
);

-- 3. MEETING_NOTES TABLE (for collaborative notes during meeting)
CREATE TABLE IF NOT EXISTS meeting_notes (
  id SERIAL PRIMARY KEY,
  meeting_id INT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type VARCHAR(20) DEFAULT 'general', -- 'general', 'action_item', 'decision', 'question'
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX idx_meetings_organization_id ON meetings(organization_id);
CREATE INDEX idx_meetings_organizer_id ON meetings(organizer_id);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);
CREATE INDEX idx_meetings_end_time ON meetings(end_time);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_associated_lead ON meetings(associated_lead_id);
CREATE INDEX idx_meetings_associated_company ON meetings(associated_company_id);
CREATE INDEX idx_meetings_associated_deal ON meetings(associated_deal_id);
CREATE INDEX idx_meetings_external_id ON meetings(external_id);
CREATE INDEX idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_user_id ON meeting_attendees(user_id);
CREATE INDEX idx_meeting_attendees_lead_id ON meeting_attendees(lead_id);
CREATE INDEX idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);

-- 5. ROW LEVEL SECURITY
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
CREATE POLICY "Users can view their organization's meetings"
  ON meetings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meetings in their organization"
  ON meetings FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update meetings in their organization"
  ON meetings FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete meetings in their organization"
  ON meetings FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for meeting_attendees
CREATE POLICY "Users can view meeting attendees in their organization"
  ON meeting_attendees FOR SELECT
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert meeting attendees in their organization"
  ON meeting_attendees FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update meeting attendees in their organization"
  ON meeting_attendees FOR UPDATE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete meeting attendees in their organization"
  ON meeting_attendees FOR DELETE
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for meeting_notes
CREATE POLICY "Users can view meeting notes (non-private or own)"
  ON meeting_notes FOR SELECT
  USING (
    (is_private = false OR user_id = auth.uid()) AND
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert meeting notes"
  ON meeting_notes FOR INSERT
  WITH CHECK (
    meeting_id IN (
      SELECT id FROM meetings WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own meeting notes"
  ON meeting_notes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own meeting notes"
  ON meeting_notes FOR DELETE
  USING (user_id = auth.uid());

-- 6. FUNCTION: Update meetings updated_at timestamp
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER: Auto-update meetings timestamp
CREATE TRIGGER trigger_update_meetings_timestamp
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_meetings_updated_at();

-- 8. FUNCTION: Create activity when meeting is completed
CREATE OR REPLACE FUNCTION create_meeting_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO activities (
      organization_id,
      user_id,
      activity_type,
      subject,
      body,
      outcome,
      duration_minutes,
      activity_date,
      associated_lead_id,
      associated_company_id,
      associated_deal_id
    ) VALUES (
      NEW.organization_id,
      NEW.organizer_id,
      'meeting',
      NEW.title,
      NEW.description,
      NEW.outcome,
      NEW.duration_minutes,
      NEW.start_time,
      NEW.associated_lead_id,
      NEW.associated_company_id,
      NEW.associated_deal_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER: Auto-create activity on meeting completion
CREATE TRIGGER trigger_meeting_to_activity
  AFTER UPDATE ON meetings
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed'))
  EXECUTE FUNCTION create_meeting_activity();
