import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import { AuthShell } from "@/components/auth/AuthShell"

export default function ResetPasswordPage() {
    return (
        <AuthShell
            title="Set new password"
            description="Create a strong password to secure your XbandGlobal account and continue."
        >
            <ResetPasswordForm />
        </AuthShell>
    )
}
