// Stripe webhook handler
// Path: /api/webhooks/stripe
//
// Security controls:
// - verifies stripe-signature
// - processes only paid checkout sessions
// - validates package metadata against server-side package config
// - uses service-role Supabase client for privileged writes
// - applies idempotent transaction + credit increment atomically via Postgres RPC

import { NextRequest, NextResponse } from "next/server"
import { stripe, CREDIT_PACKAGES } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"
import { sendCreditPurchaseEmail } from "@/lib/email"

function createServiceClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase service role env vars")
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
    )
}

interface LegacyApplyInput {
    userId: string
    credits: number
    amountUsd: number
    paymentIntentId: string | null
    checkoutSessionId: string
}

async function applyStripePurchaseLegacy(
    supabase: ReturnType<typeof createServiceClient>,
    input: LegacyApplyInput
): Promise<{ applied: boolean; transactionId: string | null }> {
    const { userId, credits, amountUsd, paymentIntentId, checkoutSessionId } = input

    // Idempotency guard by payment_intent and checkout_session_id.
    if (paymentIntentId) {
        const { data: existingByIntent, error: existingByIntentError } = await supabase
            .from("transactions")
            .select("id")
            .eq("stripe_payment_intent", paymentIntentId)
            .maybeSingle()

        if (existingByIntentError) throw existingByIntentError
        if (existingByIntent?.id) {
            return { applied: false, transactionId: existingByIntent.id as string }
        }
    }

    const { data: existingBySession, error: existingBySessionError } = await supabase
        .from("transactions")
        .select("id")
        .eq("stripe_checkout_session_id", checkoutSessionId)
        .maybeSingle()

    if (existingBySessionError) throw existingBySessionError
    if (existingBySession?.id) {
        return { applied: false, transactionId: existingBySession.id as string }
    }

    const { data: insertedTx, error: insertError } = await supabase
        .from("transactions")
        .insert({
            user_id: userId,
            credits_amount: credits,
            amount_usd: amountUsd,
            stripe_payment_intent: paymentIntentId,
            stripe_checkout_session_id: checkoutSessionId,
            status: "succeeded",
        })
        .select("id")
        .single()

    if (insertError) {
        // Handle concurrent duplicate delivery race with unique constraints.
        if (insertError.code === "23505") {
            const { data: raceWinner } = await supabase
                .from("transactions")
                .select("id")
                .or(
                    paymentIntentId
                        ? `stripe_payment_intent.eq.${paymentIntentId},stripe_checkout_session_id.eq.${checkoutSessionId}`
                        : `stripe_checkout_session_id.eq.${checkoutSessionId}`
                )
                .maybeSingle()
            return { applied: false, transactionId: (raceWinner?.id as string | undefined) ?? null }
        }
        throw insertError
    }

    const insertedId = insertedTx.id as string
    const { error: incrementError } = await supabase.rpc("increment_user_credits", {
        p_user_id: userId,
        p_amount: credits,
    })

    if (incrementError) {
        // Compensating action: remove inserted transaction so retries can succeed.
        await supabase.from("transactions").delete().eq("id", insertedId)
        throw incrementError
    }

    return { applied: true, transactionId: insertedId }
}

export async function POST(req: NextRequest) {
    // Read raw body before parsing to keep signature verification valid.
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")
    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
        console.error("Stripe webhook: STRIPE_WEBHOOK_SECRET not set")
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    if (event.type !== "checkout.session.completed") {
        return NextResponse.json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session

    // Ignore completed sessions that are not yet paid (async methods).
    if (session.payment_status !== "paid") {
        console.log("Stripe webhook: checkout.session.completed ignored due to unpaid status", {
            sessionId: session.id,
            paymentStatus: session.payment_status,
        })
        return NextResponse.json({ received: true, ignored: true })
    }

    const userId = session.metadata?.user_id?.trim()
    const packageId = session.metadata?.package_id?.trim()
    const metadataCredits = parseInt(session.metadata?.credits ?? "", 10)
    const selectedPackage = packageId ? CREDIT_PACKAGES.find((pkg) => pkg.id === packageId) : undefined

    if (!userId || !packageId || !selectedPackage) {
        console.error("Stripe webhook: invalid metadata", {
            sessionId: session.id,
            userId,
            packageId,
        })
        return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    if (Number.isInteger(metadataCredits) && metadataCredits > 0 && metadataCredits !== selectedPackage.credits) {
        console.error("Stripe webhook: metadata credits mismatch", {
            sessionId: session.id,
            packageId,
            metadataCredits,
            expectedCredits: selectedPackage.credits,
        })
        return NextResponse.json({ error: "Package metadata mismatch" }, { status: 400 })
    }

    const paymentIntentId =
        typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null
    const amountUsd = Number(((session.amount_total ?? selectedPackage.priceUsdCents) / 100).toFixed(2))

    let supabase: ReturnType<typeof createServiceClient>
    try {
        supabase = createServiceClient()
    } catch (error) {
        console.error("Stripe webhook: service role client is not configured", error)
        return NextResponse.json({ error: "Webhook handler misconfigured" }, { status: 500 })
    }

    const { data: applyRows, error: applyError } = await supabase.rpc("apply_stripe_credit_purchase", {
        p_user_id: userId,
        p_credits: selectedPackage.credits,
        p_amount_usd: amountUsd,
        p_payment_intent: paymentIntentId,
        p_checkout_session_id: session.id,
    })

    if (applyError?.code === "PGRST202") {
        console.warn("Stripe webhook: apply_stripe_credit_purchase RPC missing, using legacy fallback path")
        try {
            const fallbackResult = await applyStripePurchaseLegacy(supabase, {
                userId,
                credits: selectedPackage.credits,
                amountUsd,
                paymentIntentId,
                checkoutSessionId: session.id,
            })

            if (!fallbackResult.applied) {
                return NextResponse.json({ received: true, duplicate: true })
            }

            console.log(
                `Stripe webhook: credited ${selectedPackage.credits} credits to user ${userId} (tx ${fallbackResult.transactionId})`
            )
            return NextResponse.json({ received: true })
        } catch (fallbackError) {
            console.error("Stripe webhook: legacy fallback failed:", fallbackError)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
        }
    }

    if (applyError) {
        console.error("Stripe webhook: failed to apply credit purchase atomically:", applyError)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const applyResult = Array.isArray(applyRows) ? applyRows[0] : null
    if (!applyResult) {
        console.error("Stripe webhook: apply_stripe_credit_purchase returned no data", {
            sessionId: session.id,
            userId,
            paymentIntentId,
        })
        return NextResponse.json({ error: "Invalid database response" }, { status: 500 })
    }

    if (!applyResult.applied) {
        console.log("Stripe webhook: duplicate event skipped", {
            sessionId: session.id,
            paymentIntentId,
            transactionId: applyResult.transaction_id,
        })
        return NextResponse.json({ received: true, duplicate: true })
    }

    console.log(
        `Stripe webhook: credited ${selectedPackage.credits} credits to user ${userId} (tx ${applyResult.transaction_id})`
    )

        // Fire purchase confirmation email — non-blocking
        ; (async () => {
            try {
                const { data: profileRow } = await supabase
                    .from("profiles")
                    .select("email")
                    .eq("id", userId)
                    .single()
                if (profileRow?.email) {
                    await sendCreditPurchaseEmail(
                        profileRow.email as string,
                        selectedPackage.credits,
                        session.amount_total ?? selectedPackage.priceUsdCents
                    )
                }
            } catch (e) {
                console.error("Credit purchase email failed (non-fatal):", e)
            }
        })()

    return NextResponse.json({ received: true })
}
