# Epic 2: Core Authentication

## 1. Goal
Implement a robust authentication system using Supabase Auth (Email/Password) to manage the three primary user roles: Client, Provider, and Admin, and build the public-facing Landing Page. Ensure protected routes enforce these roles.

## 2. In Scope
*   Public Landing Page (marketing copy, hero section, calls-to-action).
*   Signup, Login, and Logout pages/components.
*   Forgot Password and Reset Password flow.
*   Supabase Auth integration (`@supabase/ssr` middleware).
*   Database trigger to automatically create a `profiles` record when a new user signs up in `auth.users`.
*   Protected route middleware to check session and defined role.

## 3. Out of Scope
*   Magic links, OAuth, or social logins.
*   Provider onboarding wizard (covered in Epic 4).

## 4. Technical Requirements
*   **Server Actions:**
    *   `signup(email, password, role)`: Registers user and handles error responses.
    *   `login(email, password)`: Establishes session cookie.
    *   `logout()`: Clears session.
    *   `requestPasswordReset(email)`: Sends password reset email.
    *   `resetPassword(newPassword)`: Updates password for authenticated reset session.
*   **Middleware:** `middleware.ts` to intercept requests to `/dashboard/*`, `/admin/*`, and `/provider/*` and redirect to `/login` if no session exists or role is insufficient.

## 5. Acceptance Criteria
1.  Public visitors can view the Landing Page and navigate to the Auth flows via CTAs.
2.  User can register an account with an email and password.
3.  A corresponding row is automatically created in the `profiles` table with the requested role (Client or Provider).
4.  User can log in and log out successfully.
5.  Unauthenticated users attempting to access `/dashboard` are redirected to `/login`.
6.  Client users attempting to access `/admin` are redirected to an unauthorized or home page.
7.  A user can request a password reset email and set a new password successfully.
