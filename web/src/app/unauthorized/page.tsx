import Link from "next/link"
import { LockKeyhole, ArrowLeft, LayoutDashboard } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#02040a] px-4 py-16 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[#02040a] z-0" />
                {/* Orbital Geometric Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.03] animate-[spin_60s_linear_infinite] z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/[0.05] animate-[spin_40s_linear_infinite_reverse] z-0" />

                {/* Luminous Glows */}
                <div className="absolute -left-[10%] top-[10%] h-[50%] w-[50%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen z-0" />
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen z-0" />

                {/* Fine grain overlay without external asset requests */}
                <div
                    className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%, transparent)",
                        backgroundSize: "3px 3px",
                    }}
                />
            </div>

            <section className="relative z-10 w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#060d1f]/40 p-8 text-center backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] sm:p-10 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.05] to-transparent mix-blend-overlay" />
                <div className="relative">
                    <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.02]">
                        <LockKeyhole className="h-6 w-6 text-primary" />
                    </span>

                    <p className="mt-5 text-xs font-display uppercase tracking-[0.34em] text-slate-400">Access Control</p>
                    <h1 className="mt-3 text-4xl tracking-tight text-white sm:text-5xl">Unauthorized</h1>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                        Your account does not currently have permission to open this page. Use dashboard navigation or return to home.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-full border border-white/18 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Home
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-primary/85"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
