"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Trophy, Sparkles, ShoppingBag, GraduationCap, Globe } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/play", labelKey: "nav.play", icon: Flame },
  { href: "/puzzle", labelKey: "nav.daily", icon: Sparkles },
  { href: "/leaderboard", labelKey: "nav.ladder", icon: Trophy },
  { href: "/store", labelKey: "nav.store", icon: ShoppingBag },
  { href: "/learn", labelKey: "nav.learn", icon: GraduationCap },
];

export function Nav() {
  const pathname = usePathname();
  const { language, cycleLanguage, t } = useI18n();

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-40 bg-[var(--board-bg)]">
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
                {t(l.labelKey)}
                {active && <span className="absolute -bottom-[5px] left-0 h-[2px] w-full bg-[var(--ember)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={cycleLanguage}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 font-display text-xs font-semibold text-muted-foreground transition-colors hover:bg-[var(--board-bg-elevated)] hover:text-foreground"
            aria-label={t("nav.changeLanguage")}
            title={t("nav.changeLanguage")}
          >
            <Globe className="size-4" />
            {language}
          </button>
          {pathname !== "/play" && (
            <Button asChild variant="ember" size="sm" className="inline-flex">
              <Link href="/play">{t("nav.playNow")}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="flex items-center justify-around bg-[var(--board-bg)] px-2 py-1.5 md:hidden">
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
              {t(l.labelKey)}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
