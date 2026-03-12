import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { XbandLogo } from "@/components/ui/XbandLogo"

type AuthShellProps = {
    title: string
    description: string
    children: ReactNode
}

export function AuthShell({ title, description, children }: AuthShellProps) {
    return (
        <main className="relative flex min-h-screen bg-[#02040a] overflow-hidden">
            {/* Left Panel: Form Content */}
            <div className="relative z-10 flex w-full flex-col justify-between px-6 py-8 sm:px-12 lg:w-1/2 xl:px-24">
                <header className="flex items-center justify-between">
                    <Link href="/" className="group inline-flex items-center gap-4">
                        <XbandLogo className="h-8 w-8 group-hover:scale-105 transition-transform duration-500" />
                        <span className="text-[1.35rem] font-medium tracking-[-0.02em] text-white/95 transition-colors duration-300 group-hover:text-primary">
                            XBandGlobal
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-[10px] font-display uppercase tracking-[0.22em] text-slate-400 hover:border-white/30 hover:text-white hover:bg-white/[0.04] transition-all duration-300"
                    >
                        Back to site
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </header>

                <div className="flex flex-1 flex-col justify-center max-w-md w-full mx-auto my-12">
                    <div className="mb-8 space-y-3">
                        <XbandLogo className="w-12 h-12" />
                        <h1 className="text-4xl font-medium leading-none tracking-[-0.03em] text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.24)]">
                            XBandGlobal
                        </h1>
                    </div>
                    {children}
                </div>

                <footer className="text-sm text-slate-500 flex justify-between items-center">
                    <p className="text-sm text-white/40">
                        &copy; {new Date().getFullYear()} XbandGlobal. Integrated world-building protocols.
                    </p>
                </footer>
            </div>

            {/* Right Panel: Immersive Branding */}
            <div className="relative hidden w-1/2 lg:block border-l border-white/5 bg-[#060d1f]/40 relative overflow-hidden backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {/* Dark base */}
                    <div className="absolute inset-0 bg-black/40 z-0" />

                    {/* Orbital Geometric Rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/[0.02] animate-[spin_80s_linear_infinite] z-0" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-primary/[0.04] animate-[spin_50s_linear_infinite_reverse] z-0" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-cyan-400/[0.03] animate-[spin_30s_linear_infinite] z-0" />

                    {/* Luminous Glows */}
                    <div className="absolute -left-[20%] top-[20%] h-[60%] w-[60%] bg-cyan-500/10 blur-[130px] rounded-full mix-blend-screen z-0" />
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen z-0" />
                    <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[400px] bg-blue-600/15 blur-[160px] rounded-full mix-blend-screen z-0" />

                    {/* Grid overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.25] mix-blend-overlay z-0"
                        style={{
                            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                            maskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                        }}
                    />

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

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-12 z-10 bg-gradient-to-t from-[#02040a] via-transparent to-transparent">
                    <div className="space-y-6 max-w-xl">
                        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[10px] font-display uppercase tracking-[0.3em] text-primary backdrop-blur-md">
                            Mission Control
                        </span>
                        <h2 className="text-5xl lg:text-6xl font-display uppercase leading-[0.95] tracking-[-0.04em] text-white">
                            Institutional Execution Lane
                        </h2>
                        <p className="text-lg leading-relaxed text-slate-300 font-light">
                            XbandGlobal connects visionary founders with verified incorporation specialists across 190+ jurisdictions. Seamless discovery, immutable trust, zero friction.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
