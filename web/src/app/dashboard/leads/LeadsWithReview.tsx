"use client"

// ─── LeadsWithReview — Client Component ──────────────────────────────────────
// Wraps each LeadCard + manages which modal is open.
// Role: Frontend Developer (skill: frontend-developer)

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowUpRight, Clock, Zap, Star, MessageSquare, Eye, Reply, CheckCircle2, XCircle } from "lucide-react"
import type { LeadWithReviewFlag } from "./types"
import type { LeadStatus } from "@/app/actions/leads"

const ReviewModal = dynamic(() => import("./ReviewModal"), { ssr: false })

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    new: { label: "Sent", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: MessageSquare },
    viewed: { label: "Viewed", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Eye },
    responded: { label: "Responded", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Reply },
    closed: { label: "Closed", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: CheckCircle2 },
    refunded: { label: "Refunded", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: XCircle },
}

// Statuses eligible for a review (must have had some interaction)
const REVIEWABLE_STATUSES: LeadStatus[] = ["responded", "closed"]

interface Props {
    leads: LeadWithReviewFlag[]
}

export default function LeadsWithReview({ leads }: Props) {
    // Track which leadId has the review modal open (null = none open)
    const [activeReviewLeadId, setActiveReviewLeadId] = useState<string | null>(null)
    // Track locally that a review was just submitted (optimistic hide of button)
    const [justReviewedIds, setJustReviewedIds] = useState<Set<string>>(new Set())

    const activeReviewLead = leads.find(l => l.id === activeReviewLeadId) ?? null

    function handleReviewSuccess() {
        if (activeReviewLeadId) {
            setJustReviewedIds(prev => new Set([...prev, activeReviewLeadId]))
        }
        setActiveReviewLeadId(null)
    }

    return (
        <>
            <div className="space-y-4">
                {leads.map(lead => {
                    const status = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new
                    const StatusIcon = status.icon
                    const date = new Date(lead.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                    })
                    const canReview = REVIEWABLE_STATUSES.includes(lead.status)
                    const alreadyReviewed = lead.hasReview || justReviewedIds.has(lead.id)

                    return (
                        <div
                            key={lead.id}
                            className="rounded-3xl border border-white/10 bg-[#060d1f]/60 p-6 backdrop-blur-xl"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/providers/${lead.provider?.id}`}
                                        className="text-white font-semibold hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
                                    >
                                        {lead.provider?.company_name ?? "Unknown Provider"}
                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                                    </Link>
                                    {lead.provider?.pricing_band && (
                                        <p className="text-xs text-slate-500 mt-0.5">{lead.provider.pricing_band}</p>
                                    )}
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${status.color}`}>
                                        <StatusIcon className="w-3 h-3" /> {status.label}
                                    </span>
                                </div>
                            </div>

                            {/* Message preview */}
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4 italic">
                                &ldquo;{lead.message}&rdquo;
                            </p>

                            {/* Footer row */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-4 text-xs text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />{date}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Zap className="w-3 h-3 text-amber-500" />{lead.credits_spent} credit spent
                                    </span>
                                    {lead.responded_at && (
                                        <span className="text-emerald-500">
                                            Responded {new Date(lead.responded_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                        </span>
                                    )}
                                </div>

                                {/* Review CTA — only show for reviewable statuses */}
                                {canReview && (
                                    alreadyReviewed ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                                            <Star className="w-3 h-3 fill-amber-400" /> Reviewed
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setActiveReviewLeadId(lead.id)}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 px-3 py-1.5 rounded-full transition-all"
                                        >
                                            <Star className="w-3 h-3" /> Leave a Review
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Review Modal */}
            {activeReviewLeadId && activeReviewLead && (
                <ReviewModal
                    leadId={activeReviewLeadId}
                    providerName={activeReviewLead.provider?.company_name ?? "this provider"}
                    onClose={() => setActiveReviewLeadId(null)}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </>
    )
}
