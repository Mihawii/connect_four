import { applyMove, createInitialState, makeClock } from "../engine/rules";
import { searchBestMove } from "../engine/solver";
import type { Mode, Player } from "../engine/types";

export type Classification =
  | "Brilliant"
  | "Best"
  | "Good"
  | "Inaccuracy"
  | "Miss"
  | "Mistake"
  | "Blunder";

export interface AnalyzedMove {
  ply: number;
  player: Player;
  col: number;
  bestCol: number;
  scorePlayed: number;
  scoreBest: number;
  delta: number;
  classification: Classification;
  burned: number;
}

const ANALYZE_DEPTH = 6;

function classify(delta: number, wasWinning: boolean, stillWinning: boolean, unique: boolean): Classification {
  if (wasWinning && !stillWinning) return "Blunder";
  if (delta <= 2) return unique && wasWinning ? "Brilliant" : "Best";
  if (delta <= 25) return "Good";
  if (delta <= 90) return "Inaccuracy";
  if (delta <= 400) return wasWinning ? "Miss" : "Mistake";
  return "Blunder";
}

export interface MatchAnalysis {
  mode: Mode;
  moves: AnalyzedMove[];
  summaryStats: {
    brilliant: number;
    best: number;
    blunders: number;
    misses: number;
    accuracyP1: number;
    accuracyP2: number;
  };
  winner: Player | null;
}

export function analyzeMatch(mode: Mode, cols: number[]): MatchAnalysis {
  let state = createInitialState(mode, mode === "blitzInferno" ? makeClock(60_000, 1000) : null);
  const analyzed: AnalyzedMove[] = [];

  for (let i = 0; i < cols.length; i++) {
    if (state.status !== "playing") break;
    const player = state.currentPlayer;
    const best = searchBestMove(state, ANALYZE_DEPTH);
    const playedCol = cols[i];

    const afterPlayed = applyMove(state, playedCol);
    const playedScore = -searchBestMove(afterPlayed, Math.max(1, ANALYZE_DEPTH - 1)).score;

    const wasWinning = best.score > 5000;
    const stillWinning = playedScore > 5000;
    const delta = Math.max(0, best.score - playedScore);

    // uniqueness: would most other legal moves have lost the win?
    let losingAlternatives = 0;
    let totalAlternatives = 0;
    for (let c = 0; c < 7; c++) {
      if (c === playedCol) continue;
      const alt = applyMove(state, c);
      if (alt === state) continue;
      totalAlternatives++;
      const altScore = -searchBestMove(alt, 2).score;
      if (altScore < 5000) losingAlternatives++;
    }
    const unique = wasWinning && totalAlternatives > 0 && losingAlternatives === totalAlternatives;

    analyzed.push({
      ply: i + 1,
      player,
      col: playedCol,
      bestCol: best.col,
      scorePlayed: playedScore,
      scoreBest: best.score,
      delta,
      classification: classify(delta, wasWinning, stillWinning, unique),
      burned: afterPlayed.moves[afterPlayed.moves.length - 1]?.burnedThisTurn.length ?? 0,
    });
    state = afterPlayed;
  }

  const acc = (p: Player) => {
    const ms = analyzed.filter((m) => m.player === p);
    if (ms.length === 0) return 100;
    const good = ms.filter((m) => ["Brilliant", "Best", "Good"].includes(m.classification)).length;
    return Math.round((good / ms.length) * 100);
  };

  return {
    mode,
    moves: analyzed,
    winner: state.winner,
    summaryStats: {
      brilliant: analyzed.filter((m) => m.classification === "Brilliant").length,
      best: analyzed.filter((m) => m.classification === "Best").length,
      blunders: analyzed.filter((m) => m.classification === "Blunder").length,
      misses: analyzed.filter((m) => m.classification === "Miss").length,
      accuracyP1: acc(1),
      accuracyP2: acc(2),
    },
  };
}

/** Offline fallback review built from analysis alone — used when no Anthropic key is set. */
export function heuristicReview(analysis: MatchAnalysis, forPlayer: Player) {
  const mine = analysis.moves.filter((m) => m.player === forPlayer);
  const blunders = mine.filter((m) => m.classification === "Blunder");
  const misses = mine.filter((m) => m.classification === "Miss");
  const brilliants = mine.filter((m) => m.classification === "Brilliant");
  const worst = [...mine].sort((a, b) => b.delta - a.delta)[0];
  const acc = forPlayer === 1 ? analysis.summaryStats.accuracyP1 : analysis.summaryStats.accuracyP2;

  const phase = (frac: number) => {
    const ms = mine.slice(Math.floor(mine.length * frac), Math.floor(mine.length * (frac + 0.34)));
    if (ms.length === 0) return "—";
    const a = ms.filter((m) => ["Brilliant", "Best", "Good"].includes(m.classification)).length / ms.length;
    return a > 0.8 ? "A" : a > 0.6 ? "B" : a > 0.4 ? "C" : "D";
  };

  const lines: string[] = [];
  lines.push(`You played at ${acc}% accuracy across ${mine.length} moves.`);
  if (brilliants.length) lines.push(`Move ${brilliants[0].ply} was brilliant — the only column that kept the win alive.`);
  if (misses.length) lines.push(`On move ${misses[0].ply} you had a winning idea on column ${misses[0].bestCol + 1} and let it slip.`);
  if (blunders.length) lines.push(`Move ${blunders[0].ply} was the turning point: column ${blunders[0].col + 1} handed the initiative away. ${blunders[0].bestCol + 1} was the hold.`);
  if (!blunders.length && !misses.length) lines.push(`Clean game — no blunders, no missed wins. This is how you climb.`);

  return {
    phaseGrades: { opening: phase(0), midgame: phase(0.33), endgame: phase(0.66) },
    moves: mine
      .filter((m) => ["Brilliant", "Miss", "Blunder", "Mistake"].includes(m.classification))
      .slice(0, 6)
      .map((m) => ({
        turn: m.ply,
        classification: m.classification,
        note:
          m.classification === "Brilliant"
            ? `Only move. Column ${m.col + 1} was forced and you found it.`
            : m.classification === "Blunder"
              ? `Column ${m.bestCol + 1} was the move; ${m.col + 1} let the threat through.`
              : `Better was column ${m.bestCol + 1}.`,
      })),
    heroMoment: brilliants.length ? { turn: brilliants[0].ply, why: "The one forcing move on the board." } : worst && worst.delta < 5 ? { turn: worst.ply, why: "Accurate under pressure." } : null,
    turningPoint: (blunders[0] ?? misses[0]) ? { turn: (blunders[0] ?? misses[0]).ply, why: `Column ${(blunders[0] ?? misses[0]).bestCol + 1} was the hold.` } : null,
    summary: lines.join(" "),
  };
}
