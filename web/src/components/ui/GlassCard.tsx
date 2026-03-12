"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
    children: React.ReactNode;
    gradient?: boolean;
    hoverEffect?: boolean;
}

export const GlassCard = ({
    children,
    className,
    gradient = false,
    hoverEffect = true,
    ...props
}: GlassCardProps) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -10, scale: 1.01 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "glass-card relative overflow-hidden transition-all duration-700",
                hoverEffect && "glass-card-hover",
                gradient && "after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/10 after:to-transparent after:opacity-5",
                className
            )}
            {...props}
        >
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
};
