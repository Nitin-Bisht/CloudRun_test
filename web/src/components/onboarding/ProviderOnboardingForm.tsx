"use client"

// ─── Multi-Step Provider Onboarding Wizard ───────────────────────────────────
// Role: Frontend Developer (skill: frontend-developer)
// Steps: 1. Company Info → 2. Document Upload → 3. Review & Submit

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { submitProviderApplication, getUploadSignedUrl } from "@/app/actions/providers"
import { Building2, FileUp, CheckCircle, ChevronRight, ChevronLeft, AlertCircle, Loader2 } from "lucide-react"

// ─── Schemas ─────────────────────────────────────────────────────────────────

const step1Schema = z.object({
    company_name: z.string().min(2, "Company name must be at least 2 characters"),
    bio: z.string().min(20, "Please write at least 20 characters about your services"),
    website_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    pricing_band: z.string().min(1, "Please select a pricing band"),
    response_time_hours: z.number().min(1).max(168),
})

const SERVICES = ["Company Formation", "Tax Advisory", "Banking Setup", "Legal Compliance", "Nominee Services", "Virtual Office", "Accounting", "Visa & Immigration"]
const LANGUAGES = ["English", "Arabic", "Chinese", "French", "Spanish", "German", "Russian", "Portuguese"]
const PRICING_BANDS = ["$500 - $1,500", "$1,500 - $3,000", "$3,000 - $7,500", "$7,500+"]

type Step1Values = z.infer<typeof step1Schema>

interface WizardState extends Step1Values {
    services: string[]
    languages: string[]
    documentPath: string
    documentName: string
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepDot({ n, current, label }: { n: number; current: number; label: string }) {
    const done = n < current
    const active = n === current
    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all ${done ? "border-emerald-500 bg-emerald-500 text-white" :
                active ? "border-blue-400 bg-blue-400/20 text-blue-300" :
                    "border-white/15 text-slate-500"
                }`}>
                {done ? <CheckCircle className="w-5 h-5" /> : n}
            </div>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${active ? "text-blue-300" : "text-slate-500"}`}>{label}</span>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProviderOnboardingForm() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done" | "error">("idle")

    const [wizard, setWizard] = useState<Partial<WizardState>>({
        services: [],
        languages: [],
        documentPath: "",
        documentName: "",
    })

