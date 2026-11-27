-- Sprint 5: Complete RLS policies for tables missing them
-- Date: 2026-11-27
-- Fix: 4 tables with RLS enabled but no policies + 3 missing DELETE policies

-- =============================================
-- 1. ORGANIZATIONS POLICIES
-- =============================================
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

-- =============================================
-- 2. TASKS POLICIES (full CRUD)
-- =============================================
CREATE POLICY "tasks_select"
  ON tasks FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "tasks_insert"
  ON tasks FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "tasks_update"
  ON tasks FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "tasks_delete"
  ON tasks FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- =============================================
-- 3. ACTIVITIES POLICIES (full CRUD)
-- =============================================
CREATE POLICY "activities_select"
  ON activities FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "activities_insert"
  ON activities FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "activities_update"
  ON activities FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "activities_delete"
  ON activities FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- =============================================
-- 4. PIPELINE_STAGES POLICIES (full CRUD)
-- =============================================
CREATE POLICY "pipeline_stages_select"
  ON pipeline_stages FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "pipeline_stages_insert"
  ON pipeline_stages FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "pipeline_stages_update"
  ON pipeline_stages FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "pipeline_stages_delete"
  ON pipeline_stages FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- =============================================
-- 5. MISSING DELETE POLICIES FOR EXISTING TABLES
-- =============================================
CREATE POLICY "leads_delete"
  ON leads FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "companies_delete"
  ON companies FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "deals_delete"
  ON deals FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
