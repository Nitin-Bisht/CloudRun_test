import { LoginForm } from "@/components/auth/LoginForm"
import { AuthShell } from "@/components/auth/AuthShell"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ deleted?: string }>
}) {
    const { deleted } = await searchParams

    return (
        <AuthShell
            title="Log in to XbandGlobal"
            description="Welcome back. Access your global setup workspace and continue execution."
        >
            {deleted === "true" && (
                <div className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-500/12 px-4 py-3 text-sm font-medium text-emerald-200">
                    Your account has been deleted successfully.
                </div>
            )}
            <LoginForm />
        </AuthShell>
    )
}
