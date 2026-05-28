"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Trophy, Sparkles, ShoppingBag, GraduationCap } from "@/components/icons";
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
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--board-bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-lg font-extrabold text-foreground">
            Inferno
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative py-1 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
                {active && <span className="absolute -bottom-[5px] left-0 h-[2px] w-full bg-[var(--ember)]" />}
              </Link>
            );
          })}
        </nav>

        {pathname !== "/play" && (
          <Button asChild variant="ember" size="sm" className="hidden sm:inline-flex">
            <Link href="/play">Play now</Link>
          </Button>
        )}
        {pathname === "/play" && <div className="hidden sm:block" />}
      </div>

      {/* Mobile bottom nav */}
      <nav className="flex items-center justify-around border-t border-border bg-[var(--board-bg)] px-2 py-1.5 md:hidden">
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
              <Icon className={cn("size-5", active && "text-[var(--ember)]")} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
