import { adminGetLeads } from "@/app/actions/admin"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageSquare, CheckCircle2, Eye, Reply, XCircle, RotateCcw } from "lucide-react"
import type { LeadStatus } from "@/app/actions/leads"
import RefundButton from "./RefundButton"

export const metadata = { title: "Lead Management | Admin" }

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: typeof MessageSquare }> = {
    new: { label: "New", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: MessageSquare },
    viewed: { label: "Viewed", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Eye },
    responded: { label: "Responded", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Reply },
    closed: { label: "Closed", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: CheckCircle2 },
    refunded: { label: "Refunded", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: RotateCcw },
}

export default async function AdminLeadsPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from("profiles").select("email, role").eq("id", user.id).single()
    if (profile?.role !== "admin") redirect("/unauthorized")

    const leads = await adminGetLeads()

    return (
        <DashboardShell userEmail={profile?.email ?? ""} userRole="admin">
            <div className="mx-auto w-full max-w-6xl space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <MessageSquare className="w-8 h-8 text-blue-500" />
                            Lead Management
                        </h1>
                        <p className="mt-2 text-slate-400">All platform leads. Issue refunds on disputed contacts.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-400">
                        {leads.length} total leads
                    </div>
                </header>

                {/* Table */}
                {leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] py-24 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-400">No leads on the platform yet.</p>
                    </div>
                ) : (
                    <div className="bg-[#060D1E]/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Client</th>
                                    <th className="px-6 py-4 font-medium">Provider</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Credits</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leads.map((lead) => {
                                    const cfg = STATUS_CONFIG[lead.status]
                                    const Icon = cfg.icon
                                    return (
                                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                                            {/* Client */}
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white text-sm">
                                                    {lead.client?.full_name ?? "—"}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">{lead.client?.email}</p>
                                            </td>

                                            {/* Provider */}
                                            <td className="px-6 py-4 text-slate-200">
                                                {lead.provider?.company_name ?? "—"}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                                                    <Icon className="w-3 h-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>

                                            {/* Credits */}
                                            <td className="px-6 py-4 text-slate-400">
                                                {lead.credits_spent}
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                {lead.status !== "refunded" && (
                                                    <RefundButton leadId={lead.id} />
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardShell>
    )
}