    const step1Form = useForm<Step1Values>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            company_name: wizard.company_name ?? "",
            bio: wizard.bio ?? "",
            website_url: wizard.website_url ?? "",
            pricing_band: wizard.pricing_band ?? "",
            response_time_hours: wizard.response_time_hours ?? 48,
        }
    })

    // ── Step 1 Submit ─────────────────────────────────────────────────────────
    function handleStep1(data: Step1Values) {
        setWizard(prev => ({ ...prev, ...data }))
        setStep(2)
    }

    // ── Service / Language toggle ─────────────────────────────────────────────
    function toggleItem(key: "services" | "languages", item: string) {
        setWizard(prev => {
            const list = prev[key] ?? []
            return { ...prev, [key]: list.includes(item) ? list.filter(s => s !== item) : [...list, item] }
        })
    }

    // ── File Upload ───────────────────────────────────────────────────────────
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadProgress("uploading")
        setError(null)

        const result = await getUploadSignedUrl(file.name, file.type)
        if (!result) { setUploadProgress("error"); setError("Could not get upload URL."); return }

        try {
            const res = await fetch(result.signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            })
            if (!res.ok) throw new Error("Upload failed")
            setWizard(prev => ({ ...prev, documentPath: result.path, documentName: file.name }))
            setUploadProgress("done")
        } catch {
            setUploadProgress("error")
            setError("File upload failed. Please try again.")
        }
    }

    // ── Final Submit ──────────────────────────────────────────────────────────
    function handleFinalSubmit() {
        if (!wizard.documentPath) { setError("Please upload your business license."); return }
        setError(null)
        startTransition(async () => {
            const result = await submitProviderApplication(
                {
                    company_name: wizard.company_name!,
                    bio: wizard.bio!,
                    website_url: wizard.website_url,
                    pricing_band: wizard.pricing_band!,
                    services: wizard.services ?? [],
                    languages: wizard.languages ?? [],
                    response_time_hours: wizard.response_time_hours ?? 48,
                },
                wizard.documentPath!
            )
            if (result.success) {
                router.push("/dashboard?onboarded=1")
                router.refresh()
            } else {
                setError(result.error ?? "Submission failed. Please try again.")
            }
        })
    }

    return (
        <div className="min-h-screen bg-[#020813] flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                        <Building2 className="w-3.5 h-3.5" /> Provider Onboarding
                    </span>
                    <h1 className="text-3xl font-bold text-white">Set up your provider profile</h1>
                    <p className="text-slate-400 mt-2 text-sm">Complete all steps to apply for marketplace verification.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-8 mb-10">
                    <StepDot n={1} current={step} label="Company" />
                    <div className={`flex-1 h-px max-w-[80px] ${step > 1 ? "bg-emerald-500" : "bg-white/10"} transition-colors`} />
                    <StepDot n={2} current={step} label="Document" />
                    <div className={`flex-1 h-px max-w-[80px] ${step > 2 ? "bg-emerald-500" : "bg-white/10"} transition-colors`} />
                    <StepDot n={3} current={step} label="Review" />
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Card */}
                <div className="bg-[#060D1E]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">

                    {/* ── Step 1: Company Info ── */}
                    {step === 1 && (
                        <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Company Information</h2>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-sm text-slate-300 font-medium">Company Name *</label>
                                    <input {...step1Form.register("company_name")} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Acme Corp LLC" />
                                    {step1Form.formState.errors.company_name && <p className="text-red-400 text-xs">{step1Form.formState.errors.company_name.message}</p>}
                                </div>

                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-sm text-slate-300 font-medium">About Your Services *</label>
                                    <textarea {...step1Form.register("bio")} rows={3} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Describe your expertise and services offered..." />
                                    {step1Form.formState.errors.bio && <p className="text-red-400 text-xs">{step1Form.formState.errors.bio.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm text-slate-300 font-medium">Website (optional)</label>
                                    <input {...step1Form.register("website_url")} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://yourfirm.com" />
                                    {step1Form.formState.errors.website_url && <p className="text-red-400 text-xs">{step1Form.formState.errors.website_url.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm text-slate-300 font-medium">Typical Response Time</label>
                                    <select {...step1Form.register("response_time_hours", { valueAsNumber: true })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value={4}>Under 4 hours</option>
                                        <option value={24}>Within 24 hours</option>
                                        <option value={48}>Within 48 hours</option>
                                        <option value={72}>Within 72 hours</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-sm text-slate-300 font-medium">Pricing Band *</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {PRICING_BANDS.map(band => (
                                            <label key={band} className={`flex items-center justify-center text-xs font-medium p-3 rounded-xl border cursor-pointer transition-all ${step1Form.watch("pricing_band") === band
                                                ? "border-blue-500 bg-blue-500/20 text-blue-300"
                                                : "border-white/10 text-slate-400 hover:border-white/20"
                                                }`}>
                                                <input type="radio" {...step1Form.register("pricing_band")} value={band} className="sr-only" />
                                                {band}
                                            </label>
                                        ))}
                                    </div>
                                    {step1Form.formState.errors.pricing_band && <p className="text-red-400 text-xs">{step1Form.formState.errors.pricing_band.message}</p>}
                                </div>

                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-sm text-slate-300 font-medium">Services Offered</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SERVICES.map(s => (
                                            <button type="button" key={s} onClick={() => toggleItem("services", s)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(wizard.services ?? []).includes(s)
                                                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                                                    : "border-white/10 text-slate-400 hover:border-white/20"
                                                    }`}>{s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-sm text-slate-300 font-medium">Languages Spoken</label>
                                    <div className="flex flex-wrap gap-2">
                                        {LANGUAGES.map(l => (
                                            <button type="button" key={l} onClick={() => toggleItem("languages", l)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(wizard.languages ?? []).includes(l)
                                                    ? "border-purple-500 bg-purple-500/20 text-purple-300"
                                                    : "border-white/10 text-slate-400 hover:border-white/20"
                                                    }`}>{l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── Step 2: Document Upload ── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-2">Upload Business License</h2>
                            <p className="text-slate-400 text-sm">Upload a clear scan of your business registration or professional license. PDF, JPG, or PNG accepted. Max 10MB.</p>

                            <label className={`flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${uploadProgress === "done" ? "border-emerald-500/50 bg-emerald-500/5" :
                                uploadProgress === "error" ? "border-red-500/50 bg-red-500/5" :
                                    "border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5"
                                }`}>
                                <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                                {uploadProgress === "uploading" && <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />}
                                {uploadProgress === "done" && <CheckCircle className="w-10 h-10 text-emerald-400 mb-3" />}
                                {(uploadProgress === "idle" || uploadProgress === "error") && <FileUp className="w-10 h-10 text-slate-500 mb-3" />}
                                <p className={`text-sm font-medium ${uploadProgress === "done" ? "text-emerald-400" : uploadProgress === "error" ? "text-red-400" : "text-slate-400"}`}>
                                    {uploadProgress === "uploading" ? "Uploading..." :
                                        uploadProgress === "done" ? `Uploaded: ${wizard.documentName}` :
                                            uploadProgress === "error" ? "Upload failed — click to retry" :
                                                "Click to upload or drag and drop"}
                                </p>
                            </label>

                            <div className="flex justify-between pt-4">
                                <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white px-4 py-3 rounded-xl transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={() => { if (uploadProgress !== "done") { setError("Please upload your document first."); return; } setError(null); setStep(3) }}
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                                >
                                    Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Review & Submit ── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-2">Review & Submit</h2>
                            <p className="text-slate-400 text-sm">Please review your details before submitting for admin verification.</p>

                            <div className="space-y-4 text-sm text-slate-300">
                                <div className="grid grid-cols-2 gap-3 border-b border-white/5 pb-4">
                                    <div><span className="text-slate-500">Company</span><p className="text-white font-medium mt-1">{wizard.company_name}</p></div>
                                    <div><span className="text-slate-500">Pricing</span><p className="text-white font-medium mt-1">{wizard.pricing_band}</p></div>
                                    <div className="col-span-2"><span className="text-slate-500">Bio</span><p className="text-white mt-1 leading-relaxed">{wizard.bio}</p></div>
                                    {wizard.website_url && <div><span className="text-slate-500">Website</span><p className="text-blue-400 mt-1">{wizard.website_url}</p></div>}
                                    <div><span className="text-slate-500">Response Time</span><p className="text-white font-medium mt-1">{wizard.response_time_hours}h</p></div>
                                </div>
                                <div className="border-b border-white/5 pb-4">
                                    <span className="text-slate-500">Services</span>
                                    <p className="text-white mt-1">{(wizard.services ?? []).join(", ") || "None selected"}</p>
                                </div>
                                <div className="border-b border-white/5 pb-4">
                                    <span className="text-slate-500">Languages</span>
                                    <p className="text-white mt-1">{(wizard.languages ?? []).join(", ") || "None selected"}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Document</span>
                                    <p className="text-emerald-400 mt-1 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{wizard.documentName}</p>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-2xl text-xs leading-relaxed">
                                After submission, your application will be reviewed by our team within 1-2 business days. You will be notified once verified.
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white px-4 py-3 rounded-xl transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                                >
                                    {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CheckCircle className="w-4 h-4" /> Submit Application</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
