"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { HUD } from "@/components/game/HUD";
import { ClockBar } from "@/components/game/ClockBar";
import { WinOverlay } from "@/components/game/WinOverlay";
import { CoachPanel } from "@/components/game/CoachPanel";
import { SoundManager } from "@/components/game/SoundManager";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas").then((m) => m.GameCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-mono text-xs uppercase tracking-widest text-[var(--gold)]">
      Lighting the board…
    </div>
  ),
});

export default function PlayPage() {
  return (
    <div className="play-page dark min-h-svh bg-[#1a1714] text-[#f0ece4]">
      <SoundManager />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Play</h1>
          <Button asChild variant="ghost" size="sm" className="text-white/50 hover:bg-white/[0.08] hover:text-white/80">
            <Link href="/room">
              <Users className="size-4" /> Play a friend
            </Link>
          </Button>
        </div>
        <HUD />
        <div className="mt-4">
          <ClockBar />
        </div>
      </div>

      <div className="relative mt-2 h-[64vh] min-h-[440px] w-full">
        <GameCanvas />
        <WinOverlay />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white/20">
          drag to rotate · click a column
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <CoachPanel />
      </div>

      <OnboardingModal />
    </div>
  );
}
