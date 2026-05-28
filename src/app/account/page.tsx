"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { User as UserIcon, Mail, LogOut, Flame, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { useUser, signInWithGoogle, signInWithEmail, signOut } from "@/lib/supabase/auth";
import { toast } from "sonner";

export default function AccountPage() {
  return (
    <React.Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>}>
      <AccountInner />
    </React.Suspense>
  );
}

function AccountInner() {
  const { user, loading } = useUser();
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (params.get("upgraded")) toast.success("Welcome to Pro 🔥");
  }, [params]);

  const sendMagic = async () => {
    try {
      await signInWithEmail(email);
      setSent(true);
      toast.success("Magic link sent", { description: "Check your inbox." });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send link");
    }
  };

  if (!isSupabaseEnabled) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[var(--ember)]/15 text-[var(--ember)]">
          <UserIcon className="size-6" />
        </div>
        <h1 className="font-display text-2xl font-bold">Accounts are off</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="rounded bg-secondary px-1">.env.local</code> to enable sign-in, match history, ranked
          play, and cloud sync. Everything else works without it.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-6 text-center font-display text-3xl font-bold">Sign in to Inferno</h1>
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
              Continue with Google
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            {sent ? (
              <p className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-400">
                <Check className="size-4" /> Magic link sent
              </p>
            ) : (
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button variant="ember" className="w-full" onClick={sendMagic} disabled={!email.includes("@")}>
                  <Mail className="size-4" /> Email me a magic link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-[var(--ember)]/15 text-xl font-bold text-[var(--ember)]">
          {(user.email ?? "?")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.email}</h1>
          <Badge variant="muted" className="mt-1">Free tier</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Rating", value: "1200" },
          { label: "Games", value: "0" },
          { label: "Win rate", value: "—" },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="font-display text-3xl font-bold">{s.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--ember)]/30 bg-[var(--ember)]/5 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Flame className="size-4 text-[var(--ember)]" />
          Unlock unlimited coach reviews + the puzzle archive.
        </div>
        <Button asChild variant="ember" size="sm">
          <a href="/store">Go Pro</a>
        </Button>
      </div>

      <Button variant="ghost" className="mt-6" onClick={signOut}>
        <LogOut className="size-4" /> Sign out
      </Button>
    </div>
  );
}
