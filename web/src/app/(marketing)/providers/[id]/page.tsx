import { notFound } from "next/navigation"
import Link from "next/link"
import { getProviderProfile } from "@/app/actions/providers"
import { getReviewsForProvider } from "@/app/actions/reviews"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ContactProviderModal } from "@/components/leads/ContactProviderModal"
import {
    Star, Globe, Clock, DollarSign, ArrowLeft,
    CheckCircle2, Languages, Briefcase, ExternalLink
} from "lucide-react"

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const provider = await getProviderProfile(id)
    if (!provider) return { title: "Provider Not Found | XbandGlobal" }

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

    const displayName = hasActiveSubscription ? provider.company_name : `${provider.company_name.charAt(0)}********`

    return {
        title: `${displayName} | XbandGlobal Provider`,
        description: provider.bio ?? `View the profile of ${displayName} on XbandGlobal.`,
    }
}

// ─── Provider Detail Page ─────────────────────────────────────────────────────
export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const provider = await getProviderProfile(id)
    if (!provider) notFound()

    // Auth context for the Contact button
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    let clientCredits = 0
    let alreadyContacted = false
    let hasActiveSubscription = false

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, credits, has_active_subscription")
            .eq("id", user.id)
            .single()
        
        clientCredits = profile?.credits ?? 0
        hasActiveSubscription = profile?.role === "admin" || (profile?.has_active_subscription ?? false)

        const { data: existing } = await supabase
            .from("leads")
            .select("id")
            .eq("client_id", user.id)
            .eq("provider_id", id)
            .maybeSingle()
        alreadyContacted = !!existing
    }

    const [stars, reviews] = await Promise.all([
        Promise.resolve(Math.round(provider.rating_avg)),
        getReviewsForProvider(id),
    ])

    return (
        <main className="min-h-screen bg-[#020813]">
            <div className="mx-auto max-w-4xl px-6 py-12 sm:py-20">

                {/* ── Back link ── */}
                <Link href="/providers"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" /> Back to Directory
                </Link>

                {/* ── Profile card ── */}
                <div className="rounded-3xl border border-white/10 bg-[#060d1f]/60 backdrop-blur-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]">

                    {/* Header bar */}
                    <div className="relative px-8 py-8 border-b border-white/10">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-500/[0.07] to-transparent" />
                        <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
                            {/* Avatar placeholder */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
                                {provider.company_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    {provider.company_name}
                                </h1>
                                {/* Rating row */}
                                <div className="flex items-center flex-wrap gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < stars ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                                        ))}
                                        <span className="ml-1 text-slate-400 text-sm">
                                            {provider.rating_avg > 0 ? provider.rating_avg.toFixed(1) : "No reviews yet"}
                                            {provider.review_count > 0 && ` · ${provider.review_count} review${provider.review_count !== 1 ? "s" : ""}`}
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified by XbandGlobal
                                    </span>
                                </div>
                                {/* Meta row */}
                                <div className="flex items-center flex-wrap gap-5 mt-3 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        Responds within {provider.response_time_hours}h
                                    </span>
                                    {provider.website_url && (
                                        <a href={provider.website_url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                            Website
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="sm:ml-auto shrink-0 relative z-30">
                                {hasActiveSubscription ? (
                                    <ContactProviderModal
                                        providerId={id}
                                        providerName={provider.company_name}
                                        clientCredits={clientCredits}
                                        isAuthenticated={!!user}
                                        alreadyContacted={alreadyContacted}
                                    />
                                ) : (
                                    <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95">
                                        Upgrade to Contact
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="relative px-8 py-8">
                        {!hasActiveSubscription && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-start bg-[#060d1f]/40 backdrop-blur-[6px] rounded-b-3xl pt-24 pb-8">
                                <div className="max-w-md text-center px-6">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                        <Briefcase className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight drop-shadow-md">Unlock Full Profile</h3>
                                    <p className="text-slate-300 mb-8 leading-relaxed font-medium">
                                        Subscribe to access detailed provider info, including full biographies, services offered, jurisdictions, and verified client reviews.
                                    </p>
                                    <Link href={user ? "/dashboard/credits" : "/pricing"} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 hover:scale-105 active:scale-95">
                                        View Subscription Plans
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className={`space-y-8 transition-all duration-500 ${!hasActiveSubscription ? "opacity-30 blur-[8px] pointer-events-none select-none" : ""}`}>
                            {/* Bio */}
                        {provider.bio && (
                            <section>
                                <h2 className="text-xs font-display uppercase tracking-[0.2em] text-slate-500 mb-3">About</h2>
                                <p className="text-slate-300 leading-relaxed">{provider.bio}</p>
                            </section>
                        )}

                        <div className="grid sm:grid-cols-2 gap-8">
                            {/* Services */}
                            {provider.services.length > 0 && (
                                <section>
                                    <h2 className="text-xs font-display uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
                                        <Briefcase className="w-3.5 h-3.5" /> Services
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {provider.services.map(s => (
                                            <span key={s} className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/15 text-blue-300 text-sm font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Languages */}
                            {provider.languages.length > 0 && (
                                <section>
                                    <h2 className="text-xs font-display uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
                                        <Languages className="w-3.5 h-3.5" /> Languages
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {provider.languages.map(l => (
                                            <span key={l} className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/15 text-purple-300 text-sm font-medium">
                                                {l}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Countries */}
                        {provider.countries.length > 0 && (
                            <section>
                                <h2 className="text-xs font-display uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5" /> Jurisdictions Served
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {provider.countries.map(c => (
                                        <Link key={c.code} href={`/countries/${c.code.toLowerCase()}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:border-white/20 hover:text-white transition-colors">
                                            {c.flag_emoji && <span>{c.flag_emoji}</span>}
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Disclaimer */}
                        <div className="rounded-2xl border border-white/5 bg-white/[0.015] px-5 py-4 text-xs text-slate-500 leading-relaxed">
                            XbandGlobal verifies providers&apos; credentials but does not guarantee service outcomes. Always conduct your own due diligence before engaging any professional.
                        </div>

                        {/* ── Reviews Section ── */}
                        <section id="reviews">
                            <h2 className="text-xs font-display uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                                <Star className="w-3.5 h-3.5" /> Client Reviews
                                {reviews.length > 0 && (
                                    <span className="ml-auto text-slate-600 normal-case tracking-normal text-xs font-normal">
                                        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </h2>

                            {reviews.length === 0 ? (
                                <div className="rounded-2xl border border-white/5 bg-white/[0.015] px-5 py-6 text-center text-sm text-slate-500">
                                    No reviews yet — be the first to work with this provider.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => {
                                        const reviewStars = Math.round(review.rating)
                                        const clientFirstName = review.client_name
                                            ? review.client_name.split(" ")[0]
                                            : "Anonymous"
                                        const date = new Date(review.created_at).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })
                                        return (
                                            <div key={review.id} className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < reviewStars ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                                                        ))}
                                                        <span className="ml-1.5 text-sm font-semibold text-white">{review.rating}.0</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{date}</span>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-slate-300 text-sm leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                                                )}
                                                <p className="text-xs text-slate-600 mt-2">— {clientFirstName}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </section>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
