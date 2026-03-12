import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProviderOnboardingForm from "@/components/onboarding/ProviderOnboardingForm"

export const metadata = {
    title: "Set Up Your Profile | XbandGlobal",
}

export default async function OnboardingPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Check if they have a profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    // Only providers need to onboard
    if (!profile || profile.role !== "provider") redirect("/dashboard")

    // If provider already applied, redirect to dashboard
    const { data: existing } = await supabase
        .from("providers")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle()

    if (existing) redirect("/dashboard")

    return <ProviderOnboardingForm />
}
