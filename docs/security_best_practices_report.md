# Security Best Practices Report (Epic 5 + Epic 6)

## Executive summary
A focused security audit of the Epic 5 provider directory and Epic 6 Stripe credits flow found two remaining risks.
Three security issues were fixed during this run (public route over-protection, checkout origin trust, and provider website URL sanitization).

## Remaining Findings

### High

#### SBP-001: Stripe webhook is currently non-operational due to missing service-role secret
- **Severity:** High
- **Location:** `web/src/app/api/webhooks/stripe/route.ts:18`, `web/src/app/api/webhooks/stripe/route.ts:73`, `web/src/app/api/webhooks/stripe/route.ts:78`
- **Evidence:** The handler requires `SUPABASE_SERVICE_ROLE_KEY` and returns `500 {"error":"Webhook handler misconfigured"}` when receiving a validly signed test event.
- **Config evidence:** `web/.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Stripe keys, and webhook secret, but no `SUPABASE_SERVICE_ROLE_KEY`.
- **Impact:** Successful Stripe payments cannot be credited, so Epic 6 credit top-up fails end-to-end.
- **Fix:** Set `SUPABASE_SERVICE_ROLE_KEY` in server runtime secrets (not client-exposed), then re-run webhook E2E tests.

### Medium

#### SBP-002: Crediting flow is not truly atomic across transaction insert and balance increment
- **Severity:** Medium
- **Location:** `web/src/app/api/webhooks/stripe/route.ts:95`, `web/src/app/api/webhooks/stripe/route.ts:114`, `web/src/app/api/webhooks/stripe/route.ts:123`
- **Evidence:** The code inserts into `transactions` first, then calls `increment_user_credits`. If increment fails, it returns HTTP 200 and suppresses retries.
- **Impact:** A payment can be recorded while credits are never applied, requiring manual repair.
- **Fix:** Move insert + credit increment into one DB transaction (single RPC with idempotency), and only return success when both operations commit.

## Fixed During This Audit

### SBP-FIX-001: Public provider directory was accidentally protected by auth middleware
- **Location:** `web/src/lib/supabase/middleware.ts:39`, `web/src/lib/supabase/middleware.ts:57`, `web/src/lib/supabase/middleware.ts:68`, `web/src/lib/supabase/middleware.ts:89`
- **Fix applied:** Replaced broad `startsWith('/provider')` checks with strict provider-route matching (`/provider` or `/provider/...`), so `/providers` remains public.

### SBP-FIX-002: Checkout success/cancel URLs trusted unvalidated request origin
- **Location:** `web/src/app/actions/credits.ts:10`, `web/src/app/actions/credits.ts:54`, `web/src/app/actions/credits.ts:85`
- **Fix applied:** Added trusted origin resolution from server config (`APP_ORIGIN` / Vercel env), removed dependence on request `Origin` header.

### SBP-FIX-003: Provider website URLs now enforce safe scheme
- **Location:** `web/src/app/actions/providers.ts:31`, `web/src/app/actions/providers.ts:170`, `web/src/app/actions/providers.ts:364`, `web/src/app/actions/providers.ts:428`
- **Fix applied:** Added server-side normalization/validation to allow only `http`/`https` website URLs.

## Validation Commands Run
- `npm run lint` (pass)
- `npm run build` (pass)
- Playwright E2E checks on `/providers` and `/providers/[id]` (pass for public access, filtering, profile details)
- Webhook signature checks:
  - Missing signature -> `400`
  - Invalid signature -> `400`
  - Valid signed event without service-role key -> `500` misconfigured
