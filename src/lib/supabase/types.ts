// Hand-written DB types. Regenerate with:
//   supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
// (kept manual here so the project typechecks before a project exists)

export interface Profile {
  id: string;
  display_name: string | null;
  country: string | null;
  city: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  pro_until: string | null;
  created_at: string;
}

export interface EloRating {
  user_id: string;
  format: string;
  rating: number;
  games_played: number;
  wins: number;
  losses: number;
  updated_at: string;
}

export interface MatchRow {
  id: string;
  format: string;
  mode: string;
  p1_id: string | null;
  p2_id: string | null;
  bot_level: string | null;
  status: string;
  winner: number | null;
  moves: unknown;
  time_control: unknown;
  ranked: boolean;
  started_at: string;
  ended_at: string | null;
}

export interface RoomRow {
  id: string;
  code: string;
  host_id: string | null;
  guest_id: string | null;
  format: string;
  mode: string;
  settings: Record<string, unknown>;
  status: string;
  state: unknown;
  created_at: string;
}

export interface PuzzleRow {
  date: string;
  position: unknown;
  solution: unknown;
  difficulty: string;
  theme: string | null;
}

export interface LeaderboardRow {
  id: string;
  display_name: string | null;
  country: string | null;
  city: string | null;
  format: string;
  rating: number;
  games_played: number;
  wins: number;
}

type GenericTable<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: GenericTable<Profile>;
      elo_ratings: GenericTable<EloRating>;
      matches: GenericTable<MatchRow>;
      rooms: GenericTable<RoomRow>;
      puzzles: GenericTable<PuzzleRow>;
      friendships: GenericTable<{ user_id: string; friend_id: string; status: string; created_at: string }>;
      puzzle_attempts: GenericTable<{ user_id: string; puzzle_date: string; solved: boolean; moves_taken: number | null; shareable_grid: string | null; attempted_at: string }>;
      coach_reviews: GenericTable<{ id: string; match_id: string | null; user_id: string | null; persona: string; content: unknown; created_at: string }>;
      entitlements: GenericTable<{ user_id: string; sku: string; source: string | null; granted_at: string }>;
      subscriptions: GenericTable<{ user_id: string; stripe_customer_id: string | null; stripe_subscription_id: string | null; status: string | null; plan: string | null; current_period_end: string | null; updated_at: string }>;
      skins: GenericTable<{ sku: string; kind: string; name: string; description: string | null; price_cents: number; asset: unknown; season: string | null; created_at: string }>;
    };
    Views: {
      leaderboard: { Row: LeaderboardRow };
    };
    Functions: {
      apply_elo: { Args: { p_winner: string; p_loser: string; p_format: string }; Returns: void };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
