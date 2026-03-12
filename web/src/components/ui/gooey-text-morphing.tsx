"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
  justify?: "start" | "center" | "end";
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 2,
  className,
  textClassName,
  justify = "center",
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!text1Ref.current || !text2Ref.current) return;

    // currentIndex = the word currently fully visible
    let currentIndex = 0;

    // Initialise: text1 shows texts[0] fully, text2 pre-loads texts[1] but invisible
    const show = (el: HTMLSpanElement, text: string, visible: boolean) => {
      el.textContent = text;
      el.style.opacity = visible ? "100%" : "0%";
      el.style.filter = visible ? "" : "blur(8px)";
    };

    show(text1Ref.current, texts[0], true);
    show(text2Ref.current, texts[1 % texts.length], false);

    // Phase: "hold" → wait, "morph" → animate transition
    type Phase = "hold" | "morph";
    let phase: Phase = "hold";
    let elapsed = 0;
    let lastTs = performance.now();
    let animId: number;

    const setMorphProgress = (fraction: number) => {
      // fraction 0→1: text1 fades out, text2 fades in
      const t1 = text1Ref.current;
      const t2 = text2Ref.current;
      if (!t1 || !t2) return;

      const blur1 = fraction >= 1 ? 100 : Math.min(8 / (1 - fraction + 0.001) - 8, 100);
      t1.style.filter = `blur(${blur1}px)`;
      t1.style.opacity = `${Math.pow(Math.max(1 - fraction, 0), 0.4) * 100}%`;

      const blur2 = fraction <= 0 ? 100 : Math.min(8 / (fraction + 0.001) - 8, 100);
      t2.style.filter = `blur(${blur2}px)`;
      t2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    };

    const tick = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.1); // cap at 100ms to avoid jumps
      lastTs = ts;
      elapsed += dt;

      if (phase === "hold") {
        if (elapsed >= cooldownTime) {
          elapsed = 0;
          phase = "morph";
          // Pre-load the next word into text2
          const nextIndex = (currentIndex + 1) % texts.length;
          if (text2Ref.current) {
            text2Ref.current.textContent = texts[nextIndex];
          }
        }
      } else {
        // morph phase
        const fraction = Math.min(elapsed / morphTime, 1);
        setMorphProgress(fraction);

        if (fraction >= 1) {
          // Transition complete — advance currentIndex
          currentIndex = (currentIndex + 1) % texts.length;
          const nextIndex = (currentIndex + 1) % texts.length;

          // Snap: text1 = newly visible word (fully shown), text2 = next word (hidden)
          if (text1Ref.current && text2Ref.current) {
            show(text1Ref.current, texts[currentIndex], true);
            show(text2Ref.current, texts[nextIndex], false);
          }

          elapsed = 0;
          phase = "hold";
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="gooey-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className={cn(
          "flex h-full items-center",
          justify === "center" && "justify-center",
          justify === "start" && "justify-start",
          justify === "end" && "justify-end"
        )}
        style={{ filter: "url(#gooey-threshold)" }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute inline-block select-none whitespace-nowrap",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute inline-block select-none whitespace-nowrap",
            textClassName
          )}
        />
      </div>
    </div>
  );
}
