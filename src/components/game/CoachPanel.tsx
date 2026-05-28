"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Sparkles, Loader2, GraduationCap, TrendingUp, AlertTriangle, Star } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from "@/lib/store/gameStore";
import type { CoachReview } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const PERSONAS = [
  { value: "analyst", label: "Cool Analyst" },
  { value: "hype", label: "Hype Friend (Pro)" },
  { value: "drill", label: "Drill Sergeant (Pro)" },
  { value: "zen", label: "Zen Master (Pro)" },
];

const CLASS_COLOR: Record<string, string> = {
  Brilliant: "text-cyan-400",
  Best: "text-emerald-400",
  Good: "text-emerald-300",
  Inaccuracy: "text-yellow-400",
  Miss: "text-orange-400",
  Mistake: "text-orange-500",
  Blunder: "text-red-500",
};

export function CoachPanel() {
  const game = useGame((s) => s.game);
  const opponent = useGame((s) => s.opponent);
  const [loading, setLoading] = React.useState(false);
  const [review, setReview] = React.useState<CoachReview | null>(null);
  const [source, setSource] = React.useState<string>("");
  const [persona, setPersona] = React.useState("analyst");

  const forPlayer = typeof opponent === "object" ? (opponent.plays === 1 ? 2 : 1) : 1;
  const over = game.status !== "playing";

  React.useEffect(() => {
    setReview(null);
  }, [game.startedAt]);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: game.mode,
          cols: game.moves.map((m) => m.col),
          forPlayer,
          persona,
        }),
      });
      const data = await res.json();
      setReview(data.review);
      setSource(data.source);
    } catch {
      setSource("error");
    } finally {
      setLoading(false);
    }
  };

  if (!over) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.03] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--ember)]/15 text-[var(--ember)]">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight">AI Coach</h3>
            {source && <p className="font-mono text-[10px] text-muted-foreground">{source}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={persona} onValueChange={setPersona}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ember" size="sm" onClick={analyze} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {review ? "Re-analyze" : "Analyze game"}
          </Button>
        </div>
      </div>

      {review && (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-relaxed text-foreground">{review.summary}</p>

          <div className="grid grid-cols-3 gap-2">
            {(["opening", "midgame", "endgame"] as const).map((ph) => (
              <div key={ph} className="rounded-lg bg-white/[0.04] p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{ph}</p>
                <p className="font-display text-2xl font-bold text-[var(--ember)]">{review.phaseGrades[ph]}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {review.heroMoment && (
              <div className="flex items-start gap-2 rounded-lg bg-cyan-500/[0.08] p-3">
                <Star className="mt-0.5 size-4 shrink-0 text-cyan-400" />
                <div>
                  <p className="text-xs font-semibold text-cyan-400">Hero moment · move {review.heroMoment.turn}</p>
                  <p className="text-xs text-muted-foreground">{review.heroMoment.why}</p>
                </div>
              </div>
            )}
            {review.turningPoint && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/[0.08] p-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
                <div>
                  <p className="text-xs font-semibold text-red-400">Turning point · move {review.turningPoint.turn}</p>
                  <p className="text-xs text-muted-foreground">{review.turningPoint.why}</p>
                </div>
              </div>
            )}
          </div>

          {review.moves.length > 0 && (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <TrendingUp className="size-3" /> Key moves
              </p>
              {review.moves.map((m) => (
                <div key={m.turn} className="flex items-baseline gap-2 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs">
                  <span className="font-mono text-muted-foreground">#{m.turn}</span>
                  <Badge variant="outline" className={cn("border-current", CLASS_COLOR[m.classification])}>
                    {m.classification}
                  </Badge>
                  <span className="text-muted-foreground">{m.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
