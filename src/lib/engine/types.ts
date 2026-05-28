export const COLS = 7 as const;
export const ROWS = 6 as const;
export const MAX_AGE = 10 as const;
export const TURN_CAP = 80 as const;

export type Player = 1 | 2;
export type Mode = "classic" | "inferno" | "blitzInferno";

export interface Disc {
  player: Player;
  age: number;
}

export type Cells = (Disc | null)[][];

export interface BurnEvent {
  col: number;
  row: number;
  player: Player;
}

export interface Move {
  player: Player;
  col: number;
  row: number;
  timestamp: number;
  burnedThisTurn: BurnEvent[];
}

export interface ClockState {
  msPerSide: Record<Player, number>;
  incrementMs: number;
  lastTickAt: number | null;
  activePlayer: Player | null;
  running: boolean;
}

export interface GameState {
  mode: Mode;
  cells: Cells;
  currentPlayer: Player;
  turnsByPlayer: Record<Player, number>;
  totalTurns: number;
  status: "playing" | "won" | "draw" | "turnCap" | "timeout";
  winner: Player | null;
  winningLine: { col: number; row: number }[] | null;
  lastMove: { col: number; row: number } | null;
  lastBurned: BurnEvent[];
  moves: Move[];
  clock: ClockState | null;
  startedAt: number;
}

export interface FormatConfig {
  mode: Mode;
  label: string;
  decay: boolean;
  clock: ClockState | null;
  description: string;
}

export type Difficulty = "random" | "easy" | "hard" | "perfect";

export const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  random: 0,
  easy: 3,
  hard: 6,
  perfect: 9,
};

export interface CoachReview {
  phaseGrades: { opening: string; midgame: string; endgame: string };
  moves: Array<{
    turn: number;
    classification: "Brilliant" | "Best" | "Good" | "Inaccuracy" | "Miss" | "Mistake" | "Blunder";
    note: string;
  }>;
  heroMoment: { turn: number; why: string } | null;
  turningPoint: { turn: number; why: string } | null;
  summary: string;
}
