"use client";

import * as React from "react";
import { COLS, type Player } from "@/lib/engine/types";
import { BOARD_HEIGHT, SLOT_SIZE, slotToWorld } from "./constants";

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
                  <planeGeometry args={[SLOT_SIZE * 0.9, 0.05]} />
                  <meshBasicMaterial color="#FF5722" />
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
      <cylinderGeometry args={[0.42, 0.42, 0.22, 32]} />
      <meshStandardMaterial
        color={player === 1 ? "#FF5722" : "#F2C94C"}
        transparent
        opacity={0.35}
        emissive={player === 1 ? "#FF5722" : "#F2C94C"}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
