# Epic 9: Admin Dashboard & Operations

## 1. Goal
Equip Admin with the operational controls needed to run marketplace quality: metrics, moderation, status management, and refund handling.

## 2. In Scope
*   `Admin Metrics`: High-level dashboard showing total users, verified providers, credits sold, and leads generated.
*   `Dispute Handling`: Admin interfaces to manually refund a lead (return 1 credit to client, mark lead as refunded).
*   `Provider Moderation`: Suspend or re-enable providers based on quality/compliance outcomes.
*   `Auditability`: Record admin-sensitive actions to `admin_audit_logs`.

## 3. Out of Scope
*   Complex charting/graphing libraries (simple stat cards are sufficient for MVP).
*   Automated AI dispute resolution.
*   Legal pages, sitewide disclaimer wiring, GDPR delete-account flow, and deployment hardening (Epic 10).

## 4. Technical Requirements
*   **Queries:** `getPlatformMetrics()`, requiring `service_role` key or admin-specific RLS to run aggregate queries (`COUNT`, `SUM`) across multiple tables.
*   **Refund Action:** `adminRefundLead(leadId)`. Must increment client credits, decrement provider stats (if applicable), and update lead status to `refunded`. Must be wrapped in a transaction/RPC.
*   **Moderation Action:** `adminSetProviderStatus(providerId, status, reason)` for `verified`/`suspended` transitions.
*   **Audit Logging:** Every refund and moderation action writes one row to `admin_audit_logs`.

## 5. Acceptance Criteria
1.  Admin logs in and sees an accurate count of total revenue (credits sold) and total active providers.
2.  Admin can view a specific lead and click "Refund". The client's credit balance increases by 1, and the lead status changes.
3.  Admin can suspend a provider; suspended providers are immediately removed from public discovery.
4.  Refund and provider-status actions are recorded in `admin_audit_logs`.
