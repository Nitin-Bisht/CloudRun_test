
---

## 📄 FILE 4: `API_SPEC.md` (API & Server Actions)

```markdown
# API & Server Actions Specification

## Note
Use Next.js Server Actions for most mutations. Use API Routes for Stripe Webhooks.

## 1. Server Actions (Mutations)
- `createProfile(data)`: Create user profile on signup.
- `submitProviderApplication(data)`: Create provider record + upload license.
- `purchaseCredits(amount)`: Create Stripe Checkout Session.
- `sendLead(providerId, message)`: Deduct credit, create lead record, send email.
- `submitReview(providerId, rating, comment)`: Create review record.

## 2. API Routes (Webhooks)
- `POST /api/webhooks/stripe`: 
  - Verify signature.
  - If `payment_intent.succeeded`: Update `transactions` table, add credits to `profiles`.
  - Return 200 OK.

## 3. Data Fetching (Queries)
- `getCountries()`: Fetch all active countries.
- `getProvidersByCountry(countryCode)`: Fetch verified providers for a country.
- `getProviderDetails(providerId)`: Fetch full profile + reviews.
- `getUserCredits(userId)`: Fetch current credit balance.