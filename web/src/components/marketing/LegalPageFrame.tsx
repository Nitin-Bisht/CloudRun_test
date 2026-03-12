import Link from "next/link"
import { ArrowLeft, Clock3 } from "lucide-react"
import { XbandLogo } from "@/components/ui/XbandLogo"


type LegalSection = {
    title: string
    paragraphs: string[]
}

type LegalPageFrameProps = {
    title: string
    subtitle: string
    updatedOn: string
    sections: LegalSection[]
}

export function LegalPageFrame({ title, subtitle, updatedOn, sections }: LegalPageFrameProps) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#02040a] px-4 py-24 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[#02040a] z-0" />
                {/* Orbital Geometric Rings */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.03] animate-[spin_60s_linear_infinite] z-0" />
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/[0.05] animate-[spin_40s_linear_infinite_reverse] z-0" />

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

            <div className="relative z-10 mx-auto w-full max-w-5xl space-y-8">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[11px] font-display uppercase tracking-[0.2em] text-slate-300 transition-colors hover:border-white/30 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back Home
                    </Link>
                    <XbandLogo className="w-10 h-10" />
                </div>

                <section className="rounded-[2rem] border border-white/10 bg-[#060d1f]/40 p-8 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] sm:p-10 lg:p-12 relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.05] to-transparent mix-blend-overlay" />
                    <div className="relative">
                        <div className="space-y-4">
                            <p className="text-xs font-display uppercase tracking-[0.42em] text-primary/80">Legal Protocol</p>
                            <h1 className="text-4xl tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">{title}</h1>
                            <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">{subtitle}</p>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.02] px-4 py-2 text-[11px] text-slate-400">
                                <Clock3 className="h-3.5 w-3.5" />
                                Last updated: {updatedOn}
                            </div>
                        </div>

                        <div className="mt-10 space-y-6">
                            {sections.map((section, index) => (
                                <article key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.015] p-5 sm:p-6">
                                    <div className="mb-3 flex items-center gap-3">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <h2 className="text-xl tracking-tight text-white sm:text-2xl">{section.title}</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {section.paragraphs.map((paragraph) => (
                                            <p key={paragraph} className="text-sm leading-relaxed text-slate-300 sm:text-base">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
