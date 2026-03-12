// ─── Shared types for the Leads dashboard ────────────────────────────────────

import type { LeadWithProvider } from "@/app/actions/leads"

export interface LeadWithReviewFlag extends LeadWithProvider {
    hasReview: boolean
}
