"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowRight, Flame } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Mode } from "@/lib/engine/types";
import { createRoomCode, normalizeRoomCode } from "@/lib/room/share";

export default function RoomLanding() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("blitzInferno");
  const [join, setJoin] = React.useState("");

  const create = () => router.push(`/room/${createRoomCode()}?mode=${mode}`);
  const joinRoom = () => {
    const c = normalizeRoomCode(join);
    if (c) router.push(`/room/${c}`);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[var(--ember)]/15 text-[var(--ember)]">
          <Users className="size-6" />
        </div>
        <h1 className="font-display text-3xl font-bold">Play a friend</h1>
      </div>

      <Card className="space-y-4 p-6">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Format</label>
          <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="inferno">Inferno (decay)</SelectItem>
              <SelectItem value="blitzInferno">Inferno Blitz (decay + clock)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ember" className="w-full" onClick={create}>
          <Flame className="size-4" /> Create room
        </Button>
      </Card>

      <div className="my-5 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or join one <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex gap-2">
        <input
          value={join}
          onChange={(e) => setJoin(e.target.value)}
          placeholder="Room code"
          maxLength={6}
          className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button variant="outline" onClick={joinRoom} disabled={!join.trim()}>
          Join <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
