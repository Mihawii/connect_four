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
  principle: string;
  explainBefore: string;
  explainAfter: string;
  checks: string[];
  tryThis: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "win",
    title: "Cash the forced win",
    concept: "Tactical scan",
    rows: [".......", ".......", ".......", ".......", ".......", "RRR...."],
    toMove: 1,
    solutionCol: 3,
    principle: "Before you defend or build, ask whether you can win immediately.",
    explainBefore: "You are Ember. Three discs already touch on the bottom row. One column ends the game right now.",
    explainAfter: "Column 4 completes the row. Winning threats outrank every other idea because the game is scored at placement.",
    checks: ["Scan your longest line first.", "Count empty landing squares beside it.", "If four appears now, play it."],
    tryThis: "Name the row before you click: columns 1, 2, 3, then the missing column.",
  },
  {
    id: "block",
    title: "Block before you dream",
    concept: "Defense",
    rows: [".......", ".......", ".......", ".......", ".......", "YYY...."],
    toMove: 1,
    solutionCol: 3,
    principle: "A threat that wins next turn is not optional. It must be answered.",
    explainBefore: "Flare has three on the floor. If you spend this move attacking elsewhere, Flare wins on the next move.",
    explainAfter: "Column 4 occupies the only winning square. Your turn checklist is: my win, their win, then my plan.",
    checks: ["Look for the opponent's open threes.", "Find the exact landing square that completes four.", "Block only the square that actually wins."],
    tryThis: "Say the opponent's winning column out loud, then take it away.",
  },
  {
    id: "center",
    title: "Start from the center",
    concept: "Opening",
    rows: [".......", ".......", ".......", ".......", ".......", "......."],
    toMove: 1,
    solutionCol: 3,
    principle: "The center touches more possible fours than an edge.",
    explainBefore: "On an empty board, the middle column gives one disc access to horizontal, vertical, and diagonal plans.",
    explainAfter: "Column 4 is the center. It creates the most future lines and makes your next threats harder to ignore.",
    checks: ["Count how many directions a move influences.", "Prefer central columns when no tactic exists.", "Avoid edge moves unless they solve a concrete threat."],
    tryThis: "Imagine the disc as an anchor. Choose the spot with the most roads out.",
  },
  {
    id: "vertical",
    title: "Respect the vertical stack",
    concept: "Column threats",
    rows: [".......", ".......", ".......", "..R....", "..R....", "..R...."],
    toMove: 1,
    solutionCol: 2,
    principle: "A three-high stack wins only if the column still has room above it.",
    explainBefore: "Ember owns three discs in one column. The next disc falls directly on top of them.",
    explainAfter: "Column 3 makes a vertical four. Vertical threats are easy to miss because they do not stretch across the board.",
    checks: ["Read each column from bottom to top.", "Find stacks of three with an empty cell above.", "Make sure the column is not full."],
    tryThis: "Trace the column upward, not sideways.",
  },
  {
    id: "fork",
    title: "Build a two-way threat",
    concept: "Double threat",
    rows: [".......", ".......", ".......", ".......", ".......", ".RR...."],
    toMove: 1,
    solutionCol: 3,
    principle: "The best non-winning move often creates two wins at once.",
    explainBefore:
      "Ember has two connected discs on columns 2 and 3. Add one disc so the line has a playable square on both ends.",
    explainAfter:
      "Column 4 creates Ember on columns 2, 3, and 4. Columns 1 and 5 both become threats, and Flare can only block one.",
    checks: ["Build open threes, not closed threes.", "Check both ends of the line.", "Ask whether one defender can cover every threat."],
    tryThis: "After your move, point to the two different winning columns.",
  },
  {
    id: "diagonal-support",
    title: "Only count supported diagonals",
    concept: "Gravity",
    rows: [".......", ".......", ".......", "..RY...", ".RYY...", "RYYY..."],
    toMove: 1,
    solutionCol: 3,
    principle: "A diagonal square matters only when a disc can actually land there.",
    explainBefore: "Ember has a rising diagonal. The missing square is high in column 4, so the lower cells must support it first.",
    explainAfter: "Column 4 lands on the support stack and completes the diagonal. Gravity decides which tactics are real.",
    checks: ["Locate the missing diagonal square.", "Count the filled cells below it.", "If the landing row matches the target, the tactic is live."],
    tryThis: "Read the diagonal, then read the support column before clicking.",
  },
];

export const DECAY_CONCEPTS = [
  {
    title: "Threats have timers",
    body: "In Inferno, every disc lasts 10 of your own turns. A slow setup can vanish before it pays off, so count whether the line will still exist when you plan to use it.",
  },
  {
    title: "Burns can open lanes",
    body: "When an old disc burns, pieces above it fall. That drop can turn a harmless stack into a diagonal or vertical win. Watch old support pieces as active tactics, not clutter.",
  },
  {
    title: "Convert before collapse",
    body: "Classic Connect Four rewards patient threats. Inferno rewards timing: convert open threes quickly, or build them to peak just as a burn changes the board.",
  },
];
