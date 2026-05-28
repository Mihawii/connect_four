"use client";

import * as React from "react";
import { COLS, ROWS, type Cells } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

interface MiniBoardProps {
  cells: Cells;
  onColClick?: (col: number) => void;
  legalCols?: number[];
  winningLine?: { col: number; row: number }[] | null;
  disabled?: boolean;
  showColNumbers?: boolean;
}

export function MiniBoard({
  cells,
  onColClick,
  legalCols,
  winningLine,
  disabled,
  showColNumbers,
}: MiniBoardProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const isWinning = (c: number, r: number) => !!winningLine?.some((p) => p.col === c && p.row === r);

  return (
    <div className="inline-block rounded-lg border-[1.5px] border-ink bg-[var(--coal)] p-3 shadow-hard">
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: COLS }, (_, c) => {
          const playable = !disabled && (!legalCols || legalCols.includes(c));
          return (
            <button
              key={c}
              disabled={!playable || !onColClick}
              onClick={() => onColClick?.(c)}
              onMouseEnter={() => setHover(c)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "flex flex-col-reverse gap-1.5 rounded-md p-1 transition-colors sm:gap-2",
                playable && onColClick && "cursor-pointer hover:bg-white/5",
                hover === c && playable && "bg-white/10",
              )}
            >
              {Array.from({ length: ROWS }, (_, r) => {
                const disc = cells[c][r];
                const win = isWinning(c, r);
                return (
                  <span
                    key={r}
                    className={cn(
                      "relative size-7 rounded-full sm:size-9 md:size-10",
                      !disc && "bg-[#161210] shadow-[inset_0_2px_3px_rgba(0,0,0,0.6)]",
                      win && "ring-2 ring-white",
                    )}
                    style={
                      disc
                        ? {
                            background: disc.player === 1 ? "var(--ember)" : "var(--gold)",
                            boxShadow:
                              "inset 0 -2px 4px rgba(0,0,0,0.28), inset 0 2px 3px rgba(255,255,255,0.25)",
                          }
                        : undefined
                    }
                  >
                    {disc?.player === 2 && (
                      <span className="absolute inset-[28%] rounded-full border-[2.5px] border-[#1a1410]/70" />
                    )}
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>
      {showColNumbers && (
        <div className="mt-1.5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: COLS }, (_, c) => (
            <span key={c} className="text-center font-mono text-[10px] text-white/35">
              {c + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
