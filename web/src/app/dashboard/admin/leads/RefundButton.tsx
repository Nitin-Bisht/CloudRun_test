"use client"

// ─── Admin: Lead Refund Button ────────────────────────────────────────────────
// Role: Frontend Developer (skill: frontend-developer)

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { adminRefundLead } from "@/app/actions/admin"
import { RotateCcw, Loader2, AlertCircle } from "lucide-react"

interface Props {
    leadId: string
}

export default function RefundButton({ leadId }: Props) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    function handleRefund() {
        if (!window.confirm("Refund this lead? The client will receive their credit back and the lead will be marked as refunded.")) return

        setError(null)
        startTransition(async () => {
            const result = await adminRefundLead(leadId)
            if (result.success) {
                router.refresh()
            } else {
                setError(result.error ?? "Refund failed.")
            }
        })
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={handleRefund}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isPending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <RotateCcw className="w-3.5 h-3.5" />
                }
                {isPending ? "Refunding…" : "Refund"}
            </button>
            {error && (
                <div className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
        </div>
    )
}
