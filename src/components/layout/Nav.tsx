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

  const isPlay = pathname === "/play" || pathname.startsWith("/play/");

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        isPlay
          ? "border-b border-white/[0.06] bg-[#1a1714]"
          : "border-b-[1.5px] border-ink bg-[var(--paper)]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span
            className={cn(
              "font-display text-lg font-extrabold tracking-tight",
              isPlay ? "text-white" : "text-foreground",
            )}
          >
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
                  isPlay
                    ? active
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                    : active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
                {active && <span className="absolute -bottom-[5px] left-0 h-[2px] w-full bg-[var(--ember)]" />}
              </Link>
            );
          })}
        </nav>

        {!isPlay && (
          <Button asChild variant="ember" size="sm" className="hidden sm:inline-flex">
            <Link href="/play">Play now</Link>
          </Button>
        )}
        {isPlay && <div className="hidden sm:block" />}
      </div>

      {/* Mobile bottom nav */}
      <nav
        className={cn(
          "flex items-center justify-around border-t-[1.5px] px-2 py-1.5 md:hidden",
          isPlay
            ? "border-white/[0.06] bg-[#1a1714]"
            : "border-ink bg-[var(--paper)]",
        )}
      >
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1 text-[10px] font-medium",
                isPlay
                  ? active
                    ? "text-white"
                    : "text-white/35"
                  : active
                    ? "text-foreground"
                    : "text-muted-foreground",
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
