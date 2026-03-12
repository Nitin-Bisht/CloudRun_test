import { redirect } from "next/navigation"
import { BadgeCheck, Coins, Layers3, Sparkles, UserRound, ArrowRight, Activity, Globe, Compass } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import Link from "next/link"

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    if (!profile) {
        return (
            <DashboardShell userEmail={user.email ?? ""}>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="w-full max-w-xl rounded-[2rem] border border-red-500/20 bg-red-500/5 p-12 text-center backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                        <h1 className="text-3xl font-bold text-white tracking-tight">Profile anomaly detected</h1>
                        <p className="mt-4 text-slate-400 font-light leading-relaxed">
                            Secured connection established, but local identity could not be verified. Please contact strategic support to restore access.
                        </p>
                    </div>
                </div>
            </DashboardShell>
        )
    }

    // Role-based routing enforcement
    if (profile.role === "provider") {
        const { data: providerRow } = await supabase
            .from("providers")
            .select("id")
            .eq("profile_id", user.id)
            .maybeSingle()

        if (!providerRow) {
            redirect("/dashboard/onboarding")
        }
    }

    const metrics = [
        {
            title: "Operating Role",
            value: profile.role,
            icon: UserRound,
            accent: "from-blue-500 to-indigo-600",
            glow: "bg-blue-500/20",
        },
        {
            title: "Available Capital",
            value: String(profile.credits ?? 0),
            icon: Coins,
            accent: "from-amber-400 to-amber-600",
            glow: "bg-amber-500/20",
            suffix: " CRD",
        },
        {
            title: "System Status",
            value: "Optimal",
            icon: Activity,
            accent: "from-emerald-400 to-teal-500",
            glow: "bg-emerald-500/20",
        }
    ]

    return (
        <DashboardShell userEmail={user.email ?? ""}>
            <div className="mx-auto w-full max-w-6xl space-y-10 pb-20">
                {/* --- HEADER: Command Center --- */}
                <header className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#020614]/60 p-8 sm:p-12 shadow-[0_0_120px_rgba(0,0,0,0.8)] backdrop-blur-3xl rise-in">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,210,255,0.08),transparent_50%)]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between z-10">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] pl-2 pr-4 py-1.5 text-[10px] font-display uppercase tracking-[0.3em] text-primary backdrop-blur-md shadow-[0_0_20px_rgba(0,210,255,0.1)]">
                                <span className="relative flex h-1.5 w-1.5 ml-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                                </span>
                                Command Center Active
                            </span>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl lg:text-6xl glow-text leading-[1.1]">
                                    Platform Overview
                                </h1>
                                <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-slate-400 sm:text-base">
                                    Welcome back, {profile.first_name || "Operator"}. Your workspace is secure and ready for global execution.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                        <Globe className="w-64 h-64 text-primary" strokeWidth={0.5} />
                    </div>
                </header>

                {/* --- METRICS: The Data Layer --- */}
                <section className="grid gap-5 md:grid-cols-3">
                    {metrics.map((item, idx) => (
                        <article
                            key={item.title}
                            className={`rise-in rise-delay-${idx + 1} group relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#060D1E]/40 p-7 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-[#060D1E]/60`}
                        >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent mix-blend-overlay" />
                            <div className={`pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r ${item.accent} [mask-image:linear-gradient(to_bottom_right,white,transparent)]`} />

                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-500 group-hover:scale-110 shadow-lg ${item.accent}`}>
                                        <item.icon className="h-5 w-5 text-white drop-shadow-md" strokeWidth={2} />
                                    </span>
                                    <div className={`absolute top-6 right-6 h-20 w-20 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-40 pointer-events-none ${item.glow}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-display uppercase tracking-[0.25em] text-slate-500">{item.title}</p>
                                    <p className="text-3xl font-medium tracking-tight text-white capitalize flex items-baseline gap-2">
                                        {item.value}
                                        {item.suffix && <span className="text-sm font-display tracking-widest text-slate-500 uppercase">{item.suffix}</span>}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                {/* --- WORKFLOW: Strategic Action Center --- */}
                <section className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-[#020614]/40 p-8 backdrop-blur-3xl shadow-xl sm:p-10 rise-in rise-delay-3">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_70%)]" />
                    <div className="relative z-10 mb-8 flex items-center gap-3">
                        <Layers3 className="h-6 w-6 text-primary" strokeWidth={1.5} />
                        <h2 className="text-2xl font-semibold tracking-tight text-white">Strategic Operations</h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3 relative z-10">
                        <Link href="/dashboard/countries" className="group rounded-2xl border border-white/5 bg-[#060D1E]/60 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
                            <Compass className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors mb-4" />
                            <p className="text-base font-medium text-white tracking-tight group-hover:text-primary transition-colors">Jurisdiction Discovery</p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-400">Identify optimal corporate structures based on your strategic requirements and capital allocations.</p>
                        </Link>

                        <Link href="/dashboard/admin/providers" className="group rounded-2xl border border-white/5 bg-[#060D1E]/60 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
                            <UserRound className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors mb-4" />
                            <p className="text-base font-medium text-white tracking-tight group-hover:text-primary transition-colors">Provider Intelligence</p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-400">Compare vetted institutional providers using cryptographically-verified performance metrics.</p>
                        </Link>

                        <div className="group rounded-2xl border border-white/5 bg-[#060D1E]/60 p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] cursor-not-allowed opacity-70">
                            <BadgeCheck className="h-6 w-6 text-slate-500 mb-4" />
                            <p className="text-base font-medium text-white tracking-tight">Execution Handoff</p>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500">Deploy capital and initiate direct operational engagement with selected jurisdictional partners. (Locked)</p>
                        </div>
                    </div>
                </section>

                {/* --- FUTURE: The Horizon --- */}
                <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent p-8 sm:p-10 rise-in rise-delay-4 group">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,210,255,0.15),transparent_60%)] group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <p className="inline-flex items-center gap-2 text-[10px] font-display uppercase tracking-[0.25em] text-primary">
                                <Sparkles className="h-3.5 w-3.5" /> Upcoming Protocol Epics
                            </p>
                            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Architecting the future of global expansion</h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300/80">
                                Additional analytics vectors, encrypted provider workflows, and administrative control surfaces will initialize here automatically as the core protocol upgrades.
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center justify-center">
                            <div className="relative flex items-center justify-center h-24 w-24 rounded-full border border-primary/20 bg-primary/5">
                                <div className="absolute inset-0 rounded-full border border-primary/40 animate-[spin_10s_linear_infinite] border-t-transparent border-l-transparent" />
                                <div className="absolute inset-2 rounded-full border border-primary/30 animate-[spin_15s_linear_infinite_reverse] border-b-transparent border-r-transparent" />
                                <Layers3 className="h-8 w-8 text-primary shadow-[0_0_15px_rgba(0,210,255,0.4)]" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardShell>
    )
}

