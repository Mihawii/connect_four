import { DIFFICULTY_DEPTH, type Difficulty, type GameState } from "./types";
import { randomLegal, searchBestMove } from "./solver";

export function chooseBotMove(state: GameState, difficulty: Difficulty): number {
  if (difficulty === "random") return randomLegal(state);
  const depth = DIFFICULTY_DEPTH[difficulty];
  const { col } = searchBestMove(state, depth);
  if (col === -1) return randomLegal(state);
  return col;
}

export function botLabel(difficulty: Difficulty): string {
  switch (difficulty) {
    case "random":
      return "Sparkler";
    case "easy":
      return "Kindling";
    case "hard":
      return "Bonfire";
    case "perfect":
      return "Inferno";
  }
}

export function botDescription(difficulty: Difficulty): string {
  switch (difficulty) {
    case "random":
      return "Plays random legal moves. For absolute first-timers.";
    case "easy":
      return "Sees 3 turns ahead. A decent sparring partner.";
    case "hard":
      return "Sees 6 turns ahead. Beats most casual players.";
    case "perfect":
      return "Sees 9+ turns ahead. Brings the heat.";
  }
}
