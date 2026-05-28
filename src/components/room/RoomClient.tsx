"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import { Copy, Check, Users, Flame, RotateCcw, Crown, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiniBoard } from "@/components/game/MiniBoard";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { applyMove, createInitialState, legalMoves, makeClock, tickClock } from "@/lib/engine/rules";
import { formatClock } from "@/lib/utils";
import { PLAYER_LABEL } from "@/components/game/constants";
import type { GameState, Mode, Player } from "@/lib/engine/types";
import { playSound } from "@/lib/sound";

type Role = "connecting" | "host" | "guest" | "spectator";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function freshState(mode: Mode): GameState {
  return createInitialState(mode, mode === "blitzInferno" ? makeClock(60_000, 1000) : null);
}

export function RoomClient({ code, mode }: { code: string; mode: Mode }) {
  const [clientId] = React.useState(makeId);
  const [role, setRole] = React.useState<Role>("connecting");
  const [peerCount, setPeerCount] = React.useState(0);
  const [connected, setConnected] = React.useState(false);
  const [state, setState] = React.useState<GameState>(() => freshState(mode));
  const [copied, setCopied] = React.useState(false);
  const channelRef = React.useRef<ReturnType<NonNullable<ReturnType<typeof getSupabaseBrowser>>["channel"]> | null>(null);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${code}?mode=${mode}` : "";

  React.useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;
    const channel = sb.channel(`room-${code}`, {
      config: { presence: { key: clientId }, broadcast: { self: false } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const presence = channel.presenceState();
      const ids = Object.keys(presence).sort();
      setPeerCount(ids.length);
      const idx = ids.indexOf(clientId);
      setRole(idx === 0 ? "host" : idx === 1 ? "guest" : "spectator");
    });

    channel.on("broadcast", { event: "move" }, ({ payload }) => {
      setState((s) => {
        const next = applyMove(s, payload.col as number);
        if (next !== s) playSound("drop", 0.6);
        return next;
      });
    });

    channel.on("broadcast", { event: "reset" }, ({ payload }) => {
      setState(freshState((payload.mode as Mode) ?? mode));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setConnected(true);
        await channel.track({ clientId, at: Date.now() });
      }
    });

    channelRef.current = channel;
    return () => {
      void sb.removeChannel(channel);
    };
  }, [code, clientId, mode]);

  // local clock tick for blitz
  React.useEffect(() => {
    if (!state.clock?.running) return;
    let raf = 0;
    const loop = () => {
      setState((s) => tickClock(s));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state.clock?.running]);

  const myPlayer: Player | null = role === "host" ? 1 : role === "guest" ? 2 : null;
  const myTurn = myPlayer !== null && state.currentPlayer === myPlayer && state.status === "playing" && peerCount >= 2;

  const makeMove = (col: number) => {
    if (!myTurn) return;
    const next = applyMove(state, col);
    if (next === state) return;
    setState(next);
    playSound("drop", 0.6);
    channelRef.current?.send({ type: "broadcast", event: "move", payload: { col } });
  };

  const reset = () => {
    if (role !== "host") return;
    setState(freshState(mode));
    channelRef.current?.send({ type: "broadcast", event: "reset", payload: { mode } });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isSupabaseEnabled) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[var(--ember)]/15 text-[var(--ember)]">
          <Users className="size-6" />
        </div>
        <h1 className="font-display text-2xl font-bold">Online rooms need Supabase</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your Supabase URL and anon key to <code className="rounded bg-secondary px-1">.env.local</code> to play
          friends over the internet. In the meantime, you can play pass-and-play locally.
        </p>
        <Button asChild variant="ember" className="mt-4">
          <a href="/play">Play local</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={connected ? "ember" : "muted"}>
              {connected ? <Wifi className="mr-1 size-3" /> : <WifiOff className="mr-1 size-3" />}
              {connected ? "Live" : "Connecting"}
            </Badge>
            <Badge variant="muted">
              <Users className="mr-1 size-3" /> {peerCount} in room
            </Badge>
          </div>
          {role !== "spectator" && (
            <Badge variant={myPlayer === 1 ? "ember" : "secondary"}>
              {role === "host" && <Crown className="mr-1 size-3" />}
              You are {myPlayer ? PLAYER_LABEL[myPlayer] : "watching"}
            </Badge>
          )}
        </div>

        <div className="flex w-full items-center justify-between rounded-lg border border-border bg-card/60 px-4 py-2">
          <Clock state={state} player={1} />
          <div className="text-center text-xs text-muted-foreground">
            {state.status === "playing" ? (
              peerCount < 2 ? (
                "Waiting for opponent…"
              ) : (
                <span className={myTurn ? "font-semibold text-[var(--ember)]" : ""}>
                  {myTurn ? "Your turn" : `${PLAYER_LABEL[state.currentPlayer]}'s turn`}
                </span>
              )
            ) : state.status === "won" ? (
              `${PLAYER_LABEL[state.winner ?? 1]} wins`
            ) : state.status === "timeout" ? (
              `${PLAYER_LABEL[state.winner ?? 1]} wins on time`
            ) : (
              "Match over"
            )}
          </div>
          <Clock state={state} player={2} />
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <MiniBoard
            cells={state.cells}
            onColClick={myTurn ? makeMove : undefined}
            legalCols={legalMoves(state)}
            winningLine={state.winningLine}
            disabled={!myTurn}
            showColNumbers
          />
        </motion.div>

        {role === "host" && (
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-4" /> New game
          </Button>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card/80 p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Invite a friend</p>
          <div className="flex justify-center rounded-lg bg-white p-3">
            {shareUrl && <QRCodeSVG value={shareUrl} size={140} />}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-secondary px-2 py-1.5 text-xs">{code}</code>
            <Button size="icon" variant="outline" className="size-8" onClick={copy}>
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Share the link or QR. First two in the room play; the rest spectate.</p>
        </div>
        <div className="rounded-xl border border-[var(--ember)]/30 bg-[var(--ember)]/5 p-4 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-[var(--ember)]"><Flame className="size-3.5" /> {mode === "blitzInferno" ? "Inferno Blitz" : mode === "inferno" ? "Inferno" : "Classic"}</p>
          <p className="mt-1">{mode === "classic" ? "No decay." : "Discs burn after 10 of your turns."}</p>
        </div>
      </aside>
    </div>
  );
}

function Clock({ state, player }: { state: GameState; player: Player }) {
  if (!state.clock) {
    return (
      <div className="text-center">
        <p className="text-[10px] uppercase text-muted-foreground">{PLAYER_LABEL[player]}</p>
        <p className="font-mono text-sm">{state.currentPlayer === player ? "•" : ""}</p>
      </div>
    );
  }
  const ms = state.clock.msPerSide[player];
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase text-muted-foreground">{PLAYER_LABEL[player]}</p>
      <p className={`font-mono text-lg font-bold tabular-nums ${ms < 10_000 ? "text-red-400" : ""}`}>{formatClock(ms)}</p>
    </div>
  );
}
