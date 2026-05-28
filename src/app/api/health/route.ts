import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const event = url.searchParams.get("event") ?? "manual";

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      event,
      checks: {
        api: { ok: true, status: 200 },
        database: { ok: true, status: 200 },
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        event,
        checks: {
          api: { ok: true, status: 200 },
          database: {
            ok: false,
            status: 503,
            message: "Database health check failed",
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
