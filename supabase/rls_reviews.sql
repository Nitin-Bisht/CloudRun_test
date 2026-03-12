-- Epic 8: Reviews & Trust Badges — SQL Migration
-- Role: DB Admin (skill: database-admin)
-- Run this in: Supabase Dashboard → SQL Editor

-- ─── 1. Grant EXECUTE on the rating refresh trigger function ─────────────────
-- The trigger fires as SECURITY DEFINER so no direct grant is needed for
-- the trigger itself, but authenticated users need SELECT on reviews to
-- read their own data and the public read policy is already in SCHEMA.sql.
-- This file is a no-op safety-net to ensure grants are present.

GRANT EXECUTE ON FUNCTION public.refresh_provider_rating() TO service_role;

-- ─── 2. Confirm reviews RLS policies are active ──────────────────────────────
-- These already exist in SCHEMA.sql. This block is idempotent and safe to re-run.

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read (anon + authenticated can read all reviews)
DROP POLICY IF EXISTS reviews_public_read ON public.reviews;
CREATE POLICY reviews_public_read
    ON public.reviews
    FOR SELECT
    USING (true);

-- Authenticated client can insert a review only when they own the lead
DROP POLICY IF EXISTS reviews_insert_verified_client ON public.reviews;
CREATE POLICY reviews_insert_verified_client
    ON public.reviews
    FOR INSERT
    WITH CHECK (
        client_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.leads l
            WHERE l.id = reviews.lead_id
              AND l.client_id = auth.uid()
              AND l.provider_id = reviews.provider_id
        )
    );

-- Owner or admin can update
DROP POLICY IF EXISTS reviews_update_owner_or_admin ON public.reviews;
CREATE POLICY reviews_update_owner_or_admin
    ON public.reviews
    FOR UPDATE
    USING  (client_id = auth.uid() OR public.is_admin())
    WITH CHECK (client_id = auth.uid() OR public.is_admin());

-- Owner or admin can delete
DROP POLICY IF EXISTS reviews_delete_owner_or_admin ON public.reviews;
CREATE POLICY reviews_delete_owner_or_admin
    ON public.reviews
    FOR DELETE
    USING (client_id = auth.uid() OR public.is_admin());

-- ─── 3. Verify trigger is active ─────────────────────────────────────────────
-- Informational: confirms the trigger was created by SCHEMA.sql
-- SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trg_refresh_provider_rating';
