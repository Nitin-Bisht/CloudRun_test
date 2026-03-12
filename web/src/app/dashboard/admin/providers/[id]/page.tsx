import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import ProviderStatusActions from "../ProviderStatusActions"
import { getProviderDocumentUrl } from "@/app/actions/providers"
import { ArrowLeft, Building2, Globe, Clock, FileCheck, Languages, DollarSign } from "lucide-react"
import type { ProviderDocument, ProviderStatus, ProviderWithProfile } from "@/lib/types/providers"

const STATUS_BADGE: Record<ProviderStatus, string> = {
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    verified: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    rejected: "border-red-500/20 bg-red-500/10 text-red-400",
    suspended: "border-slate-500/20 bg-slate-500/10 text-slate-400",
}

type ProviderWithAdminProfile = ProviderWithProfile & {
    profiles: {
        email: string | null
        full_name: string | null
    } | null
}

type ProviderDocumentWithUrl = ProviderDocument & { signedUrl: string | null }

export default async function AdminProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: adminProfile } = await supabase.from("profiles").select("email, role").eq("id", user.id).single()
    if (adminProfile?.role !== "admin") redirect("/unauthorized")

    const { data: providerResult } = await supabase
        .from("providers")
        .select("*, profiles(email, full_name)")
        .eq("id", id)
        .single()

    const provider = providerResult as ProviderWithAdminProfile | null
    if (!provider) notFound()

    const { data: documentsResult } = await supabase
        .from("provider_documents")
        .select("*")
        .eq("provider_id", id)
    const documents = (documentsResult ?? []) as ProviderDocument[]

    // Generate signed download URLs for all documents
    const documentsWithUrls: ProviderDocumentWithUrl[] = await Promise.all(
        documents.map(async (doc) => ({
            ...doc,
            signedUrl: await getProviderDocumentUrl(doc.storage_path),
        }))
    )

    return (
        <DashboardShell userEmail={adminProfile?.email ?? ""} userRole="admin">
            <div className="mx-auto w-full max-w-4xl space-y-8">
                <Link href="/dashboard/admin/providers" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Queue
                </Link>

                <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/10 pb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-blue-400" />
                            {provider.company_name}
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm">{provider.profiles?.email}</p>
                    </div>
                    <span className={`capitalize px-4 py-1.5 rounded-full text-sm font-medium border ${STATUS_BADGE[provider.status as ProviderStatus]}`}>
                        {provider.status}
                    </span>
                </header>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Profile Info */}
                    <section className="bg-[#060D1E]/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-5">
                        <h2 className="text-lg font-semibold text-white">Profile Details</h2>

                        {provider.bio && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">About</p>
                                <p className="text-slate-200 text-sm leading-relaxed">{provider.bio}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {provider.pricing_band && (
                                <div className="flex items-start gap-2">
                                    <DollarSign className="w-4 h-4 text-slate-500 mt-0.5" />
                                    <div><p className="text-slate-500 text-xs">Pricing</p><p className="text-white">{provider.pricing_band}</p></div>
                                </div>
                            )}
                            <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                                <div><p className="text-slate-500 text-xs">Response Time</p><p className="text-white">{provider.response_time_hours}h</p></div>
                            </div>
                            {provider.website_url && (
                                <div className="col-span-2 flex items-start gap-2">
                                    <Globe className="w-4 h-4 text-slate-500 mt-0.5" />
                                    <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{provider.website_url}</a>
                                </div>
                            )}
                        </div>

                        {provider.services?.length > 0 && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Services</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {provider.services.map((s: string) => (
                                        <span key={s} className="text-xs px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {provider.languages?.length > 0 && (
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Languages className="w-3 h-3" />Languages</p>
                                <p className="text-slate-200 text-sm">{provider.languages.join(", ")}</p>
                            </div>
                        )}

                        <p className="text-xs text-slate-600 pt-2 border-t border-white/5">
                            Applied {new Date(provider.created_at).toLocaleString()}
                        </p>
                    </section>

                    {/* Documents + Actions */}
                    <div className="space-y-6">
                        <section className="bg-[#060D1E]/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-emerald-400" /> Submitted Documents
                            </h2>
                            {documentsWithUrls.length === 0 ? (
                                <p className="text-slate-500 text-sm">No documents uploaded.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {documentsWithUrls.map((doc) => (
                                        <li key={doc.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                                            <div>
                                                <p className="text-sm text-white capitalize">{doc.document_type}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[180px]">{doc.storage_path.split("/").pop()}</p>
                                            </div>
                                            {doc.signedUrl ? (
                                                <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer"
                                                    className="shrink-0 text-xs bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                                                    Download
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-500">URL expired</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="bg-[#060D1E]/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                            <h2 className="text-lg font-semibold text-white mb-4">Change Status</h2>
                            <ProviderStatusActions providerId={provider.id} currentStatus={provider.status as ProviderStatus} />
                        </section>
                    </div>
                </div>
            </div>
        </DashboardShell>
    )
}
