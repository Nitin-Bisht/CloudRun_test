"use client"

// ─── Contact Provider Modal ───────────────────────────────────────────────────
// Role: Frontend Developer (skill: frontend-developer)

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { sendLead } from "@/app/actions/leads"
import { MessageSquare, X, Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface ContactProviderModalProps {
    providerId: string
    providerName: string
    clientCredits: number
    isAuthenticated: boolean
    alreadyContacted: boolean
}

export function ContactProviderModal({
    providerId,
    providerName,
    clientCredits,
    isAuthenticated,
    alreadyContacted,
}: ContactProviderModalProps) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    function handleOpenClick() {
        if (!isAuthenticated) { router.push("/login"); return }
        if (clientCredits < 1) { router.push("/dashboard/credits"); return }
        setOpen(true)
    }

    function handleSubmit() {
        if (!message.trim()) return
        startTransition(async () => {
            const res = await sendLead(providerId, message)
            setResult(res)
            if (res.success) {
                setMessage("")
            }
        })
    }

    // ── Button shown on profile page ──
    if (!open) {
        return (
            <button
                onClick={handleOpenClick}
                disabled={alreadyContacted}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm transition-all ${alreadyContacted
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default"
                        : !isAuthenticated || clientCredits < 1
                            ? "bg-blue-600/50 hover:bg-blue-600 text-white border border-blue-500/30"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.45)]"
                    }`}
            >
                {alreadyContacted ? (
                    <><CheckCircle2 className="w-4 h-4" /> Message Sent</>
                ) : !isAuthenticated ? (
                    <><MessageSquare className="w-4 h-4" /> Sign in to Contact</>
                ) : clientCredits < 1 ? (
                    <><Zap className="w-4 h-4" /> Buy Credits to Contact</>
                ) : (
                    <><MessageSquare className="w-4 h-4" /> Contact Provider<span className="flex items-center gap-1 ml-1 opacity-70 text-xs"><Zap className="w-3 h-3" />1</span></>
                )}
            </button>
        )
    }

    // ── Modal overlay ──
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#060d1f] shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div>
                            <h2 className="text-white font-semibold text-lg">Contact {providerName}</h2>
                            <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                1 credit will be deducted from your balance
                            </p>
                        </div>
                        <button onClick={() => setOpen(false)} disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {result?.success ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                <h3 className="text-white font-semibold text-lg">Message sent!</h3>
                                <p className="text-slate-400 text-sm mt-2">
                                    {providerName} will receive your message shortly.<br />
                                    You&apos;ll be notified when they respond.
                                </p>
                                <button onClick={() => setOpen(false)}
                                    className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm transition-colors">
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                {result?.error && (
                                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        {result.error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm text-slate-300 mb-2 font-medium">
                                        Your message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={5}
                                        maxLength={1000}
                                        placeholder={`Introduce yourself and explain what you need from ${providerName}. Include your country of intended incorporation, timeline, and any specific requirements.`}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[11px] text-slate-600">Minimum 20 characters</p>
                                        <p className={`text-[11px] ${message.length > 950 ? "text-red-400" : "text-slate-600"}`}>
                                            {message.length}/1000
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button onClick={() => setOpen(false)} disabled={isPending}
                                        className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors text-sm">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isPending || message.trim().length < 20}
                                        className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                        {isPending ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                        ) : (
                                            <><MessageSquare className="w-4 h-4" /> Send Message</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
