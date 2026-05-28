"use client";

import * as React from "react";
import { Trophy, MapPin, Globe, Users, Flame, Swords, Clock } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { demoLeaderboard, type LeaderRow } from "@/lib/leaderboardDemo";
import { LEADERBOARD_FORMATS } from "@/lib/leaderboard";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

const FORMATS = LEADERBOARD_FORMATS;

export default function LeaderboardPage() {
  const [format, setFormat] = React.useState("blitzInferno");
  const [rows, setRows] = React.useState<LeaderRow[]>(() => demoLeaderboard(1));
  const [source, setSource] = React.useState("demo");

  React.useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      try {
        const res = await fetch(`/api/leaderboard?format=${format}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Leaderboard unavailable");
        const data = await res.json();
        if (!active) return;
        setRows(data.rows);
        setSource(data.source ?? "api");
      } catch {
        if (!active) return;
        setRows(demoLeaderboard(FORMATS.findIndex((f) => f.value === format) + 1));
        setSource("demo");
      }
    }

    void loadLeaderboard();

    return () => {
      active = false;
    };
  }, [format]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-[1.5px] border-ink pb-5">
        <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--ember)]/15 text-[var(--ember)]">
          <Trophy className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">The Ladder</h1>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Ratings by format. Watch the top table, then take a room code to a friend.
          </p>
        </div>
        </div>
        <div className="rounded-lg border border-border bg-[var(--paper-2)] px-3 py-2 text-right">
          <p className="font-mono text-xl font-bold tabular-nums">{rows[0]?.rating ?? "—"}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">rating to chase</p>
        </div>
      </div>

      {(!isSupabaseEnabled || source === "demo") && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-300">
          <Flame className="size-3.5" /> Showing API-backed demo data. Connect player ratings to populate the real ladder.
        </div>
      )}

      <Tabs value={format} onValueChange={setFormat}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {FORMATS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-1 text-xs text-muted-foreground">
            <button className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1"><Globe className="size-3" /> Global</button>
            <button className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"><MapPin className="size-3" /> Almaty</button>
            <button className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"><Users className="size-3" /> Friends</button>
          </div>
        </div>

        {FORMATS.map((f) => (
          <TabsContent key={f.value} value={f.value}>
            <div className="overflow-hidden rounded-lg border-[1.5px] border-ink bg-[var(--paper-2)]">
              {rows.map((r) => (
                <div
                  key={r.name}
                  className={cn(
                    "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 px-4 py-3 text-sm last:border-0 sm:grid-cols-[3rem_minmax(0,1fr)_6rem_5rem_5rem]",
                    r.rank <= 3 && "bg-[var(--ember)]/5",
                  )}
                >
                  <span
                    className={cn(
                      "text-center font-mono text-lg font-bold",
                      r.rank === 1 ? "text-yellow-400" : r.rank === 2 ? "text-zinc-300" : r.rank === 3 ? "text-orange-400" : "text-muted-foreground",
                    )}
                  >
                    {r.rank}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="mr-0.5 inline size-3" />
                      {r.city}, {r.country}
                    </p>
                  </div>
                  <Badge variant="muted" className="hidden sm:inline-flex">
                    {r.tier}
                  </Badge>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{r.games} games</span>
                  <span className="w-14 text-right font-mono font-bold text-[var(--ember)]">{r.rating}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <section className="mt-10">
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold">
          <Swords className="size-5 text-[var(--ember)]" /> Weekly tournaments
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Weekly Blitz Open", kind: "Free · 32 players", prize: "Cosmetic ribbon for top 3", when: "Sun 18:00" },
            { title: "Pro Cup", kind: "Pro · 16 players", prize: "Champion flair + XP boost", when: "Sun 20:00" },
          ].map((t) => (
            <div key={t.title} className="rounded-lg border-[1.5px] border-ink bg-[var(--paper-2)] p-4 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                <Badge variant={t.kind.startsWith("Pro") ? "ember" : "muted"}>{t.kind.split(" · ")[0]}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.kind}</p>
              <p className="mt-2 text-sm">{t.prize}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {t.when}
                </span>
                <span className="text-xs font-medium text-[var(--ember)]">Registration opens soon</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
