# VISTAR - End-to-End Required Feature Specification

This document defines the complete required feature set to build and ship the VISTAR web product end to end. It is aligned to PRD, user stories, technical spec, API spec, legal requirements, and launch readiness.

## 1. Product Scope and Boundaries

### 1.1 Product Goal
Build a trusted B2B marketplace where clients can discover and contact verified incorporation providers by country through a paid credit system.

### 1.2 In Scope (Required)
- Responsive web app (desktop and mobile web).
- Three roles: Client, Provider, Admin.
- Country discovery, provider discovery, provider onboarding, verification workflow.
- Credit purchase via Stripe and paid lead/contact flow.
- Reviews linked to real contact events.
- Admin controls for provider moderation and country content.
- Legal disclaimer, terms, privacy, and GDPR deletion flow.

### 1.3 Out of Scope (Not Required for Initial Launch)
- Native mobile app.
- Full in-app chat.
- Multi-language.
- Automated legal advice.
- Third-party KYC/KYB integrations.

## 2. Role-Based Capabilities

### 2.1 Client
- Register/login/logout via email/password.
- Browse countries and provider listings.
- View provider profiles and reviews.
- Buy credits.
- Spend credits to send lead inquiries.
- Track credit balance and contact history.
- Submit reviews after eligible contact.

### 2.2 Provider
- Register as provider and submit onboarding application.
- Upload required license documents.
- Manage public profile, service tags, and pricing ranges.
- View and respond to incoming leads.
- Track verification status and basic performance metrics.

### 2.3 Admin
- Review provider applications and verify/reject/suspend providers.
- Edit country requirements content.
- View platform metrics (users, credits sold, leads, refunds).
- Handle disputes/refunds and moderation events.

## 3. End-to-End User Journeys (Required)

### 3.1 Client Journey
1. User signs up and verifies account.
2. User selects a country and reads requirements.
3. User filters and compares verified providers.
4. User buys credits via Stripe.
5. User opens provider contact form and submits inquiry.
6. One credit is deducted and lead is created.
7. Provider receives notification and responds.
8. User can later submit a review for that provider.

### 3.2 Provider Journey
1. Provider signs up and chooses provider account type.
2. Provider submits business profile and license.
3. Admin reviews and sets status: pending -> verified or rejected.
4. Verified provider appears in public search.
5. Provider receives paid leads and responds within SLA.

### 3.3 Admin Journey
1. Admin checks provider queue.
2. Admin verifies documents and updates status.
3. Admin edits country requirement data.
4. Admin monitors lead, refund, and response metrics.
5. Admin resolves disputes and applies moderation actions.

## 4. Functional Requirements by Module

### 4.1 Authentication and Accounts
- Email/password auth via Supabase.
- Session persistence and protected routes.
- Role assignment: client, provider, admin.
- Account verification and password reset.

### 4.2 Profiles
- Client profile: name, company, country, contact info.
- Provider profile: legal name, display name, countries served, services, languages, pricing band, bio.
- Admin profile and audit identity.

### 4.3 Country Content
- Country listing page with active countries only.
- Country detail page with requirements JSON:
  - company_types
  - min_capital
  - local_director
  - registered_address
  - documents
  - timeline
  - tax_info
- Admin editable country content.

### 4.4 Provider Discovery
- Filter providers by country, verification status, price range, rating, and services.
- Public listing only includes verified providers.
- Provider detail page shows rating, review count, services, and verification badge.

### 4.5 Provider Onboarding and Verification
- Provider application form with required legal and business fields.
- License upload to Supabase Storage.
- Status lifecycle:
  - pending
  - verified
  - rejected
  - suspended
- Admin review notes and decision history.

### 4.6 Credits and Billing
- Credit packages available in UI.
- Stripe Checkout session generation.
- Webhook processing for successful payment.
- Transaction recording and balance update.
- Idempotent webhook handling.

### 4.7 Lead/Contact Flow
- Contact action requires available credits.
- On submit:
  - validate provider eligibility
  - deduct one credit atomically
  - create lead record
  - trigger email notifications
- Prevent duplicate accidental submissions.
- Lead status lifecycle:
  - new
  - viewed
  - responded
  - closed
  - refunded

### 4.8 Reviews
- Only users with valid prior lead/contact to provider can review.
- One review per lead or controlled policy (must be defined in code).
- Rating aggregation updates provider score.
- Admin moderation for abusive/fraudulent content.

