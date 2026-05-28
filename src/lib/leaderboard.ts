import { prisma } from "@/lib/prisma";
import { demoLeaderboard, type LeaderRow } from "@/lib/leaderboardDemo";
import { DEFAULT_RATING, ratingTier, updateRating } from "@/lib/engine/elo";
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

type ParsedPeer = { clientId: string; ip: string | null };

type ParsedState = {
  moves: Array<{ player?: number }>;
  winner: number | null;
  status: string | null;
};

type Aggregate = {
  key: string;
  name: string;
  city: string;
  country: string;
  games: number;
  wins: number;
  losses: number;
  moveCount: number;
  rating: number;
  lastActiveTs: number;
};

type RatedGame = {
  p1: string;
  p2: string;
  resultP1: 0 | 0.5 | 1;
  at: number;
};

export function isLeaderboardFormat(value: string): value is Mode {
  return LEADERBOARD_FORMATS.some((format) => format.value === value);
}

function parseJsonValue<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  if (trimmed.startsWith("::ffff:")) return trimmed.slice(7);
  return trimmed;
}

function maskIp(ip: string): string {
  const normalized = normalizeIp(ip);
  if (normalized.includes(".")) {
    const parts = normalized.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
    return normalized;
  }
  const ipv6 = normalized.split(":").filter(Boolean);
  if (ipv6.length <= 2) return normalized;
  return `${ipv6.slice(0, 2).join(":")}::*`;
}

function parsePeers(raw: unknown): ParsedPeer[] {
  const peers = parseJsonValue<unknown[]>(raw, []);
  if (!Array.isArray(peers)) return [];

  const parsed: ParsedPeer[] = [];
  for (const peer of peers) {
    if (typeof peer === "string") {
      if (peer.trim().length) parsed.push({ clientId: peer.trim(), ip: null });
      continue;
    }
    if (!peer || typeof peer !== "object") continue;
    const rec = peer as Record<string, unknown>;
    const rawClientId = typeof rec.clientId === "string" ? rec.clientId : typeof rec.id === "string" ? rec.id : null;
    if (!rawClientId || rawClientId.trim().length === 0) continue;
    const ip = typeof rec.ip === "string" && rec.ip.trim().length > 0 ? normalizeIp(rec.ip) : null;
    parsed.push({ clientId: rawClientId.trim(), ip });
  }
  return parsed;
}

function parseState(raw: unknown): ParsedState {
  const state = parseJsonValue<Record<string, unknown> | null>(raw, null);
  if (!state || typeof state !== "object") {
    return { moves: [], winner: null, status: null };
  }

  const movesRaw = Array.isArray(state.moves) ? state.moves : [];
  const moves = movesRaw.filter((m): m is { player?: number } => Boolean(m && typeof m === "object"));
  const winner = state.winner === 1 || state.winner === 2 ? state.winner : null;
  const status = typeof state.status === "string" ? state.status : null;

  return { moves, winner, status };
}

function getIdentity(peer: ParsedPeer): { key: string; name: string; city: string; country: string } {
  if (peer.ip) {
    return {
      key: `ip:${peer.ip}`,
      name: `Anon ${maskIp(peer.ip)}`,
      city: "IP session",
      country: "Anonymous",
    };
  }
  return {
    key: `legacy:${peer.clientId}`,
    name: `Anon ${peer.clientId.slice(0, 6)}`,
    city: "Legacy session",
    country: "Anonymous",
  };
}

function touchAggregate(map: Map<string, Aggregate>, identity: ReturnType<typeof getIdentity>, at: number): Aggregate {
  const existing = map.get(identity.key);
  if (existing) {
    if (at > existing.lastActiveTs) existing.lastActiveTs = at;
    return existing;
  }

  const created: Aggregate = {
    key: identity.key,
    name: identity.name,
    city: identity.city,
    country: identity.country,
    games: 0,
    wins: 0,
    losses: 0,
    moveCount: 0,
    rating: DEFAULT_RATING,
    lastActiveTs: at,
  };
  map.set(identity.key, created);
  return created;
}

