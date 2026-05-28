"use client";

import * as React from "react";
import { RotateCcw, Undo2, Bot, Users, Sparkles } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLOCK_PRESETS, useGame } from "@/lib/store/gameStore";
import { searchBestMove } from "@/lib/engine/solver";
import { useSettings } from "@/lib/store/settingsStore";
import { pingApiHealth } from "@/lib/api/health";
import { PLAYER_LABEL } from "./constants";
import type { Difficulty, Mode } from "@/lib/engine/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MODES: Array<{ value: Mode; label: string }> = [
  { value: "classic", label: "Classic" },
  { value: "inferno", label: "Inferno" },
  { value: "blitzInferno", label: "Blitz" },
];

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: "random", label: "Sparkler" },
  { value: "easy", label: "Kindling" },
  { value: "hard", label: "Bonfire" },
  { value: "perfect", label: "Inferno" },
];

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string; icon?: React.ReactNode }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-border bg-[var(--paper)]">
      {options.map((o, i) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 font-display text-xs font-semibold transition-colors",
            i > 0 && "border-l border-border",
            value === o.value
              ? "bg-[var(--ink)] text-[var(--paper)]"
              : "text-muted-foreground hover:bg-[var(--accent)] hover:text-foreground",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

const selectCls = "h-8 border border-border bg-[var(--paper)] font-display text-xs text-foreground";

export function HUD() {
  const game = useGame((s) => s.game);
  const opponent = useGame((s) => s.opponent);
  const newGame = useGame((s) => s.newGame);
  const setOpponent = useGame((s) => s.setOpponent);
  const undo = useGame((s) => s.undo);
  const reset = useGame((s) => s.reset);
  const showHints = useSettings((s) => s.showHints);

  const opponentKind = opponent === "human" ? "human" : "bot";
  const botDifficulty = typeof opponent === "object" ? opponent.difficulty : "easy";
  const botPlays = typeof opponent === "object" ? opponent.plays : 2;

  const handleHint = () => {
    if (game.status !== "playing") return;
    pingApiHealth("hint-request");
    const result = searchBestMove(game, 5);
    if (result.col >= 0) toast(`Best column: ${result.col + 1}`);
  };

  const handleMode = (mode: Mode) =>
    newGame(mode, { opponent, clockPreset: mode === "blitzInferno" ? "60+1" : undefined });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-border pb-3">
      <Segmented options={MODES} value={game.mode} onChange={handleMode} />

      <Segmented
        options={[
          { value: "human", label: "Human", icon: <Users className="size-3.5" /> },
          { value: "bot", label: "Bot", icon: <Bot className="size-3.5" /> },
        ]}
        value={opponentKind}
        onChange={(v) => setOpponent(v === "human" ? "human" : { kind: "bot", difficulty: botDifficulty, plays: 2 })}
      />

      {opponentKind === "bot" && (
        <>
          <Select value={botDifficulty} onValueChange={(v) => setOpponent({ kind: "bot", difficulty: v as Difficulty, plays: botPlays })}>
            <SelectTrigger className={cn(selectCls, "w-28")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setOpponent({ kind: "bot", difficulty: botDifficulty, plays: botPlays === 1 ? 2 : 1 })}
            className="flex items-center gap-1.5 rounded-md border border-border bg-[var(--paper)] px-3 py-1.5 font-display text-xs font-semibold text-foreground transition-colors hover:bg-[var(--accent)]"
          >
            <span className={cn("size-3 rounded-full", botPlays === 1 ? "bg-[var(--ember)]" : "bg-[var(--gold)]")} />
            {PLAYER_LABEL[botPlays]}
          </button>
        </>
      )}

      <Select
        value={game.clock ? "60+1" : "untimed"}
        onValueChange={(v) =>
          v === "untimed"
            ? newGame(game.mode === "blitzInferno" ? "inferno" : game.mode, { opponent })
            : newGame("blitzInferno", { opponent, clockPreset: v as keyof typeof CLOCK_PRESETS })}
      >
        <SelectTrigger className={cn(selectCls, "w-32")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="untimed">Untimed</SelectItem>
          {Object.entries(CLOCK_PRESETS).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-1">
        {showHints && (
          <Button variant="ghost" size="icon" onClick={handleHint} disabled={game.status !== "playing"} title="Hint" className="text-muted-foreground">
            <Sparkles className="text-[var(--ember)]" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={undo} disabled={game.moves.length === 0} title="Undo" className="text-muted-foreground">
          <Undo2 />
        </Button>
        <Button variant="ghost" size="icon" onClick={reset} title="Restart" className="text-muted-foreground">
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}
