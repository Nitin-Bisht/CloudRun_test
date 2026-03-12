"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Carousel, type SlideData } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const JURISDICTION_SLIDES: SlideData[] = [
  {
    title: "Singapore",
    button: "Explore Jurisdiction",
    src: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=75&w=1800&auto=format&fit=crop",
  },
  {
    title: "Delaware, US",
    button: "Explore Jurisdiction",
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=75&w=1800&auto=format&fit=crop",
  },
  {
    title: "Cayman Islands",
    button: "Explore Jurisdiction",
    src: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?q=75&w=1800&auto=format&fit=crop",
  },
  {
    title: "London, UK",
    button: "Explore Jurisdiction",
    src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=75&w=1800&auto=format&fit=crop",
  },
  {
    title: "Dubai, UAE",
    button: "Explore Jurisdiction",
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=75&w=1800&auto=format&fit=crop",
  },
];

export function JurisdictionCarousel({ liteMode = false }: { liteMode?: boolean }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const slideCount = JURISDICTION_SLIDES.length;
  // Keep enough scroll room to rotate slides, but shorten the section so
  // the next "method" section appears sooner.
  const sectionHeightVh = liteMode ? slideCount * 48 : slideCount * 56;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const normalizedProgress = useTransform(scrollYProgress, [0.02, 0.98], [0, 1], {
    clamp: true,
  });
  const smoothProgress = useSpring(normalizedProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
  });

  useMotionValueEvent(smoothProgress, "change", (value) => {
    const nextIndex = Math.min(slideCount - 1, Math.max(0, Math.round(value * (slideCount - 1))));
    setCurrent((prev) => (prev === nextIndex ? prev : nextIndex));
  });

  return (
    <section
      id="jurisdictions"
      ref={sectionRef}
      className="relative isolate z-40 bg-background"
      style={{ height: `${sectionHeightVh}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,210,255,0.06),transparent_70%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center gap-10 px-6 py-16 lg:px-12">
          <div className="space-y-3 text-center">
            <p className="text-[10px] font-display uppercase tracking-[0.5em] text-primary glow-text">
              Global Reach
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic lowercase leading-none text-white break-words sm:break-normal max-w-[280px] sm:max-w-none mx-auto">
              190+ Jurisdictions
            </h2>
            <p className="mx-auto max-w-md text-xs font-light text-slate-400 lg:text-sm">
              Scroll while in this section to rotate through jurisdictions.
            </p>
          </div>

          <div className={cn("w-full", liteMode ? "max-w-4xl" : "max-w-6xl")}>
            <Carousel slides={JURISDICTION_SLIDES} current={current} onCurrentChange={setCurrent} />
          </div>

          <motion.p
            style={{ opacity: useTransform(smoothProgress, [0, 0.1], [1, 0.35]) }}
            className="text-[9px] font-display uppercase tracking-[0.4em] text-white/35"
          >
            Scroll to rotate
          </motion.p>
        </div>
      </div>
    </section>
  );
}
