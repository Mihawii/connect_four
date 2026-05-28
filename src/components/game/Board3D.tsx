"use client";

import * as React from "react";
import { RoundedBox } from "@react-three/drei";
import { COLS, ROWS } from "@/lib/engine/types";
import { BOARD_COLOR, BOARD_HEIGHT, BOARD_WIDTH, DISC_RADIUS, FRAME_PAD, SLOT_COLOR, slotToWorld } from "./constants";

const FRAME_DEPTH = 0.6;
const BACK_Z = -0.34;
const BAR = FRAME_PAD;

export function Board3D() {
  const slots = React.useMemo(() => {
    const out: Array<[number, number]> = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const [x, y] = slotToWorld(c, r);
        out.push([x, y]);
      }
    }
    return out;
  }, []);

  const halfW = BOARD_WIDTH / 2;
  const halfH = BOARD_HEIGHT / 2;

  return (
    <group>
      {/* back panel — the wall behind the discs */}
      <RoundedBox
        args={[BOARD_WIDTH + BAR * 2, BOARD_HEIGHT + BAR * 2, 0.3]}
        radius={0.28}
        smoothness={4}
        position={[0, 0, BACK_Z]}
        receiveShadow
      >
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.62} metalness={0.06} />
      </RoundedBox>

      {/* recessed hole hints on the back wall */}
      {slots.map(([x, y], i) => (
        <mesh key={i} position={[x, y, BACK_Z + 0.16]}>
          <circleGeometry args={[DISC_RADIUS * 1.06, 40]} />
          <meshStandardMaterial color={SLOT_COLOR} roughness={0.95} />
        </mesh>
      ))}

      {/* open frame: four bars so the play well is unobstructed and discs are always visible */}
      <RoundedBox args={[BOARD_WIDTH + BAR * 2, BAR, FRAME_DEPTH]} radius={0.12} smoothness={3} position={[0, halfH + BAR / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.5} metalness={0.12} />
      </RoundedBox>
      <RoundedBox args={[BOARD_WIDTH + BAR * 2, BAR, FRAME_DEPTH]} radius={0.12} smoothness={3} position={[0, -(halfH + BAR / 2), 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.5} metalness={0.12} />
      </RoundedBox>
      <RoundedBox args={[BAR, BOARD_HEIGHT, FRAME_DEPTH]} radius={0.12} smoothness={3} position={[-(halfW + BAR / 2), 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.5} metalness={0.12} />
      </RoundedBox>
      <RoundedBox args={[BAR, BOARD_HEIGHT, FRAME_DEPTH]} radius={0.12} smoothness={3} position={[halfW + BAR / 2, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={BOARD_COLOR} roughness={0.5} metalness={0.12} />
      </RoundedBox>

      {/* thin column dividers for structure */}
      {Array.from({ length: COLS - 1 }, (_, i) => {
        const x = slotToWorld(i, 0)[0] + 0.5;
        return (
          <mesh key={`div-${i}`} position={[x, 0, BACK_Z + 0.22]}>
            <boxGeometry args={[0.05, BOARD_HEIGHT, 0.06]} />
            <meshStandardMaterial color={BOARD_COLOR} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}
