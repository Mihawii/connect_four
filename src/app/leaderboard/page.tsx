"use client";

import * as React from "react";
import {
  Bonfire,
  Globe,
  Medal1st,
  NavArrowRight,
  PeopleTag,
  Pin,
  Timer,
  Tournament,
  Trophy,
} from "iconoir-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { demoLeaderboard, type LeaderRow } from "@/lib/leaderboardDemo";
import { LEADERBOARD_FORMATS } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

const FORMATS = LEADERBOARD_FORMATS;

const SCOPES = [
  { label: "Global", icon: Globe, active: true },
  { label: "Almaty", icon: Pin, active: false },
  { label: "Friends", icon: PeopleTag, active: false },
];

const TOURNAMENTS = [
  { title: "Weekly Blitz Open", kind: "Free", seats: "32 players", prize: "Cosmetic ribbon for top 3", when: "Sun 18:00" },
  { title: "Pro Cup", kind: "Pro", seats: "16 players", prize: "Champion flair + XP boost", when: "Sun 20:00" },
];

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex size-9 items-center justify-center rounded-md border-[1.5px] border-ink bg-[var(--gold)] text-ink shadow-hard-sm">
        <Medal1st className="size-5" strokeWidth={2} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-md border border-border bg-[var(--paper)] font-display text-base font-semibold",
        rank <= 3 && "border-ink bg-[var(--ember)]/10",
      )}
    >
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const [format, setFormat] = React.useState("blitzInferno");
  const [rows, setRows] = React.useState<LeaderRow[]>(() => demoLeaderboard(1));

  React.useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      try {
        const res = await fetch(`/api/leaderboard?format=${format}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Leaderboard unavailable");
        const data = await res.json();
        if (!active) return;
        setRows(data.rows);
      } catch {
        if (!active) return;
        setRows(demoLeaderboard(FORMATS.findIndex((f) => f.value === format) + 1));
      }
    }

    void loadLeaderboard();

    return () => {
      active = false;
    };
  }, [format]);

  const leader = rows[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="grid gap-5 border-b-[1.5px] border-ink pb-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex items-start gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-[var(--ember)] text-[oklch(0.99_0.014_85)] shadow-hard-sm">
            <Trophy className="size-8" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="font-display text-5xl font-semibold leading-tight md:text-6xl">The Ladder</h1>
          </div>
        </div>

        <aside className="rounded-lg border-[1.5px] border-ink bg-[var(--paper-2)] p-4">
          <p className="font-display text-sm font-semibold text-muted-foreground">Current mark</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-4xl font-semibold leading-none">{leader?.rating ?? "—"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{leader ? `${leader.name}, ${leader.city}` : "No leader yet"}</p>
            </div>
            <Bonfire className="size-8 text-[var(--ember)]" strokeWidth={2.2} />
          </div>
        </aside>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Tabs value={format} onValueChange={setFormat} className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="border-[1.5px] border-ink bg-[var(--paper-2)]">
              {FORMATS.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className="font-display text-sm font-semibold">
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex rounded-lg border border-border bg-[var(--paper-2)] p-1">
              {SCOPES.map((scope) => {
                const Icon = scope.icon;
                return (
                  <button
                    key={scope.label}
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-display text-xs font-semibold transition-colors",
                      scope.active ? "bg-[var(--ink)] text-[var(--paper)]" : "text-muted-foreground hover:bg-[var(--accent)] hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={2.2} />
                    {scope.label}
                  </button>
                );
              })}
            </div>
          </div>

          {FORMATS.map((f) => (
            <TabsContent key={f.value} value={f.value} className="mt-4">
              <div className="overflow-hidden rounded-lg border-[1.5px] border-ink bg-[var(--paper-2)]">
                <div className="hidden grid-cols-[4rem_minmax(0,1fr)_7rem_6rem_6rem] items-center border-b-[1.5px] border-ink bg-[var(--paper)] px-4 py-2 font-display text-xs font-semibold text-muted-foreground sm:grid">
                  <span>Rank</span>
                  <span>Player</span>
                  <span>Tier</span>
                  <span>Games</span>
                  <span className="text-right">Rating</span>
                </div>

                {rows.map((r) => (
                  <div
                    key={r.name}
                    className={cn(
                      "grid grid-cols-[3rem_minmax(0,1fr)_4.5rem] items-center gap-3 border-b border-border/80 px-4 py-3 last:border-0 sm:grid-cols-[4rem_minmax(0,1fr)_7rem_6rem_6rem]",
                      r.rank <= 3 && "bg-[var(--gold)]/14",
                    )}
                  >
                    <RankMark rank={r.rank} />

                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold">{r.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Pin className="size-3" strokeWidth={2.2} />
                        {r.city}, {r.country}
                      </p>
                    </div>

                    <span className="hidden w-fit rounded-md border border-border bg-[var(--paper)] px-2 py-1 font-display text-xs font-semibold text-muted-foreground sm:inline-flex">
                      {r.tier}
                    </span>
                    <span className="hidden font-display text-sm font-semibold text-muted-foreground sm:inline">{r.games}</span>
                    <span className="text-right font-display text-xl font-semibold text-[var(--ember)]">{r.rating}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <aside className="space-y-3">
          <div className="rounded-lg border-[1.5px] border-ink bg-[var(--paper-2)] p-4">
            <p className="flex items-center gap-2 font-display text-sm font-semibold">
              <Tournament className="size-4 text-[var(--ember)]" strokeWidth={2.2} />
              Weekly tables
            </p>
            <div className="mt-3 space-y-3">
              {TOURNAMENTS.map((event) => (
                <div key={event.title} className="rounded-md border border-border bg-[var(--paper)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-base font-semibold">{event.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{event.kind}, {event.seats}</p>
                    </div>
                    <NavArrowRight className="mt-0.5 size-4 text-muted-foreground" strokeWidth={2.2} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{event.prize}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Timer className="size-4 text-[var(--ember)]" strokeWidth={2.2} />
                    {event.when}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-[var(--paper-2)] p-4">
            <p className="font-display text-sm font-semibold">How rating moves</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Beat stronger players to climb faster. Inferno Blitz is weighted separately from Classic.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