### 4.9 Dashboards
- Client dashboard:
  - current credits
  - transaction history
  - lead/contact history
  - review status
- Provider dashboard:
  - verification status
  - lead inbox
  - response SLA indicator
  - profile management
- Admin dashboard:
  - provider queue
  - country CMS
  - metrics and moderation tools

### 4.10 Notifications
- Transactional emails:
  - signup verification
  - credit purchase success
  - lead received (provider)
  - lead confirmation (client)
  - provider status updates
  - refund notifications
- Provider expected response window should be visible.

### 4.11 Legal and Compliance
- Mandatory footer disclaimer on every page.
- Terms and Privacy pages.
- Platform positioning as connector, not law firm.
- GDPR delete request flow for user data.

### 4.12 Analytics and Reporting
- Core platform metrics:
  - total clients
  - total providers
  - verified providers
  - credits sold
  - gross revenue
  - leads created
  - response rate
  - refund rate
- Event tracking for funnel steps from search -> contact -> review.

## 5. Data and Domain Requirements

### 5.1 Core Entities
- profiles
- providers
- countries
- transactions
- leads
- reviews
- provider_documents
- admin_audit_logs

### 5.2 Critical Data Rules
- Credit balance cannot go negative.
- Lead creation and credit deduction must be atomic.
- Public queries never return unverified providers.
- Provider can only access own leads and documents.
- Client can only access own transactions and leads.

## 6. API and Server Action Requirements

### 6.1 Required Server Actions
- createProfile(data)
- submitProviderApplication(data)
- purchaseCredits(amount)
- sendLead(providerId, message)
- submitReview(providerId, rating, comment)

### 6.2 Required API Route
- POST /api/webhooks/stripe
  - verify stripe signature
  - process payment_intent.succeeded
  - update transactions
  - increment profile credits
  - return 200

### 6.3 Required Query Functions
- getCountries()
- getProvidersByCountry(countryCode)
- getProviderDetails(providerId)
- getUserCredits(userId)

## 7. Security and Access Control Requirements

### 7.1 Supabase RLS Requirements
- clients:
  - can read/write only own profile
  - can read only own transactions and leads
- providers:
  - can read/write only own provider profile
  - can read only leads assigned to own provider account
- public:
  - can read only active countries and verified providers
- admin:
  - elevated policies for moderation and cms operations

### 7.2 Additional Security Controls
- Validate and sanitize all user inputs.
- Server-side authorization checks for every mutation.
- Rate-limit lead submissions and auth-sensitive endpoints.
- Secure file upload constraints (mime, size, extension).
- Audit log for admin decisions and sensitive mutations.

## 8. Non-Functional Requirements

### 8.1 Performance
- Fast first render on homepage and country pages.
- Provider listing filtering should remain responsive under realistic load.

### 8.2 Reliability
- Stripe webhook idempotency and retry safety.
- Email sending failures should not corrupt billing/lead state.

### 8.3 Observability
- Error tracking for server actions and webhooks.
- Structured logs for payment and lead lifecycle events.

### 8.4 Maintainability
- Typed schemas and shared domain types.
- Clear separation of UI, server actions, and data access layers.

## 9. Launch Definition of Done (End-to-End)

All items below must be complete before launch:

1. Auth works for all roles with protected routes.
2. Country pages render correct structured requirement content.
3. Provider onboarding + document upload + admin verification works end to end.
4. Public directory shows only verified providers with working filters.
5. Credit purchase works via Stripe checkout and webhook updates balance correctly.
6. Client can spend credit and create lead; provider receives notification.
7. Provider can view and manage lead status in dashboard.
8. Eligible client can submit review; provider rating updates.
9. Admin can manage providers, country content, and refunds/disputes.
10. Legal pages and mandatory disclaimer are present sitewide.
11. RLS policies verified for all sensitive tables.
12. Production deployment on Vercel with required env vars configured.

## 10. Prioritization (Build Sequence)

### Phase 1: Foundation
- App setup, auth, profiles, schema, RLS.

### Phase 2: Marketplace Core
- Country pages, provider onboarding, provider directory.

### Phase 3: Monetization and Leads
- Stripe credits, webhook handling, contact flow, notifications.

### Phase 4: Trust and Operations
- Reviews, admin moderation, dispute/refund handling, analytics.

## 11. Explicit Scope Decisions to Keep Consistent

- Launch countries for this spec: TBD (finalized after product readiness).
- Credit model: 1 credit = 1 provider contact.
- Platform is a connector marketplace and does not provide legal advice.
