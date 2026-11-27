-- Sprint 5: Complete RLS policies for tables missing them
-- Date: 2026-11-27
-- Fix: 4 tables with RLS enabled but no policies + 3 missing DELETE policies
-- IDEMPOTENT: Safe to run multiple times

-- =============================================
-- 1. ORGANIZATIONS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;
CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND is_owner = true)
  );

-- =============================================
-- 2. TASKS POLICIES (full CRUD)
-- =============================================
DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select"
  ON tasks FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "tasks_insert" ON tasks;
CREATE POLICY "tasks_insert"
  ON tasks FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "tasks_update" ON tasks;
CREATE POLICY "tasks_update"
  ON tasks FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "tasks_delete" ON tasks;
CREATE POLICY "tasks_delete"
  ON tasks FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- =============================================
-- 3. ACTIVITIES POLICIES (full CRUD)
-- =============================================
DROP POLICY IF EXISTS "activities_select" ON activities;
CREATE POLICY "activities_select"
  ON activities FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "activities_insert" ON activities;
CREATE POLICY "activities_insert"
  ON activities FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "activities_update" ON activities;
CREATE POLICY "activities_update"
  ON activities FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "activities_delete" ON activities;
CREATE POLICY "activities_delete"
  ON activities FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- =============================================
-- 4. PIPELINE_STAGES POLICIES (full CRUD)
-- =============================================
DROP POLICY IF EXISTS "pipeline_stages_select" ON pipeline_stages;
CREATE POLICY "pipeline_stages_select"
  ON pipeline_stages FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "pipeline_stages_insert" ON pipeline_stages;
CREATE POLICY "pipeline_stages_insert"
  ON pipeline_stages FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "pipeline_stages_update" ON pipeline_stages;
CREATE POLICY "pipeline_stages_update"
  ON pipeline_stages FOR UPDATE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "pipeline_stages_delete" ON pipeline_stages;
CREATE POLICY "pipeline_stages_delete"
  ON pipeline_stages FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- =============================================
-- 5. MISSING DELETE POLICIES FOR EXISTING TABLES
-- =============================================
DROP POLICY IF EXISTS "leads_delete" ON leads;
CREATE POLICY "leads_delete"
  ON leads FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "companies_delete" ON companies;
CREATE POLICY "companies_delete"
  ON companies FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "deals_delete" ON deals;
CREATE POLICY "deals_delete"
  ON deals FOR DELETE
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
