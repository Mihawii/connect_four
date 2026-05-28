"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Sparkles } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/store/gameStore";
import { PLAYER_LABEL } from "./constants";
import Link from "next/link";

export function WinOverlay() {
  const game = useGame((s) => s.game);
  const reset = useGame((s) => s.reset);
  const show = game.status !== "playing";
  const burned = game.moves.reduce((a, m) => a + m.burnedThisTurn.length, 0);

  const headline =
    game.status === "won"
      ? `${PLAYER_LABEL[game.winner ?? 1]} wins`
      : game.status === "timeout"
        ? `${PLAYER_LABEL[game.winner ?? 1]} wins on time`
        : game.status === "draw"
          ? "Draw"
          : "Turn cap";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-4"
          style={{ background: "color-mix(in oklch, var(--coal) 70%, transparent)" }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="pointer-events-auto w-full max-w-sm rounded-lg border-[1.5px] border-ink bg-[var(--paper)] p-6 text-center shadow-hard-lg"
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-md border-[1.5px] border-ink bg-[var(--ember)]">
              <Sparkles className="size-6 text-[oklch(0.99_0.014_85)]" />
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold">{headline}</h2>
            <p className="mt-1 font-display text-xs font-semibold uppercase text-muted-foreground">
              {game.totalTurns} moves · {burned} burned
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button variant="ember" onClick={reset}>
                <RotateCcw /> Rematch
              </Button>
              <Button asChild variant="outline">
                <Link href="/puzzle">
                  <Sparkles className="text-[var(--ember)]" /> Today&rsquo;s puzzle
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
