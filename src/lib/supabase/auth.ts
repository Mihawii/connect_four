"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./client";

export function useUser() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) {
      setLoading(false);
      return;
    }
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export async function signInWithGoogle() {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
  });
}

export async function signInWithEmail(email: string) {
  const sb = getSupabaseBrowser();
  if (!sb) throw new Error("Supabase not configured");
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/account` },
  });
  if (error) throw error;
}

export async function signOut() {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  await sb.auth.signOut();
}
