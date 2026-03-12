# Epic 7: Lead Creation & Contact Flow

## 1. Goal
Implement the central marketplace transaction: A Client spends a credit to message a Provider. This epic connects the discovery phase to the monetization phase.

## 2. In Scope
*   `UI/UX`: "Contact Provider" modal on the provider profile page.
*   `Logic`: Transactional operation to deduct 1 credit and create 1 lead.
*   `UI/UX`: Client Dashboard view of sent leads.
*   `UI/UX`: Provider Dashboard Lead Inbox to view received leads.
*   `Notifications`: Trigger basic email to provider (via Resend/SendGrid).

## 3. Out of Scope
*   Full in-app real-time chat. Providers and clients will communicate via email/phone once the introduction is made.
*   Client Document Vault (deferred for roadmap enhancement).

## 4. Technical Requirements
*   **Server Action:** `sendLead(providerId, message)`
*   **Atomicity:** Deducting the credit from `profiles` and inserting the row into `leads` must be atomic (either both succeed or both fail). Recommendation: Use a Supabase PostgreSQL function (RPC) for this operation.
*   **Email Dependency:** Implement `@resend/node` or equivalent to handle transactional emails.
*   **Lead Lifecycle:** Initial status `new`, with support for `viewed`, `responded`, `closed`, and `refunded`.

## 5. Acceptance Criteria
1.  A Client with 0 credits attempting to click "Contact" is prompted to buy credits (redirects to Epic 6 flow).
2.  A Client with >0 credits can fill out a message form and click "Send".
3.  Exactly 1 credit is deducted from their balance.
4.  A new row is created in the `leads` table with status `new`.
5.  An email is dispatched to the Provider's registered email address notifying them of the new lead.
6.  The Provider logs into their dashboard and sees the new lead and the Client's contact information.
