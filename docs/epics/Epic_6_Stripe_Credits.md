# Epic 6: Stripe Integration & Credits

## 1. Goal
Implement the core monetization engine of VISTAR. Allow clients to easily purchase platform credits using Stripe Checkout, and securely update their account balance via Stripe Webhooks.

## 2. In Scope
*   `Stripe Setup`: Configure Stripe Products (Credit Packages) via Stripe Dashboard.
*   `UI/UX`: "Buy Credits" page/modal showing available pricing tiers.
*   `Server Action`: Create Stripe Checkout Session.
*   `API Route`: Create robust `/api/webhooks/stripe` endpoint.
*   `Database`: Record all successful purchases in the `transactions` table.

## 3. Out of Scope
*   Stripe Connect for routing money directly to providers (not required for Pay-Per-Lead MVP).
*   Subscription/recurring billing (credits are one-time purchases for now).

## 4. Technical Requirements
*   **Dependencies:** `stripe` (Node SDK).
*   **Webhook Security:** Must verify `stripe-signature` header using the webhook secret.
*   **Idempotency:** The webhook handler must check if a `stripe_payment_intent` already exists in the `transactions` table to prevent double-crediting if Stripe sends duplicate webhook events.
*   **Database Operation:** Updating `profiles.credits` and inserting into `transactions` must happen in a secure, server-side context (Service Role Key or Rpc call).

## 5. Acceptance Criteria
1.  A Client clicks "Buy 5 Credits for $50", is redirected to Stripe Checkout, and can enter test card details.
2.  Upon success, the user is redirected back to `/dashboard` with a success query param.
3.  The Stripe Webhook fires asynchronously; the backend verifies the signature and adds 5 credits to the user's `profiles` record.
4.  A corresponding record is created in the `transactions` table containing the Stripe Payment Intent ID.
5.  If the same webhook payload is sent twice (simulating a network retry), the user only receives the 5 credits once.
