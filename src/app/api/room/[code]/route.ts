import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createInitialState, applyMove, makeClock } from "@/lib/engine/rules";
import type { GameState, Mode } from "@/lib/engine/types";
import { isValidRoomCode, normalizeRoomCode, roomShareUrl } from "@/lib/room/share";

const MODES = new Set<Mode>(["classic", "inferno", "blitzInferno"]);
type StoredPeer = string | { clientId: string; ip: string | null; joinedAt: string };

function parseMode(value: unknown): Mode {
  return typeof value === "string" && MODES.has(value as Mode) ? (value as Mode) : "classic";
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string") return (value ?? fallback) as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  if (trimmed.startsWith("::ffff:")) return trimmed.slice(7);
  return trimmed;
}

function requestIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }

  const real = req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip");
  if (real?.trim()) return normalizeIp(real);
  return null;
}

function parsePeers(value: unknown): StoredPeer[] {
  const raw = parseJson<unknown[]>(value, []);
  if (!Array.isArray(raw)) return [];

  const peers: StoredPeer[] = [];
  for (const peer of raw) {
    if (typeof peer === "string") {
      if (peer.trim().length) peers.push(peer.trim());
      continue;
    }
    if (!peer || typeof peer !== "object") continue;
    const rec = peer as Record<string, unknown>;
    const clientId = typeof rec.clientId === "string" ? rec.clientId.trim() : "";
    if (!clientId) continue;
    const ip = typeof rec.ip === "string" && rec.ip.trim().length > 0 ? normalizeIp(rec.ip) : null;
    const joinedAt = typeof rec.joinedAt === "string" && rec.joinedAt.trim().length > 0 ? rec.joinedAt : new Date().toISOString();
    peers.push({ clientId, ip, joinedAt });
  }

  return peers;
}

function peerClientId(peer: StoredPeer): string {
  if (typeof peer === "string") return peer;
  return peer.clientId;
}

function originFrom(req: Request) {
  return req.headers.get("origin") ?? new URL(req.url).origin;
}

function roomPayload(
  req: Request,
  room: { id: string; mode: string; state: unknown; peers: unknown },
) {
  const mode = parseMode(room.mode);
  const shareUrl = roomShareUrl(originFrom(req), room.id, mode);
  const peers = parsePeers(room.peers).map(peerClientId);

  return {
    state: parseJson(room.state, null),
    peers,
    mode,
    shareUrl,
    qrValue: shareUrl,
  };
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = normalizeRoomCode(rawCode);

  if (!isValidRoomCode(code)) {
    return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
  }
  
  const room = await prisma.room.findUnique({
    where: { id: code },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(roomPayload(req, room));
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = normalizeRoomCode(rawCode);

  if (!isValidRoomCode(code)) {
    return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  if (body.action === "join") {
    if (typeof body.clientId !== "string" || body.clientId.trim().length === 0) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }
    const clientId = body.clientId.trim();
    const ip = requestIp(req);

    let room = await prisma.room.findUnique({ where: { id: code } });
    if (!room) {
      const mode = parseMode(body.mode);
      const state = createInitialState(mode, mode === "blitzInferno" ? makeClock(60000, 1000) : null);
      room = await prisma.room.create({
        data: {
          id: code,
          mode: mode,
          state: jsonValue(state),
          peers: jsonValue([{ clientId, ip, joinedAt: new Date().toISOString() }]),
        },
      });
    } else {
      const peers = parsePeers(room.peers);
      const idx = peers.findIndex((peer) => peerClientId(peer) === clientId);

      if (idx < 0) {
        peers.push({ clientId, ip, joinedAt: new Date().toISOString() });
      } else if (typeof peers[idx] === "string") {
        peers[idx] = { clientId, ip, joinedAt: new Date().toISOString() };
      } else if (ip && peers[idx].ip !== ip) {
        peers[idx] = { ...peers[idx], ip };
      }

      room = await prisma.room.update({
        where: { id: code },
        data: { peers: jsonValue(peers) },
      });
    }
    
    return NextResponse.json({ success: true, room: { ...room, ...roomPayload(req, room) } });
  }

  if (body.action === "move") {
    const col = body.col;
    if (typeof col !== "number" || !Number.isInteger(col) || col < 0 || col > 6) {
      return NextResponse.json({ error: "Invalid column" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { id: code } });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const state = parseJson<GameState | null>(room.state, null);
    if (!state) return NextResponse.json({ error: "Invalid room state" }, { status: 500 });

    const nextState = applyMove(state, col);

    if (nextState !== state) {
      await prisma.room.update({
        where: { id: code },
        data: { state: jsonValue(nextState) },
      });
    }
    return NextResponse.json({ success: true });
  }

  if (body.action === "reset") {
    const mode = parseMode(body.mode);
    const state = createInitialState(mode, mode === "blitzInferno" ? makeClock(60000, 1000) : null);
    await prisma.room.update({
      where: { id: code },
      data: { state: jsonValue(state) },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
