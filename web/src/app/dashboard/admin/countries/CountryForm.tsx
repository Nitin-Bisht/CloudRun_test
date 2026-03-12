"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { upsertCountry } from "@/app/actions/countries"
import { Country, CountryUpsertInput } from "@/lib/types/countries"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"

const countrySchema = z.object({
    code: z.string().min(2).max(3).toUpperCase(),
    name: z.string().min(2),
    flag_emoji: z.string().optional(),
    avg_cost: z.string().optional(),
    is_active: z.boolean(),
    requirements: z.string().refine((val) => {
        try {
            JSON.parse(val)
            return true
        } catch {
            return false
        }
    }, "Must be valid JSON string")
})

type CountryFormValues = z.infer<typeof countrySchema>

export default function CountryEditForm({ initialData }: { initialData: Country | null }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const form = useForm<CountryFormValues>({
        resolver: zodResolver(countrySchema),
        defaultValues: {
            code: initialData?.code || "",
            name: initialData?.name || "",
            flag_emoji: initialData?.flag_emoji || "",
            avg_cost: initialData?.avg_cost || "",
            is_active: initialData?.is_active ?? true,
            requirements: initialData?.requirements ? JSON.stringify(initialData.requirements, null, 2) : "{\n  \"company_types\": [],\n  \"min_capital\": \"\",\n  \"local_director\": \"\",\n  \"registered_address\": \"\",\n  \"documents\": [],\n  \"timeline\": \"\",\n  \"tax_info\": \"\"\n}"
        }
    })

    function onSubmit(data: CountryFormValues) {
        setError(null)
        startTransition(async () => {
            const parsedData: CountryUpsertInput = {
                ...data,
                requirements: JSON.parse(data.requirements) as CountryUpsertInput["requirements"],
            }

            const result = await upsertCountry(parsedData)

            if (result.success) {
                router.push("/dashboard/admin/countries")
                router.refresh()
            } else {
                setError(result.error || "Failed to save country")
            }
        })
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-8">
            <Link
                href="/dashboard/admin/countries"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Jurisdictions
            </Link>

            <div>
                <h1 className="text-3xl font-bold text-white">
                    {initialData ? `Edit ${initialData.name}` : "New Jurisdiction"}
                </h1>
                <p className="mt-2 text-slate-400">Manage directory details and JSON requirements.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-[#060D1E]/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Country Code (2-3 chars URL slug)</label>
                        <input
                            {...form.register("code")}
                            disabled={!!initialData}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                            placeholder="e.g. AE"
                        />
                        {form.formState.errors.code && <p className="text-red-400 text-xs mt-1">{form.formState.errors.code.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Display Name</label>
                        <input
                            {...form.register("name")}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. United Arab Emirates"
                        />
                        {form.formState.errors.name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Flag Emoji</label>
                        <input
                            {...form.register("flag_emoji")}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. UAE flag emoji"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Average Setup Cost (Display string)</label>
                        <input
                            {...form.register("avg_cost")}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. $5,000 - $12,000"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 py-4 border-y border-white/10">
                    <input
                        type="checkbox"
                        {...form.register("is_active")}
                        id="is_active"
                        className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-500 focus:ring-blue-500 focus:ring-offset-black"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-slate-200">
                        Active (Visible to public)
                    </label>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-300">Requirements (JSON format)</label>
                        <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded">Format: Format_Structure schemas</span>
                    </div>
                    <textarea
                        {...form.register("requirements")}
                        className="w-full h-80 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        spellCheck="false"
                    />
                    {form.formState.errors.requirements && <p className="text-red-400 text-xs mt-1">{form.formState.errors.requirements.message}</p>}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                    >
                        {isPending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {initialData ? "Save Changes" : "Create Jurisdiction"}
                    </button>
                </div>
            </form>
        </div>
    )
}
