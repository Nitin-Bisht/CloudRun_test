"use server"

// ─── Reviews Server Actions ───────────────────────────────────────────────────
// Role: Backend Architect (skill: backend-architect)
// Security review: Security Auditor (skill: backend-security-coder)

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Review {
    id: string
    lead_id: string
    provider_id: string
    client_id: string
    rating: number
    comment: string | null
    created_at: string
    client_name: string | null
}

// ─── Submit a Review ──────────────────────────────────────────────────────────

/**
 * Authenticated client submits a 1-5 star review for a lead they own.
 * Guards:
 *  - Must own the lead (server-side check + RLS)
 *  - A review can only exist once per lead (UNIQUE constraint on lead_id)
 *  - lead must belong to the calling user
 * The DB trigger `refresh_provider_rating` updates providers.rating_avg automatically.
 */
export async function submitReview(
    leadId: string,
    rating: number,
    comment: string
): Promise<{ success: boolean; error?: string }> {
    // Validate inputs
    if (!leadId) return { success: false, error: "Invalid lead." }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { success: false, error: "Rating must be between 1 and 5." }
    }
    const trimmedComment = comment.trim()
    if (trimmedComment.length > 500) {
        return { success: false, error: "Comment must be under 500 characters." }
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated." }

    // Security Auditor: verify the caller owns this lead and get provider_id
    const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("id, client_id, provider_id, status")
        .eq("id", leadId)
        .eq("client_id", user.id)          // ownership enforced here
        .maybeSingle()

    if (leadError || !lead) {
        return { success: false, error: "Lead not found or you don't have permission." }
    }

    // Security Auditor: check for duplicate (belt + suspenders — UNIQUE handles DB-level)
    const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("lead_id", leadId)
        .maybeSingle()

    if (existing) {
        return { success: false, error: "You have already reviewed this provider for this lead." }
    }

    const { error: insertError } = await supabase
        .from("reviews")
        .insert({
            lead_id: leadId,
            provider_id: lead.provider_id,
            client_id: user.id,
            rating,
            comment: trimmedComment || null,
        })

    if (insertError) {
        console.error("submitReview insert error:", insertError)
        if (insertError.code === "23505") {
            return { success: false, error: "You have already reviewed this provider for this lead." }
        }
        return { success: false, error: "Failed to submit review. Please try again." }
    }

    revalidatePath("/dashboard/leads")
    revalidatePath(`/providers/${lead.provider_id}`)
    return { success: true }
}

// ─── Get All Reviews for a Provider (Public) ──────────────────────────────────

/**
 * Publicly readable — returns all reviews for a given provider, newest first.
 * Joins with profiles to get the reviewer's first name for display.
 */
export async function getReviewsForProvider(providerId: string): Promise<Review[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("reviews")
        .select(`
            id, lead_id, provider_id, client_id, rating, comment, created_at,
            profiles!reviews_client_id_fkey(full_name)
        `)
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false })

    if (error) { console.error("getReviewsForProvider:", error); return [] }

    return (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        lead_id: r.lead_id as string,
        provider_id: r.provider_id as string,
        client_id: r.client_id as string,
        rating: r.rating as number,
        comment: r.comment as string | null,
        created_at: r.created_at as string,
        client_name: (r.profiles as { full_name: string | null } | null)?.full_name ?? null,
    }))
}

// ─── Check if Current User Already Reviewed a Lead ───────────────────────────

/**
 * Returns the review ID if the current user has already reviewed the given lead,
 * otherwise null. Used in the client dashboard to hide/disable the CTA button.
 */
export async function getMyReviewForLead(leadId: string): Promise<string | null> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("lead_id", leadId)
        .eq("client_id", user.id)
        .maybeSingle()

    return data?.id ?? null
}

// ─── Get Existing Review IDs for a Set of Lead IDs (batch) ───────────────────

/**
 * Efficient batch lookup: given a list of leadIds, returns a Set of those
 * leadIds that already have a review from the current user.
 * Used in the leads dashboard to flag all leads in one query.
 */
export async function getReviewedLeadIds(leadIds: string[]): Promise<Set<string>> {
    if (leadIds.length === 0) return new Set()

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Set()

    const { data } = await supabase
        .from("reviews")
        .select("lead_id")
        .in("lead_id", leadIds)
        .eq("client_id", user.id)

    return new Set((data ?? []).map((r: { lead_id: string }) => r.lead_id))
}
