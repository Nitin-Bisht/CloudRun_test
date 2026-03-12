-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: Public read access for VERIFIED providers only
-- Role: Database Admin (skill: database-admin)
-- Run in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow any visitor (including unauthenticated) to read verified providers
DROP POLICY IF EXISTS "public_read_verified_providers" ON public.providers;
CREATE POLICY "public_read_verified_providers"
ON public.providers FOR SELECT
USING (status = 'verified');

-- Allow public to read the countries linked to verified providers
DROP POLICY IF EXISTS "public_read_provider_countries" ON public.provider_countries;
CREATE POLICY "public_read_provider_countries"
ON public.provider_countries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.id = provider_countries.provider_id
    AND p.status = 'verified'
  )
);

-- NOTE: The existing admin/provider RLS policies from SCHEMA.sql remain intact.
-- This only ADDS the public anon read path for verified rows.
