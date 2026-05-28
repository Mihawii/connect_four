import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseEnabled } from "./config";
import type { Database } from "./types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Server Supabase client bound to the request cookies. Null when not configured. */
export async function getSupabaseServer() {
  if (!isSupabaseEnabled) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...options }));
        } catch {
          // called from a Server Component — safe to ignore, middleware refreshes sessions
        }
      },
    },
  });
}

/** Service-role client for privileged server operations (webhooks, ELO writes). Untyped on purpose. */
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;
  return createServerClient(SUPABASE_URL, serviceKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
