"use client";

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const LOGO_SOURCES = ["/brand/logo.png", "/brand/xband-logo.png"] as const

export function XbandLogo({ className = "w-10 h-10" }: { className?: string }) {
    const [sourceIndex, setSourceIndex] = useState(0)
    const [showTextFallback, setShowTextFallback] = useState(false)

    const src = LOGO_SOURCES[Math.min(sourceIndex, LOGO_SOURCES.length - 1)]

    const handleError = () => {
        setSourceIndex((current) => {
            if (current < LOGO_SOURCES.length - 1) return current + 1
            setShowTextFallback(true)
            return current
        })
    }

    return (
        <span className={cn("relative flex items-center justify-center shrink-0", className)}>
            {!showTextFallback ? (
                <>
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-1 rounded-full bg-[radial-gradient(circle,rgba(242,201,76,0.34)_0%,rgba(242,201,76,0.1)_48%,transparent_78%)] logo-gooey-glow"
                    />
                    <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 44px, 56px"
                        className="pointer-events-none object-contain logo-gooey-layer"
                        aria-hidden="true"
                    />
                    <Image
                        src={src}
                        alt="XBandGlobal logo"
                        fill
                        sizes="(max-width: 768px) 44px, 56px"
                        className="relative object-contain logo-core-fade brightness-110 contrast-125 saturate-125 drop-shadow-[0_0_12px_rgba(250,220,130,0.38)]"
                        onError={handleError}
                    />
                </>
            ) : (
                <span className="text-[10px] font-semibold tracking-[0.12em] text-white/80">XBandGlobal</span>
            )}
        </span>
    )
}
