"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Users } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { HUD } from "@/components/game/HUD";
import { ClockBar } from "@/components/game/ClockBar";
import { WinOverlay } from "@/components/game/WinOverlay";
import { CoachPanel } from "@/components/game/CoachPanel";
import { SoundManager } from "@/components/game/SoundManager";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

function BoardLoading() {
  const { t } = useI18n();

  return (
    <div className="flex h-full w-full items-center justify-center font-display text-xs font-semibold uppercase text-[var(--gold)]">
      {t("play.loadingBoard")}
    </div>
  );
}

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas").then((m) => m.GameCanvas), {
  ssr: false,
  loading: () => <BoardLoading />,
});

export default function PlayPage() {
  const { t } = useI18n();

  return (
    <div className="play-page min-h-svh text-foreground">
      <SoundManager />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">{t("play.title")}</h1>
          <Button asChild variant="ghost" size="default" className="h-11 px-5 text-sm font-semibold hover:bg-[var(--board-bg-elevated)]">
            <Link href="/room">
              <Users className="size-5" /> {t("play.playFriend")}
            </Link>
          </Button>
        </div>
        <div>
          <HUD />
          <div className="mt-4">
            <ClockBar />
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-4 h-[64vh] min-h-[440px] w-full max-w-6xl overflow-hidden rounded-lg">
        <GameCanvas />
        <WinOverlay />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[var(--paper)] opacity-40">
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
