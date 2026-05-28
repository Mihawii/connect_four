"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Mode } from "@/lib/engine/types";

const RoomClient = dynamic(() => import("@/components/room/RoomClient").then((m) => m.RoomClient), {
  ssr: false,
  loading: () => <div className="py-20 text-center text-sm text-muted-foreground">Joining room…</div>,
});

const VALID_MODES: Mode[] = ["classic", "inferno", "blitzInferno"];

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const search = useSearchParams();
  const code = (params.code ?? "").toString().toUpperCase();
  const modeParam = search.get("mode") as Mode | null;
  const mode: Mode = modeParam && VALID_MODES.includes(modeParam) ? modeParam : "blitzInferno";

  return <RoomClient code={code} mode={mode} />;
}
