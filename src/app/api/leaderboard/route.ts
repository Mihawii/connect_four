import { NextResponse } from "next/server";
import { getLeaderboardRows, isLeaderboardFormat, LEADERBOARD_FORMATS } from "@/lib/leaderboard";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requested = url.searchParams.get("format") ?? "blitzInferno";
  const format = isLeaderboardFormat(requested) ? requested : "blitzInferno";
  const rows = await getLeaderboardRows(format);
  const source = rows.some((row) => row.country === "Anonymous") ? "database" : "demo";

  return NextResponse.json({
    ok: true,
    format,
    formats: LEADERBOARD_FORMATS,
    source,
    rows: rows.map((row, index) => ({ ...row, rank: index + 1 })),
  });
}
