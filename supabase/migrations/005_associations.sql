-- ProspectHub CRM - Associations Module
-- Flexible many-to-many associations between entities

-- Create associations table for linking any entity to any entity
CREATE TABLE IF NOT EXISTS associations (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL,
  source_id INT NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, source_type, source_id, target_type, target_id)
);

-- Index for efficient lookups
CREATE INDEX idx_associations_source ON associations(organization_id, source_type, source_id);
CREATE INDEX idx_associations_target ON associations(organization_id, target_type, target_id);
CREATE INDEX idx_associations_created_by ON associations(created_by);

-- Enable RLS
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for associations
CREATE POLICY "Users can view their organization's associations"
  ON associations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert associations in their organization"
  ON associations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete associations in their organization"
  ON associations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Function to get all associations for an entity
CREATE OR REPLACE FUNCTION get_entity_associations(
  p_org_id INT,
  p_entity_type VARCHAR,
  p_entity_id INT
)
RETURNS TABLE (
  id INT,
  related_type VARCHAR,
  related_id INT,
  direction VARCHAR,
  created_by UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  -- Outgoing associations (entity is source)
  SELECT
    a.id,
    a.target_type::VARCHAR as related_type,
    a.target_id as related_id,
    'outgoing'::VARCHAR as direction,
    a.created_by,
    a.created_at
  FROM associations a
  WHERE a.organization_id = p_org_id
    AND a.source_type = p_entity_type
    AND a.source_id = p_entity_id

  UNION ALL

  -- Incoming associations (entity is target)
  SELECT
    a.id,
    a.source_type::VARCHAR as related_type,
    a.source_id as related_id,
    'incoming'::VARCHAR as direction,
    a.created_by,
    a.created_at
  FROM associations a
  WHERE a.organization_id = p_org_id
    AND a.target_type = p_entity_type
    AND a.target_id = p_entity_id

  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_entity_associations TO authenticated;
