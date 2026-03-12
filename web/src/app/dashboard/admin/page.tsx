import { getPlatformMetrics } from "@/app/actions/admin"
import { adminGetProviders } from "@/app/actions/providers"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
    Users, Building2, CheckCircle2, Clock, MessageSquare,
    RotateCcw, CreditCard, ShieldCheck, ListChecks, Globe,
    ArrowUpRight, Sparkles, Activity
} from "lucide-react"

export const metadata = { title: "Admin Overview | XbandGlobal" }

interface StatCardProps {
    label: string
    value: number | string
    icon: LucideIcon
    accent: string
    href?: string
    delay?: number
}

function StatCard({ label, value, icon: Icon, accent, href, delay = 0 }: StatCardProps) {
    const inner = (
        <div
            className={`group relative overflow-hidden rounded-2xl border bg-[#060D1E]/40 p-6 backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,0,0,0.6)] ${accent} animate-in fade-in slide-in-from-bottom-4 fill-mode-both`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Top gradient reveal */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-300 transition-colors">
                        {label}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white drop-shadow-md">
                            {value?.toLocaleString() ?? "—"}
                        </span>
                    </div>
                </div>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 shadow-inner overflow-hidden group-hover:border-white/20 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className="relative z-10 h-5 w-5 text-slate-400 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                </div>
            </div>

            {href && (
                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/[0.04] pt-4">
                    <span className="font-display text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                        View Details
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-slate-600 group-hover:text-white transition-colors" />
                </div>
            )}
        </div>
    )

    return href ? <Link href={href} className="block outline-none">{inner}</Link> : inner
}

const QUICK_LINKS = [
    {
        title: "Provider Queue",
        desc: "Review pending applications and verify providers.",
        href: "/dashboard/admin/providers",
        icon: ShieldCheck,
        accent: "border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/5",
        iconColor: "text-blue-400",
    },
    {
        title: "Lead Management",
        desc: "View leads and issue refunds on disputes.",
        href: "/dashboard/admin/leads",
        icon: ListChecks,
        accent: "border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/5",
        iconColor: "text-emerald-400",
    },
    {
        title: "Jurisdictions",
        desc: "Manage countries and onboarding logic.",
        href: "/dashboard/admin/countries",
        icon: Globe,
        accent: "border-amber-500/20 hover:border-amber-400/40 hover:bg-amber-500/5",
        iconColor: "text-amber-400",
    },
]

export default async function AdminOverviewPage() {
    // Role gate
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from("profiles").select("email, role").eq("id", user.id).single()
    if (profile?.role !== "admin") redirect("/unauthorized")

    // Fetch data
    const [metrics, providers] = await Promise.all([
        getPlatformMetrics(),
        adminGetProviders("pending"),
    ])

    const stats: StatCardProps[] = [
        { label: "Total Users", value: metrics?.total_users ?? 0, icon: Users, accent: "border-white/10" },
        {
            label: "Verified Providers", value: metrics?.verified_providers ?? 0,
            icon: CheckCircle2, accent: "border-emerald-500/20"
        },
        {
            label: "Pending Approvals", value: providers.length,
            icon: Clock, accent: "border-amber-500/20", href: "/dashboard/admin/providers"
        },
        {
            label: "Total Leads", value: metrics?.total_leads ?? 0,
            icon: MessageSquare, accent: "border-white/10", href: "/dashboard/admin/leads"
        },
        {
            label: "Refunded Leads", value: metrics?.refunded_leads ?? 0,
            icon: RotateCcw, accent: "border-purple-500/20"
        },
        {
            label: "Credits Sold", value: metrics?.total_credits_sold ?? 0,
            icon: CreditCard, accent: "border-blue-500/20"
        },
    ]

    return (
        <DashboardShell userEmail={profile?.email ?? ""} userRole="admin">
            <div className="mx-auto w-full max-w-6xl space-y-12">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#020510]/60 p-8 lg:p-12 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="inline-flex items-center justify-center rounded-lg bg-blue-500/10 p-2 border border-blue-500/20">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                </div>
                                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                                    System Administrator
                                </span>
                            </div>
                            <h1 className="font-display text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                                Platform Overview
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
                                Monitor platform health, verify new service providers, and manage global operational jurisdictions. All systems operational.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 backdrop-blur-sm shadow-inner group transition-colors hover:bg-emerald-500/10">
                            <div className="relative flex h-3 w-3 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </div>
                            <div>
                                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-400/80">System Status</p>
                                <p className="font-medium text-emerald-50">Optimal Performance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div>
                    <h2 className="mb-6 font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3">
                        <Activity className="h-4 w-4" /> Global Metrics
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 100} />)}
                    </div>
                </div>

                {/* Quick Nav */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
                    <h2 className="mb-6 font-display text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-3">
                        <Sparkles className="h-4 w-4" /> Strategic Operations
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {QUICK_LINKS.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`group flex flex-col gap-4 rounded-2xl border bg-[#060D1E]/40 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg ${l.accent}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 shadow-inner ${l.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                                        <l.icon className="h-5 w-5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.02] border border-white/[0.04] group-hover:bg-white/10 transition-colors">
                                        <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="font-display text-lg font-bold text-white tracking-wide">{l.title}</p>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{l.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
