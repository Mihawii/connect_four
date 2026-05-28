"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HUD } from "@/components/game/HUD";
import { WinOverlay } from "@/components/game/WinOverlay";
import { CoachPanel } from "@/components/game/CoachPanel";
import { SoundManager } from "@/components/game/SoundManager";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas").then((m) => m.GameCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      Lighting the board…
    </div>
  ),
});

export default function PlayPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
      <SoundManager />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Local match</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/room">
            <Users className="size-4" /> Play a friend
          </Link>
        </Button>
      </div>
      <HUD />
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#0a0a0d] to-[#1a0d05] shadow-2xl shadow-[var(--ember)]/10">
        <GameCanvas />
        <WinOverlay />
        <div className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          drag to rotate · scroll to zoom · click a column to drop
        </div>
      </div>
      <CoachPanel />
    </div>
  );
}
