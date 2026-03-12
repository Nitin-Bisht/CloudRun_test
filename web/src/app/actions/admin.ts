"use server"

// ─── Admin Server Actions ─────────────────────────────────────────────────────
// Role: Backend Architect (skill: backend-architect)
// All actions enforce role = 'admin' before executing.

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { LeadStatus } from "@/app/actions/leads"
import { sendLeadRefundEmail } from "@/lib/email"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlatformMetrics {
    total_users: number
    total_providers: number
    verified_providers: number
    pending_providers: number
    total_leads: number
    refunded_leads: number
    total_credits_sold: number
}

export interface AdminLead {
    id: string
    message: string
    status: LeadStatus
    credits_spent: number
    created_at: string
    refunded_at: string | null
    client: {
        id: string
        email: string
        full_name: string | null
    } | null
    provider: {
        id: string
        company_name: string
    } | null
}

// ─── Helper: assert admin role ────────────────────────────────────────────────

async function requireAdmin() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { supabase: null, user: null, error: "Not authenticated" }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        return { supabase: null, user: null, error: "Admin role required" }
    }

    return { supabase, user, error: null }
}

// ─── getPlatformMetrics ───────────────────────────────────────────────────────

/**
 * Calls the get_platform_metrics() Postgres RPC.
 * Returns aggregate counts used by the admin home dashboard.
 */
export async function getPlatformMetrics(): Promise<PlatformMetrics | null> {
    const { supabase, error } = await requireAdmin()
    if (error || !supabase) return null

    const { data, error: rpcError } = await supabase.rpc("get_platform_metrics")

    if (rpcError) {
        console.error("getPlatformMetrics:", rpcError)
        return null
    }

    return data as PlatformMetrics
}

// ─── adminGetLeads ────────────────────────────────────────────────────────────

/**
 * Fetches all leads with joined client profile and provider name.
 * Optionally filter by status.
 */
export async function adminGetLeads(
    statusFilter?: LeadStatus
): Promise<AdminLead[]> {
    const { supabase, error } = await requireAdmin()
    if (error || !supabase) return []

    let query = supabase
        .from("leads")
        .select(`
            id, message, status, credits_spent, created_at, refunded_at,
            profiles!leads_client_id_fkey(id, email, full_name),
            providers(id, company_name)
        `)
        .order("created_at", { ascending: false })

    if (statusFilter) {
        query = query.eq("status", statusFilter)
    }

    const { data, error: queryError } = await query

    if (queryError) {
        console.error("adminGetLeads:", queryError)
        return []
    }

    return (data ?? []).map((l: Record<string, unknown>) => ({
        id: l.id as string,
        message: l.message as string,
        status: l.status as LeadStatus,
        credits_spent: l.credits_spent as number,
        created_at: l.created_at as string,
        refunded_at: l.refunded_at as string | null,
        client: l.profiles as AdminLead["client"] | null,
        provider: l.providers as AdminLead["provider"] | null,
    }))
}

// ─── adminRefundLead ─────────────────────────────────────────────────────────

/**
 * Calls the admin_refund_lead(p_lead_id) Postgres RPC.
 * Atomically refunds the lead and returns 1 credit to the client.
 */
export async function adminRefundLead(
    leadId: string
): Promise<{ success: boolean; error?: string }> {
    const { supabase, error: authError } = await requireAdmin()
    if (authError || !supabase) return { success: false, error: authError ?? "Unauthorized" }

    const { error: rpcError } = await supabase.rpc("admin_refund_lead", {
        p_lead_id: leadId,
    })

    if (rpcError) {
        console.error("adminRefundLead:", rpcError)
        const msg = rpcError.message ?? ""
        if (msg.includes("already refunded")) return { success: false, error: "This lead has already been refunded." }
        if (msg.includes("not found")) return { success: false, error: "Lead not found." }
        return { success: false, error: "Refund failed. Please try again." }
    }

    revalidatePath("/dashboard/admin/leads")
    revalidatePath("/dashboard/leads") // refresh client view too

        // Fire refund confirmation email to the client (non-blocking)
        ; (async () => {
            try {
                const { data: leadData } = await supabase
                    .from("leads")
                    .select("credits_spent, providers(company_name), profiles!leads_client_id_fkey(email)")
                    .eq("id", leadId)
                    .single()
                const clientEmail = (leadData?.profiles as unknown as { email: string } | null)?.email
                const providerName = (leadData?.providers as unknown as { company_name: string } | null)?.company_name ?? "the provider"
                const credits = leadData?.credits_spent ?? 1
                if (clientEmail) {
                    await sendLeadRefundEmail(clientEmail, providerName, credits)
                }
            } catch (e) {
                console.error("Refund email failed (non-fatal):", e)
            }
        })()

    return { success: true }
}
