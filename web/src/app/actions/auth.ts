"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const signupSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["client", "provider"]),
})

export async function login(prevState: unknown, formData: FormData) {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0].message,
        }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
}

export async function signup(prevState: unknown, formData: FormData) {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0].message,
        }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            data: {
                role: parsed.data.role, // This gets picked up by DB trigger
            },
        }
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
}

export async function logout() {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
}

const emailSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
})

export async function requestPasswordReset(prevState: unknown, formData: FormData) {
    const parsed = emailSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const supabase = await createServerSupabaseClient()

    // Typically we'd append a return URL or something
    // get callback url from origin
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${origin}/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: "Password reset instructions sent. Please check your email." }
}

const resetPasswordSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export async function resetPassword(prevState: unknown, formData: FormData) {
    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
    })

    if (error) {
        return { error: error.message }
    }

    redirect("/dashboard")
}
