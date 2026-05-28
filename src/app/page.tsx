import Link from "next/link";
import { Flame, Sparkles, Trophy, Users, Zap, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Flame,
    title: "Decay rule",
    body: "Every disc lasts ten of your turns. On the eleventh, it burns away. Strategy reborn.",
  },
  {
    icon: Zap,
    title: "Bullet & Blitz",
    body: "60 seconds + 1 second a move. Matches end before your coffee cools.",
  },
  {
    icon: Sparkles,
    title: "AI coach",
    body: "After every game, Claude tells you the move that lost it and the one that almost won it.",
  },
  {
    icon: Users,
    title: "Friend rooms",
    body: "Share a link or a QR code. No account needed to start.",
  },
  {
    icon: Trophy,
    title: "Ranked ladder",
    body: "ELO by format. Global, city, and friends leaderboards.",
  },
  {
    icon: GraduationCap,
    title: "Learn mode",
    body: "Same engine teaches forks, threats, and double threats. Built for kids and rusty adults.",
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate">
      <div className="absolute inset-x-0 -top-24 -z-10 mx-auto h-[40rem] max-w-6xl">
        <div className="absolute inset-x-1/2 -translate-x-1/2 top-10 size-[28rem] rounded-full bg-[var(--ember)]/30 blur-3xl" />
        <div className="absolute right-10 top-40 size-72 rounded-full bg-[var(--ember-bright)]/20 blur-3xl" />
      </div>
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-24 text-center sm:pt-24">
        <Badge variant="ember" className="mb-6 px-3 py-1 text-xs">
          Connect Four, but on fire
        </Badge>
        <h1 className="text-balance font-display text-5xl font-bold tracking-tight sm:text-7xl">
          Drop fast.{" "}
          <span className="bg-gradient-to-br from-[var(--ember-bright)] via-[var(--ember)] to-red-500 bg-clip-text text-transparent">
            Burn faster.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          Bullet Connect Four with a burning board. Every disc lasts ten of your turns, then it&rsquo;s gone.
          Match length: a single TikTok scroll.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild variant="ember" size="xl" className="w-64">
            <Link href="/play">
              <Flame className="size-5" /> Start a match
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-64">
            <Link href="/puzzle">Today&rsquo;s daily puzzle</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No signup. Works offline. Ad-free, forever.</p>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/70 p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--ember)]/40 hover:shadow-lg hover:shadow-[var(--ember)]/10"
            >
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-[var(--ember)]/0 transition-colors group-hover:bg-[var(--ember)]/10" />
              <div className="relative flex size-10 items-center justify-center rounded-md bg-[var(--ember)]/15 text-[var(--ember)]">
                <Icon className="size-5" />
              </div>
              <h3 className="relative mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="relative mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          );
        })}
      </section>
      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The one new rule</p>
          <p className="max-w-3xl text-balance text-2xl font-medium sm:text-3xl">
            Every disc lasts exactly{" "}
            <span className="text-[var(--ember)]">10 of your turns.</span> Then it burns away. Pieces above
            fall by gravity. Wins still count the moment you place them.
          </p>
          <Button asChild variant="ember" size="lg">
            <Link href="/play">Try it now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