function buildRowsFromDb(
  format: Mode,
  rows: Array<{ mode: string; peers: unknown; state: unknown; updatedAt: Date }>,
): LeaderRow[] {
  const aggregates = new Map<string, Aggregate>();
  const ratedGames: RatedGame[] = [];

  for (const room of rows) {
    if (room.mode !== format) continue;

    const state = parseState(room.state);
    const peers = parsePeers(room.peers).slice(0, 2);
    if (peers.length === 0) continue;

    const played = state.moves.length > 0 || state.status === "won" || state.status === "timeout" || state.status === "draw";
    const seen = new Set<string>();
    const identities = peers.map(getIdentity);
    const updatedAt = room.updatedAt.getTime();

    for (let i = 0; i < peers.length; i += 1) {
      const identity = identities[i];
      if (seen.has(identity.key)) continue;
      seen.add(identity.key);

      const agg = touchAggregate(aggregates, identity, updatedAt);
      if (!played) continue;

      agg.games += 1;
      const playerNumber = i + 1;
      const personalMoves = state.moves.reduce(
        (sum, move) => sum + (move.player === playerNumber ? 1 : 0),
        0,
      );
      agg.moveCount += personalMoves;
    }

    if (peers.length === 2 && identities[0].key !== identities[1].key) {
      if (state.winner === 1 || state.winner === 2) {
        const p1 = touchAggregate(aggregates, identities[0], updatedAt);
        const p2 = touchAggregate(aggregates, identities[1], updatedAt);
        if (state.winner === 1) {
          p1.wins += 1;
          p2.losses += 1;
          ratedGames.push({ p1: identities[0].key, p2: identities[1].key, resultP1: 1, at: updatedAt });
        } else {
          p2.wins += 1;
          p1.losses += 1;
          ratedGames.push({ p1: identities[0].key, p2: identities[1].key, resultP1: 0, at: updatedAt });
        }
      } else if (state.status === "draw") {
        ratedGames.push({ p1: identities[0].key, p2: identities[1].key, resultP1: 0.5, at: updatedAt });
      }
    }
  }

  ratedGames.sort((a, b) => a.at - b.at);
  for (const game of ratedGames) {
    const p1 = aggregates.get(game.p1);
    const p2 = aggregates.get(game.p2);
    if (!p1 || !p2) continue;

    const nextP1 = updateRating(p1.rating, p2.rating, game.resultP1);
    const nextP2 = updateRating(p2.rating, p1.rating, (1 - game.resultP1) as 0 | 0.5 | 1);
    p1.rating = nextP1;
    p2.rating = nextP2;
  }

  const activeRows = Array.from(aggregates.values())
    .filter((row) => row.games > 0 || row.wins > 0 || row.losses > 0 || row.moveCount > 0)
    .map((row) => {
      const activityBonus = Math.min(80, Math.round(Math.sqrt(row.moveCount) * 10 + row.games * 2));
      const rating = row.rating + activityBonus;
      return {
        rank: 0,
        name: row.name,
        city: row.city,
        country: row.country,
        rating,
        games: row.games,
        tier: ratingTier(rating).name,
        _wins: row.wins,
        _last: row.lastActiveTs,
      };
    })
    .sort((a, b) => b.rating - a.rating || b.games - a.games || b._wins - a._wins || b._last - a._last)
    .map((row, index) => ({
      rank: index + 1,
      name: row.name,
      city: row.city,
      country: row.country,
      rating: row.rating,
      games: row.games,
      tier: row.tier,
    }));

  return activeRows;
}

export async function getLeaderboardRows(format: Mode): Promise<LeaderRow[]> {
  try {
    const rooms = await prisma.room.findMany({
      select: { id: true, mode: true, peers: true, state: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const dbRows = buildRowsFromDb(format, rooms);
    if (dbRows.length >= 10) return dbRows;

    const demo = demoLeaderboard(seeds[format]).sort((a, b) => b.rating - a.rating);
    if (dbRows.length === 0) {
      return demo.map((row, index) => ({ ...row, rank: index + 1 }));
    }

    const usedNames = new Set(dbRows.map((row) => row.name));
    const mixed = [...dbRows];
    for (const row of demo) {
      if (mixed.length >= 10) break;
      if (usedNames.has(row.name)) continue;
      mixed.push({ ...row, rank: 0 });
      usedNames.add(row.name);
    }

    return mixed
      .sort((a, b) => b.rating - a.rating || b.games - a.games)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  } catch {
    return demoLeaderboard(seeds[format])
      .sort((a, b) => b.rating - a.rating)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }
}
