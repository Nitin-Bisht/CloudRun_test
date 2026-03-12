import { SignupForm } from "@/components/auth/SignupForm"
import { AuthShell } from "@/components/auth/AuthShell"

type SignupPageProps = {
    searchParams: Promise<{
        role?: string | string[]
    }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
    const resolvedSearchParams = await searchParams
    const roleParam = Array.isArray(resolvedSearchParams.role)
        ? resolvedSearchParams.role[0]
        : resolvedSearchParams.role
    const defaultRole = roleParam === "provider" ? "provider" : "client"

    return (
        <AuthShell
            title="Create your account"
            description="Set up your profile and start connecting with verified incorporation partners worldwide."
        >
            <SignupForm defaultRole={defaultRole} />
        </AuthShell>
    )
}
