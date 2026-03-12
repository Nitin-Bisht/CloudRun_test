import { adminGetProviders } from "@/app/actions/providers"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ShieldCheck, Clock, CheckCircle2, XCircle, PauseCircle, Users } from "lucide-react"
import type { ProviderStatus, ProviderWithProfile } from "@/lib/types/providers"

const STATUS_CONFIG: Record<ProviderStatus, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: "Pending Review", color: "text-amber-400 border-amber-500/20 bg-amber-500/10", icon: Clock },
    verified: { label: "Verified", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "text-red-400 border-red-500/20 bg-red-500/10", icon: XCircle },
    suspended: { label: "Suspended", color: "text-slate-400 border-slate-500/20 bg-slate-500/10", icon: PauseCircle },
}

export const metadata = { title: "Provider Approval Queue | Admin" }

export default async function AdminProvidersPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from("profiles").select("email, role").eq("id", user.id).single()
    if (profile?.role !== "admin") redirect("/unauthorized")

    const providers = await adminGetProviders()

    const pending = providers.filter(p => p.status === "pending")
    const others = providers.filter(p => p.status !== "pending")

    function ProviderRow({ p }: { p: ProviderWithProfile }) {
        const cfg = STATUS_CONFIG[p.status]
        const Icon = cfg.icon
        return (
            <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                    <div>
                        <p className="font-medium text-white">{p.company_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.profiles?.email}</p>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/admin/providers/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 text-sm transition-colors">
                        Review →
                    </Link>
                </td>
            </tr>
        )
    }

    return (
        <DashboardShell userEmail={profile?.email ?? ""} userRole="admin">
            <div className="mx-auto w-full max-w-6xl space-y-8">
                <header className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                            Provider Approval Queue
                        </h1>
                        <p className="mt-2 text-slate-400">Review, verify, or reject provider applications.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-2 rounded-xl">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{pending.length} pending</span>
                    </div>
                </header>

                {providers.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.02]">
                        <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No provider applications yet.</p>
                    </div>
                ) : (
                    <div className="bg-[#060D1E]/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-white/5 border-b border-white/10 text-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Provider</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Applied</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pending.map(p => <ProviderRow key={p.id} p={p} />)}
                                {others.map(p => <ProviderRow key={p.id} p={p} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardShell>
    )
}
