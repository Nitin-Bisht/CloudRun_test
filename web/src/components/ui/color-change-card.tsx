"use client"

import React from "react"
import { motion, Variants } from "framer-motion"
import { ArrowRight } from "lucide-react"

const ColorChangeCards = () => {
  return (
    <section className="relative bg-transparent z-30 pt-16 pb-32">
        <div className="container mx-auto px-6 lg:px-12 relative z-10 mb-12">
            <div className="max-w-4xl space-y-6">
                <span className="text-xs text-primary font-display uppercase tracking-[0.6em] block glow-text">Core Capabilities</span>
                <h2 className="text-4xl lg:text-7xl tracking-tight leading-[0.88] text-white font-display uppercase">
                    Institutional <br className="hidden md:block" /> Intelligence
                </h2>
            </div>
        </div>

      <div className="mx-auto container px-6 lg:px-12 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
        <Card
          heading="Discover"
          description="Access structured cost models and regulatory requirements across 190+ jurisdictions."
          imgSrc="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072"
        />
        <Card
          heading="Network"
          description="Connect with immutable, cryptographically-verified incorporation experts worldwide."
          imgSrc="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2084"
        />
        <Card
          heading="Execute"
          description="Initiate institutional-grade setups with a secure, credit-based contact protocol."
          imgSrc="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=2100"
        />
        <Card
          heading="Scale"
          description="Achieve global entity activation with complete transparency and 48-hour launch support."
          imgSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069"
        />
      </div>
    </section>
  )
}

// --- Card Component ---
interface CardProps {
  heading: string
  description: string
  imgSrc: string
}

const Card = ({ heading, description, imgSrc }: CardProps) => {
  return (
    <motion.div
      transition={{ staggerChildren: 0.035 }}
      whileHover="hover"
      className="group relative h-80 lg:h-96 w-full cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1d]"
    >
      <div
        className="absolute inset-0 saturate-100 transition-all duration-700 group-hover:scale-110 md:saturate-0 md:group-hover:saturate-100 opacity-60 group-hover:opacity-80 mix-blend-screen"
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-70" />
      
      <div className="relative z-20 flex h-full flex-col justify-between p-6 lg:p-10 text-slate-300 transition-colors duration-500 group-hover:text-white">
        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center ml-auto bg-black/40 backdrop-blur-sm transition-all duration-500 group-hover:bg-primary group-hover:border-primary">
            <ArrowRight className="text-xl transition-all duration-500 group-hover:-rotate-45 group-hover:text-black" />
        </div>
        <div>
          <h4 className="font-display uppercase tracking-wider mb-2">
            {heading.split("").map((letter, index) => (
              <AnimatedLetter letter={letter} key={index} />
            ))}
          </h4>
          <p className="text-sm lg:text-base font-light text-slate-400 group-hover:text-slate-200 transition-colors duration-500 max-w-sm">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

// --- AnimatedLetter Helper Component ---
interface AnimatedLetterProps {
  letter: string
}

const letterVariants: Variants = {
  hover: {
    y: "-50%",
  },
}

const AnimatedLetter = ({ letter }: AnimatedLetterProps) => {
  return (
    <div className="inline-block h-[36px] overflow-hidden font-bold text-3xl lg:text-4xl">
      <motion.span
        className="flex min-w-[4px] flex-col"
        style={{ y: "0%" }}
        variants={letterVariants}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span>{letter}</span>
        <span>{letter}</span>
      </motion.span>
    </div>
  )
}

export default ColorChangeCards
