"use client"

// ─── ReviewModal Client Component ────────────────────────────────────────────
// Role: Frontend Developer (skill: frontend-developer)

import { useState, useTransition } from "react"
import { Star, X, Send, CheckCircle2, Loader2 } from "lucide-react"
import { submitReview } from "@/app/actions/reviews"

interface ReviewModalProps {
    leadId: string
    providerName: string
    onClose: () => void
    onSuccess?: () => void
}

export default function ReviewModal({ leadId, providerName, onClose, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleSubmit() {
        if (rating === 0) { setError("Please select a star rating."); return }
        setError(null)

        startTransition(async () => {
            const result = await submitReview(leadId, rating, comment)
            if (result.success) {
                setSuccess(true)
                // Auto-close after 1.5 s so user sees the confirmation
                setTimeout(() => {
                    onSuccess?.()
                    onClose()
                }, 1500)
            } else {
                setError(result.error ?? "Something went wrong.")
            }
        })
    }

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#060d1f] p-8 shadow-2xl">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {success ? (
                    /* ── Success State ── */
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
                        <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                        <h2 className="text-xl font-bold text-white">Review Submitted!</h2>
                        <p className="text-slate-400 text-sm">
                            Thank you — your feedback helps other clients on XbandGlobal.
                        </p>
                    </div>
                ) : (
                    /* ── Form State ── */
                    <>
                        <h2 className="text-xl font-bold text-white mb-1">Leave a Review</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            How was your experience with{" "}
                            <span className="text-white font-medium">{providerName}</span>?
                        </p>

                        {/* Star Picker */}
                        <div className="flex items-center gap-2 mb-6" role="group" aria-label="Star rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHovered(star)}
                                    onMouseLeave={() => setHovered(0)}
                                    aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                                    className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                                >
                                    <Star
                                        className={`w-9 h-9 transition-colors ${star <= (hovered || rating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-700"
                                            }`}
                                    />
                                </button>
                            ))}
                            {rating > 0 && (
                                <span className="ml-2 text-sm text-slate-400">
                                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                                </span>
                            )}
                        </div>

                        {/* Comment textarea */}
                        <div className="mb-6">
                            <label htmlFor="review-comment" className="block text-sm font-medium text-slate-300 mb-2">
                                Comment <span className="text-slate-500 font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="review-comment"
                                rows={4}
                                maxLength={500}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience working with this provider…"
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition"
                            />
                            <p className="text-xs text-slate-600 mt-1 text-right">{comment.length}/500</p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <p className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3">
                                {error}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isPending || rating === 0}
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition-all"
                            >
                                {isPending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Submit Review</>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
