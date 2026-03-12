import { getCountries } from "@/app/actions/countries"
import { Country } from "@/lib/types/countries"
import Link from "next/link"
import { Globe, ArrowRight } from "lucide-react"

export const metadata = {
    title: "Global Jurisdictions | XbandGlobal",
    description: "Explore world-class business jurisdictions tailored for global incorporation.",
}

export default async function CountriesPage() {
    const countries = await getCountries(true)

    return (
        <div className="min-h-screen bg-[#020813] text-white pt-24 pb-20 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <header className="mb-16 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                        <Globe className="w-4 h-4" />
                        <span>Active Jurisdictions</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Worlds of Opportunity
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                        Discover tailored incorporation environments. Each jurisdiction offers unique benefits designed to accelerate your global business expansion.
                    </p>
                </header>

                {countries.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
                        <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-medium text-white mb-2">No Jurisdictions Available</h2>
                        <p className="text-slate-400">We are currently preparing our active jurisdiction list. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {countries.map((country: Country) => (
                            <Link
                                key={country.code}
                                href={`/countries/${country.code.toLowerCase()}`}
                                className="group relative block rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden transition-all hover:scale-[1.02] duration-500"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-500" />

                                <div className="relative h-full bg-[#060D1E]/90 backdrop-blur-xl rounded-[23px] p-8 flex flex-col justify-between border border-white/5 group-hover:border-white/10 transition-colors">
                                    <div>
                                        <div className="text-5xl mb-6 filter drop-shadow-md">
                                            {country.flag_emoji || "\u{1F30D}"}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                                            {country.name}
                                        </h2>
                                        {country.avg_cost && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-sm text-slate-300">
                                                <span className="text-slate-500">Est. Cost:</span>
                                                <span className="font-medium">{country.avg_cost}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex items-center text-blue-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
                                        Explore Requirements
                                        <ArrowRight className="ml-2 w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
