import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import { AuthShell } from "@/components/auth/AuthShell"

export default function ForgotPasswordPage() {
    return (
        <AuthShell
            title="Reset password"
            description="Enter your account email and we will send secure reset instructions."
        >
            <ForgotPasswordForm />
        </AuthShell>
    )
}
