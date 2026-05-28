"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import { Copy, Check, Users, Flame, RotateCcw, Crown, Wifi, WifiOff } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MiniBoard } from "@/components/game/MiniBoard";
import { applyMove, createInitialState, legalMoves, makeClock, tickClock } from "@/lib/engine/rules";
import { formatClock } from "@/lib/utils";
import { PLAYER_LABEL } from "@/components/game/constants";
import type { GameState, Mode, Player } from "@/lib/engine/types";
import { playSound } from "@/lib/sound";
import { roomShareUrl } from "@/lib/room/share";

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
  const isJoiningRef = React.useRef(false);
  
  const shareUrl = typeof window !== "undefined" ? roomShareUrl(window.location.origin, code, mode) : "";

  React.useEffect(() => {
    let mounted = true;
    let pollInterval: NodeJS.Timeout;

    const syncRoom = async () => {
      try {
        const res = await fetch(`/api/room/${code}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setConnected(true);
            const serverState = data.state as GameState;
            
            // Only update state if it's actually different to avoid interrupting local tick
            setState((prev) => {
              if (prev.moves.length !== serverState.moves.length) {
                if (serverState.moves.length > prev.moves.length) {
                  playSound("drop", 0.6);
                }
                return serverState;
              }
              return prev;
            });
            
            const peers = data.peers as string[];
            setPeerCount(peers.length);
            const idx = peers.indexOf(clientId);
            if (idx >= 0) {
              setRole(idx === 0 ? "host" : idx === 1 ? "guest" : "spectator");
            }
          }
        }
      } catch {
        if (mounted) setConnected(false);
      }
    };

    const joinRoom = async () => {
      if (isJoiningRef.current) return;
      isJoiningRef.current = true;
      try {
        await fetch(`/api/room/${code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", clientId, mode }),
        });
        await syncRoom();
        pollInterval = setInterval(syncRoom, 1000); // 1-second polling
      } catch (err) {
        console.error("Failed to join room", err);
      }
    };

    joinRoom();

    return () => {
      mounted = false;
      clearInterval(pollInterval);
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

  const makeMove = async (col: number) => {
    if (!myTurn) return;
    
    // Optimistic UI update
    const next = applyMove(state, col);
    if (next === state) return;
    setState(next);
    playSound("drop", 0.6);
    
    try {
      await fetch(`/api/room/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move", clientId, col }),
      });
    } catch (err) {
      console.error("Failed to submit move", err);
    }
  };

  const reset = async () => {
    if (role !== "host") return;
    
    // Optimistic update
    setState(freshState(mode));
    
    try {
      await fetch(`/api/room/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", clientId, mode }),
      });
    } catch (err) {
      console.error("Failed to reset room", err);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
