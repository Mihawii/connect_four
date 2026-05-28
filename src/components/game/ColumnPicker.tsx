"use client";

import * as React from "react";
import { COLS, type Player } from "@/lib/engine/types";
import { BOARD_HEIGHT, SLOT_SIZE, slotToWorld, PLAYER_COLOR_HEX } from "./constants";

interface ColumnPickerProps {
  onHover: (col: number | null) => void;
  onPick: (col: number) => void;
  legalCols: number[];
  hoverCol: number | null;
  nextRowByCol: number[];
  currentPlayer: Player;
}

export function ColumnPicker({
  onHover,
  onPick,
  legalCols,
  hoverCol,
  nextRowByCol,
  currentPlayer,
}: ColumnPickerProps) {
  return (
    <group>
      {Array.from({ length: COLS }, (_, c) => {
        const [x] = slotToWorld(c, 0);
        const isLegal = legalCols.includes(c);
        const isHovered = hoverCol === c && isLegal;
        return (
          <group key={c}>
            <mesh
              position={[x, 0, 0.4]}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (isLegal) onHover(c);
              }}
              onPointerOut={() => onHover(null)}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (isLegal) onPick(c);
              }}
            >
              <planeGeometry args={[SLOT_SIZE, BOARD_HEIGHT + 1]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {isHovered && (
              <>
                <mesh position={[x, BOARD_HEIGHT / 2 + 0.6, 0]}>
                  <planeGeometry args={[SLOT_SIZE * 0.9, 0.07]} />
                  <meshBasicMaterial color={PLAYER_COLOR_HEX[currentPlayer]} />
                </mesh>
                <GhostDisc col={c} row={nextRowByCol[c] ?? 0} player={currentPlayer} />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}

function GhostDisc({ col, row, player }: { col: number; row: number; player: Player }) {
  const [, y] = slotToWorld(col, row);
  const [x] = slotToWorld(col, 0);
  return (
    <mesh position={[x, y, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.42, 0.42, 0.22, 36]} />
      <meshStandardMaterial
        color={PLAYER_COLOR_HEX[player]}
        transparent
        opacity={0.32}
        emissive={PLAYER_COLOR_HEX[player]}
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}
