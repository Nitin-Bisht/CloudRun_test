import { getCountryByCode } from "@/app/actions/countries"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, MapPin, FileCheck, Building2, Landmark, CheckCircle2 } from "lucide-react"

type CountryPageProps = {
    params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: CountryPageProps) {
    const { code } = await params
    const country = await getCountryByCode(code)
    if (!country) return { title: "Not Found | XbandGlobal" }

    return {
        title: `${country.name} Incorporation | XbandGlobal`,
        description: `Explore business incorporation requirements and benefits for ${country.name}.`,
    }
}

export default async function CountryDetailPage({ params }: CountryPageProps) {
    const { code } = await params
    const country = await getCountryByCode(code)

    if (!country || !country.is_active) {
        notFound()
    }

    const reqs = country.requirements || {}

    return (
        <div className="min-h-screen bg-[#020813] text-white pt-24 pb-20 relative overflow-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <Link
                    href="/countries"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Jurisdictions
                </Link>

                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
                    <div>
                        <div className="text-7xl mb-6 filter drop-shadow-lg">{country.flag_emoji || "🌎"}</div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                            {country.name}
                        </h1>
                    </div>
                    {country.avg_cost && (
                        <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                            <p className="text-sm text-slate-400 uppercase tracking-wider font-medium mb-1">Average Setup Cost</p>
                            <p className="text-3xl font-bold text-white">{country.avg_cost}</p>
                        </div>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Details Column */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Company Types */}
                        {reqs.company_types && reqs.company_types.length > 0 && (
                            <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                    <Building2 className="w-6 h-6 text-blue-400" />
                                    Supported Entities
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {reqs.company_types.map((type: string, idx: number) => (
                                        <span key={idx} className="px-5 py-2.5 bg-white/5 border border-blue-500/20 rounded-xl text-sm font-medium text-blue-100">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Documents Required */}
                        {reqs.documents && reqs.documents.length > 0 && (
                            <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                                    <FileCheck className="w-6 h-6 text-emerald-400" />
                                    Required Documents
                                </h2>
                                <ul className="space-y-4">
                                    {reqs.documents.map((doc: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span className="text-slate-200 leading-relaxed">{doc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Additional Requirements */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {reqs.local_director && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                                    <h3 className="text-sm uppercase tracking-wider text-slate-400 font-medium mb-3">Local Director</h3>
                                    <p className="text-slate-200">{reqs.local_director}</p>
                                </div>
                            )}
                            {reqs.registered_address && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                                    <h3 className="text-sm uppercase tracking-wider text-slate-400 font-medium mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Registered Address
                                    </h3>
                                    <p className="text-slate-200">{reqs.registered_address}</p>
                                </div>
                            )}
                            {reqs.min_capital && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                                    <h3 className="text-sm uppercase tracking-wider text-slate-400 font-medium mb-3">Minimum Capital</h3>
                                    <p className="text-slate-200">{reqs.min_capital}</p>
                                </div>
                            )}
                        </section>

                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8">
                        {reqs.timeline && (
                            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-md">
                                <Clock className="w-8 h-8 text-blue-400 mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">Estimated Timeline</h3>
                                <p className="text-2xl font-bold text-blue-200">{reqs.timeline}</p>
                            </div>
                        )}

                        {reqs.tax_info && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden text-center sm:text-left">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
                                <Landmark className="w-8 h-8 text-slate-400 mx-auto sm:mx-0 mb-4" />
                                <h3 className="text-lg font-medium text-white mb-3">Tax Profile</h3>
                                <p className="text-slate-300 leading-relaxed text-sm">{reqs.tax_info}</p>
                            </div>
                        )}

                        {/* Call to Action mapped to Epic 5 concept */}
                        <div className="mt-8">
                            <Link
                                href="/dashboard"
                                className="block w-full text-center px-6 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                Find Providers in {country.name}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
