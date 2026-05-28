"use client";

import * as React from "react";
import { useGame } from "@/lib/store/gameStore";
import { useSettings } from "@/lib/store/settingsStore";
import { playSound } from "@/lib/sound";

export function SoundManager() {
  const moves = useGame((s) => s.game.moves);
  const status = useGame((s) => s.game.status);
  const winner = useGame((s) => s.game.winner);
  const opponent = useGame((s) => s.opponent);
  const soundEnabled = useSettings((s) => s.soundEnabled);
  const volume = useSettings((s) => s.soundVolume);

  const prevMoveCount = React.useRef(0);
  const prevStatus = React.useRef(status);

  React.useEffect(() => {
    if (!soundEnabled) {
      prevMoveCount.current = moves.length;
      return;
    }
    if (moves.length > prevMoveCount.current) {
      const last = moves[moves.length - 1];
      playSound("drop", volume);
      if (last?.burnedThisTurn.length) {
        window.setTimeout(() => playSound("burn", volume), 80);
      }
    }
    prevMoveCount.current = moves.length;
  }, [moves, soundEnabled, volume]);

  React.useEffect(() => {
    if (!soundEnabled) {
      prevStatus.current = status;
      return;
    }
    if (status !== prevStatus.current && status !== "playing") {
      const humanWon =
        typeof opponent === "object"
          ? winner !== null && winner !== opponent.plays
          : true;
      window.setTimeout(() => playSound(humanWon ? "win" : "lose", volume), 120);
    }
    prevStatus.current = status;
  }, [status, winner, opponent, soundEnabled, volume]);

  return null;
}
