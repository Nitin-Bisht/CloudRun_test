"use client"

import Link from "next/link"
import { motion, useScroll } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { XbandLogo } from "@/components/ui/XbandLogo"

function Clock() {
    const [time, setTime] = useState("")

    useEffect(() => {
        const update = () => {
            const now = new Date()
            setTime(now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }))
        }
        update()
        const id = setInterval(update, 60000)
        return () => clearInterval(id)
    }, [])

    return (
        <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#0a1f44]/40">Sovereign Time</span>
            <span className="text-sm font-display text-[#0a1f44]">{time || "00:00 AM"}</span>
        </div>
    )
}

export function Navbar() {
    const { scrollY } = useScroll()
    const [isCompact, setIsCompact] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    const lastYRef = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentY = scrollY.get()
            const deltaY = currentY - lastYRef.current

            // Become compact after 80px scroll
            setIsCompact(currentY > 80)

            // Hide on scroll down after 200px, show on scroll up
            if (currentY > 200 && deltaY > 10) {
                setIsHidden(true)
            } else if (deltaY < -10 || currentY < 200) {
                setIsHidden(false)
            }

            lastYRef.current = currentY
        }

        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [scrollY])

    const navLinks = [
        { name: "Architecture", href: "/#architecture" },
        { name: "Method", href: "/#method" },
        { name: "Pricing", href: "/pricing" },
        { name: "Contact", href: "/contact" },
        { name: "Launch", href: "/#get-started" },
    ]

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.36, 1] }}
            className={[
                "fixed top-0 left-0 right-0 z-[100] px-10 flex items-center justify-between pointer-events-none",
                "transition-[padding,transform,background-color,backdrop-filter,border-color] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isCompact
                    ? "py-5 bg-white/90 backdrop-blur-md border-b border-[#0a1f44]/10 shadow-sm"
                    : "py-10",
                isHidden ? "-translate-y-[120%]" : "translate-y-0",
            ].join(" ")}
        >
            {/* Left Group: Branding + Nav */}
            <div className="flex items-center gap-24 pointer-events-auto">
                <Link href="/" className="group flex items-center gap-4">
                    <XbandLogo className="h-10 w-10 relative z-10" />
                    <span className="text-[1.45rem] sm:text-[1.6rem] font-medium tracking-[-0.02em] text-[#0a1f44] transition-colors duration-500 group-hover:text-[#c9a84c]">
                        XBandGlobal
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-12">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[10px] font-display uppercase tracking-[0.4em] text-[#0a1f44]/50 hover:text-[#0a1f44] transition-colors duration-500"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right Group: State Indicator */}
            <div className="flex items-center gap-8 pointer-events-auto">
                <Clock />
                <div className="w-12 h-12 rounded-full border border-[#0a1f44]/15 flex items-center justify-center group hover:bg-[#0a1f44]/8 transition-all cursor-pointer">
                    <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full group-hover:scale-150 transition-transform" />
                </div>
            </div>
        </motion.header>
    )
}
