-- ProspectHub CRM - Message Templates
-- Templates email/SMS avec tokens de personnalisation

-- 1. MESSAGE_TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  body TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'email' CHECK (type IN ('email', 'sms', 'whatsapp', 'linkedin')),
  category VARCHAR(100),
  tokens JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEMPLATE_CATEGORIES TABLE (pour organiser les templates)
CREATE TABLE IF NOT EXISTS template_categories (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 3. INDEXES
CREATE INDEX idx_message_templates_organization_id ON message_templates(organization_id);
CREATE INDEX idx_message_templates_type ON message_templates(type);
CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_is_active ON message_templates(is_active);
CREATE INDEX idx_template_categories_organization_id ON template_categories(organization_id);

-- 4. ROW LEVEL SECURITY
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_templates
CREATE POLICY "Users can view their organization's templates"
  ON message_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert templates in their organization"
  ON message_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update templates in their organization"
  ON message_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete templates in their organization"
  ON message_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for template_categories
CREATE POLICY "Users can view their organization's template categories"
  ON template_categories FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert template categories in their organization"
  ON template_categories FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update template categories in their organization"
  ON template_categories FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete template categories in their organization"
  ON template_categories FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 5. FUNCTION: Update templates updated_at timestamp
CREATE OR REPLACE FUNCTION update_message_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER: Auto-update templates timestamp
CREATE TRIGGER trigger_update_message_templates_timestamp
  BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_message_templates_updated_at();

-- 7. FUNCTION: Increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id INT)
RETURNS VOID AS $$
BEGIN
  UPDATE message_templates
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Seed default categories
INSERT INTO template_categories (organization_id, name, description, color, display_order)
SELECT o.id, c.name, c.description, c.color, c.display_order
FROM organizations o
CROSS JOIN (
  VALUES
    ('Prospection', 'Templates pour la premiere prise de contact', '#3B82F6', 1),
    ('Suivi', 'Templates pour le suivi des prospects', '#10B981', 2),
    ('Relance', 'Templates pour les relances', '#F59E0B', 3),
    ('Cloture', 'Templates pour conclure une vente', '#8B5CF6', 4)
) AS c(name, description, color, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM template_categories tc
  WHERE tc.organization_id = o.id AND tc.name = c.name
);
