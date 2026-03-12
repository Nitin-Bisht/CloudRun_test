"use client"

import { useState, useTransition } from "react"
import { updateLeadStatus } from "@/app/actions/leads"
import { Check, Eye, Reply, type LucideIcon } from "lucide-react"

type AllowedStatus = "viewed" | "responded" | "closed"
type AnyLeadStatus = "new" | "viewed" | "responded" | "closed" | "refunded"

interface Props {
    leadId: string
    currentStatus: AnyLeadStatus
}

interface LeadAction {
    label: string
    nextStatus: AllowedStatus
    icon: LucideIcon
    fromStatuses: AnyLeadStatus[]
}

const LEAD_ACTIONS: LeadAction[] = [
    { label: "Mark Viewed", nextStatus: "viewed", icon: Eye, fromStatuses: ["new"] },
    { label: "Mark Responded", nextStatus: "responded", icon: Reply, fromStatuses: ["new", "viewed"] },
    { label: "Close", nextStatus: "closed", icon: Check, fromStatuses: ["new", "viewed", "responded"] },
]

export function ProviderLeadActions({ leadId, currentStatus }: Props) {
    const [status, setStatus] = useState<AnyLeadStatus>(currentStatus)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const available = LEAD_ACTIONS.filter(a => a.fromStatuses.includes(status))
    if (available.length === 0) return null

    function handleAction(next: AllowedStatus) {
        setError(null)
        startTransition(async () => {
            const res = await updateLeadStatus(leadId, next)
            if (res.success) setStatus(next)
            else setError(res.error ?? "Update failed")
        })
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {error && <p className="text-red-400 text-xs w-full">{error}</p>}
            {available.map((action) => {
                const Icon = action.icon
                return (
                    <button
                        key={action.nextStatus}
                        onClick={() => handleAction(action.nextStatus)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
                    >
                        <Icon className="w-3 h-3" />
                        {action.label}
                    </button>
                )
            })}
        </div>
    )
}
