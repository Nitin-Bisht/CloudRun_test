"use client";

import { useMemo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SupabaseClientStatus() {
  const clientReady = useMemo(() => Boolean(createBrowserSupabaseClient()), []);

  return (
    <p className="text-sm text-zinc-600">
      Browser client: {clientReady ? "initialized" : "not initialized"}
    </p>
  );
}
