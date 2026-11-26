-- Storage policies for documents bucket
-- Execute in Supabase Dashboard > SQL Editor

-- Allow authenticated users to upload to their organization folder
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);

-- Allow users to view documents from their organization
CREATE POLICY "Users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);

-- Allow users to update their own documents
CREATE POLICY "Users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);

-- Allow users to delete documents
CREATE POLICY "Users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);
