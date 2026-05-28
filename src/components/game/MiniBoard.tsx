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
    <div className="inline-block rounded-2xl bg-gradient-to-b from-[#3a2410] to-[#5a3a1a] p-3 shadow-xl">
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
                "flex flex-col-reverse gap-1.5 rounded-lg p-1 transition-colors sm:gap-2",
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
                      disc ? "shadow-inner" : "bg-[#0d0d10]",
                      win && "ring-2 ring-white",
                    )}
                    style={
                      disc
                        ? {
                            background:
                              disc.player === 1
                                ? "radial-gradient(circle at 35% 30%, #ff7b3a, #e2451b)"
                                : "radial-gradient(circle at 35% 30%, #ffe89a, #e8b93a)",
                            boxShadow: disc.age > 8 ? "0 0 12px #ff5722" : undefined,
                          }
                        : undefined
                    }
                  >
                    {disc && disc.player === 2 && (
                      <span className="absolute inset-[30%] rounded-full border-2 border-black/20" />
                    )}
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>
      {showColNumbers && (
        <div className="mt-1 grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: COLS }, (_, c) => (
            <span key={c} className="text-center font-mono text-[10px] text-white/40">
              {c + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
