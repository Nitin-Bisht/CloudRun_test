"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
    const [state, formAction] = useActionState(requestPasswordReset, null);
    const fieldClass = "h-11 rounded-lg border-white/10 bg-white/[0.02] px-4 text-sm text-white placeholder:text-slate-500 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:bg-white/[0.04] transition-all duration-300";

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        className={fieldClass}
                    />
                </div>
            </div>

            {state?.error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/12 px-4 py-3 text-sm font-medium text-red-200">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/12 px-4 py-3 text-sm font-medium text-emerald-200">
                    {state.success}
                </div>
            )}

            <Button type="submit" className="h-11 w-full rounded-xl bg-white text-black font-semibold hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(0,210,255,0.2)] transition-all duration-300">
                Send reset link
            </Button>

            <div className="mt-4 text-center text-sm text-slate-300">
                Remember your password?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                    Log in
                </Link>
            </div>
        </form>
    );
}
