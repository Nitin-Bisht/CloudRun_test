-- ─── Epic 9: Admin Operations Migration ───────────────────────────────────────
-- Role: SQL Pro (skill: sql-pro)
-- Adds:
--   1. admin_refund_lead(p_lead_id UUID)  — atomic refund + audit log
--   2. get_platform_metrics()             — aggregate stats for admin dashboard

-- ─── 1. admin_refund_lead ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_refund_lead(p_lead_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id   UUID := auth.uid();
  v_lead       RECORD;
BEGIN
  -- only admins may call this
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  -- lock the lead row to prevent concurrent double-refund
  SELECT id, client_id, status, credits_spent
    INTO v_lead
    FROM public.leads
   WHERE id = p_lead_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', p_lead_id;
  END IF;

  IF v_lead.status = 'refunded' THEN
    RAISE EXCEPTION 'Lead % is already refunded', p_lead_id;
  END IF;

  -- mark the lead as refunded
  UPDATE public.leads
     SET status       = 'refunded',
         refunded_at  = timezone('utc', now()),
         updated_at   = timezone('utc', now())
   WHERE id = p_lead_id;

  -- return the credit(s) to the client
  UPDATE public.profiles
     SET credits    = credits + v_lead.credits_spent,
         updated_at = timezone('utc', now())
   WHERE id = v_lead.client_id;

  -- audit log
  INSERT INTO public.admin_audit_logs
    (admin_id, action_type, target_type, target_id, metadata)
  VALUES
    (v_admin_id, 'lead_refunded', 'leads', p_lead_id,
     jsonb_build_object('credits_returned', v_lead.credits_spent));
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_refund_lead(UUID) TO authenticated, service_role;

-- ─── 2. get_platform_metrics ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_platform_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin role required';
  END IF;

  SELECT jsonb_build_object(
    'total_users',         (SELECT COUNT(*) FROM public.profiles),
    'total_providers',     (SELECT COUNT(*) FROM public.providers),
    'verified_providers',  (SELECT COUNT(*) FROM public.providers WHERE status = 'verified'),
    'pending_providers',   (SELECT COUNT(*) FROM public.providers WHERE status = 'pending'),
    'total_leads',         (SELECT COUNT(*) FROM public.leads),
    'refunded_leads',      (SELECT COUNT(*) FROM public.leads WHERE status = 'refunded'),
    'total_credits_sold',  (
      SELECT COALESCE(SUM(credits_amount), 0)
        FROM public.transactions
       WHERE status = 'succeeded'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_platform_metrics() TO authenticated, service_role;
