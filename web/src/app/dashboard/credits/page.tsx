import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { CREDIT_PACKAGES } from "@/lib/stripe"
import { createCheckoutSessionAction } from "@/app/actions/credits"
import { Zap, Star, ArrowRight, CheckCircle2, ShieldCheck, CreditCard, AlertCircle } from "lucide-react"

export const metadata = {
    title: "Buy Credits | XbandGlobal",
    description: "Purchase XbandGlobal credits to contact verified incorporation providers.",
}

interface PageProps {
    searchParams: Promise<{ cancelled?: string }>
}

export default async function CreditsPage({ searchParams }: PageProps) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("credits, role")
        .eq("id", user.id)
        .single()

    const params = await searchParams
    const cancelled = params.cancelled === "true"

    return (
        <div className="min-h-screen bg-[#020813] py-16 px-6">
            <div className="mx-auto max-w-5xl">

                {/* ── Header ── */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400 mb-6">
                        <Zap className="w-3.5 h-3.5" /> 1 credit = contact 1 provider
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                        Buy Credits
                    </h1>
                    <p className="mt-3 text-slate-400 max-w-md mx-auto">
                        Use credits to send direct messages to verified providers. Credits never expire.
                    </p>
                    {/* Current balance */}
                    <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3">
                        <span className="text-slate-400 text-sm">Current balance:</span>
                        <span className="text-white font-bold text-lg flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-400" />{profile?.credits ?? 0} credits
                        </span>
                    </div>
                </div>

                {/* ── Cancelled banner ── */}
                {cancelled && (
                    <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-amber-300">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm">Payment was cancelled — no charge was made. Choose a package below to try again.</p>
                    </div>
                )}

                {/* ── Pricing Cards ── */}
                <div className="grid gap-6 sm:grid-cols-3 mb-16">
                    {CREDIT_PACKAGES.map((pkg) => {
                        const isPopular = pkg.badge === "Most Popular"
                        const isBest = pkg.badge === "Best Value"
                        const perCredit = (pkg.priceUsd / pkg.credits).toFixed(2)

                        return (
                            <div key={pkg.id}
                                className={`relative flex flex-col rounded-3xl border p-8 transition-all ${isPopular
                                    ? "border-blue-500/40 bg-blue-500/5 shadow-[0_0_60px_rgba(59,130,246,0.1)]"
                                    : "border-white/10 bg-[#060d1f]/60"
                                    }`}>
                                {/* Badge */}
                                {pkg.badge && (
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${isPopular ? "bg-blue-500 text-white" : "bg-amber-500 text-black"
                                        }`}>
                                        {isPopular ? <><Star className="w-3 h-3 inline mr-1" />{pkg.badge}</> : pkg.badge}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <p className="text-xs font-display uppercase tracking-[0.2em] text-slate-500 mb-2">{pkg.label}</p>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-4xl font-bold text-white">${pkg.priceUsd}</span>
                                        <span className="text-slate-400 text-sm mb-1.5">USD</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">${perCredit} per credit</p>
                                </div>

                                <div className="flex-1 mb-8 space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                                        <span className="text-white font-semibold">{pkg.credits} Credits</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span className="text-slate-300 text-sm">Contact {pkg.credits} providers</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span className="text-slate-300 text-sm">Credits never expire</span>
                                    </div>
                                    {isBest && (
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="text-slate-300 text-sm">40% saving vs Starter</span>
                                        </div>
                                    )}
                                    {isPopular && (
                                        <div className="flex items-center gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="text-slate-300 text-sm">20% saving vs Starter</span>
                                        </div>
                                    )}
                                </div>

                                {/* Checkout form */}
                                <form action={createCheckoutSessionAction}>
                                    <input type="hidden" name="packageId" value={pkg.id} />
                                    <button type="submit"
                                        className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 font-medium text-sm transition-all ${isPopular
                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                                            : "bg-white/10 hover:bg-white/20 text-white"
                                            }`}>
                                        <CreditCard className="w-4 h-4" />
                                        Buy {pkg.credits} Credits
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        )
                    })}
                </div>

                {/* ── Trust row ── */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                        Secured by Stripe
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        Visa, Mastercard, Amex
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Instant credit top-up
                    </div>
                </div>

                {/* ── Back ── */}
                <div className="text-center mt-10">
                    <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
