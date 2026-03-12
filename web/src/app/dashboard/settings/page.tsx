import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { redirect } from "next/navigation"
import { deleteAccount } from "@/app/actions/account"
import { AlertTriangle, User, CreditCard, Shield, Loader2 } from "lucide-react"

// Role: Frontend Developer (skill: frontend-developer)
// Role: TypeScript Pro (skill: typescript-pro) — strict typing on server props

export const metadata = { title: "Settings | XbandGlobal" }

// ─── Danger Zone Delete Form ──────────────────────────────────────────────────
// Inlined as a thin client-interactive form that calls the deleteAccount action.
// We wrap it in its own async form so Next.js Server Actions wire directly.

async function DeleteAccountSection() {
    return (
        <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.03] p-8">
            <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 rounded-xl bg-red-500/10 p-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-red-300">Danger Zone</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Permanently delete your account and all personal data. Financial records
                        are retained for legal compliance but de-identified. This action is
                        <strong className="text-red-400"> irreversible</strong>.
                    </p>
                </div>
            </div>

            {/* GDPR delete form — server action, no JS required */}
            <form action={async () => { "use server"; await deleteAccount() }}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="confirm-delete" className="block text-xs font-medium text-slate-400 mb-2">
                            Type <span className="font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">delete</span> to confirm
                        </label>
                        <input
                            id="confirm-delete"
                            name="confirmation"
                            type="text"
                            required
                            pattern="delete"
                            title="Type 'delete' to confirm"
                            placeholder="delete"
                            className="w-full max-w-xs rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-sm font-semibold transition-all"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Delete My Account
                    </button>
                </div>
            </form>
        </section>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("email, role, credits, full_name, created_at")
        .eq("id", user.id)
        .single()

    const isAdmin = profile?.role === "admin"

    return (
        <DashboardShell userEmail={profile?.email ?? ""} userRole={profile?.role}>
            <div className="mx-auto w-full max-w-2xl space-y-8">
                {/* Header */}
                <header className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-500" />
                        Account Settings
                    </h1>
                    <p className="mt-2 text-slate-400">Manage your account information and preferences.</p>
                </header>

                {/* Account Info */}
                <section className="rounded-3xl border border-white/10 bg-[#060D1E]/40 p-8 backdrop-blur-xl space-y-5">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <User className="w-4 h-4" /> Account
                    </h2>

                    <dl className="space-y-4">
                        {[
                            { label: "Email", value: profile?.email ?? "—" },
                            { label: "Name", value: profile?.full_name ?? "Not set" },
                            { label: "Role", value: profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "—" },
                            {
                                label: "Member Since",
                                value: profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                                    : "—"
                            },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <dt className="text-sm text-slate-500">{label}</dt>
                                <dd className="text-sm font-medium text-slate-200">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* Credits (clients only) */}
                {profile?.role === "client" && (
                    <section className="rounded-3xl border border-white/10 bg-[#060D1E]/40 p-8 backdrop-blur-xl">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-5">
                            <CreditCard className="w-4 h-4" /> Credits
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-4xl font-bold text-white">{profile?.credits ?? 0}</p>
                                <p className="text-sm text-slate-500 mt-1">Available credits</p>
                            </div>
                            <a
                                href="/dashboard/credits"
                                className="px-5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 text-sm font-medium transition-all"
                            >
                                Buy Credits →
                            </a>
                        </div>
                    </section>
                )}

                {/* Legal */}
                <section className="rounded-3xl border border-white/10 bg-[#060D1E]/40 p-8 backdrop-blur-xl">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-4">Legal</h2>
                    <div className="flex gap-4 text-sm">
                        <a href="/legal/terms" className="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</a>
                        <span className="text-slate-700">·</span>
                        <a href="/legal/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
                    </div>
                </section>

                {/* Danger Zone — skip for admins */}
                {!isAdmin && <DeleteAccountSection />}
            </div>
        </DashboardShell>
    )
}
