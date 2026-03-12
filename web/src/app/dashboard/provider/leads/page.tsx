import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getMyReceivedLeads, type LeadWithClient } from "@/app/actions/leads"
import { ProviderLeadActions } from "./ProviderLeadActions"
import { Inbox, Clock, User, Zap } from "lucide-react"

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    new: { label: "New", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    viewed: { label: "Viewed", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    responded: { label: "Responded", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    closed: { label: "Closed", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
    refunded: { label: "Refunded", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
}

function LeadInboxCard({ lead }: { lead: LeadWithClient }) {
    const badge = STATUS_BADGE[lead.status] ?? STATUS_BADGE.new
    const date = new Date(lead.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

    return (
        <div className="rounded-3xl border border-white/10 bg-[#060d1f]/60 p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(lead.client?.full_name ?? lead.client?.email ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white font-semibold flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {lead.client?.full_name ?? "Anonymous Client"}
                        </p>
                        <p className="text-xs text-slate-500">{lead.client?.email}</p>
                    </div>
                </div>
                <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${badge.color}`}>
                    {badge.label}
                </span>
            </div>

            {/* Message */}
            <div className="bg-white/[0.03] rounded-2xl px-4 py-3 mb-4 border border-white/5">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {lead.message}
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{date}</span>
                    <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" />{lead.credits_spent} credit</span>
                </div>
                <ProviderLeadActions leadId={lead.id} currentStatus={lead.status} />
            </div>
        </div>
    )
}

export const metadata = { title: "Lead Inbox | XbandGlobal" }

export default async function ProviderLeadsPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    if (profile?.role !== "provider" && profile?.role !== "admin") redirect("/dashboard")

    const leads = await getMyReceivedLeads()
    const newCount = leads.filter(l => l.status === "new").length

    return (
        <div className="min-h-screen bg-[#020813] py-16 px-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            Lead Inbox
                            {newCount > 0 && (
                                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-sm font-semibold">
                                    {newCount} new
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-400 mt-2">
                            {leads.length} total lead{leads.length !== 1 ? "s" : ""} received
                        </p>
                    </div>
                </div>

                {leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] py-24 text-center">
                        <Inbox className="w-12 h-12 text-slate-700 mb-4" />
                        <h3 className="text-white font-semibold text-lg">No leads yet</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs">
                            Once clients contact you through your XbandGlobal profile, their messages will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leads.map(lead => <LeadInboxCard key={lead.id} lead={lead} />)}
                    </div>
                )}
            </div>
        </div>
    )
}
