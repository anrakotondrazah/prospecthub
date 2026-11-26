-- ProspectHub CRM - Documents Feature
-- Document storage and management for contacts, deals, and companies

-- 1. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(1000) NOT NULL,
  file_type VARCHAR(50), -- pdf, docx, xlsx, png, jpg, etc.
  file_size BIGINT DEFAULT 0, -- in bytes
  mime_type VARCHAR(100),
  storage_path VARCHAR(500), -- Supabase Storage path

  -- Associations (peut etre lie a plusieurs entites)
  associated_lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
  associated_company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  associated_deal_id INT REFERENCES deals(id) ON DELETE CASCADE,

  -- Document metadata
  version INT DEFAULT 1,
  is_template BOOLEAN DEFAULT false,
  tags JSONB,
  metadata JSONB, -- custom metadata (page count, dimensions, etc.)

  -- Access control
  visibility VARCHAR(20) DEFAULT 'private', -- 'private', 'team', 'organization'
  shared_with JSONB, -- array of user UUIDs

  -- Timestamps
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. DOCUMENT_VERSIONS (track document history)
CREATE TABLE IF NOT EXISTS document_versions (
  id SERIAL PRIMARY KEY,
  document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INT NOT NULL,
  file_url VARCHAR(1000) NOT NULL,
  file_size BIGINT DEFAULT 0,
  storage_path VARCHAR(500),
  change_summary TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, version)
);

-- 3. DOCUMENT_ACCESS_LOGS (track who viewed/downloaded)
CREATE TABLE IF NOT EXISTS document_access_logs (
  id BIGSERIAL PRIMARY KEY,
  document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL, -- 'view', 'download', 'share'
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent VARCHAR(500)
);

-- 4. INDEXES
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_associated_lead ON documents(associated_lead_id);
CREATE INDEX idx_documents_associated_company ON documents(associated_company_id);
CREATE INDEX idx_documents_associated_deal ON documents(associated_deal_id);
CREATE INDEX idx_documents_file_type ON documents(file_type);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_access_logs_document_id ON document_access_logs(document_id);

-- 5. ROW LEVEL SECURITY
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view their organization's documents"
  ON documents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents in their organization"
  ON documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents in their organization"
  ON documents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents in their organization"
  ON documents FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for document_versions
CREATE POLICY "Users can view document versions in their organization"
  ON document_versions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert document versions in their organization"
  ON document_versions FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for document_access_logs
CREATE POLICY "Users can view access logs in their organization"
  ON document_access_logs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert access logs"
  ON document_access_logs FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 6. FUNCTION: Update documents updated_at timestamp
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER: Auto-update documents timestamp
CREATE TRIGGER trigger_update_documents_timestamp
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_documents_updated_at();

-- 8. FUNCTION: Auto-increment document version
CREATE OR REPLACE FUNCTION increment_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.file_url IS DISTINCT FROM OLD.file_url THEN
    -- Insert version history
    INSERT INTO document_versions (document_id, version, file_url, file_size, storage_path, uploaded_by)
    VALUES (OLD.id, OLD.version, OLD.file_url, OLD.file_size, OLD.storage_path, NEW.uploaded_by);

    -- Increment version
    NEW.version = OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGER: Auto-version on file change
CREATE TRIGGER trigger_document_version
  BEFORE UPDATE ON documents
  FOR EACH ROW
  WHEN (NEW.file_url IS DISTINCT FROM OLD.file_url)
  EXECUTE FUNCTION increment_document_version();
