import {
  COLS,
  ROWS,
  type Cells,
  type GameState,
  type Player,
} from "./types";
import {
  applyMove,
  cloneCells,
  findWinThroughCell,
  legalMoves,
  nextOpenRow,
  other,
} from "./rules";

const CENTER_WEIGHTS = [3, 4, 5, 7, 5, 4, 3];

/**
 * Heuristic eval of a board from the perspective of `me`.
 * Positive = good for `me`, negative = good for opponent.
 * Uses standard Connect Four scoring of all 4-windows on the board.
 */
function evalBoard(cells: Cells, me: Player): number {
  let score = 0;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const d = cells[c][r];
      if (d?.player === me) score += CENTER_WEIGHTS[c];
    }
  }
  const windows = enumerateWindows(cells);
  for (const w of windows) score += scoreWindow(w, me);
  return score;
}

function enumerateWindows(cells: Cells): Array<Array<Player | 0>> {
  const flat = (c: number, r: number): Player | 0 => (cells[c][r]?.player ?? 0);
  const wins: Array<Array<Player | 0>> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      wins.push([flat(c, r), flat(c + 1, r), flat(c + 2, r), flat(c + 3, r)]);
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      wins.push([flat(c, r), flat(c, r + 1), flat(c, r + 2), flat(c, r + 3)]);
    }
  }
  for (let c = 0; c <= COLS - 4; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      wins.push([flat(c, r), flat(c + 1, r + 1), flat(c + 2, r + 2), flat(c + 3, r + 3)]);
    }
  }
  for (let c = 0; c <= COLS - 4; c++) {
    for (let r = 3; r < ROWS; r++) {
      wins.push([flat(c, r), flat(c + 1, r - 1), flat(c + 2, r - 2), flat(c + 3, r - 3)]);
    }
  }
  return wins;
}

function scoreWindow(window: Array<Player | 0>, me: Player): number {
  const them = other(me);
  let mineCount = 0;
  let themCount = 0;
  let empty = 0;
  for (const v of window) {
    if (v === me) mineCount++;
    else if (v === them) themCount++;
    else empty++;
  }
  if (mineCount && themCount) return 0;
  if (mineCount === 4) return 10000;
  if (themCount === 4) return -10000;
  if (mineCount === 3 && empty === 1) return 50;
  if (mineCount === 2 && empty === 2) return 10;
  if (themCount === 3 && empty === 1) return -60;
  if (themCount === 2 && empty === 2) return -8;
  return 0;
}

interface SearchResult {
  col: number;
  score: number;
}

const PREFERRED_ORDER = [3, 4, 2, 5, 1, 6, 0];

function orderedMoves(state: GameState): number[] {
  const legal = legalMoves(state);
  return PREFERRED_ORDER.filter((c) => legal.includes(c));
}

function negamax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  rootPlayer: Player,
): number {
  if (state.status === "won") {
    return state.winner === rootPlayer ? 100000 - state.totalTurns : -100000 + state.totalTurns;
  }
  if (state.status === "draw" || state.status === "turnCap") return 0;
  if (depth === 0) {
    return evalBoard(state.cells, rootPlayer) * (state.currentPlayer === rootPlayer ? 1 : -1);
  }

  let best = -Infinity;
  const moves = orderedMoves(state);
  if (moves.length === 0) return 0;

  for (const c of moves) {
    const next = applyMove(state, c);
    if (next === state) continue;
    const score = -negamax(next, depth - 1, -beta, -alpha, rootPlayer);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export function searchBestMove(state: GameState, depth: number): SearchResult {
  const me = state.currentPlayer;
  const legal = legalMoves(state);
  if (legal.length === 0) return { col: -1, score: 0 };

  for (const c of legal) {
    const cells = cloneCells(state.cells);
    const row = nextOpenRow(cells, c);
    if (row < 0) continue;
    cells[c][row] = { player: me, age: 1 };
    if (findWinThroughCell(cells, c, row)) return { col: c, score: 100000 };
  }

  for (const c of legal) {
    const cells = cloneCells(state.cells);
    const row = nextOpenRow(cells, c);
    if (row < 0) continue;
    cells[c][row] = { player: other(me), age: 1 };
    if (findWinThroughCell(cells, c, row)) return { col: c, score: 50000 };
  }

  let best: SearchResult = { col: legal[0], score: -Infinity };
  let alpha = -Infinity;
  const beta = Infinity;
  const ordered = orderedMoves(state);
  for (const c of ordered) {
    const next = applyMove(state, c);
    if (next === state) continue;
    const score = -negamax(next, Math.max(0, depth - 1), -beta, -alpha, me);
    if (score > best.score) best = { col: c, score };
    if (score > alpha) alpha = score;
  }
  return best;
}

export function randomLegal(state: GameState): number {
  const legal = legalMoves(state);
  if (legal.length === 0) return -1;
  return legal[Math.floor(Math.random() * legal.length)];
}
