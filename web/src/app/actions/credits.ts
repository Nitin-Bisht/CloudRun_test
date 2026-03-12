"use server"

// ─── Credits Server Actions ───────────────────────────────────────────────────
// Role: Backend Architect + Security Auditor (skills: backend-architect, backend-security-coder)

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { stripe, CREDIT_PACKAGES } from "@/lib/stripe"

function resolveAppOrigin(): string {
    const configuredOrigin = process.env.APP_ORIGIN ?? process.env.NEXT_PUBLIC_APP_ORIGIN
    if (configuredOrigin) {
        const parsed = new URL(configuredOrigin)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            throw new Error("APP_ORIGIN must use http or https")
        }
        return parsed.origin
    }

    const vercelOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
    if (vercelOrigin) {
        const normalized = vercelOrigin.replace(/^https?:\/\//, "")
        return `https://${normalized}`
    }

    if (process.env.NODE_ENV !== "production") {
        return "http://localhost:3000"
    }

    throw new Error("APP_ORIGIN is required in production")
}

/**
 * Creates a Stripe Checkout Session for a credit package purchase.
 * Redirects directly to Stripe Checkout on success.
 */
export async function createCheckoutSession(packageId: string): Promise<{ error: string } | never> {

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)
    if (!pkg) return { error: "Invalid credit package" }

    // Only clients can buy credits (admins and providers don't need them)
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", user.id)
        .single()
    if (!profile) return { error: "Profile not found" }
    if (profile.role !== "client") return { error: "Only client accounts can purchase credits" }

    let origin: string
    try {
        origin = resolveAppOrigin()
    } catch (err) {
        console.error("createCheckoutSession: invalid app origin configuration", err)
        return { error: "Checkout is temporarily unavailable. Please try again later." }
    }

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: profile.email,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    unit_amount: pkg.priceUsdCents,
                    product_data: {
                        name: `XbandGlobal ${pkg.credits} Credits — ${pkg.label} Pack`,

                        description: pkg.description,
                        metadata: { package_id: pkg.id, credits: pkg.credits },
                    },
                },
                quantity: 1,
            },
        ],
        metadata: {
            user_id: user.id,
            package_id: pkg.id,
            credits: pkg.credits.toString(),
        },
        success_url: `${origin}/dashboard?credits=success&amount=${pkg.credits}`,
        cancel_url: `${origin}/dashboard/credits?cancelled=true`,
    })

    if (!session.url) return { error: "Failed to create checkout session" }
    redirect(session.url)
}

/**
 * FormData wrapper — required because HTML <form action={fn}> needs a
 * function that accepts FormData and returns void | Promise<void>.
 */
export async function createCheckoutSessionAction(formData: FormData): Promise<void> {
    const packageId = formData.get("packageId")
    if (typeof packageId !== "string" || !packageId) return
    await createCheckoutSession(packageId)
}
