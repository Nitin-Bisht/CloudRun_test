"use server"

// Account Server Actions
// Role: Backend Architect + Backend Security Coder
//
// GDPR "Right to Erasure" implementation:
// - Anonymizes PII in profiles table (name/company/avatar/email)
// - Soft-deletes the Supabase Auth user via service-role admin client
// - Preserves financial records (leads, transactions) for audit integrity

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

/**
 * GDPR account deletion:
 * 1. Verify authenticated session
 * 2. Anonymize PII in profiles
 * 3. Soft-delete Supabase Auth user so credentials are revoked while FK-linked records remain
 * 4. Redirect to /login?deleted=true
 */
export async function deleteAccount(): Promise<{ error: string } | never> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const userId = user.id
    const redactedEmail = `deleted+${userId}@deleted.vistar.local`

    const { error: anonError } = await supabase
        .from("profiles")
        .update({
            full_name: null,
            company_name: null,
            avatar_url: null,
            email: redactedEmail,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

    if (anonError) {
        console.error("deleteAccount: profile anonymization failed:", anonError)
        return { error: "Account deletion failed. Please try again." }
    }

    const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )

    // Use soft delete so transaction-linked profile rows can remain for audit integrity.
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId, true)

    if (deleteError) {
        console.error("deleteAccount: auth deleteUser failed:", deleteError)
        return { error: "Account deletion failed. Please contact support." }
    }

    // Best effort sign-out in current session before redirect.
    await supabase.auth.signOut()

    redirect("/login?deleted=true")
}
