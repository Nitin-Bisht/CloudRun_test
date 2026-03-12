// Centralized transactional email helper
// Uses Resend with explicit delivery modes:
// - live: send to real recipient
// - sandbox: redirect all mail to EMAIL_SANDBOX_TO

const FROM = process.env.RESEND_FROM_EMAIL ?? "XbandGlobal <onboarding@resend.dev>"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xband.global"
const DELIVERY_MODE = (process.env.EMAIL_DELIVERY_MODE ?? "live").toLowerCase()
const SANDBOX_TO = process.env.EMAIL_SANDBOX_TO?.trim()
const FAIL_HARD = process.env.EMAIL_FAIL_HARD === "true"

const API_KEY = () => process.env.RESEND_API_KEY

type SendEmailResult = {
    delivered: boolean
    status: number | null
    error?: string
}

function failEmail(message: string): SendEmailResult {
    console.error(message)
    if (FAIL_HARD) {
        throw new Error(message)
    }
    return { delivered: false, status: null, error: message }
}

function wrapSandboxNotice(html: string, originalRecipient: string): string {
    return `
      <div style="margin-bottom:16px;padding:10px 12px;border:1px solid #92400e;background:#451a03;color:#fef3c7;border-radius:8px;font-size:12px">
        Sandbox mode active. Original recipient: <strong>${originalRecipient}</strong>
      </div>
      ${html}
    `
}

async function sendEmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
    const key = API_KEY()
    if (!key) {
        return failEmail(`[Email] RESEND_API_KEY not set - skipping: \"${subject}\" -> ${to}`)
    }

    let recipient = to
    let finalSubject = subject
    let finalHtml = html

    if (DELIVERY_MODE === "sandbox") {
        if (!SANDBOX_TO) {
            return failEmail(
                `[Email] EMAIL_DELIVERY_MODE=sandbox requires EMAIL_SANDBOX_TO. Skipping: \"${subject}\" -> ${to}`
            )
        }
        recipient = SANDBOX_TO
        finalSubject = `[SANDBOX to ${to}] ${subject}`
        finalHtml = wrapSandboxNotice(html, to)
    }

    let res: Response
    try {
        res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ from: FROM, to: [recipient], subject: finalSubject, html: finalHtml }),
        })
    } catch (error) {
        return failEmail(`[Email] Network error for \"${subject}\": ${error instanceof Error ? error.message : String(error)}`)
    }

    if (!res.ok) {
        const err = await res.text()
        const tip =
            res.status === 403
                ? " Resend rejected delivery. If your domain is not verified, use EMAIL_DELIVERY_MODE=sandbox with EMAIL_SANDBOX_TO set to your verified inbox."
                : ""
        return failEmail(`[Email] Resend error (${res.status}) for \"${subject}\" -> ${recipient}: ${err}${tip}`)
    }

    console.log(`[Email] Delivered (${DELIVERY_MODE}) \"${subject}\" -> ${recipient}`)
    return { delivered: true, status: res.status }
}

