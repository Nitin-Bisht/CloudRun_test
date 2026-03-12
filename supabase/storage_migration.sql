-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Storage: provider-docs bucket + RLS
-- Role: Database Admin (skill: database-admin)
-- Run this in your Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-docs', 'provider-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (already enabled by default in Supabase)
-- The following policies are scoped to the 'provider-docs' bucket.

-- Policy: Providers can upload their own files
DROP POLICY IF EXISTS "provider_docs_insert_own" ON storage.objects;
CREATE POLICY "provider_docs_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Providers can update their own files
DROP POLICY IF EXISTS "provider_docs_update_own" ON storage.objects;
CREATE POLICY "provider_docs_update_own"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'provider-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Providers can read their own files; Admins can read all
DROP POLICY IF EXISTS "provider_docs_select_own_or_admin" ON storage.objects;
CREATE POLICY "provider_docs_select_own_or_admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'provider-docs'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.is_admin()
  )
);

-- Policy: Admins can delete files
DROP POLICY IF EXISTS "provider_docs_delete_admin" ON storage.objects;
CREATE POLICY "provider_docs_delete_admin"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'provider-docs'
  AND public.is_admin()
);

-- NOTE: Public has NO access to this bucket. No public read policy.
