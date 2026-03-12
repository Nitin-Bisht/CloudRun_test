import { createServerSupabaseClient } from "@/lib/supabase/server"
import { CREDIT_PACKAGES } from "@/lib/stripe"
import { Zap, Star, ArrowRight, CheckCircle2, ShieldCheck, CreditCard, Sparkles } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Pricing & Plans | XbandGlobal",
    description: "Flexible credit packages for global business expansion.",
}

export default async function PricingPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-[#020813] py-24 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full mix-blend-screen translate-y-1/4 translate-x-1/4" />

            <div className="mx-auto max-w-5xl relative z-10">
                {/* ── Header ── */}
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[10px] font-display uppercase tracking-[0.2em] text-blue-400 mb-8">
                        <Sparkles className="w-3.5 h-3.5" /> Institutional Access
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6">
                        Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Operation Costs</span>
                    </h1>
                    <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                        Select a strategic credit package to begin direct engagement with verified jurisdictional providers across the globe.
                    </p>
                </div>

                {/* ── Pricing Cards ── */}
                <div className="grid gap-8 sm:grid-cols-3 mb-24">
                    {CREDIT_PACKAGES.map((pkg, idx) => {
                        const isPopular = pkg.badge === "Most Popular"
                        const isBestValue = pkg.badge === "Best Value"
                        const perCredit = (pkg.priceUsd / pkg.credits).toFixed(2)

                        return (
                            <div key={pkg.id}
                                className={`group relative flex flex-col rounded-[2.5rem] border p-10 transition-all duration-500 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-8 delay-${(idx + 1) * 100} ${isPopular
                                    ? "border-blue-500/40 bg-blue-500/[0.03] shadow-[0_0_80px_rgba(59,130,246,0.1)]"
                                    : "border-white/[0.06] bg-[#060d1f]/40 backdrop-blur-xl"
                                    }`}>
                                
                                {isPopular && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2.5rem]" />
                                )}

                                {/* Badge */}
                                {pkg.badge && (
                                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-[10px] font-display uppercase tracking-[0.15em] whitespace-nowrap z-20 shadow-xl ${
                                        isPopular ? "bg-blue-600 text-white" : "bg-amber-500 text-black font-bold"
                                    }`}>
                                        {isPopular && <Star className="w-3 h-3 inline mr-2 -mt-0.5 fill-current" />}
                                        {pkg.badge}
                                    </div>
                                )}

                                <div className="mb-8 relative z-10">
                                    <p className="text-[10px] font-display uppercase tracking-[0.25em] text-slate-500 mb-4">{pkg.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold text-white tracking-tighter">${pkg.priceUsd}</span>
                                        <span className="text-slate-500 text-sm font-display tracking-widest uppercase">USD</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <p className="text-xs text-slate-500 font-medium whitespace-nowrap">${perCredit} per credit</p>
                                        <div className="h-px flex-1 bg-white/5" />
                                    </div>
                                </div>

                                <div className="flex-1 mb-10 space-y-5 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            <Zap className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{pkg.credits} Operational Credits</p>
                                            <p className="text-[11px] text-slate-500">Contact up to {pkg.credits} partners</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
                                            <span className="text-slate-400 text-sm">Direct Provider Messaging</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
                                            <span className="text-slate-400 text-sm">Verified Credentials Access</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
                                            <span className="text-slate-400 text-sm">Infinite Credit Validity</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                <Link 
                                    href={user ? "/dashboard/credits" : "/signup"}
                                    className={`w-full group/btn inline-flex items-center justify-center gap-3 rounded-[1.5rem] py-4 font-semibold text-sm transition-all relative z-10 overflow-hidden ${isPopular
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/40"
                                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                        }`}>
                                    <CreditCard className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                    {user ? "Secure Acquisition" : "Initialize Account"}
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        )
                    })}
                </div>

                {/* ── Trust markers ── */}
                <div className="bg-[#060d1f]/30 border border-white/[0.04] rounded-[2.5rem] p-12 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto md:mx-0">
                                <ShieldCheck className="w-6 h-6 text-blue-400" />
                            </div>
                            <h4 className="text-white font-semibold">Stripe Secure Protocol</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">Financial data is encrypted and processed via the PCI DSS Tier 1 secure Stripe architecture.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto md:mx-0">
                                <Zap className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h4 className="text-white font-semibold">Immediate Initializing</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">Credits are applied to your operating profile instantly upon cryptographic verification of payment.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto md:mx-0">
                                <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h4 className="text-white font-semibold">Enterprise Readiness</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">Integrated VAT compliance and institutional invoicing provided for all strategic capital allocations.</p>
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-white/5 flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* payment method logos placeholder or text */}
                        <div className="flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-slate-400">
                            <CreditCard className="w-4 h-4" /> Visa
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-slate-400">
                            <CreditCard className="w-4 h-4" /> Mastercard
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-slate-400">
                            <CreditCard className="w-4 h-4" /> Amex
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-display uppercase tracking-widest text-slate-400">
                            <ShieldCheck className="w-4 h-4" /> Apple Pay
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12 pb-20">
                    <p className="text-slate-500 text-sm italic">
                        Questions about bulk institutional pricing? <Link href="/support" className="text-blue-400 hover:text-blue-300 transition-colors not-italic font-medium">Contact Protocol Support</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
