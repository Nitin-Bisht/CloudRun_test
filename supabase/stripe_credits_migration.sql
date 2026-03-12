-- ============================================================================
-- Epic 6: Stripe Credits - SQL helpers and hardening
-- Run in: Supabase Dashboard -> SQL Editor
-- Role: Database Admin
-- ============================================================================

-- RPC: Atomically increment a user's credit balance.
-- Called by trusted server-side handlers only.
CREATE OR REPLACE FUNCTION public.increment_user_credits(
    p_user_id UUID,
    p_amount  INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Credit increment must be a positive integer';
    END IF;

    UPDATE public.profiles
    SET credits = credits + p_amount
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found in profiles', p_user_id;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_user_credits(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_credits(UUID, INTEGER) TO service_role;

-- RPC: Idempotent + atomic Stripe credit purchase application.
-- This function guarantees:
-- 1) duplicate webhook events do not double-credit
-- 2) transaction row insert and credits increment commit together
CREATE OR REPLACE FUNCTION public.apply_stripe_credit_purchase(
    p_user_id             UUID,
    p_credits             INTEGER,
    p_amount_usd          NUMERIC(10,2),
    p_payment_intent      TEXT,
    p_checkout_session_id TEXT
)
RETURNS TABLE(applied BOOLEAN, transaction_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing_id UUID;
    v_transaction_id UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User id is required';
    END IF;

    IF p_credits IS NULL OR p_credits <= 0 THEN
        RAISE EXCEPTION 'Credits must be a positive integer';
    END IF;

    IF p_amount_usd IS NULL OR p_amount_usd < 0 THEN
        RAISE EXCEPTION 'Amount must be >= 0';
    END IF;

    IF p_checkout_session_id IS NULL OR length(trim(p_checkout_session_id)) = 0 THEN
        RAISE EXCEPTION 'Checkout session id is required';
    END IF;

    -- Lock profile row to serialize concurrent updates and ensure user exists.
    PERFORM 1
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found in profiles', p_user_id;
    END IF;

    -- Fast idempotency checks before attempting insert.
    IF p_payment_intent IS NOT NULL THEN
        SELECT id INTO v_existing_id
        FROM public.transactions
        WHERE stripe_payment_intent = p_payment_intent
        LIMIT 1;

        IF v_existing_id IS NOT NULL THEN
            RETURN QUERY SELECT FALSE, v_existing_id;
            RETURN;
        END IF;
    END IF;

    SELECT id INTO v_existing_id
    FROM public.transactions
    WHERE stripe_checkout_session_id = p_checkout_session_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
        RETURN QUERY SELECT FALSE, v_existing_id;
        RETURN;
    END IF;

    -- Insert transaction first, handling concurrent duplicate deliveries safely.
    BEGIN
        INSERT INTO public.transactions (
            user_id,
            credits_amount,
            amount_usd,
            stripe_payment_intent,
            stripe_checkout_session_id,
            status
        )
        VALUES (
            p_user_id,
            p_credits,
            p_amount_usd,
            p_payment_intent,
            p_checkout_session_id,
            'succeeded'
        )
        RETURNING id INTO v_transaction_id;
    EXCEPTION
        WHEN unique_violation THEN
            SELECT t.id INTO v_transaction_id
            FROM public.transactions t
            WHERE t.stripe_checkout_session_id = p_checkout_session_id
               OR (p_payment_intent IS NOT NULL AND t.stripe_payment_intent = p_payment_intent)
            ORDER BY t.created_at DESC
            LIMIT 1;

            IF v_transaction_id IS NULL THEN
                RAISE;
            END IF;

            RETURN QUERY SELECT FALSE, v_transaction_id;
            RETURN;
    END;

    UPDATE public.profiles
    SET credits = credits + p_credits
    WHERE id = p_user_id;

    RETURN QUERY SELECT TRUE, v_transaction_id;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_stripe_credit_purchase(UUID, INTEGER, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_credit_purchase(UUID, INTEGER, NUMERIC, TEXT, TEXT) TO service_role;

-- RLS: Allow users to read only their own transactions.
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_transactions" ON public.transactions;
CREATE POLICY "users_read_own_transactions"
ON public.transactions FOR SELECT
USING (user_id = auth.uid());

-- Verify:
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_name IN ('increment_user_credits', 'apply_stripe_credit_purchase');
