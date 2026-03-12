"use server"

// â”€â”€â”€ Provider Server Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Role: Backend Architect (skill: backend-architect)
// Handles: submitProviderApplication, uploadProviderDocument,
//           adminGetProviders, adminUpdateProviderStatus

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendProviderStatusEmail } from "@/lib/email"
import type {
    Provider,
    ProviderWithProfile,
    ProviderApplicationInput,
    ProviderStatus,
} from "@/lib/types/providers"

const ALLOWED_PROVIDER_DOC_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
])

const ALLOWED_PROVIDER_STATUS_TRANSITIONS: Record<ProviderStatus, ProviderStatus[]> = {
    pending: ["verified", "rejected"],
    verified: ["suspended"],
    rejected: ["verified"],
    suspended: ["verified"],
}

function normalizeWebsiteUrl(value: string | null | undefined): string | null {
    if (!value) return null
    try {
        const parsed = new URL(value)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
        return parsed.toString()
    } catch {
        return null
    }
}

// â”€â”€â”€ Read â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Fetches the signed-in user's provider profile, or null if they haven't applied. */
export async function getMyProviderProfile(): Promise<Provider | null> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle()

    if (error) {
        console.error("getMyProviderProfile:", error)
        return null
    }
    return data as Provider | null
}

/** Admin: Fetch all providers, optionally filtered by status, joined with profile email. */
export async function adminGetProviders(status?: ProviderStatus): Promise<ProviderWithProfile[]> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: actorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    if (actorProfile?.role !== "admin") return []

    let query = supabase
        .from("providers")
        .select("*, profiles(email, full_name, avatar_url)")
        .order("created_at", { ascending: true })

    if (status) {
        query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
        console.error("adminGetProviders:", error)
        return []
    }
    return (data ?? []) as ProviderWithProfile[]
}

/** Get a signed URL for an admin to download a provider document. */
export async function getProviderDocumentUrl(storagePath: string): Promise<string | null> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: actorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    if (actorProfile?.role !== "admin") return null

    const { data, error } = await supabase.storage
        .from("provider-docs")
        .createSignedUrl(storagePath, 60 * 60) // 1 hour

    if (error) {
        console.error("getProviderDocumentUrl:", error)
        return null
    }
    return data.signedUrl
}

// â”€â”€â”€ Write â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Step 1: Upload a provider document to Supabase Storage.
 * Returns the storage path on success.
 * Called client-side before submitting the application.
 */
export async function getUploadSignedUrl(fileName: string, contentType: string): Promise<{ path: string; signedUrl: string } | null> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    if (!ALLOWED_PROVIDER_DOC_TYPES.has(contentType.toLowerCase())) {
        console.error("getUploadSignedUrl: unsupported file type", contentType)
        return null
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filePath = `${user.id}/${Date.now()}-${safeFileName}`

    const { data, error } = await supabase.storage
        .from("provider-docs")
        .createSignedUploadUrl(filePath)

    if (error) {
        console.error("getUploadSignedUrl:", error)
        return null
    }
    return { path: filePath, signedUrl: data.signedUrl }
}

/**
 * Step 2: Submit the provider application.
 * Inserts into `providers` + `provider_documents`. Sets status to `pending`.
 */
