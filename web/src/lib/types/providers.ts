// ─── Provider Types ─────────────────────────────────────────────────────────
// Defined by: Backend Architect (using backend-architect skill)

export type ProviderStatus = "pending" | "verified" | "rejected" | "suspended"

export interface Provider {
    id: string
    profile_id: string
    company_name: string
    bio: string | null
    website_url: string | null
    status: ProviderStatus
    pricing_band: string | null
    services: string[]
    languages: string[]
    response_time_hours: number
    rating_avg: number
    review_count: number
    created_at: string
    updated_at: string
}

export interface ProviderWithProfile extends Provider {
    profiles: {
        email: string
        full_name: string | null
        avatar_url: string | null
    }
}

export interface ProviderDocument {
    id: string
    provider_id: string
    uploaded_by: string
    document_type: string
    storage_path: string
    created_at: string
}

export interface ProviderApplicationInput {
    company_name: string
    bio: string
    website_url?: string
    pricing_band: string
    services: string[]
    languages: string[]
    response_time_hours: number
}
