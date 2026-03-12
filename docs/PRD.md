# Product Requirements Document (PRD)

## 1. Overview
Build a B2B marketplace webapp connecting businesses (Clients) with vetted incorporation service providers (Providers) across multiple countries. The platform allows clients to search by country, view requirements, compare providers, and contact them using a credit system.

## 2. Target Users
1. **Client:** Startup founder/SME looking to incorporate internationally.
2. **Provider:** Incorporation firm/Consultant looking for leads.
3. **Admin:** Platform owner managing quality and content.

## 3. Core Features (MVP Scope)
### Client Side
- **Search:** Filter providers by country.
- **Country Pages:** Static checklist of requirements (cost, timeline, docs).
- **Provider Profiles:** Bio, services, verification badge, reviews.
- **Contact System:** Spend credits to unlock contact form/message.
- **Credits:** Purchase credits via Stripe.
- **Auth:** Email/Password signup/login.

### Provider Side
- **Onboarding:** Register, upload license, submit for approval.
- **Dashboard:** View leads (contacts), manage profile.
- **Status:** Pending → Verified (by Admin).

### Admin Side
- **Approval:** Approve/reject provider registrations.
- **CMS:** Edit country requirement checklists.
- **Analytics:** View total users, credits sold, contacts made.

## 4. Out of Scope (For Now)
- Mobile App (Responsive Web Only).
- Multi-language (English Only).
- In-app Chat (Email forwarding or simple message form).
- Automated Legal Advice (Platform is a connector only).

## 5. Success Metrics
- 30 Verified Providers (across 3 countries).
- 100 Client Signups.
- 50 Credit Transactions in Month 1.