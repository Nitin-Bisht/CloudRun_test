# VISTAR — Production Deployment Checklist

> Follow these steps before every production push to Vercel. All env vars must be set in **Vercel Dashboard → Project → Settings → Environment Variables**.

---

## 1. Required Environment Variables

| Variable | Where to get it | Example |
|----------|----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | `eyJ...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API keys | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API keys | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → endpoint → Signing secret | `whsec_...` |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys | `re_...` |
| `RESEND_FROM_EMAIL` | Your verified Resend sender domain | `VISTAR <hello@vistar.global>` |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel production URL | `https://vistar.global` |

> [!CAUTION]
> **Never expose `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` client-side.** Both are strictly server-side. Only `NEXT_PUBLIC_*` vars are safe for the browser.

> [!WARNING]
> The `.env.local` currently has `STRIPE_WEBHOOK_SECRET=whsec_placeholder`. **Replace this with the real secret from the Stripe dashboard before going live.**

---

## 2. Supabase Configuration

### Apply Migrations
Run these SQL files in Supabase SQL Editor (in order):

```
supabase/lead_flow_migration.sql
supabase/rls_reviews.sql
supabase/admin_ops_migration.sql
```

### Auth Settings
1. **Site URL** → set to `https://vistar.global`
2. **Redirect URLs** → add `https://vistar.global/**`
3. **Email Templates** → Supabase handles the password-reset email automatically

### Create Admin User
After first deployment, promote the admin account via SQL:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@vistar.global';
```

---

## 3. Stripe Webhook Setup

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL:** `https://vistar.global/api/webhooks/stripe`
4. **Events to send:** `checkout.session.completed`
5. Copy the **Signing secret** → paste into `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 4. Resend Domain Verification

1. Go to [resend.com](https://resend.com) → Domains → your domain
2. Confirm DNS records are verified (SPF, DKIM, DMARC)
3. Set `RESEND_FROM_EMAIL` to an address on that domain, e.g.: `VISTAR <hello@vistar.global>`

---

## 5. Vercel Project Setup

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Link project (first time)
vercel link

# Deploy to production
vercel --prod
```

Or push to the `main` branch if Vercel GitHub integration is configured.

**Framework preset:** Next.js  
**Root directory:** `web`  
**Build command:** `npm run build`  
**Output directory:** `.next`

---

## 6. Post-Deploy Smoke Test Checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Visit `https://vistar.global` | Landing page loads, Footer shows legal disclaimer |
| 2 | Visit `/terms` and `/privacy` | Full legal pages render |
| 3 | Sign up as client | Redirect to `/dashboard` |
| 4 | Sign up as provider | Redirect to `/dashboard` |
| 5 | Client: buy credits (Stripe test card `4242 4242 4242 4242`) | Credits added, confirmation email received |
| 6 | Client: contact a provider | Lead created, provider receives email notification |
| 7 | Admin: log in and visit `/dashboard/admin` | Metrics home loads |
| 8 | Admin: refund a lead | Credits returned to client, refund email sent |
| 9 | Admin: verify a provider | Provider status → verified, email sent |
| 10 | Visit `/dashboard/settings` | Account info, credits, Delete Account form |
| 11 | Password reset flow | Email delivered, can set new password |

---

## 7. Environment Validation Script

Run this in your local environment to confirm all required vars are set before deploy:

```bash
node -e "
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_SITE_URL'
];
const missing = required.filter(k => !process.env[k] || process.env[k].includes('placeholder'));
if (missing.length) {
  console.error('Missing or placeholder env vars:', missing.join(', '));
  process.exit(1);
}
console.log('All env vars OK');
"
```

---

## 8. Email Sandbox Mode (Local/QA)

When using a Resend sandbox account (for example `onboarding@resend.dev`), production recipients will be rejected with HTTP 403.

Set these local env vars to force all transactional emails to a single verified inbox:

```bash
EMAIL_DELIVERY_MODE=sandbox
EMAIL_SANDBOX_TO=your_verified_resend_inbox@example.com
EMAIL_FAIL_HARD=false
```
