"use client";

import * as React from "react";
import { GraduationCap, Check, ArrowRight, Flame, RotateCcw } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MiniBoard } from "@/components/game/MiniBoard";
import { LESSONS, DECAY_CONCEPTS, parseBoard, type Lesson } from "@/lib/lessons";
import { applyMove, createInitialState, legalMoves } from "@/lib/engine/rules";
import type { GameState } from "@/lib/engine/types";
import { playSound } from "@/lib/sound";
import { toast } from "sonner";

function buildLessonState(lesson: Lesson) {
  const base = createInitialState("classic");
  return { ...base, cells: parseBoard(lesson.rows), currentPlayer: lesson.toMove } as GameState;
}

export default function LearnPage() {
  const [idx, setIdx] = React.useState(0);
  const lesson = LESSONS[idx];
  const initial = React.useMemo(() => buildLessonState(lesson), [lesson]);
  const [state, setState] = React.useState<GameState>(initial);
  const [done, setDone] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);

  React.useEffect(() => {
    setState(initial);
    setDone(false);
    setAttempts(0);
  }, [initial]);

  const onColClick = (col: number) => {
    if (done) return;
    setAttempts((value) => value + 1);
    if (col === lesson.solutionCol) {
      setState(applyMove(initial, col));
      setDone(true);
      playSound("win", 0.6);
    } else {
      playSound("lose", 0.4);
      toast.error(`Column ${col + 1} is not the lesson move`, { description: lesson.checks[0] });
    }
  };

  const next = () => {
    if (idx < LESSONS.length - 1) setIdx(idx + 1);
  };

  const reset = () => {
    setState(initial);
    setDone(false);
    setAttempts(0);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-7 flex items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--ember)]/15 text-[var(--ember)]">
          <GraduationCap className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Learn</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Train the move checklist that wins real games: immediate wins, urgent blocks, central control, forks, gravity, and Inferno timing.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-1.5 sm:grid-cols-6">
        {LESSONS.map((l, i) => (
          <button
            key={l.id}
            onClick={() => setIdx(i)}
            className={`rounded-md border px-2 py-2 text-left text-[11px] transition-colors ${
              i === idx
                ? "border-ink bg-[var(--ember)] text-[oklch(0.99_0.014_85)]"
                : i < idx
                  ? "border-border bg-[var(--ember)]/10 text-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:bg-accent"
            }`}
            aria-label={l.title}
          >
            <span className="block font-mono text-[10px]">{i + 1}</span>
            <span className="block truncate font-medium">{l.concept}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="muted">{lesson.concept}</Badge>
            <span className="font-mono text-xs text-muted-foreground">
              Lesson {idx + 1} of {LESSONS.length}
            </span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold">{lesson.title}</h2>
          <p className="mt-2 text-base font-medium leading-relaxed">{lesson.principle}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {done ? lesson.explainAfter : lesson.explainBefore}
          </p>

          <div className="mt-6 flex justify-center">
            <MiniBoard
              cells={state.cells}
              onColClick={done ? undefined : onColClick}
              legalCols={legalMoves(state)}
              winningLine={state.winningLine}
              disabled={done}
              showColNumbers
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="size-4" /> Reset
            </Button>
            {done ? (
              idx < LESSONS.length - 1 ? (
                <Button variant="ember" onClick={next}>
                  Next lesson <ArrowRight className="size-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-500">
                  <Check className="size-5" /> Fundamentals complete
                </div>
              )
            ) : (
              <span className="text-xs text-muted-foreground">
                Choose the lesson move{attempts > 0 ? `, attempts ${attempts}` : ""}
              </span>
            )}
          </div>
        </Card>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Decision checklist</p>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed">
              {lesson.checks.map((check, i) => (
                <li key={check} className="flex gap-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--ember)]/12 font-mono text-[10px] text-[var(--ember)]">
                    {i + 1}
                  </span>
                  <span>{check}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-lg border border-ink bg-[var(--gold)]/35 p-4 shadow-hard-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Try this</p>
            <p className="mt-2 text-sm leading-relaxed">{lesson.tryThis}</p>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
          <Flame className="size-5 text-[var(--ember)]" /> Inferno strategy
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          {DECAY_CONCEPTS.map((c) => (
            <Card key={c.title} className="p-4">
              <h4 className="text-sm font-semibold text-[var(--ember)]">{c.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
