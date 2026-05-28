"use client";

import * as React from "react";
import { GraduationCap, Check, ArrowRight, Flame, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MiniBoard } from "@/components/game/MiniBoard";
import { LESSONS, DECAY_CONCEPTS, parseBoard } from "@/lib/lessons";
import { applyMove, createInitialState, legalMoves } from "@/lib/engine/rules";
import type { GameState } from "@/lib/engine/types";
import { playSound } from "@/lib/sound";
import { toast } from "sonner";

function buildLessonState(rows: string[]) {
  const base = createInitialState("classic");
  return { ...base, cells: parseBoard(rows) } as GameState;
}

export default function LearnPage() {
  const [idx, setIdx] = React.useState(0);
  const lesson = LESSONS[idx];
  const initial = React.useMemo(() => buildLessonState(lesson.rows), [lesson]);
  const [state, setState] = React.useState<GameState>(initial);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    setState(initial);
    setDone(false);
  }, [initial]);

  const onColClick = (col: number) => {
    if (done) return;
    if (col === lesson.solutionCol) {
      setState(applyMove(initial, col));
      setDone(true);
      playSound("win", 0.6);
    } else {
      playSound("lose", 0.4);
      toast.error("Try again", { description: "Re-read the hint and look at every column." });
    }
  };

  const next = () => {
    if (idx < LESSONS.length - 1) setIdx(idx + 1);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--ember)]/15 text-[var(--ember)]">
          <GraduationCap className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Learn</h1>
          <p className="text-sm text-muted-foreground">Strategic thinking, one fork at a time. Built for kids and rusty adults.</p>
        </div>
      </div>

      <div className="mb-4 flex gap-1.5">
        {LESSONS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => setIdx(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= idx ? "bg-[var(--ember)]" : "bg-secondary"}`}
            aria-label={l.title}
          />
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Badge variant="muted">{lesson.concept}</Badge>
          <span className="text-xs text-muted-foreground">
            Lesson {idx + 1} / {LESSONS.length}
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold">{lesson.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{done ? lesson.explainAfter : lesson.explainBefore}</p>

        <div className="mt-5 flex justify-center">
          <MiniBoard
            cells={state.cells}
            onColClick={done ? undefined : onColClick}
            legalCols={legalMoves(state)}
            winningLine={state.winningLine}
            disabled={done}
            showColNumbers
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => { setState(initial); setDone(false); }}>
            <RotateCcw className="size-4" /> Reset
          </Button>
          {done ? (
            idx < LESSONS.length - 1 ? (
              <Button variant="ember" onClick={next}>
                Next lesson <ArrowRight className="size-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="size-5" /> Fundamentals complete
              </div>
            )
          ) : (
            <span className="text-xs text-muted-foreground">Click the winning column</span>
          )}
        </div>
      </Card>

      <div className="mt-8">
        <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <Flame className="size-5 text-[var(--ember)]" /> Inferno strategy
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {DECAY_CONCEPTS.map((c) => (
            <Card key={c.title} className="p-4">
              <h4 className="text-sm font-semibold text-[var(--ember)]">{c.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{c.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
