import Link from "next/link"
import { getMyLeads } from "@/app/actions/leads"
import type { LeadWithReviewFlag } from "./types"
import { getReviewedLeadIds } from "@/app/actions/reviews"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageSquare } from "lucide-react"
import LeadsWithReview from "./LeadsWithReview"

export const metadata = {
    title: "My Messages | XbandGlobal",
}

// LeadWithReviewFlag is now defined in ./types to avoid circular imports

export default async function ClientLeadsPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const leads = await getMyLeads()
    const reviewedIds = await getReviewedLeadIds(leads.map(l => l.id))

    const leadsWithFlags: LeadWithReviewFlag[] = leads.map(l => ({
        ...l,
        hasReview: reviewedIds.has(l.id),
    }))

    return (
        <div className="min-h-screen bg-[#020813] py-16 px-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white">My Messages</h1>
                    <p className="text-slate-400 mt-2">Providers you&apos;ve contacted through XbandGlobal.</p>
                </div>

                {leadsWithFlags.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] py-24 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-700 mb-4" />
                        <h3 className="text-white font-semibold text-lg">No messages yet</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs">
                            Browse verified providers and contact one to get started.
                        </p>
                        <Link
                            href="/providers"
                            className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-medium transition-all"
                        >
                            Browse Providers
                        </Link>
                    </div>
                ) : (
                    <LeadsWithReview
                        leads={leadsWithFlags}
                    />
                )}
            </div>
        </div>
    )
}
