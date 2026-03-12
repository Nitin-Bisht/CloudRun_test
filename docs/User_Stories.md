# User Stories & Acceptance Criteria

## Sprint 1: Foundation
1. **Setup Repo:** Initialize Next.js 14 + Supabase + Tailwind.
   - AC: Repo runs locally, connects to DB.
2. **Auth System:** Implement Signup/Login.
   - AC: User can sign up, verify email, login, logout.
3. **Database:** Run SCHEMA.sql.
   - AC: All tables created, RLS policies active.

## Sprint 2: Core Marketplace
4. **Country Pages:** Create static content for 3 pilot countries (TBD).
   - AC: Page loads, shows requirements, lists providers.
5. **Provider Onboarding:** Form to submit business info + license.
   - AC: Data saved to DB, status = 'pending'.
6. **Provider Directory:** Display verified providers.
   - AC: Only 'verified' providers show in public search.

## Sprint 3: Monetization & Contact
7. **Stripe Integration:** Buy credits flow.
   - AC: User clicks "Buy", redirects to Stripe, returns on success, credits added.
8. **Contact System:** Spend credit to message.
   - AC: Credit deducted, lead saved, email sent to provider.
9. **Reviews:** Allow clients to review after contact.
   - AC: Review saved, provider rating updated.

## Sprint 4: Admin & Polish
10. **Admin Dashboard:** Approve providers, edit countries.
    - AC: Admin can toggle verification status.
11. **Legal:** Add Terms, Privacy, Disclaimer.
    - AC: Links in footer, content visible.
12. **Deploy:** Push to Vercel.
    - AC: Site live on production URL.
