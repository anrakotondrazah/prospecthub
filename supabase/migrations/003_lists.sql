-- ProspectHub CRM - Lists Feature
-- HubSpot-like Lists (Static & Dynamic)

-- 1. LISTS TABLE
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'static', -- 'static' ou 'dynamic'
  filters JSONB, -- pour listes dynamiques
  member_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LIST_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS list_members (
  id SERIAL PRIMARY KEY,
  list_id INT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  lead_id INT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(list_id, lead_id)
);

-- 3. INDEXES
CREATE INDEX idx_lists_organization_id ON lists(organization_id);
CREATE INDEX idx_lists_type ON lists(type);
CREATE INDEX idx_list_members_list_id ON list_members(list_id);
CREATE INDEX idx_list_members_lead_id ON list_members(lead_id);

-- 4. ROW LEVEL SECURITY
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lists
CREATE POLICY "Users can view their organization's lists"
  ON lists FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lists in their organization"
  ON lists FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update lists in their organization"
  ON lists FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lists in their organization"
  ON lists FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for list_members
CREATE POLICY "Users can view list members in their organization"
  ON list_members FOR SELECT
  USING (
    list_id IN (
      SELECT id FROM lists WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert list members in their organization"
  ON list_members FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT id FROM lists WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete list members in their organization"
  ON list_members FOR DELETE
  USING (
    list_id IN (
      SELECT id FROM lists WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 5. FUNCTION: Update member count trigger
CREATE OR REPLACE FUNCTION update_list_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE lists SET member_count = member_count + 1, updated_at = NOW() WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE lists SET member_count = member_count - 1, updated_at = NOW() WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER: Auto-update member count
CREATE TRIGGER trigger_update_list_member_count
  AFTER INSERT OR DELETE ON list_members
  FOR EACH ROW EXECUTE FUNCTION update_list_member_count();

-- 7. FUNCTION: Update lists updated_at timestamp
CREATE OR REPLACE FUNCTION update_lists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER: Auto-update lists timestamp
CREATE TRIGGER trigger_update_lists_timestamp
  BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION update_lists_updated_at();
