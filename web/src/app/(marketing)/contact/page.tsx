import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, Globe } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "Contact Us | XbandGlobal",
    description: "Get in touch with the XbandGlobal protocol support team.",
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#020813] py-24 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full mix-blend-screen translate-y-1/4 translate-x-1/4" />

            <div className="mx-auto max-w-5xl relative z-10">
                {/* ── Header ── */}
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[10px] font-display uppercase tracking-[0.2em] text-blue-400 mb-8">
                        <Sparkles className="w-3.5 h-3.5" /> Direct Support Protocol
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-6">
                        Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">The Protocol</span>
                    </h1>
                    <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                        Our specialized jurisdictional support team is available to assist with institutional inquiries and operational onboarding.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* ── Contact Form ── */}
                    <div className="bg-[#060d1f]/40 backdrop-blur-xl border border-white/[0.06] rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in slide-in-from-left-8 duration-700">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-blue-400" /> Transmit Inqury
                        </h2>
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 ml-1">Entity Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Your full name or organization"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Email</label>
                                <input 
                                    type="email" 
                                    placeholder="email@example.com"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 ml-1">Inquiry Details</label>
                                <textarea 
                                    rows={5}
                                    placeholder="Describe your jurisdictional requirements..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                />
                            </div>
                            <button className="w-full group inline-flex items-center justify-center gap-3 rounded-full bg-blue-600 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all duration-300">
                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Initiate Transmission
                            </button>
                        </form>
                    </div>

                    {/* ── Contact Info ── */}
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="space-y-8">
                            <h3 className="text-xl font-semibold text-white tracking-tight">Institutional Contact Points</h3>
                            
                            <div className="group flex items-start gap-6 p-6 rounded-[2rem] border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 mb-1">Email Access</p>
                                    <a href="mailto:xbandglobal@gmail.com" className="text-lg text-white font-medium hover:text-blue-400 transition-colors">xbandglobal@gmail.com</a>
                                </div>
                            </div>

                            <div className="group flex items-start gap-6 p-6 rounded-[2rem] border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <Phone className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 mb-1">Direct Line</p>
                                    <a href="tel:+918341727278" className="text-lg text-white font-medium hover:text-emerald-400 transition-colors">+91 83417 27278</a>
                                </div>
                            </div>

                            <div className="group flex items-start gap-6 p-6 rounded-[2rem] border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-display uppercase tracking-[0.2em] text-slate-500 mb-1">Global HQ</p>
                                    <p className="text-lg text-white font-medium">Hyderabad, India</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0b1224]/50 border border-white/[0.04] rounded-[2rem] p-8 space-y-4">
                            <div className="flex items-center gap-3 text-blue-400">
                                <Globe className="w-5 h-5" />
                                <span className="text-xs font-display uppercase tracking-[0.2em] font-bold">Operational Status: Online</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-light">
                                Our protocol support team maintains 24/7 responsiveness for Tier 1 institutional partners. Regular inquiries are generally acknowledged within 12 mission hours.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Visual Map Placeholder ── */}
                <div className="mt-20 h-[300px] rounded-[3rem] border border-white/[0.06] bg-[#060d1f]/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020813] via-transparent to-[#020813]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto border border-blue-500/40 relative">
                                <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
                                <MapPin className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-xs font-display uppercase tracking-[0.4em] text-white/40">Network Node: Hyderabad, IN</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
