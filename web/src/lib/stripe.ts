// ─── Stripe Client Singleton ──────────────────────────────────────────────────
// Role: Backend Architect (skill: backend-architect)
// Safe to import in Server Components and Route Handlers.

import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
})

// ─── Credit Packages ──────────────────────────────────────────────────────────
// Single source of truth — used by the UI and the checkout session creator.

export interface CreditPackage {
    id: string
    credits: number
    priceUsd: number       // in dollars
    priceUsdCents: number  // in cents (for Stripe)
    label: string
    badge: string | null
    description: string
}

export const CREDIT_PACKAGES: CreditPackage[] = [
    {
        id: "credits_5",
        credits: 5,
        priceUsd: 25,
        priceUsdCents: 2500,
        label: "Starter",
        badge: null,
        description: "Perfect for exploring the platform",
    },
    {
        id: "credits_20",
        credits: 20,
        priceUsd: 80,
        priceUsdCents: 8000,
        label: "Growth",
        badge: "Most Popular",
        description: "20% cheaper per credit",
    },
    {
        id: "credits_50",
        credits: 50,
        priceUsd: 150,
        priceUsdCents: 15000,
        label: "Scale",
        badge: "Best Value",
        description: "40% cheaper per credit",
    },
]