export async function submitProviderApplication(
    data: ProviderApplicationInput,
    documentPath: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: actorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    if (actorProfile?.role !== "provider" && actorProfile?.role !== "admin") {
        return { success: false, error: "Only providers can submit applications" }
    }

    const normalizedWebsiteUrl = normalizeWebsiteUrl(data.website_url ?? null)
    if (data.website_url && !normalizedWebsiteUrl) {
        return { success: false, error: "Website URL must start with http:// or https://" }
    }

    // Insert provider row
    const { data: provider, error: providerError } = await supabase
        .from("providers")
        .insert({
            profile_id: user.id,
            company_name: data.company_name,
            bio: data.bio,
            website_url: normalizedWebsiteUrl,
            pricing_band: data.pricing_band,
            services: data.services,
            languages: data.languages,
            response_time_hours: data.response_time_hours,
            status: "pending",
        })
        .select()
        .single()

    if (providerError) {
        console.error("submitProviderApplication â€“ provider insert:", providerError)
        return { success: false, error: providerError.message }
    }

    // Insert document record
    const { error: docError } = await supabase
        .from("provider_documents")
        .insert({
            provider_id: provider.id,
            uploaded_by: user.id,
            document_type: "license",
            storage_path: documentPath,
        })

    if (docError) {
        console.error("submitProviderApplication - document insert:", docError)
        await supabase.from("providers").delete().eq("id", provider.id)
        return { success: false, error: "Failed to attach provider document record" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/providers")
    revalidatePath("/admin/providers")
    return { success: true }
}

/**
 * Admin state-machine transition:  pending â†’ verified | rejected, verified â†’ suspended
 * Records every decision in admin_audit_logs for accountability.
 */
export async function adminUpdateProviderStatus(
    providerId: string,
    newStatus: ProviderStatus,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    const { data: actorProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    if (actorProfile?.role !== "admin") {
        return { success: false, error: "Admin role required" }
    }

    const { data: existingProvider, error: existingProviderError } = await supabase
        .from("providers")
        .select("status")
        .eq("id", providerId)
        .single()

    if (existingProviderError || !existingProvider) {
        console.error("adminUpdateProviderStatus: fetch existing status:", existingProviderError)
        return { success: false, error: "Provider not found" }
    }

    const currentStatus = existingProvider.status as ProviderStatus
    if (!ALLOWED_PROVIDER_STATUS_TRANSITIONS[currentStatus].includes(newStatus)) {
        return {
            success: false,
            error: `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
        }
    }

    const { error: updateError } = await supabase
        .from("providers")
        .update({ status: newStatus })
        .eq("id", providerId)

    if (updateError) {
        console.error("adminUpdateProviderStatus:", updateError)
        return { success: false, error: updateError.message }
    }

    // Audit log
    await supabase.from("admin_audit_logs").insert({
        admin_id: user.id,
        action_type: `provider_status_${newStatus}`,
        target_type: "providers",
        target_id: providerId,
        metadata: { notes: notes ?? null },
    })

    revalidatePath("/dashboard/admin/providers")
    revalidatePath(`/dashboard/admin/providers/${providerId}`)
    revalidatePath("/admin/providers")
    revalidatePath(`/admin/providers/${providerId}`)
    revalidatePath("/providers")

        // Fire provider status email (non-blocking)
        ; (async () => {
            try {
                const { data: prov } = await supabase
                    .from("providers")
                    .select("company_name, profiles(email)")
                    .eq("id", providerId)
                    .single()
                const providerEmail = (prov?.profiles as unknown as { email: string } | null)?.email
                if (providerEmail && prov?.company_name) {
                    await sendProviderStatusEmail(providerEmail, prov.company_name as string, newStatus as "verified" | "rejected" | "suspended")
                }
            } catch (e) {
                console.error("Provider status email failed (non-fatal):", e)
            }
        })()

    return { success: true }
}

// ─── Public Directory Queries (Epic 5) ───────────────────────────────────────

export interface ProviderFilters {
    countryCode?: string   // e.g. "AE", "SG"
    pricingBand?: string   // e.g. "$500 - "$1,500"
    minRating?: number     // e.g. 4
    service?: string       // e.g. "Tax Advisory"
}

export interface PublicProvider {
    id: string
    company_name: string
    bio: string | null
    website_url: string | null
    pricing_band: string | null
    services: string[]
    languages: string[]
    response_time_hours: number
    rating_avg: number
    review_count: number
    countries: { code: string; name: string; flag_emoji: string | null }[]
}

/**
 * Public: Fetch all VERIFIED providers with optional filters.
 * No auth required — relies on RLS policy `public_read_verified_providers`.
 */
export async function getVerifiedProviders(filters?: ProviderFilters): Promise<PublicProvider[]> {
    const supabase = await createServerSupabaseClient()

    let query = supabase
        .from("providers")
        .select(`
            id,
            company_name,
            bio,
            website_url,
            pricing_band,
            services,
            languages,
            response_time_hours,
            rating_avg,
            review_count,
            provider_countries(
                countries(code, name, flag_emoji)
            )
        `)
        .eq("status", "verified")
        .order("rating_avg", { ascending: false })

    if (filters?.pricingBand) {
        query = query.eq("pricing_band", filters.pricingBand)
    }
    if (filters?.minRating) {
        query = query.gte("rating_avg", filters.minRating)
    }
    if (filters?.service) {
        query = query.contains("services", [filters.service])
    }

    const { data, error } = await query

    if (error) {
        console.error("getVerifiedProviders:", error)
        return []
    }

    // Flatten the nested join and apply country filter if needed
    const providers = (data ?? []).map((p: Record<string, unknown>) => {
        const rawCountries = (p.provider_countries as { countries: { code: string; name: string; flag_emoji: string | null } | null }[] | null) ?? []
        const countries = rawCountries
            .map((pc) => pc.countries)
            .filter((c): c is { code: string; name: string; flag_emoji: string | null } => c !== null)
        return {
            id: p.id as string,
            company_name: p.company_name as string,
            bio: p.bio as string | null,
            website_url: normalizeWebsiteUrl(p.website_url as string | null),
            pricing_band: p.pricing_band as string | null,
            services: p.services as string[],
            languages: p.languages as string[],
            response_time_hours: p.response_time_hours as number,
            rating_avg: p.rating_avg as number,
            review_count: p.review_count as number,
            countries,
        }
    })

    // Country filter applied after join (can't filter on nested column directly)
    if (filters?.countryCode) {
        return providers.filter(p =>
            p.countries.some(c => c.code === filters.countryCode)
        )
    }
    return providers
}

/**
 * Public: Fetch a single VERIFIED provider by ID.
 * Returns null if not found or not verified — prevents enumeration of non-verified providers.
 */
export async function getProviderProfile(providerId: string): Promise<PublicProvider | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("providers")
        .select(`
            id,
            company_name,
            bio,
            website_url,
            pricing_band,
            services,
            languages,
            response_time_hours,
            rating_avg,
            review_count,
            provider_countries(
                countries(code, name, flag_emoji)
            )
        `)
        .eq("id", providerId)
        .eq("status", "verified")
        .maybeSingle()

    if (error) {
        console.error("getProviderProfile:", error)
        return null
    }
    if (!data) return null

    const p = data as Record<string, unknown>
    const rawCountries = (p.provider_countries as { countries: { code: string; name: string; flag_emoji: string | null } | null }[] | null) ?? []
    const countries = rawCountries
        .map((pc) => pc.countries)
        .filter((c): c is { code: string; name: string; flag_emoji: string | null } => c !== null)

    return {
        id: p.id as string,
        company_name: p.company_name as string,
        bio: p.bio as string | null,
        website_url: normalizeWebsiteUrl(p.website_url as string | null),
        pricing_band: p.pricing_band as string | null,
        services: p.services as string[],
        languages: p.languages as string[],
        response_time_hours: p.response_time_hours as number,
        rating_avg: p.rating_avg as number,
        review_count: p.review_count as number,
        countries,
    }
}
