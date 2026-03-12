# VISTAR Build Roadmap

Based on the required features and end-to-end user journeys defined in `Feature_Enhancements.md`, this document breaks the project down into distinct, sequential build phases (Epics). Each Epic focuses on delivering a specific, testable slice of value.

We will create a corresponding detailed implementation document for each of these Epics.

Launch countries are intentionally TBD and will be finalized after product readiness.

## Phase 1: Foundation (Infrastructure & Auth)
*   **Epic 1: Project Setup & Database Foundation.** Initialize Next.js, Tailwind, Supabase schema (Tables, Enums), and basic Row Level Security (RLS) policies.
*   **Epic 2: Core Authentication.** Setup Supabase Auth. Build Signup/Login/Logout flows for clients, providers, and admins, ensuring protected routes function correctly.

## Phase 2: Marketplace Core (Discovery & Onboarding)
*   **Epic 3: Country Content & Static Pages.** Build the `countries` listing and individual country requirement pages powered by the DB. Include basic Admin CMS to edit these JSON requirements.
*   **Epic 4: Provider Onboarding Workflow.** Build the provider application form with Supabase Storage upload for licenses. Build the Admin approval queue to verify providers.
*   **Epic 5: Provider Directory & Search.** Build the public directory displaying verified providers. Implement filtering logic (country, price, rating) and detailed public provider profiles.

## Phase 3: Monetization & Transactions (Leads)
*   **Epic 6: Stripe Integration & Credits.** Build the Stripe Checkout flow for purchasing credits. Implement the required Webhook handler to securely update user credit balances.
*   **Epic 7: Lead Creation & Contact Flow.** Build the core transaction mechanism: A client spends 1 credit to submit an atomic lead/contact to a provider. Build Client and Provider dashboards to view these leads.

## Phase 4: Trust, Operations, & Launch
*   **Epic 8: Reviews & Trust Badges.** Implement the system allowing clients to review providers post-contact. Aggregate scores and implement automated "Proof of Success" badges.
*   **Epic 9: Admin Dashboard & Operations.** Build admin oversight tools (metrics, dispute/refund handling, moderation audit).
*   **Epic 10: Legal, Comms, & Launch.** Finalize legal disclaimers, GDPR deletion flow, transactional email notifications, and production deployment on Vercel.

---
**Next Steps:** We will proceed with **Epic 1: Project Setup & Database Foundation**.
