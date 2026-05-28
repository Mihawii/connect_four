"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Sparkles, Share2, Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiniBoard } from "@/components/game/MiniBoard";
import { generateDailyPuzzle, shareableGrid, todayIso } from "@/lib/puzzle";
import { applyMove, legalMoves } from "@/lib/engine/rules";
import type { GameState } from "@/lib/engine/types";
import { toast } from "sonner";
import { playSound } from "@/lib/sound";

export default function PuzzlePage() {
  const today = todayIso();
  const puzzle = React.useMemo(() => generateDailyPuzzle(today), [today]);
  const [state, setState] = React.useState<GameState>(puzzle.state);
  const [solved, setSolved] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [tries, setTries] = React.useState(0);

  const reset = () => {
    setState(puzzle.state);
    setSolved(false);
    setFailed(false);
    setTries(0);
  };

  const onColClick = (col: number) => {
    if (solved) return;
    setTries((t) => t + 1);
    if (col === puzzle.solutionCol) {
      const next = applyMove(puzzle.state, col);
      setState(next);
      setSolved(true);
      playSound("win", 0.7);
      toast.success("Solved!", { description: "You found the burning line." });
    } else {
      setFailed(true);
      playSound("lose", 0.5);
      const next = applyMove(puzzle.state, col);
      setState(next);
      toast.error("Not the winning drop", { description: "Reset and look for four in a row." });
    }
  };

  const share = async () => {
    const grid = shareableGrid(solved ? state : puzzle.state, puzzle.solutionCol, solved);
    const text = `${grid}\nSolved in ${tries} ${tries === 1 ? "try" : "tries"} · play at inferno`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }
    } catch {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-10">
      <div className="text-center">
        <Badge variant="ember" className="mb-3">
          <Sparkles className="mr-1 size-3" /> Daily Puzzle · {today}
        </Badge>
        <h1 className="font-display text-3xl font-bold">Find the winning drop</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {puzzle.toMove === 1 ? "Ember (red)" : "Flare (yellow)"} to move. One column wins immediately. One puzzle a
          day — come back tomorrow.
        </p>
        <Badge variant="muted" className="mt-2 capitalize">
          {puzzle.difficulty}
        </Badge>
      </div>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <MiniBoard
          cells={state.cells}
          onColClick={solved ? undefined : onColClick}
          legalCols={legalMoves(state)}
          winningLine={state.winningLine}
          disabled={solved}
          showColNumbers
        />
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        {solved ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <Check className="size-5" />
            <span className="font-medium">Solved in {tries} {tries === 1 ? "try" : "tries"}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tries: {tries}</p>
        )}
        <div className="flex gap-2">
          {(solved || failed) && (
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          )}
          <Button variant="ember" onClick={share}>
            <Share2 className="size-4" /> Share result
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--ember)]/30 bg-[var(--ember)]/5 px-4 py-3 text-sm">
        <Flame className="size-4 text-[var(--ember)]" />
        <span className="text-muted-foreground">
          Pro unlocks the full puzzle archive — every past day, plus custom positions.
        </span>
      </div>
    </div>
  );
}
