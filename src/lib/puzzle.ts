import { applyMove, createInitialState, findWinThroughCell, cloneCells, nextOpenRow, legalMoves } from "./engine/rules";
import { COLS, type GameState, type Player } from "./engine/types";

/** Deterministic mulberry32 PRNG so a given date always yields the same puzzle. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dateSeed(dateIso: string): number {
  let h = 0;
  for (let i = 0; i < dateIso.length; i++) h = (Math.imul(31, h) + dateIso.charCodeAt(i)) | 0;
  return h >>> 0;
}

export interface DailyPuzzle {
  date: string;
  state: GameState;
  solutionCol: number;
  toMove: Player;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Generates a deterministic daily puzzle: a Classic position where the side to move
 * has a single forcing winning drop. Returns the position and the winning column.
 */
export function generateDailyPuzzle(dateIso: string): DailyPuzzle {
  const rand = mulberry32(dateSeed(dateIso));
  for (let attempt = 0; attempt < 400; attempt++) {
    let state = createInitialState("classic");
    const plies = 6 + Math.floor(rand() * 8);
    let aborted = false;
    for (let i = 0; i < plies; i++) {
      const legal = legalMoves(state);
      if (legal.length === 0) {
        aborted = true;
        break;
      }
      // avoid making an accidental win mid-setup
      const safe = legal.filter((c) => {
        const cells = cloneCells(state.cells);
        const row = nextOpenRow(cells, c);
        if (row < 0) return false;
        cells[c][row] = { player: state.currentPlayer, age: 1 };
        return !findWinThroughCell(cells, c, row);
      });
      const pool = safe.length ? safe : legal;
      const col = pool[Math.floor(rand() * pool.length)];
      state = applyMove(state, col);
      if (state.status !== "playing") {
        aborted = true;
        break;
      }
    }
    if (aborted) continue;

    const toMove = state.currentPlayer;
    const winningCols = legalMoves(state).filter((c) => {
      const cells = cloneCells(state.cells);
      const row = nextOpenRow(cells, c);
      if (row < 0) return false;
      cells[c][row] = { player: toMove, age: 1 };
      return !!findWinThroughCell(cells, c, row);
    });
    if (winningCols.length === 1) {
      const filled = state.cells.flat().filter(Boolean).length;
      const difficulty = filled < 10 ? "easy" : filled < 18 ? "medium" : "hard";
      return { date: dateIso, state, solutionCol: winningCols[0], toMove, difficulty };
    }
  }
  // fallback: simplest forced win
  let state = createInitialState("classic");
  state = applyMove(state, 3);
  state = applyMove(state, 0);
  state = applyMove(state, 3);
  state = applyMove(state, 1);
  state = applyMove(state, 3);
  state = applyMove(state, 2);
  return { date: dateIso, state, solutionCol: 3, toMove: state.currentPlayer, difficulty: "easy" };
}

const SQUARE: Record<number, string> = { 0: "⬛", 1: "🔴", 2: "🟡" };

/** Wordle-style shareable grid of the solved puzzle position with the winning column marked. */
export function shareableGrid(state: GameState, solutionCol: number, solved: boolean): string {
  const rows: string[] = [];
  for (let r = 5; r >= 0; r--) {
    let line = "";
    for (let c = 0; c < COLS; c++) {
      line += SQUARE[state.cells[c]?.[r]?.player ?? 0];
    }
    rows.push(line);
  }
  const marker = Array.from({ length: COLS }, (_, c) => (c === solutionCol ? (solved ? "🔥" : "👇") : "▫️")).join("");
  return `Inferno Daily ${state ? "" : ""}\n${rows.join("\n")}\n${marker}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
