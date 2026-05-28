"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/lib/store/gameStore";
import { PLAYER_LABEL } from "./constants";
import Link from "next/link";

export function WinOverlay() {
  const game = useGame((s) => s.game);
  const reset = useGame((s) => s.reset);

  const show = game.status !== "playing";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[var(--ember)]/40 bg-card/95 p-6 text-center shadow-2xl shadow-[var(--ember)]/20"
          >
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-[var(--ember)]/15">
              <Flame className="size-7 text-[var(--ember)]" />
            </div>
            <h2 className="font-display text-2xl font-semibold">
              {game.status === "won"
                ? `${PLAYER_LABEL[game.winner ?? 1]} wins`
                : game.status === "timeout"
                  ? `${PLAYER_LABEL[game.winner ?? 1]} wins on time`
                  : game.status === "draw"
                    ? "Draw"
                    : "Turn cap reached"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {game.totalTurns} moves · {game.moves.reduce((a, m) => a + m.burnedThisTurn.length, 0)} discs burned
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button variant="ember" onClick={reset}>
                <RotateCcw className="size-4" /> Rematch
              </Button>
              <Button asChild variant="outline">
                <Link href="/puzzle">
                  <Sparkles className="size-4 text-[var(--ember)]" /> Try today&rsquo;s puzzle
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
