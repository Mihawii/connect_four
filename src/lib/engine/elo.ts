export const DEFAULT_RATING = 1200;
export const K_FACTOR = 32;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function updateRating(
  rating: number,
  opponentRating: number,
  result: 0 | 0.5 | 1,
  k: number = K_FACTOR,
): number {
  const expected = expectedScore(rating, opponentRating);
  return Math.round(rating + k * (result - expected));
}

export function ratingTier(rating: number): { name: string; min: number } {
  if (rating < 1000) return { name: "Spark", min: 0 };
  if (rating < 1200) return { name: "Tinder", min: 1000 };
  if (rating < 1400) return { name: "Kindling", min: 1200 };
  if (rating < 1600) return { name: "Bonfire", min: 1400 };
  if (rating < 1800) return { name: "Wildfire", min: 1600 };
  if (rating < 2000) return { name: "Pyromancer", min: 1800 };
  return { name: "Inferno", min: 2000 };
}
