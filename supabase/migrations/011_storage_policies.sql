-- Storage policies for documents bucket
-- Execute in Supabase Dashboard > SQL Editor
-- Path format: {organization_id}/{filename}

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS INT AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Allow authenticated users to upload to their organization folder only
CREATE POLICY "Users can upload documents to their org"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_org_id()::text
);

-- Allow users to view documents from their organization only
CREATE POLICY "Users can view documents from their org"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_org_id()::text
);

-- Allow users to update documents from their organization only
CREATE POLICY "Users can update documents in their org"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_org_id()::text
);

-- Allow users to delete documents from their organization only
CREATE POLICY "Users can delete documents in their org"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_org_id()::text
);
