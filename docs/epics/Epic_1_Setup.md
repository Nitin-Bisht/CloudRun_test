# Epic 1: Project Setup & Database Foundation

## 1. Goal
Initialize the core infrastructure of VISTAR, connecting the Next.js frontend to the Supabase backend, and defining the foundational database schema and security rules (RLS) required for all subsequent features.

## 2. In Scope
*   Initialize a Next.js App Router project with TypeScript and Tailwind CSS.
*   Install core UI libraries (shadcn/ui).
*   Setup Supabase project and local environment variables.
*   Add reusable Supabase client factories for both server and browser contexts.
*   Create `SCHEMA.sql` to define:
    *   Custom Enums (`user_role`, `provider_status`, `lead_status`).
    *   `provider_status` values: `pending`, `verified`, `rejected`, `suspended`.
    *   `lead_status` values: `new`, `viewed`, `responded`, `closed`, `refunded`.
    *   Tables: `profiles`, `countries`, `providers`, `provider_countries`, `provider_documents`, `leads`, `transactions`, `reviews`, `admin_audit_logs`.
*   Establish basic Row Level Security (RLS) templates.

## 3. Out of Scope
*   UI implementation (pages, layouts, auth flows).
*   API routes or Server Actions.
*   Seed data generation (beyond basic Enums).

## 4. Technical Requirements
### 4.1 Required Dependencies
*   `@supabase/supabase-js`, `@supabase/ssr`
*   `lucide-react` (icons)
*   `clsx`, `tailwind-merge` (shadcn setup)

### 4.2 Database Schema (High-Level)
*   **`profiles`**: id (PK, references auth.users), role, email, created_at, credits.
*   **`countries`**: id (PK), code (unique), name, is_active, requirements (JSONB).
*   **`providers`**: id (PK), profile_id (FK), company_name, status, pricing_band, bio.
*   **`provider_countries`**: provider_id (FK), country_id (FK), price_range.
*   **`provider_documents`**: id (PK), provider_id (FK), storage_path, document_type, created_at.
*   **`leads`**: id (PK), client_id (FK), provider_id (FK), status, message, responded_at/refund metadata.
*   **`transactions`**: id (PK), user_id (FK), stripe_payment_intent, amount_usd, credits_amount, status.
*   **`reviews`**: id (PK), lead_id (FK), rating, comment.
*   **`admin_audit_logs`**: id (PK), admin_id (FK), action_type, target_type, target_id, metadata, created_at.

## 5. Acceptance Criteria
1.  Developer can run `npm run dev` and see a default Next.js page styled with Tailwind.
2.  Supabase client can be instantiated successfully on the server and client.
3.  Executing `SCHEMA.sql` in Supabase succeeds without errors.
4.  All required tables exist in the database with appropriate foreign key relationships.
5.  RLS is enabled on all tables (denying access by default).
