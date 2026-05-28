export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Whether Supabase is configured. When false, the app runs in local-only mode. */
export const isSupabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
