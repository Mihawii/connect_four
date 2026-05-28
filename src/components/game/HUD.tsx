"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, RotateCcw, Undo2, Bot, Users, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CLOCK_PRESETS, useGame } from "@/lib/store/gameStore";
import { Clock } from "./Clock";
import { PLAYER_LABEL } from "./constants";
import type { Difficulty, Mode } from "@/lib/engine/types";
import { searchBestMove } from "@/lib/engine/solver";
import { useSettings } from "@/lib/store/settingsStore";
import { toast } from "sonner";

const MODES: Array<{ value: Mode; label: string; tag: string }> = [
  { value: "classic", label: "Classic", tag: "On-ramp" },
  { value: "inferno", label: "Inferno", tag: "Decay" },
  { value: "blitzInferno", label: "Inferno Blitz", tag: "Bullet" },
];

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: "random", label: "Sparkler" },
  { value: "easy", label: "Kindling" },
  { value: "hard", label: "Bonfire" },
  { value: "perfect", label: "Inferno" },
];

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
    const result = searchBestMove(game, 5);
    if (result.col >= 0) {
      toast.success(`Best column: ${result.col + 1}`, {
        description: `${PLAYER_LABEL[game.currentPlayer]}'s best play according to a 5-deep search.`,
      });
    }
  };

  const handleNewGame = (mode: Mode) => {
    const clockPreset = mode === "blitzInferno" ? ("60+1" as const) : undefined;
    newGame(mode, { opponent, clockPreset });
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[260px_1fr_260px]">
      <aside className="space-y-3">
        <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Mode</p>
          <div className="flex flex-col gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => handleNewGame(m.value)}
                className={`group flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-all ${
                  game.mode === m.value
                    ? "border-[var(--ember)]/60 bg-[var(--ember)]/10 text-foreground"
                    : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  {m.value === "classic" ? null : <Flame className="size-3.5 text-[var(--ember)]" />}
                  {m.label}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.tag}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Opponent</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setOpponent("human")}
              className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs transition-colors ${
                opponentKind === "human"
                  ? "border-[var(--ember)]/60 bg-[var(--ember)]/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="size-3.5" /> Human
            </button>
            <button
              onClick={() => setOpponent({ kind: "bot", difficulty: botDifficulty, plays: 2 })}
              className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-xs transition-colors ${
                opponentKind === "bot"
                  ? "border-[var(--ember)]/60 bg-[var(--ember)]/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bot className="size-3.5" /> Bot
            </button>
          </div>
          {opponentKind === "bot" && (
            <div className="mt-3 space-y-2">
              <Select value={botDifficulty} onValueChange={(v) => setOpponent({ kind: "bot", difficulty: v as Difficulty, plays: botPlays })}>
                <SelectTrigger className="h-8 text-xs">
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase text-muted-foreground">Bot plays:</span>
                <Button
                  size="sm"
                  variant={botPlays === 1 ? "ember" : "outline"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setOpponent({ kind: "bot", difficulty: botDifficulty, plays: 1 })}
                >
                  Ember
                </Button>
                <Button
                  size="sm"
                  variant={botPlays === 2 ? "ember" : "outline"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setOpponent({ kind: "bot", difficulty: botDifficulty, plays: 2 })}
                >
                  Flare
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Time control</p>
          <Select
            value={game.clock ? "60+1" : "untimed"}
            onValueChange={(v) => {
              if (v === "untimed") newGame(game.mode === "blitzInferno" ? "inferno" : game.mode);
              else newGame("blitzInferno", { clockPreset: v as keyof typeof CLOCK_PRESETS });
            }}
          >
            <SelectTrigger className="h-8 text-xs">
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
        </div>
      </aside>

      <div className="flex flex-col items-center justify-between gap-3">
        <div className="flex items-center justify-between gap-3 self-stretch">
          <Clock player={1} />
          <div className="hidden flex-col items-center gap-1 text-xs text-muted-foreground sm:flex">
            <span className="font-mono">Turn {game.totalTurns + 1}</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={game.currentPlayer + game.status}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <Badge variant={game.currentPlayer === 1 ? "ember" : "secondary"}>
                  {game.status === "playing"
                    ? `${PLAYER_LABEL[game.currentPlayer]} to drop`
                    : game.status === "won"
                      ? `${PLAYER_LABEL[game.winner ?? 1]} wins`
                      : game.status === "timeout"
                        ? `${PLAYER_LABEL[game.winner ?? 1]} wins on time`
                        : game.status === "draw"
                          ? "Draw"
                          : "Match over"}
                </Badge>
              </motion.div>
            </AnimatePresence>
          </div>
          <Clock player={2} />
        </div>
      </div>

      <aside className="space-y-3">
        <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Match</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={game.moves.length === 0}>
              <Undo2 className="size-3.5" /> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="size-3.5" /> Restart
            </Button>
            {showHints && (
              <Button variant="ghost" size="sm" onClick={handleHint} disabled={game.status !== "playing"}>
                <Sparkles className="size-3.5 text-[var(--ember)]" /> Hint
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Live stats</p>
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between"><dt className="text-muted-foreground">Moves</dt><dd className="font-mono">{game.totalTurns}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Burns total</dt><dd className="font-mono">{game.moves.reduce((a, m) => a + m.burnedThisTurn.length, 0)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Active discs</dt><dd className="font-mono">{game.cells.flat().filter(Boolean).length}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-[var(--ember)]/30 bg-[var(--ember)]/5 p-3 backdrop-blur">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--ember)]"><Trophy className="size-3" /> Rule</p>
          <p className="mt-1 text-xs text-foreground">Every disc lasts <span className="font-mono text-[var(--ember)]">10 of your turns</span>. Then it burns.</p>
        </div>
      </aside>
    </div>
  );
}
