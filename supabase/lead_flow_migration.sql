-- ============================================================================
-- Epic 7: Lead Contact Flow - SQL migration (hardened)
-- Run in: Supabase Dashboard -> SQL Editor
-- Role: Database Admin
-- ============================================================================

-- RPC: Atomic send_lead
-- Deducts 1 credit from the authenticated client and inserts one lead row.
-- Security hardening:
-- - caller must be authenticated and match p_client_id
-- - target provider must exist and be verified
-- - duplicate lead to same provider is blocked
-- - function execute is limited to authenticated + service_role
CREATE OR REPLACE FUNCTION public.send_lead(
    p_client_id   UUID,
    p_provider_id UUID,
    p_message     TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_uid   UUID;
    v_lead_id     UUID;
    v_credits     INTEGER;
BEGIN
    v_actor_uid := auth.uid();

    IF v_actor_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF v_actor_uid <> p_client_id THEN
        RAISE EXCEPTION 'Not authorized for requested client id';
    END IF;

    IF p_message IS NULL OR length(trim(p_message)) < 20 OR length(trim(p_message)) > 1000 THEN
        RAISE EXCEPTION 'Message must be between 20 and 1000 characters';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.providers
        WHERE id = p_provider_id
          AND status = 'verified'
    ) THEN
        RAISE EXCEPTION 'Provider not found or not verified';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.leads
        WHERE client_id = p_client_id
          AND provider_id = p_provider_id
    ) THEN
        RAISE EXCEPTION 'You have already contacted this provider';
    END IF;

    -- Lock client profile to prevent concurrent double-spend.
    SELECT credits INTO v_credits
    FROM public.profiles
    WHERE id = p_client_id
    FOR UPDATE;

    IF v_credits IS NULL THEN
        RAISE EXCEPTION 'Client profile not found';
    END IF;

    IF v_credits < 1 THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    UPDATE public.profiles
    SET credits = credits - 1
    WHERE id = p_client_id;

    INSERT INTO public.leads (client_id, provider_id, message, credits_spent, status)
    VALUES (p_client_id, p_provider_id, trim(p_message), 1, 'new')
    RETURNING id INTO v_lead_id;

    RETURN v_lead_id;
END;
$$;

REVOKE ALL ON FUNCTION public.send_lead(UUID, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_lead(UUID, UUID, TEXT) TO authenticated, service_role;

-- RLS: leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Clients can see their own sent leads.
DROP POLICY IF EXISTS "clients_read_own_leads" ON public.leads;
CREATE POLICY "clients_read_own_leads"
ON public.leads FOR SELECT
USING (client_id = auth.uid());

-- Providers can see leads addressed to them.
DROP POLICY IF EXISTS "providers_read_received_leads" ON public.leads;
CREATE POLICY "providers_read_received_leads"
ON public.leads FOR SELECT
USING (
    provider_id IN (
        SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
);

-- Remove broad legacy update policy if it exists (it allowed client updates).
DROP POLICY IF EXISTS "leads_update_participant_or_admin" ON public.leads;

-- Providers can update lead status (viewed/responded/closed only).
DROP POLICY IF EXISTS "providers_update_lead_status" ON public.leads;
CREATE POLICY "providers_update_lead_status"
ON public.leads FOR UPDATE
USING (
    provider_id IN (
        SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
)
WITH CHECK (
    provider_id IN (
        SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
    AND status IN ('viewed', 'responded', 'closed')
);

-- Admins retain update capability for refunds/manual interventions.
DROP POLICY IF EXISTS "admins_update_leads" ON public.leads;
CREATE POLICY "admins_update_leads"
ON public.leads FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Verify:
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'send_lead';
