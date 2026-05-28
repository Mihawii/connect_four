"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseEnabled } from "./config";
import type { Database } from "./types";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Returns a browser Supabase client, or null when Supabase isn't configured. */
export function getSupabaseBrowser() {
  if (!isSupabaseEnabled) return null;
  if (cached) return cached;
  cached = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
