-- XbandGlobal database schema (Supabase/PostgreSQL)
-- Intended for a fresh project bootstrap.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  CREATE TYPE public.user_role AS ENUM ('client', 'provider', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.provider_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.lead_status AS ENUM ('new', 'viewed', 'responded', 'closed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'client',
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (char_length(code) BETWEEN 2 AND 3 AND code = upper(code)),
  name TEXT NOT NULL,
  flag_emoji TEXT,
  requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
  avg_cost TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  bio TEXT,
  website_url TEXT,
  status public.provider_status NOT NULL DEFAULT 'pending',
  pricing_band TEXT,
  services TEXT[] NOT NULL DEFAULT '{}'::text[],
  languages TEXT[] NOT NULL DEFAULT '{}'::text[],
  response_time_hours INTEGER NOT NULL DEFAULT 48 CHECK (response_time_hours > 0),
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.provider_countries (
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  price_range TEXT,
  PRIMARY KEY (provider_id, country_id)
);

CREATE TABLE IF NOT EXISTS public.provider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  document_type TEXT NOT NULL DEFAULT 'license',
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (provider_id, storage_path)
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  credits_amount INTEGER NOT NULL CHECK (credits_amount > 0),
  amount_usd NUMERIC(10,2) NOT NULL CHECK (amount_usd >= 0),
  stripe_payment_intent TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 1 CHECK (credits_spent > 0),
  status public.lead_status NOT NULL DEFAULT 'new',
  responded_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES public.leads(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_countries_is_active ON public.countries(is_active);
CREATE INDEX IF NOT EXISTS idx_providers_status ON public.providers(status);
CREATE INDEX IF NOT EXISTS idx_provider_countries_country_id ON public.provider_countries(country_id);
CREATE INDEX IF NOT EXISTS idx_provider_documents_provider_id ON public.provider_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON public.leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_provider_id ON public.leads(provider_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT;
BEGIN
  requested_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'client');

  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN requested_role IN ('client', 'provider') THEN requested_role::public.user_role
      ELSE 'client'::public.user_role
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  );
$$;

DROP TRIGGER IF EXISTS trg_profiles_set_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_countries_set_updated_at ON public.countries;
CREATE TRIGGER trg_countries_set_updated_at
BEFORE UPDATE ON public.countries
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_providers_set_updated_at ON public.providers;
CREATE TRIGGER trg_providers_set_updated_at
BEFORE UPDATE ON public.providers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_leads_set_updated_at ON public.leads;
CREATE TRIGGER trg_leads_set_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_set_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_set_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.refresh_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_id UUID;
BEGIN
  v_provider_id := COALESCE(NEW.provider_id, OLD.provider_id);

  UPDATE public.providers p
  SET
    rating_avg = COALESCE(a.avg_rating, 0),
    review_count = COALESCE(a.review_count, 0),
    updated_at = timezone('utc', now())
  FROM (
    SELECT
      r.provider_id,
      ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
      COUNT(*)::int AS review_count
    FROM public.reviews r
    WHERE r.provider_id = v_provider_id
    GROUP BY r.provider_id
  ) a
  WHERE p.id = v_provider_id;

  IF NOT FOUND THEN
    UPDATE public.providers
    SET rating_avg = 0, review_count = 0, updated_at = timezone('utc', now())
    WHERE id = v_provider_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_provider_rating ON public.reviews;
CREATE TRIGGER trg_refresh_provider_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.refresh_provider_rating();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.create_lead_and_deduct_credit(p_provider_id UUID, p_message TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id UUID := auth.uid();
  v_new_lead_id UUID;
BEGIN
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = p_provider_id
      AND p.status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Provider is not available for contact';
  END IF;

  UPDATE public.profiles
  SET credits = credits - 1, updated_at = timezone('utc', now())
  WHERE id = v_client_id
    AND credits >= 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  INSERT INTO public.leads (client_id, provider_id, message, credits_spent, status)
  VALUES (v_client_id, p_provider_id, p_message, 1, 'new')
  RETURNING id INTO v_new_lead_id;

  RETURN v_new_lead_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_lead_and_deduct_credit(UUID, TEXT) TO authenticated, service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own_or_admin ON public.profiles;
CREATE POLICY profiles_select_own_or_admin
ON public.profiles
FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS profiles_insert_own_or_admin ON public.profiles;
CREATE POLICY profiles_insert_own_or_admin
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS profiles_update_own_or_admin ON public.profiles;
CREATE POLICY profiles_update_own_or_admin
ON public.profiles
FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS profiles_delete_own_or_admin ON public.profiles;
CREATE POLICY profiles_delete_own_or_admin
ON public.profiles
FOR DELETE
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS countries_public_read_active ON public.countries;
CREATE POLICY countries_public_read_active
ON public.countries
FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS countries_admin_insert ON public.countries;
CREATE POLICY countries_admin_insert
ON public.countries
FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS countries_admin_update ON public.countries;
CREATE POLICY countries_admin_update
ON public.countries
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS countries_admin_delete ON public.countries;
CREATE POLICY countries_admin_delete
ON public.countries
FOR DELETE
USING (public.is_admin());

DROP POLICY IF EXISTS providers_select_visibility ON public.providers;
CREATE POLICY providers_select_visibility
ON public.providers
FOR SELECT
USING (
  status = 'verified'
  OR profile_id = auth.uid()
  OR public.is_admin()
);

DROP POLICY IF EXISTS providers_insert_own_or_admin ON public.providers;
CREATE POLICY providers_insert_own_or_admin
ON public.providers
FOR INSERT
WITH CHECK (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS providers_update_own_or_admin ON public.providers;
CREATE POLICY providers_update_own_or_admin
ON public.providers
FOR UPDATE
USING (profile_id = auth.uid() OR public.is_admin())
WITH CHECK (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS providers_delete_own_or_admin ON public.providers;
CREATE POLICY providers_delete_own_or_admin
ON public.providers
FOR DELETE
USING (profile_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS provider_countries_select_visibility ON public.provider_countries;
CREATE POLICY provider_countries_select_visibility
ON public.provider_countries
FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_countries.provider_id
      AND p.profile_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    JOIN public.countries c ON c.id = provider_countries.country_id
    WHERE p.id = provider_countries.provider_id
      AND p.status = 'verified'
      AND c.is_active = true
  )
);

DROP POLICY IF EXISTS provider_countries_insert_own_or_admin ON public.provider_countries;
CREATE POLICY provider_countries_insert_own_or_admin
ON public.provider_countries
FOR INSERT
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_countries.provider_id
      AND p.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS provider_countries_update_own_or_admin ON public.provider_countries;
CREATE POLICY provider_countries_update_own_or_admin
ON public.provider_countries
FOR UPDATE
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_countries.provider_id
      AND p.profile_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_countries.provider_id
      AND p.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS provider_countries_delete_own_or_admin ON public.provider_countries;
CREATE POLICY provider_countries_delete_own_or_admin
ON public.provider_countries
FOR DELETE
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_countries.provider_id
      AND p.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS provider_documents_select_own_or_admin ON public.provider_documents;
CREATE POLICY provider_documents_select_own_or_admin
ON public.provider_documents
FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_documents.provider_id
      AND p.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS provider_documents_insert_own_or_admin ON public.provider_documents;
CREATE POLICY provider_documents_insert_own_or_admin
ON public.provider_documents
FOR INSERT
WITH CHECK (
  public.is_admin()
  OR (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.providers p
      WHERE p.id = provider_documents.provider_id
        AND p.profile_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS provider_documents_update_own_or_admin ON public.provider_documents;
CREATE POLICY provider_documents_update_own_or_admin
ON public.provider_documents
FOR UPDATE
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_documents.provider_id
      AND p.profile_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.providers p
      WHERE p.id = provider_documents.provider_id
        AND p.profile_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS provider_documents_delete_own_or_admin ON public.provider_documents;
CREATE POLICY provider_documents_delete_own_or_admin
ON public.provider_documents
FOR DELETE
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = provider_documents.provider_id
      AND p.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS transactions_select_own_or_admin ON public.transactions;
CREATE POLICY transactions_select_own_or_admin
ON public.transactions
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS transactions_insert_own_or_admin ON public.transactions;
CREATE POLICY transactions_insert_own_or_admin
ON public.transactions
FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS transactions_update_admin_only ON public.transactions;
CREATE POLICY transactions_update_admin_only
ON public.transactions
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS transactions_delete_admin_only ON public.transactions;
CREATE POLICY transactions_delete_admin_only
ON public.transactions
FOR DELETE
USING (public.is_admin());

DROP POLICY IF EXISTS leads_select_participant_or_admin ON public.leads;
CREATE POLICY leads_select_participant_or_admin
ON public.leads
FOR SELECT
USING (
  client_id = auth.uid()
  OR public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = leads.provider_id
      AND p.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS leads_insert_client_only ON public.leads;
CREATE POLICY leads_insert_client_only
ON public.leads
FOR INSERT
WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = leads.provider_id
      AND p.status = 'verified'
  )
);

DROP POLICY IF EXISTS leads_update_participant_or_admin ON public.leads;
CREATE POLICY leads_update_participant_or_admin
ON public.leads
FOR UPDATE
USING (
  public.is_admin()
  OR client_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = leads.provider_id
      AND p.profile_id = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR client_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.providers p
    WHERE p.id = leads.provider_id
      AND p.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS leads_delete_client_or_admin ON public.leads;
CREATE POLICY leads_delete_client_or_admin
ON public.leads
FOR DELETE
USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS reviews_public_read ON public.reviews;
CREATE POLICY reviews_public_read
ON public.reviews
FOR SELECT
USING (true);

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

DROP POLICY IF EXISTS reviews_update_owner_or_admin ON public.reviews;
CREATE POLICY reviews_update_owner_or_admin
ON public.reviews
FOR UPDATE
USING (client_id = auth.uid() OR public.is_admin())
WITH CHECK (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS reviews_delete_owner_or_admin ON public.reviews;
CREATE POLICY reviews_delete_owner_or_admin
ON public.reviews
FOR DELETE
USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS admin_audit_logs_admin_select ON public.admin_audit_logs;
CREATE POLICY admin_audit_logs_admin_select
ON public.admin_audit_logs
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS admin_audit_logs_admin_insert ON public.admin_audit_logs;
CREATE POLICY admin_audit_logs_admin_insert
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_audit_logs_admin_update ON public.admin_audit_logs;
CREATE POLICY admin_audit_logs_admin_update
ON public.admin_audit_logs
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS admin_audit_logs_admin_delete ON public.admin_audit_logs;
CREATE POLICY admin_audit_logs_admin_delete
ON public.admin_audit_logs
FOR DELETE
USING (public.is_admin());
