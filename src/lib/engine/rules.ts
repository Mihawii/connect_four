import {
  COLS,
  ROWS,
  MAX_AGE,
  TURN_CAP,
  type BurnEvent,
  type Cells,
  type ClockState,
  type Disc,
  type GameState,
  type Mode,
  type Move,
  type Player,
} from "./types";

const DIRECTIONS: Array<[number, number]> = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

export function createEmptyCells(): Cells {
  return Array.from({ length: COLS }, () => Array<Disc | null>(ROWS).fill(null));
}

export function cloneCells(cells: Cells): Cells {
  return cells.map((col) => col.map((d) => (d ? { ...d } : null)));
}

export function createInitialState(mode: Mode, clock: ClockState | null = null): GameState {
  return {
    mode,
    cells: createEmptyCells(),
    currentPlayer: 1,
    turnsByPlayer: { 1: 0, 2: 0 },
    totalTurns: 0,
    status: "playing",
    winner: null,
    winningLine: null,
    lastMove: null,
    lastBurned: [],
    moves: [],
    clock,
    startedAt: Date.now(),
  };
}

export function legalMoves(state: GameState): number[] {
  if (state.status !== "playing") return [];
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (state.cells[c][ROWS - 1] === null) out.push(c);
  }
  return out;
}

export function isColumnPlayable(cells: Cells, col: number): boolean {
  return cells[col][ROWS - 1] === null;
}

export function nextOpenRow(cells: Cells, col: number): number {
  for (let r = 0; r < ROWS; r++) {
    if (cells[col][r] === null) return r;
  }
  return -1;
}

export function other(p: Player): Player {
  return p === 1 ? 2 : 1;
}

/**
 * Inferno decay: at start of a player's turn, age all of their discs by +1.
 * Any disc whose age would exceed MAX_AGE burns (returns to the bag) and pieces above fall by gravity.
 * Returns the list of burn events (for animation) and mutates cells in place.
 */
function ageAndBurnFor(cells: Cells, player: Player): BurnEvent[] {
  const burns: BurnEvent[] = [];
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const d = cells[c][r];
      if (d && d.player === player) d.age += 1;
    }
  }
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS) {
      const d = cells[c][r];
      if (d && d.player === player && d.age > MAX_AGE) {
        burns.push({ col: c, row: r, player });
        for (let rr = r; rr < ROWS - 1; rr++) {
          cells[c][rr] = cells[c][rr + 1];
        }
        cells[c][ROWS - 1] = null;
      } else {
        r += 1;
      }
    }
  }
  return burns;
}

export function applyMove(state: GameState, col: number, now: number = Date.now()): GameState {
  if (state.status !== "playing") return state;
  if (col < 0 || col >= COLS) return state;
  if (!isColumnPlayable(state.cells, col)) return state;

  const cells = cloneCells(state.cells);
  const player = state.currentPlayer;
  let burnedThisTurn: BurnEvent[] = [];

  if (state.mode !== "classic") {
    burnedThisTurn = ageAndBurnFor(cells, player);
  }

  if (!isColumnPlayable(cells, col)) return state;

  const row = nextOpenRow(cells, col);
  if (row < 0) return state;
  cells[col][row] = { player, age: 1 };

  const winLine = findWinThroughCell(cells, col, row);
  const newTurnsByPlayer: Record<Player, number> = {
    ...state.turnsByPlayer,
    [player]: state.turnsByPlayer[player] + 1,
  };
  const totalTurns = state.totalTurns + 1;

  const move: Move = {
    player,
    col,
    row,
    timestamp: now,
    burnedThisTurn,
  };

  let status: GameState["status"] = "playing";
  let winner: Player | null = null;
  if (winLine) {
    status = "won";
    winner = player;
  } else if (state.mode === "classic" && boardFull(cells)) {
    status = "draw";
  } else if (totalTurns >= TURN_CAP) {
    status = "turnCap";
  }

  let clock = state.clock;
  if (clock && clock.running) {
    const elapsed = clock.lastTickAt ? Math.max(0, now - clock.lastTickAt) : 0;
    const remaining = Math.max(0, clock.msPerSide[player] - elapsed) + clock.incrementMs;
    const msPerSide: Record<Player, number> = { ...clock.msPerSide, [player]: remaining };
    const opponent = other(player);
    if (status === "playing" && msPerSide[opponent] <= 0) {
      status = "timeout";
      winner = player;
    }
    clock = {
      ...clock,
      msPerSide,
      lastTickAt: status === "playing" ? now : null,
      activePlayer: status === "playing" ? opponent : null,
      running: status === "playing",
    };
  }

  return {
    ...state,
    cells,
    currentPlayer: status === "playing" ? other(player) : player,
    turnsByPlayer: newTurnsByPlayer,
    totalTurns,
    status,
    winner,
    winningLine: winLine,
    lastMove: { col, row },
    lastBurned: burnedThisTurn,
    moves: [...state.moves, move],
    clock,
  };
}

export function tickClock(state: GameState, now: number = Date.now()): GameState {
  if (!state.clock || !state.clock.running || state.status !== "playing") return state;
  const player = state.currentPlayer;
  const elapsed = state.clock.lastTickAt ? Math.max(0, now - state.clock.lastTickAt) : 0;
  const remaining = state.clock.msPerSide[player] - elapsed;
  if (remaining <= 0) {
    const winner = other(player);
    return {
      ...state,
      status: "timeout",
      winner,
      clock: {
        ...state.clock,
        msPerSide: { ...state.clock.msPerSide, [player]: 0 },
        lastTickAt: null,
        activePlayer: null,
        running: false,
      },
    };
  }
  return state;
}

export function boardFull(cells: Cells): boolean {
  for (let c = 0; c < COLS; c++) {
    if (cells[c][ROWS - 1] === null) return false;
  }
  return true;
}

export function findWinThroughCell(
  cells: Cells,
  col: number,
  row: number,
): { col: number; row: number }[] | null {
  const d = cells[col][row];
  if (!d) return null;
  const player = d.player;
  for (const [dc, dr] of DIRECTIONS) {
    const line: { col: number; row: number }[] = [{ col, row }];
    let nc = col + dc;
    let nr = row + dr;
    while (inBounds(nc, nr) && cells[nc][nr]?.player === player) {
      line.push({ col: nc, row: nr });
      nc += dc;
      nr += dr;
    }
    nc = col - dc;
    nr = row - dr;
    while (inBounds(nc, nr) && cells[nc][nr]?.player === player) {
      line.unshift({ col: nc, row: nr });
      nc -= dc;
      nr -= dr;
    }
    if (line.length >= 4) return line.slice(0, 4);
  }
  return null;
}

export function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

export function makeClock(totalMs: number, incrementMs: number): ClockState {
  return {
    msPerSide: { 1: totalMs, 2: totalMs },
    incrementMs,
    lastTickAt: Date.now(),
    activePlayer: 1,
    running: true,
  };
}

export const FORMATS: Record<Mode, { label: string; description: string; clock: ClockState | null }> = {
  classic: {
    label: "Classic",
    description: "The Connect Four you know. Two players, four in a row wins. No decay, no clock.",
    clock: null,
  },
  inferno: {
    label: "Inferno",
    description: "Every disc lasts 10 of your turns, then burns away. No clock — pure strategy.",
    clock: null,
  },
  blitzInferno: {
    label: "Inferno Blitz",
    description: "Decay + bullet clock. 60 seconds + 1s per move. The TikTok format.",
    clock: null,
  },
};