function wrapLayout(title: string, body: string): string {
    return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;background:#030811;color:#cbd5e1;border-radius:16px;overflow:hidden">
      <div style="background:#040c1e;padding:32px 40px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <span style="font-size:22px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#fff">XbandGlobal</span>
      </div>
      <div style="padding:40px">
        <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 16px">${title}</h2>
        ${body}
      </div>
      <div style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#475569;text-align:center">
        XbandGlobal - Verified Incorporation Setup, Trusted Across Regions<br/>
        This is a transactional email - please do not reply.
      </div>
    </div>`
}

export async function sendCreditPurchaseEmail(
    to: string,
    credits: number,
    amountUsdCents: number
): Promise<void> {
    const html = wrapLayout("Credits Added to Your Account", `
      <p style="margin:0 0 16px;color:#94a3b8">Your purchase was successful.</p>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <p style="margin:0;font-size:36px;font-weight:800;color:#fff">${credits} <span style="font-size:16px;color:#64748b">credits</span></p>
        <p style="margin:8px 0 0;font-size:13px;color:#64748b">Charged: $${(amountUsdCents / 100).toFixed(2)} USD</p>
      </div>
      <p style="color:#94a3b8;font-size:14px">Your credits are now available in your XbandGlobal dashboard to contact service providers.</p>
      <a href="${SITE_URL}/dashboard"
         style="display:inline-block;margin-top:24px;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        Go to Dashboard ->
      </a>
    `)
    await sendEmail(to, `${credits} Credits Added - XbandGlobal`, html)
}

export async function sendNewLeadEmail(
    providerEmail: string,
    providerCompany: string,
    clientName: string,
    messagePreview: string
): Promise<void> {
    const preview = messagePreview.substring(0, 500) + (messagePreview.length > 500 ? "..." : "")
    const html = wrapLayout("You Have a New Lead", `
      <p style="margin:0 0 16px;color:#94a3b8">
        A potential client has reached out to <strong style="color:#fff">${providerCompany}</strong> on XbandGlobal
      </p>
      <div style="background:rgba(255,255,255,0.04);border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em">From: ${clientName}</p>
        <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6">${preview}</p>
      </div>
      <a href="${SITE_URL}/dashboard/provider/leads"
         style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        View Full Message ->
      </a>
    `)
    await sendEmail(providerEmail, `New Lead from ${clientName} - XbandGlobal`, html)
}

export async function sendLeadRefundEmail(
    clientEmail: string,
    providerName: string,
    creditsReturned: number
): Promise<void> {
    const html = wrapLayout("Lead Refund Processed", `
      <p style="margin:0 0 16px;color:#94a3b8">
        A refund has been issued for your lead contact with <strong style="color:#fff">${providerName}</strong>.
      </p>
      <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <p style="margin:0;font-size:28px;font-weight:800;color:#c4b5fd">${creditsReturned} <span style="font-size:14px;color:#7c3aed">credits returned</span></p>
        <p style="margin:8px 0 0;font-size:12px;color:#64748b">Credits are now available in your account.</p>
      </div>
      <p style="color:#94a3b8;font-size:14px">If you have questions, contact our support team.</p>
      <a href="${SITE_URL}/dashboard"
         style="display:inline-block;margin-top:24px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        View Dashboard ->
      </a>
    `)
    await sendEmail(clientEmail, `Refund Processed: ${creditsReturned} Credits Returned - XbandGlobal`, html)
}

type ProviderStatus = "verified" | "rejected" | "suspended"

const STATUS_COPY: Record<ProviderStatus, { title: string; body: string; color: string; action?: string }> = {
    verified: {
        title: "Your Provider Application is Approved",
        body: "Congratulations - your XbandGlobal provider profile has been verified and is now live on the platform. Clients can now discover and contact you.",
        color: "#10b981",
        action: "View Your Profile",
    },
    rejected: {
        title: "Provider Application Update",
        body: "After review, your current application was not approved. Please review our provider requirements and resubmit with any missing documentation.",
        color: "#ef4444",
        action: "Resubmit Application",
    },
    suspended: {
        title: "Provider Account Suspended",
        body: "Your provider profile has been temporarily suspended pending review. Please contact support if you have questions.",
        color: "#f59e0b",
    },
}

export async function sendProviderStatusEmail(
    providerEmail: string,
    companyName: string,
    status: ProviderStatus
): Promise<void> {
    const cfg = STATUS_COPY[status]
    const html = wrapLayout(cfg.title, `
      <p style="margin:0 0 16px;color:#94a3b8">
        Hi <strong style="color:#fff">${companyName}</strong>,
      </p>
      <div style="background:rgba(255,255,255,0.04);border-left:4px solid ${cfg.color};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6">${cfg.body}</p>
      </div>
      ${cfg.action ? `
      <a href="${SITE_URL}/dashboard"
         style="display:inline-block;padding:12px 24px;background:${cfg.color};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        ${cfg.action} ->
      </a>` : ""}
    `)
    await sendEmail(providerEmail, `${cfg.title} - XbandGlobal`, html)
}
