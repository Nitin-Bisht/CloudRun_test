"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    Coins, LayoutDashboard, UserCircle, LogOut, ChevronRight,
    ShieldCheck, MessageSquare, Globe, ListChecks,
} from "lucide-react"
import { XbandLogo } from "@/components/ui/XbandLogo"

import { LogoutButton } from "@/components/auth/LogoutButton"

const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Browse Providers", href: "/providers", icon: Globe },
    { name: "Messages", href: "/dashboard/leads", icon: MessageSquare },
    { name: "Credits", href: "/dashboard/credits", icon: Coins },
]

const adminNavigation = [
    { name: "Admin Overview", href: "/dashboard/admin", icon: ShieldCheck },
    { name: "Providers", href: "/dashboard/admin/providers", icon: ListChecks },
    { name: "Lead Management", href: "/dashboard/admin/leads", icon: MessageSquare },
    { name: "Jurisdictions", href: "/dashboard/admin/countries", icon: Globe },
]

export function DashboardShell({
    children,
    userEmail,
    userRole,
}: {
    children: ReactNode
    userEmail: string
    userRole?: string
}) {
    const pathname = usePathname()
    const isAdmin = userRole === "admin"

    return (
        <div className="flex min-h-screen bg-[#010308] text-slate-300 selection:bg-primary/30 selection:text-white">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-[#020510]/95 backdrop-blur-2xl">
                <div className="flex h-[72px] items-center gap-3 px-6 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none" />
                    <XbandLogo className="h-6 w-6 relative z-10" />

                    <span className="text-lg font-medium tracking-[-0.01em] text-white relative z-10 drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                        XBandGlobal
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 no-scrollbar">
                    {/* Standard nav */}
                    <nav className="flex flex-col gap-2 relative z-10">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.name === "Browse Providers" && pathname.startsWith("/providers"))
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${isActive
                                        ? "text-white"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute inset-0 rounded-xl bg-white/10 border border-white/10 drop-shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={`h-[18px] w-[18px] shrink-0 relative z-10 transition-colors ${isActive ? "text-primary drop-shadow-[0_0_12px_rgba(0,210,255,0.6)]" : "text-slate-500 group-hover:text-slate-300"}`} />
                                    <span className="relative z-10">{item.name}</span>
                                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-primary/80 relative z-10" />}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Admin nav — rendered only for admins */}
                    {isAdmin && (
                        <div className="relative z-10">
                            <div className="px-3 mb-3 flex items-center gap-2">
                                <span className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500">Admin Controls</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
                            </div>
                            <nav className="flex flex-col gap-2">
                                {adminNavigation.map((item) => {
                                    const isActive = pathname.startsWith(item.href)
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${isActive
                                                ? "text-blue-50"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-admin-nav"
                                                    className="absolute inset-0 rounded-xl bg-blue-500/15 border border-blue-500/20 drop-shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                                />
                                            )}
                                            <item.icon className={`h-[18px] w-[18px] shrink-0 relative z-10 transition-colors ${isActive ? "text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" : "text-slate-500 group-hover:text-slate-300"}`} />
                                            <span className="relative z-10">{item.name}</span>
                                            {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-400/80 relative z-10" />}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    )}
                </div>

                <div className="border-t border-white/[0.08] p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="group flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 cursor-default relative overflow-hidden shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a1224] border border-white/10 shadow-inner">
                            <UserCircle className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 overflow-hidden relative z-10">
                            <p className="truncate text-xs font-semibold text-white/90">{userEmail}</p>
                            <p className="text-[9px] font-display uppercase tracking-[0.16em] text-primary/80 mt-0.5">{isAdmin ? "System Admin" : "Platform Operator"}</p>
                        </div>
                    </div>
                    <div className="mt-2">
                        <LogoutButton variant="ghost" className="w-full justify-start gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-300">
                            <LogOut className="h-4 w-4 shrink-0" />
                            Secure Disconnect
                        </LogoutButton>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-64 relative min-h-screen flex flex-col">
                {/* Background layers */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden pl-64">
                    {/* Dark base */}
                    <div className="absolute inset-0 bg-[#010308] z-0" />

                    {/* Deep Cinematic Glows */}
                    <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full mix-blend-screen translate-y-1/4 translate-x-1/4" />
                    <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-600/[0.03] blur-[100px] rounded-full mix-blend-screen" />

                    {/* Fine grain overlay without external asset requests */}
                    <div
                        className="absolute inset-0 z-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
                        style={{
                            backgroundImage:
                                "linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%, transparent)",
                            backgroundSize: "3px 3px",
                        }}
                    />
                </div>

                <div className="relative z-20 w-full flex-1 flex flex-col">
                    {/* Top ambient glow bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50 absolute top-0 inset-x-0" />

                    <div className="px-8 py-10 lg:px-12 flex-1 relative mt-[1px]">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
