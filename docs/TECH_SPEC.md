# Technical Specification

## 1. Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **UI Components:** shadcn/ui (for consistency & speed).
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage).
- **Payments:** Stripe (Checkout & Webhooks).
- **Email:** Resend or SendGrid (Transactional emails).
- **Hosting:** Vercel (Frontend + Serverless Functions).
- **Analytics:** PostHog or Google Analytics.

## 2. Architecture
- **Client:** Next.js Client Components for UI, Server Components for data fetching.
- **Auth:** Supabase Auth (Email/Password + Magic Link).
- **Database:** Supabase PostgreSQL with Row Level Security (RLS).
- **Storage:** Supabase Storage for provider license documents.
- **Payments:** Stripe Checkout Session → Webhook → Update User Credits.

## 3. Security & Compliance
- **RLS:** Strict Row Level Security on all tables.
  - Clients can only see their own transactions.
  - Providers can only see their own leads.
  - Public can only see verified providers.
- **Data Privacy:** GDPR compliant (data deletion endpoint).
- **Disclaimer:** Mandatory footer on all pages (see Legal.md).

## 4. Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=