# Epic 5: Provider Directory & Search

## 1. Goal
Create the public-facing directory where clients can discover, filter, and view the profiles of verified incorporation service providers. 

## 2. In Scope
*   `UI/UX`: Top-level `/providers` indexing page.
*   `UI/UX`: Individual provider profile page (`/providers/[id]`).
*   `Search/Filter`: Client-side or Server-side filtering by Country, Rating, and Pricing Band.
*   `Supabase/Data`: RLS implementation ensuring only providers with `status = 'verified'` are returned in public API calls.

## 3. Out of Scope
*   "Match Me" Questionnaire Flow (detailed in a separate roadmap phase, deferred for MVP core).
*   Spending credits to contact the provider (Epic 7).

## 4. Technical Requirements
*   **Queries:** 
    *   `getVerifiedProviders(filters)`
    *   `getProviderProfile(providerId)`
*   **Data Structure:** The page must read the aggregated review rating from the `providers` table (to be calculated by a database trigger or periodic job in Epic 8) or calculate it on the fly.

## 5. Acceptance Criteria
1.  An unauthenticated user can visit `/providers` and see a grid/list of providers.
2.  Providers with status `pending` or `rejected` do NOT appear in this list under any circumstances.
3.  User can filter the list to only show providers operating in a selected country code.
4.  User can click a provider card to view their full bio, services, and pricing band on `/providers/[id]`.
