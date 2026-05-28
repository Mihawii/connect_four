import { demoLeaderboard, type LeaderRow } from "@/lib/leaderboardDemo";
import type { Mode } from "@/lib/engine/types";

export const LEADERBOARD_FORMATS: Array<{ value: Mode; label: string }> = [
  { value: "blitzInferno", label: "Inferno Blitz" },
  { value: "inferno", label: "Inferno" },
  { value: "classic", label: "Classic" },
];

const seeds: Record<Mode, number> = {
  blitzInferno: 1,
  inferno: 2,
  classic: 3,
};

export function isLeaderboardFormat(value: string): value is Mode {
  return LEADERBOARD_FORMATS.some((format) => format.value === value);
}

export function getLeaderboardRows(format: Mode): LeaderRow[] {
  return demoLeaderboard(seeds[format]).sort((a, b) => b.rating - a.rating);
}
