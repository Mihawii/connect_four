"use client";

import * as React from "react";
import { useGame } from "@/lib/store/gameStore";
import { formatClock, formatClockTenths, cn } from "@/lib/utils";
import { PLAYER_LABEL } from "./constants";
import type { Player } from "@/lib/engine/types";

function PlayerCard({ player, now, align }: { player: Player; now: number; align: "left" | "right" }) {
  const game = useGame((s) => s.game);
  const active = game.currentPlayer === player && game.status === "playing";
  const isP1 = player === 1;

  let time: React.ReactNode = null;
  if (game.clock) {
    const base = game.clock.msPerSide[player];
    const elapsed =
      game.clock.activePlayer === player && game.clock.lastTickAt ? Math.max(0, now - game.clock.lastTickAt) : 0;
    const remaining = Math.max(0, base - elapsed);
    const urgent = remaining < 10_000;
    time = (
      <span className={cn("font-display text-3xl font-semibold tabular-nums leading-none", urgent ? "text-[var(--ember)]" : active ? "text-foreground" : "text-muted-foreground")}>
        {remaining < 10_000 ? formatClockTenths(remaining) : formatClock(remaining)}
      </span>
    );
  } else {
    time = (
      <span className={cn("font-display text-sm font-semibold leading-none", active ? "text-foreground" : "text-muted-foreground")}>
        {active ? "to move" : "waiting"}
      </span>
    );
  }

  const disc = (
    <span className="relative flex items-center justify-center">
      <span
        className={cn(
          "size-8 rounded-full transition-transform",
          isP1 ? "bg-[var(--ember)]" : "bg-[var(--gold)]",
          active ? "scale-100" : "scale-90 opacity-50",
        )}
      />
      {!isP1 && <span className="absolute size-[12px] rounded-full border-[2.5px] border-[#1a1410]/60" />}
    </span>
  );

  return (
    <div className={cn("flex items-center gap-3", align === "right" && "flex-row-reverse text-right")}>
      {disc}
      <div className="flex flex-col gap-0.5">
        <span className={cn("font-display text-[11px] font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
          {PLAYER_LABEL[player]}
        </span>
        {time}
      </div>
    </div>
  );
}

export function ClockBar() {
  const running = useGame((s) => s.game.clock?.running);
  const tick = useGame((s) => s.tick);
  const game = useGame((s) => s.game);
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!running) return;
    let raf = 0;
    const loop = () => {
      setNow(Date.now());
      tick();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, tick]);

  const status =
    game.status === "playing"
      ? `Turn ${game.totalTurns + 1}`
      : game.status === "won"
        ? `${PLAYER_LABEL[game.winner ?? 1]} wins`
        : game.status === "timeout"
          ? `${PLAYER_LABEL[game.winner ?? 1]} wins on time`
          : game.status === "draw"
            ? "Draw"
            : "Over";

  return (
    <div className="flex items-center justify-between gap-4 px-1">
      <PlayerCard player={1} now={now} align="left" />
      <span className="font-display text-xs font-semibold text-muted-foreground">{status}</span>
      <PlayerCard player={2} now={now} align="right" />
    </div>
  );
}
