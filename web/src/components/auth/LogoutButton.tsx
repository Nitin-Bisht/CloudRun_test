"use client";

import * as React from "react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className, variant = "outline", children, ...props }: React.ComponentProps<typeof Button>) {
    return (
        <Button
            variant={variant}
            className={className || "rounded-full border-white/60 bg-white/55 text-blue-700 backdrop-blur-xl hover:bg-white/70 hover:text-blue-800"}
            onClick={() => logout()}
            {...props}
        >
            {children || "Sign Out"}
        </Button>
    );
}
