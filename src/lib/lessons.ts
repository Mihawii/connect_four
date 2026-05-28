import { createEmptyCells } from "./engine/rules";
import { COLS, ROWS, type Cells, type Player } from "./engine/types";

/** rows[0] is the TOP row (row 5). Chars: '.' empty, 'R' Ember(1), 'Y' Flare(2). */
export function parseBoard(rows: string[]): Cells {
  const cells = createEmptyCells();
  for (let i = 0; i < rows.length; i++) {
    const r = ROWS - 1 - i;
    for (let c = 0; c < COLS; c++) {
      const ch = rows[i]?.[c];
      if (ch === "R") cells[c][r] = { player: 1, age: 1 };
      else if (ch === "Y") cells[c][r] = { player: 2, age: 1 };
    }
  }
  return cells;
}

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  rows: string[];
  toMove: Player;
  solutionCol: number;
  explainBefore: string;
  explainAfter: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "win",
    title: "Spot the win",
    concept: "Four in a row",
    rows: [".......", ".......", ".......", ".......", ".......", "RRR...."],
    toMove: 1,
    solutionCol: 3,
    explainBefore: "You're Ember (red). You already have three in a row along the bottom. Finish it.",
    explainAfter: "Column 4 completes four in a row. Always scan for your own three-in-a-rows first.",
  },
  {
    id: "block",
    title: "Block the threat",
    concept: "Defense",
    rows: [".......", ".......", ".......", ".......", ".......", "YYY...."],
    toMove: 1,
    solutionCol: 3,
    explainBefore: "Flare (yellow) has three in a row and is about to win. You're Ember. Stop it.",
    explainAfter: "Column 4 blocks the win. Every turn: check the opponent's threats before you attack.",
  },
  {
    id: "fork",
    title: "Build a fork",
    concept: "Double threat",
    rows: [".......", ".......", ".......", ".......", ".......", ".RR...."],
    toMove: 1,
    solutionCol: 3,
    explainBefore:
      "You're Ember with two in a row (columns 2-3). Find the move that makes an open three — a threat on BOTH ends that can't be blocked.",
    explainAfter:
      "Column 4 gives you red on columns 2-3-4 with open ends at columns 1 and 5. The opponent can only block one. That's a fork — the heart of winning Connect Four.",
  },
];

export const DECAY_CONCEPTS = [
  {
    title: "Your discs expire",
    body: "In Inferno, every disc you place lasts exactly 10 of your turns. On the 11th it burns away and everything above it drops. The board you see now is not the board you'll see in five turns.",
  },
  {
    title: "Don't camp threats",
    body: "In Classic you can sit on a threat forever. In Inferno, a winning setup can burn out from under you. Convert threats fast — or build them so they mature right as an old disc clears space.",
  },
  {
    title: "Weaponize the burn",
    body: "Advanced play: place a disc knowing an older one below it will burn, dropping it into a winning line. The decay isn't just a clock — it's a second way to attack.",
  },
];
