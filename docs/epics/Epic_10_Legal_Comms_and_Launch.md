# Epic 10: Legal, Comms, and Launch Readiness

## 1. Goal
Finalize production readiness with legal/compliance coverage, transactional communications, and deployment hardening for launch.

## 2. In Scope
*   `Legal Pages`: Publish Terms of Service and Privacy Policy pages.
*   `Disclaimer`: Render mandatory legal disclaimer in global footer on all public pages.
*   `GDPR`: Provide secure "Delete Account" flow with PII deletion/anonymization safeguards.
*   `Notifications`: Implement transactional emails (auth, credit purchase success, new lead, refund, provider status updates).
*   `Launch`: Configure Vercel production deployment and all required environment variables.

## 3. Out of Scope
*   Full legal automation workflows.
*   Multi-language legal localization.
*   Advanced email campaign tooling.

## 4. Technical Requirements
*   **Pages/Routes:** `/legal/terms`, `/legal/privacy`.
*   **Global Layout:** Footer disclaimer component included across app layouts.
*   **Delete Account Action:** `deleteAccount()` handling auth deletion and data anonymization/cleanup while preserving transaction integrity.
*   **Email Provider:** Resend or SendGrid integration with templated transactional emails.
*   **Deployment Checklist:** Validate env vars for Supabase, Stripe, webhook secret, and email provider; verify Stripe webhook endpoint in production.

## 5. Acceptance Criteria
1.  Terms and Privacy pages are accessible from footer links and render correct legal copy.
2.  Mandatory disclaimer is visible on every public page.
3.  User can delete account via settings; profile PII is removed/anonymized while required financial records remain intact.
4.  Transactional emails send successfully for at least: password reset, credit purchase, new lead, and refund.
5.  Production deployment is live on Vercel with working auth, billing webhook, and email notifications.
