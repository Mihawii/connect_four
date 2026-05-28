"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Flame, Moon, Sun, Trophy, Sparkles, ShoppingBag, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/play", label: "Play", icon: Flame },
  { href: "/puzzle", label: "Daily", icon: Sparkles },
  { href: "/leaderboard", label: "Ladder", icon: Trophy },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/learn", label: "Learn", icon: GraduationCap },
];

export function Nav() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative flex size-7 items-center justify-center">
            <Flame className="size-5 text-[var(--ember)] transition-transform group-hover:scale-110 group-hover:rotate-6" />
            <span className="absolute inset-0 -z-10 rounded-full bg-[var(--ember)]/20 blur-md" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Inferno</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          )}
          <Button asChild variant="ember" size="sm" className="hidden sm:inline-flex">
            <Link href="/play">Drop &amp; burn</Link>
          </Button>
        </div>
      </div>
      <nav className="flex items-center justify-around border-t border-border/40 px-2 py-1 md:hidden">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-[var(--ember)]")} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
