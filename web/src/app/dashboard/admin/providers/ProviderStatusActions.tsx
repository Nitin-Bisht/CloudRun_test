"use client"

// ─── Admin: Provider Status Action Buttons ───────────────────────────────────
// Role: Frontend Developer (skill: frontend-developer)

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { adminUpdateProviderStatus } from "@/app/actions/providers"
import type { ProviderStatus } from "@/lib/types/providers"
import { CheckCircle2, XCircle, PauseCircle, Loader2, AlertCircle } from "lucide-react"

interface Props {
    providerId: string
    currentStatus: ProviderStatus
}

const STATUS_ACTIONS: Record<ProviderStatus, Array<{
    nextStatus: ProviderStatus
    label: string
    className: string
    icon: typeof CheckCircle2
}>> = {
    pending: [
        {
            nextStatus: "verified",
            label: "Verify Provider",
            className: "bg-emerald-600 hover:bg-emerald-700",
            icon: CheckCircle2,
        },
        {
            nextStatus: "rejected",
            label: "Reject",
            className: "bg-red-600/80 hover:bg-red-700",
            icon: XCircle,
        },
    ],
    verified: [
        {
            nextStatus: "suspended",
            label: "Suspend",
            className: "bg-slate-600 hover:bg-slate-700",
            icon: PauseCircle,
        },
    ],
    rejected: [
        {
            nextStatus: "verified",
            label: "Verify Provider",
            className: "bg-emerald-600 hover:bg-emerald-700",
            icon: CheckCircle2,
        },
    ],
    suspended: [
        {
            nextStatus: "verified",
            label: "Reinstate",
            className: "bg-blue-600 hover:bg-blue-700",
            icon: CheckCircle2,
        },
    ],
}

export default function ProviderStatusActions({ providerId, currentStatus }: Props) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    function action(newStatus: ProviderStatus) {
        setError(null)
        startTransition(async () => {
            const result = await adminUpdateProviderStatus(providerId, newStatus)
            if (result.success) router.refresh()
            else setError(result.error ?? "Action failed")
        })
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
                    <AlertCircle className="w-4 h-4" />{error}
                </div>
            )}
            <div className="flex flex-wrap gap-3">
                {STATUS_ACTIONS[currentStatus].map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.label}
                            onClick={() => action(item.nextStatus)}
                            disabled={isPending}
                            className={`inline-flex items-center gap-2 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${item.className}`}
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                            {item.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
