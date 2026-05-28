"use client";

import { create } from "zustand";
import { applyMove, createInitialState, FORMATS, makeClock, tickClock } from "../engine/rules";
import { chooseBotMove } from "../engine/bot";
import type { Difficulty, GameState, Mode, Player } from "../engine/types";
import { pingApiHealth } from "../api/health";

export type Opponent = "human" | { kind: "bot"; difficulty: Difficulty; plays: Player };

interface ClockPreset {
  label: string;
  totalMs: number;
  incrementMs: number;
}

export const CLOCK_PRESETS: Record<string, ClockPreset> = {
  "60+1": { label: "Bullet 1+1", totalMs: 60_000, incrementMs: 1_000 },
  "30+0": { label: "Hyperbullet 30+0", totalMs: 30_000, incrementMs: 0 },
  "180+2": { label: "Blitz 3+2", totalMs: 180_000, incrementMs: 2_000 },
};

interface GameStoreState {
  game: GameState;
  opponent: Opponent;
  thinking: boolean;
  hoverCol: number | null;
  newGame: (mode: Mode, opts?: { opponent?: Opponent; clockPreset?: keyof typeof CLOCK_PRESETS }) => void;
  setOpponent: (o: Opponent) => void;
  setHoverCol: (c: number | null) => void;
  playMove: (col: number) => Promise<void>;
  tick: () => void;
  undo: () => void;
  reset: () => void;
}

function buildInitialState(mode: Mode, clockPreset?: keyof typeof CLOCK_PRESETS): GameState {
  const fallbackPreset: keyof typeof CLOCK_PRESETS | undefined =
    mode === "blitzInferno" ? "60+1" : undefined;
  const preset = clockPreset ?? fallbackPreset;
  const clock = preset ? makeClock(CLOCK_PRESETS[preset].totalMs, CLOCK_PRESETS[preset].incrementMs) : null;
  return createInitialState(mode, clock);
}

export const useGame = create<GameStoreState>((set, get) => ({
  game: buildInitialState("classic"),
  opponent: "human",
  thinking: false,
  hoverCol: null,
  newGame: (mode, opts) => {
    const game = buildInitialState(mode, opts?.clockPreset);
    set({ game, opponent: opts?.opponent ?? get().opponent, thinking: false, hoverCol: null });
    void maybeTriggerBot();
  },
  setOpponent: (opponent) => {
    set({ opponent });
    void maybeTriggerBot();
  },
  setHoverCol: (hoverCol) => set({ hoverCol }),
  playMove: async (col) => {
    const { game, opponent, thinking } = get();
    if (thinking) return;
    if (game.status !== "playing") return;
    if (typeof opponent === "object" && opponent.plays === game.currentPlayer) return;
    const next = applyMove(game, col);
    if (next === game) return;
    set({ game: next });
    await maybeTriggerBot();
  },
  tick: () => {
    const { game } = get();
    if (!game.clock?.running) return;
    const next = tickClock(game);
    if (next !== game) set({ game: next });
  },
  undo: () => {
    const { game, opponent } = get();
    if (game.moves.length === 0) return;
    const stepsBack = opponent === "human" ? 1 : 2;
    let next = createInitialState(game.mode, game.clock ? { ...game.clock, msPerSide: { 1: 60_000, 2: 60_000 } } : null);
    const replay = game.moves.slice(0, Math.max(0, game.moves.length - stepsBack));
    for (const m of replay) next = applyMove(next, m.col, m.timestamp);
    set({ game: next });
  },
  reset: () => {
    const { game, opponent } = get();
    set({ game: buildInitialState(game.mode), opponent, thinking: false, hoverCol: null });
    void maybeTriggerBot();
  },
}));

async function maybeTriggerBot() {
  const { game, opponent, thinking } = useGame.getState();
  if (thinking) return;
  if (game.status !== "playing") return;
  if (typeof opponent !== "object") return;
  if (opponent.plays !== game.currentPlayer) return;
  pingApiHealth("bot-start");
  useGame.setState({ thinking: true });
  await new Promise((r) => setTimeout(r, 280));
  const col = chooseBotMove(game, opponent.difficulty);
  const next = applyMove(useGame.getState().game, col);
  useGame.setState({ game: next, thinking: false });
  void maybeTriggerBot();
}

export { FORMATS };
