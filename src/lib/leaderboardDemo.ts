import { ratingTier } from "./engine/elo";

export interface LeaderRow {
  rank: number;
  name: string;
  city: string;
  country: string;
  rating: number;
  games: number;
  tier: string;
}

const NAMES = [
  ["AshKing", "Almaty", "KZ"],
  ["EmberQueen", "Astana", "KZ"],
  ["pyro_max", "Shymkent", "KZ"],
  ["coldfront", "Almaty", "KZ"],
  ["four_alarm", "Karaganda", "KZ"],
  ["dropzone", "Almaty", "KZ"],
  ["smolder99", "Astana", "KZ"],
  ["gravity", "Aktobe", "KZ"],
  ["wildfire", "Almaty", "KZ"],
  ["the_kindling", "Taraz", "KZ"],
  ["burnout", "Pavlodar", "KZ"],
  ["fourcast", "Almaty", "KZ"],
];

export function demoLeaderboard(seed = 1): LeaderRow[] {
  return NAMES.map(([name, city, country], i) => {
    const rating = 2200 - i * (70 + ((i * seed) % 23));
    return {
      rank: i + 1,
      name,
      city,
      country,
      rating,
      games: 120 - i * 6 + ((i * 7) % 11),
      tier: ratingTier(rating).name,
    };
  });
}
