"use server"

// ─── Lead Server Actions ──────────────────────────────────────────────────────
// Role: Backend Architect (skill: backend-architect)

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { sendNewLeadEmail } from "@/lib/email"

export type LeadStatus = "new" | "viewed" | "responded" | "closed" | "refunded"

export interface LeadWithProvider {
    id: string
    message: string
    status: LeadStatus
    credits_spent: number
    created_at: string
    responded_at: string | null
    provider: {
        id: string
        company_name: string
        pricing_band: string | null
    } | null
}

export interface LeadWithClient {
    id: string
    message: string
    status: LeadStatus
    credits_spent: number
    created_at: string
    responded_at: string | null
    client: {
        id: string
        full_name: string | null
        email: string
    } | null
}

// ─── Client: Send a Lead ──────────────────────────────────────────────────────

/**
 * Atomically deducts 1 credit and creates a lead via Supabase RPC.
 * Triggers an email notification to the provider.
 */
export async function sendLead(
    providerId: string,
    message: string
): Promise<{ success: boolean; leadId?: string; error?: string }> {
    if (!message.trim() || message.length < 20) {
        return { success: false, error: "Message must be at least 20 characters." }
    }
    if (message.length > 1000) {
        return { success: false, error: "Message must be under 1,000 characters." }
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    // Guard: only clients can send leads
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, credits, full_name, email")
        .eq("id", user.id)
        .single()
    if (!profile) return { success: false, error: "Profile not found" }
    if (profile.role !== "client") return { success: false, error: "Only clients can contact providers" }
    if (profile.credits < 1) return { success: false, error: "Insufficient credits" }

    // Guard: can't contact the same provider twice
    const { data: existing } = await supabase
        .from("leads")
        .select("id")
        .eq("client_id", user.id)
        .eq("provider_id", providerId)
        .maybeSingle()
    if (existing) return { success: false, error: "You have already contacted this provider" }

    // Atomic RPC — uses the send_lead PostgreSQL function
    const { data: leadId, error: rpcError } = await supabase
        .rpc("send_lead", {
            p_client_id: user.id,
            p_provider_id: providerId,
            p_message: message.trim(),
        })

    if (rpcError) {
        console.error("sendLead RPC error:", rpcError)
        if (rpcError.message.includes("Insufficient credits")) {
            return { success: false, error: "Insufficient credits. Please top up your account." }
        }
        if (rpcError.message.includes("already contacted")) {
            return { success: false, error: "You have already contacted this provider" }
        }
        if (rpcError.message.includes("not verified")) {
            return { success: false, error: "This provider is currently unavailable for contact." }
        }
        return { success: false, error: "Failed to send message. Please try again." }
    }

    // Notify provider by email via centralized helper (non-blocking)
    notifyProviderByEmail(providerId, profile.full_name ?? profile.email, message).catch(
        (e: unknown) => console.error("Email notification failed (non-fatal):", e)
    )

    revalidatePath("/dashboard/leads")
    revalidatePath(`/providers/${providerId}`)
    return { success: true, leadId: leadId as string }
}

// ─── Client: Get Sent Leads ───────────────────────────────────────────────────

export async function getMyLeads(): Promise<LeadWithProvider[]> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from("leads")
        .select(`
            id, message, status, credits_spent, created_at, responded_at,
            providers(id, company_name, pricing_band)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

    if (error) { console.error("getMyLeads:", error); return [] }

    return (data ?? []).map((l: Record<string, unknown>) => ({
        id: l.id as string,
        message: l.message as string,
        status: l.status as LeadStatus,
        credits_spent: l.credits_spent as number,
        created_at: l.created_at as string,
        responded_at: l.responded_at as string | null,
        provider: l.providers as LeadWithProvider["provider"] | null,
    }))
}

// ─── Provider: Get Received Leads ─────────────────────────────────────────────

export async function getMyReceivedLeads(): Promise<LeadWithClient[]> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get provider record for this user
    const { data: provider } = await supabase
        .from("providers")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle()
    if (!provider) return []

    const { data, error } = await supabase
        .from("leads")
        .select(`
            id, message, status, credits_spent, created_at, responded_at,
            profiles!leads_client_id_fkey(id, full_name, email)
        `)
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false })

    if (error) { console.error("getMyReceivedLeads:", error); return [] }

    return (data ?? []).map((l: Record<string, unknown>) => ({
        id: l.id as string,
        message: l.message as string,
        status: l.status as LeadStatus,
        credits_spent: l.credits_spent as number,
        created_at: l.created_at as string,
        responded_at: l.responded_at as string | null,
        client: l.profiles as LeadWithClient["client"] | null,
    }))
}

// ─── Provider: Update Lead Status ─────────────────────────────────────────────

export async function updateLeadStatus(
    leadId: string,
    status: Exclude<LeadStatus, "new" | "refunded">
): Promise<{ success: boolean; error?: string }> {
    const allowedStatuses = new Set(["viewed", "responded", "closed"])
    if (!allowedStatuses.has(status)) {
        return { success: false, error: "Invalid lead status transition" }
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { error } = await supabase
        .from("leads")
        .update({
            status,
            responded_at: status === "responded" ? new Date().toISOString() : undefined,
        })
        .eq("id", leadId)

    if (error) { console.error("updateLeadStatus:", error); return { success: false, error: error.message } }

    revalidatePath("/dashboard/provider/leads")
    return { success: true }
}

// ─── Email Notification (via lib/email.ts) ───────────────────────────────────

async function notifyProviderByEmail(
    providerId: string,
    clientName: string,
    message: string
): Promise<void> {
    // Fetch provider email + company name
    const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
    const { data: provider } = await serviceSupabase
        .from("providers")
        .select("company_name, profiles(email)")
        .eq("id", providerId)
        .single()

    if (!provider) return
    const providerEmail = (provider.profiles as unknown as { email: string } | null)?.email
    if (!providerEmail) return

    await sendNewLeadEmail(
        providerEmail,
        provider.company_name as string,
        clientName,
        message
    )
}
