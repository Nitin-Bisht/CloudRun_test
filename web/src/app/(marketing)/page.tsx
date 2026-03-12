import { LandingExperience } from "@/components/marketing/LandingExperience"
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env"
import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"

export const revalidate = 300

const getLandingMetrics = unstable_cache(
    async () => {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        })

        const [activeCountriesCountResult, verifiedProvidersCountResult, publishedReviewsCountResult] = await Promise.all([
            supabase
                .from("countries")
                .select("id", { count: "exact", head: true })
                .eq("is_active", true),
            supabase
                .from("providers")
                .select("id", { count: "exact", head: true })
                .eq("status", "verified"),
            supabase
                .from("reviews")
                .select("id", { count: "exact", head: true }),
        ])

        return {
            activeCountries: activeCountriesCountResult.count ?? 0,
            verifiedProviders: verifiedProvidersCountResult.count ?? 0,
            publishedReviews: publishedReviewsCountResult.count ?? 0,
        }
    },
    ["landing-metrics-v1"],
    { revalidate: 300 }
)

export default async function LandingPage() {
    let metrics = {
        activeCountries: 0,
        verifiedProviders: 0,
        publishedReviews: 0,
    }

    try {
        metrics = await getLandingMetrics()
    } catch (error) {
        console.error("Failed to load landing metrics", error)
    }

    return <LandingExperience metrics={metrics} />
}
