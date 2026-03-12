# Epic 4: Provider Onboarding Workflow

## 1. Goal
Build the funnel that converts a newly registered Provider user into a "Verified" provider visible on the marketplace. This includes securing document uploads and an Admin approval interface.

## 2. In Scope
*   `UI/UX`: Provider Onboarding multi-step form (Company Name, Bio, Pricing Band, Services).
*   `Supabase Storage`: Bucket for securely uploading business licenses (`provider_documents`).
*   `Admin UI`: Provider Approval Queue dashboard.
*   `Logic`: State machine for provider status (`pending` -> `verified`/`rejected`, and `verified` -> `suspended` when needed).
*   `Audit`: Record admin status decisions in `admin_audit_logs`.

## 3. Out of Scope
*   Third-party API integration for automated KYC/KYB validation.
*   Creating the public directory to display these providers (Epic 5).

## 4. Technical Requirements
*   **Server Actions:**
    *   `submitProviderApplication(data, fileUrl)`
    *   `adminUpdateProviderStatus(providerId, status, notes)`
*   **Supabase Storage RLS:**
    *   Providers can only upload/read their own files in the bucket.
    *   Admins can read all files in the bucket.
    *   Public has NO access to this bucket.

## 5. Acceptance Criteria
1.  A newly registered Provider sees a mandatory setup screen to enter their details and upload a PDF/Image of their license.
2.  Submitting the form saves data to `providers`, uploads the file to Storage, and sets status to `pending`.
3.  An Admin can view a list of `pending` providers at `/admin/providers`.
4.  Admin can download/view the uploaded license document.
5.  Admin can click "Verify" or "Reject". The provider's status in the database updates accordingly.
6.  Admin can suspend a previously verified provider, and suspended providers are excluded from public discovery.
