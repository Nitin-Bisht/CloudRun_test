"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Country, CountryUpsertInput } from "@/lib/types/countries"
import { revalidatePath } from "next/cache"

export async function getCountries(activeOnly: boolean = true): Promise<Country[]> {
    const supabase = await createServerSupabaseClient()

    let query = supabase.from("countries").select("*").order("name")

    if (activeOnly) {
        query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
        console.error("Error fetching countries:", error)
        return []
    }

    return (data ?? []) as Country[]
}

export async function getCountryByCode(code: string): Promise<Country | null> {
    const normalizedCode = code?.trim().toUpperCase()
    if (!normalizedCode) return null

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("countries")
        .select("*")
        .eq("code", normalizedCode)
        .maybeSingle()

    if (error) {
        console.error(`Error fetching country ${code}:`, error)
        return null
    }

    return data as Country
}

export async function upsertCountry(countryData: CountryUpsertInput) {
    const supabase = await createServerSupabaseClient()

    // Assuming the RLS policy will block non-admins
    const { data, error } = await supabase
        .from("countries")
        .upsert({
            code: countryData.code.toUpperCase(),
            name: countryData.name,
            flag_emoji: countryData.flag_emoji,
            avg_cost: countryData.avg_cost,
            is_active: countryData.is_active,
            requirements: countryData.requirements,
        }, {
            onConflict: "code"
        })
        .select()
        .single()

    if (error) {
        console.error("Error upserting country:", error)
        return { success: false, error: error.message }
    }

    // Revalidate relevant paths
    revalidatePath("/countries")
    revalidatePath(`/countries/${countryData.code.toLowerCase()}`)
    revalidatePath("/dashboard/admin/countries")
    revalidatePath("/dashboard/admin/countries/new")

    return { success: true, data: data as Country }
}
