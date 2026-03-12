import { getCountries } from "@/app/actions/countries"
import { Country } from "@/lib/types/countries"
import Link from "next/link"
import { Plus, Edit2, Globe, ShieldAlert } from "lucide-react"

export const metadata = {
    title: "Manage Jurisdictions | Admin",
}

export default async function AdminCountriesPage() {
    // Pass false to get all countries, active and inactive
    const countries = await getCountries(false)

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <header className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-blue-500" />
                        Manage Jurisdictions
                    </h1>
                    <p className="mt-2 text-slate-400">Configure global jurisdictions and their onboarding JSON requirements.</p>
                </div>
                <Link
                    href="/dashboard/admin/countries/new"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Jurisdiction
                </Link>
            </header>

            <div className="bg-[#060D1E]/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-medium">Flag</th>
                            <th className="px-6 py-4 font-medium">Code</th>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {countries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                    No jurisdictions found. Click &apos;Add Jurisdiction&apos; to create one.
                                </td>
                            </tr>
                        ) : (
                            countries.map((c: Country) => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-2xl">{c.flag_emoji || "\u{1F30D}"}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{c.code}</td>
                                    <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.is_active
                                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                                            }`}>
                                            {c.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/admin/countries/${c.code}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-400 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
