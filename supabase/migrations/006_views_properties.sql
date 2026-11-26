-- ProspectHub CRM - Views & Custom Properties
-- Sprint 3 Module C: Creating a view, Creating a property

-- 1. SAVED VIEWS TABLE
CREATE TABLE IF NOT EXISTS saved_views (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'leads', 'companies', 'deals', 'contacts'
  name VARCHAR(255) NOT NULL,
  filters JSONB DEFAULT '{}',
  columns JSONB DEFAULT '[]', -- selected columns to display
  sort_by VARCHAR(100),
  sort_order VARCHAR(4) DEFAULT 'asc',
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE, -- shared with team
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOM PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS custom_properties (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'leads', 'companies', 'deals', 'contacts'
  field_name VARCHAR(100) NOT NULL, -- snake_case internal name
  field_label VARCHAR(255) NOT NULL, -- display label
  field_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'date', 'select', 'multiselect', 'checkbox', 'url', 'email', 'phone'
  options JSONB, -- for select/multiselect: [{"value": "opt1", "label": "Option 1"}, ...]
  default_value TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, entity_type, field_name)
);

-- 3. CUSTOM PROPERTY VALUES TABLE (for storing actual values)
CREATE TABLE IF NOT EXISTS custom_property_values (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES custom_properties(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL, -- ID of lead, company, deal, etc.
  value_text TEXT,
  value_number NUMERIC,
  value_date TIMESTAMPTZ,
  value_boolean BOOLEAN,
  value_json JSONB, -- for multiselect
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, entity_type, entity_id)
);

-- 4. INDEXES
CREATE INDEX idx_saved_views_organization_id ON saved_views(organization_id);
CREATE INDEX idx_saved_views_entity_type ON saved_views(entity_type);
CREATE INDEX idx_saved_views_user_id ON saved_views(user_id);
CREATE INDEX idx_saved_views_is_shared ON saved_views(is_shared);

CREATE INDEX idx_custom_properties_organization_id ON custom_properties(organization_id);
CREATE INDEX idx_custom_properties_entity_type ON custom_properties(entity_type);
CREATE INDEX idx_custom_properties_display_order ON custom_properties(display_order);

CREATE INDEX idx_custom_property_values_property_id ON custom_property_values(property_id);
CREATE INDEX idx_custom_property_values_entity ON custom_property_values(entity_type, entity_id);

-- 5. ROW LEVEL SECURITY
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_property_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_views
CREATE POLICY "Users can view their own and shared views"
  ON saved_views FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND (user_id = auth.uid() OR is_shared = TRUE)
  );

CREATE POLICY "Users can insert views in their organization"
  ON saved_views FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own views"
  ON saved_views FOR UPDATE
  USING (
    user_id = auth.uid() OR (
      is_shared = TRUE AND organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own views"
  ON saved_views FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for custom_properties
CREATE POLICY "Users can view their organization's properties"
  ON custom_properties FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert properties in their organization"
  ON custom_properties FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update properties in their organization"
  ON custom_properties FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete properties in their organization"
  ON custom_properties FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for custom_property_values
CREATE POLICY "Users can view property values in their organization"
  ON custom_property_values FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM custom_properties WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert property values in their organization"
  ON custom_property_values FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM custom_properties WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update property values in their organization"
  ON custom_property_values FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM custom_properties WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete property values in their organization"
  ON custom_property_values FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM custom_properties WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 6. FUNCTION: Update saved_views updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER: Auto-update saved_views timestamp
CREATE TRIGGER trigger_update_saved_views_timestamp
  BEFORE UPDATE ON saved_views
  FOR EACH ROW EXECUTE FUNCTION update_saved_views_updated_at();

-- 8. FUNCTION: Update custom_properties updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER: Auto-update custom_properties timestamp
CREATE TRIGGER trigger_update_custom_properties_timestamp
  BEFORE UPDATE ON custom_properties
  FOR EACH ROW EXECUTE FUNCTION update_custom_properties_updated_at();

-- 10. FUNCTION: Update custom_property_values updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_property_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. TRIGGER: Auto-update custom_property_values timestamp
CREATE TRIGGER trigger_update_custom_property_values_timestamp
  BEFORE UPDATE ON custom_property_values
  FOR EACH ROW EXECUTE FUNCTION update_custom_property_values_updated_at();

-- 12. FUNCTION: Ensure only one default view per entity type per user
CREATE OR REPLACE FUNCTION ensure_single_default_view()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE saved_views
    SET is_default = FALSE
    WHERE organization_id = NEW.organization_id
      AND user_id = NEW.user_id
      AND entity_type = NEW.entity_type
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. TRIGGER: Auto-manage default view
CREATE TRIGGER trigger_ensure_single_default_view
  BEFORE INSERT OR UPDATE ON saved_views
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_view();
