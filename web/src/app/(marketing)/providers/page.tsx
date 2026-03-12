import Link from "next/link"
import { getVerifiedProviders, type PublicProvider } from "@/app/actions/providers"
import { Star, Clock, Globe, DollarSign, Search, ChevronRight, Flame } from "lucide-react"

// ─── Static filter options ────────────────────────────────────────────────────
const SERVICES = ["Company Formation", "Tax Advisory", "Banking Setup", "Legal Compliance", "Nominee Services", "Virtual Office", "Accounting", "Visa & Immigration"]

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({ provider }: { provider: PublicProvider }) {
    const stars = Math.round(provider.rating_avg)
    return (
        <Link href={`/providers/${provider.id}`}
            className="group flex flex-col rounded-3xl border border-white/10 bg-[#060d1f]/60 p-6 backdrop-blur-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors truncate">
                        {provider.company_name}
                    </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </div>

            {/* Bio */}
            {provider.bio && (
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {provider.bio}
                </p>
            )}

            {/* Services */}
            {provider.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.services.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-300 text-[11px] font-medium">
                            {s}
                        </span>
                    ))}
                    {provider.services.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[11px]">
                            +{provider.services.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer stats */}
            <div className="flex items-center gap-4 pt-3 border-t border-white/5 text-xs text-slate-500">
                {/* Rating */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < stars ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                    ))}
                    <span className="ml-1 text-slate-400">{provider.review_count > 0 ? `(${provider.review_count})` : "New"}</span>
                </div>
                {/* Response time */}
                <div className="flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3" />
                    <span>{provider.response_time_hours}h</span>
                </div>
                {/* Countries */}
                {provider.countries.length > 0 && (
                    <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{provider.countries.length}</span>
                    </div>
                )}
            </div>
        </Link>
    )
}

import { createServerSupabaseClient } from "@/lib/supabase/server"

// ─── Page ─────────────────────────────────────────────────────────────────────
export const metadata = {
    title: "Provider Directory | XbandGlobal",
    description: "Discover verified incorporation service providers on XbandGlobal. Filter by country, pricing, and services.",
}

interface PageProps {
    searchParams: Promise<{ country?: string; rating?: string; service?: string }>
}

export default async function ProvidersPage({ searchParams }: PageProps) {
    const params = await searchParams
    const providers = await getVerifiedProviders({
        countryCode: params.country,
        minRating: params.rating ? parseFloat(params.rating) : undefined,
        service: params.service,
    })

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    let hasActiveSubscription = false

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, has_active_subscription")
            .eq("id", user.id)
            .single()
        hasActiveSubscription = profile?.role === "admin" || (profile?.has_active_subscription ?? false)
    }

    const displayProviders = providers.map(p => ({
        ...p,
        company_name: hasActiveSubscription ? p.company_name : `${p.company_name.charAt(0)}********`
    }))

    const activeFilters = [params.country, params.rating, params.service].filter(Boolean).length

    return (
        <main className="min-h-screen bg-[#020813]">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden border-b border-white/5 pb-16 pt-24">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />
                <div className="relative mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400 mb-6">
                            <Flame className="w-3.5 h-3.5" /> Verified Experts Only
                        </span>
                        <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl tracking-tight">
                            Find your incorporation<br />
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">expert</span>
                        </h1>
                        <p className="mt-4 max-w-xl mx-auto text-slate-400 text-sm sm:text-base">
                            Browse {displayProviders.length > 0 ? displayProviders.length : "verified"} specialists in company formation, tax advisory, and global compliance — all background-checked by XbandGlobal.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Body ── */}
            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* ── Filter Sidebar ── */}
                    <aside className="lg:w-56 shrink-0">
                        <div className="sticky top-6 space-y-6">

                            <div>
                                <p className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 mb-3">Min Rating</p>
                                <div className="space-y-1.5">
                                    {[undefined, 3, 4, 5].map(r => (
                                        <Link key={String(r)} href={buildFilterUrl(params, { rating: r?.toString() })}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${params.rating === r?.toString() || (!params.rating && r === undefined) ? "bg-blue-500/15 text-blue-300 border border-blue-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                                            {r ? <><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{r}+ Stars</> : "Any Rating"}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 mb-3">Service</p>
                                <div className="space-y-1.5">
                                    <Link href={buildFilterUrl(params, { service: undefined })}
                                        className={`block px-3 py-2 rounded-xl text-sm transition-colors ${!params.service ? "bg-blue-500/15 text-blue-300 border border-blue-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                                        All Services
                                    </Link>
                                    {SERVICES.map(svc => (
                                        <Link key={svc} href={buildFilterUrl(params, { service: svc })}
                                            className={`block px-3 py-2 rounded-xl text-sm transition-colors ${params.service === svc ? "bg-blue-500/15 text-blue-300 border border-blue-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                                            {svc}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {activeFilters > 0 && (
                                <Link href="/providers" className="block text-center text-xs text-red-400 hover:text-red-300 transition-colors py-2">
                                    ✕ Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
                                </Link>
                            )}
                        </div>
                    </aside>

                    {/* ── Provider Grid ── */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-slate-400">
                                <span className="text-white font-semibold">{displayProviders.length}</span> provider{displayProviders.length !== 1 ? "s" : ""} found
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Search className="w-3.5 h-3.5" /> Sorted by rating
                            </div>
                        </div>

                        {displayProviders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] py-24 text-center">
                                <Search className="w-12 h-12 text-slate-700 mb-4" />
                                <h3 className="text-white font-semibold text-lg">No providers found</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-xs">
                                    Try adjusting your filters or{" "}
                                    <Link href="/providers" className="text-blue-400 hover:underline">clear all filters</Link>
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {displayProviders.map(p => <ProviderCard key={p.id} provider={p} />)}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}

// ─── Helper: build filter URL preserving existing params ──────────────────────
function buildFilterUrl(
    current: { country?: string; rating?: string; service?: string },
    overrides: { country?: string; rating?: string; service?: string }
): string {
    const next = { ...current, ...overrides }
    const qs = Object.entries(next)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
        .join("&")
    return qs ? `/providers?${qs}` : "/providers"
}
