"use client";

import * as React from "react";
import { useGame } from "@/lib/store/gameStore";
import { formatClock, formatClockTenths } from "@/lib/utils";
import type { Player } from "@/lib/engine/types";
import { cn } from "@/lib/utils";
import { PLAYER_LABEL } from "./constants";

export function Clock({ player }: { player: Player }) {
  const game = useGame((s) => s.game);
  const tick = useGame((s) => s.tick);

  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (!game.clock?.running) return;
    let raf = 0;
    const loop = () => {
      setNow(Date.now());
      tick();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [game.clock?.running, tick]);

  if (!game.clock) {
    return (
      <div
        className={cn(
          "rounded-md border border-border/60 px-3 py-2 text-xs uppercase tracking-wider",
          game.currentPlayer === player ? "border-[var(--ember)]/60 bg-[var(--ember)]/10" : "bg-card/60",
        )}
      >
        <div className="text-muted-foreground">{PLAYER_LABEL[player]}</div>
        <div className="font-display text-base font-semibold text-foreground">{game.currentPlayer === player ? "Your turn" : "Wait"}</div>
      </div>
    );
  }

  const baseMs = game.clock.msPerSide[player];
  const elapsed =
    game.clock.activePlayer === player && game.clock.lastTickAt
      ? Math.max(0, now - game.clock.lastTickAt)
      : 0;
  const remaining = Math.max(0, baseMs - elapsed);
  const urgent = remaining < 10_000;
  const dead = remaining <= 0;
  const fmt = remaining < 10_000 ? formatClockTenths(remaining) : formatClock(remaining);

  return (
    <div
      className={cn(
        "rounded-md border border-border/60 px-3 py-2 text-xs uppercase tracking-wider transition-colors",
        game.currentPlayer === player && game.status === "playing"
          ? "border-[var(--ember)]/60 bg-[var(--ember)]/10"
          : "bg-card/60",
        urgent && "border-red-500/60 bg-red-500/10",
        dead && "border-red-700 bg-red-900/20 text-red-300",
      )}
    >
      <div className="text-muted-foreground">{PLAYER_LABEL[player]}</div>
      <div
        className={cn(
          "font-display text-2xl font-semibold tabular-nums",
          urgent ? "text-red-400" : "text-foreground",
        )}
      >
        {fmt}
      </div>
    </div>
  );
}
