"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
    const [state, formAction] = useActionState(resetPassword, null);
    const fieldClass = "h-11 rounded-lg border-white/10 bg-white/[0.02] px-4 text-sm text-white placeholder:text-slate-500 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:bg-white/[0.04] transition-all duration-300";

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-300">New password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className={fieldClass}
                    />
                    <p className="text-xs text-slate-500">Must be at least 6 characters.</p>
                </div>
            </div>

            {state?.error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/12 px-4 py-3 text-sm font-medium text-red-200">
                    {state.error}
                </div>
            )}

            <Button type="submit" className="h-11 w-full rounded-xl bg-white text-black font-semibold hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(0,210,255,0.2)] transition-all duration-300">
                Update password
            </Button>

            <div className="mt-4 text-center text-sm text-slate-300">
                Back to{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                    log in
                </Link>
            </div>
        </form>
    );
}
