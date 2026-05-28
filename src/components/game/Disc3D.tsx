"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MAX_AGE, type Player } from "@/lib/engine/types";
import { DISC_RADIUS, DISC_THICKNESS, PLAYER_COLOR_HEX, PLAYER_COLOR_HOT, PLAYER_COLOR_CHAR } from "./constants";

interface Disc3DProps {
  player: Player;
  age: number;
  position: [number, number, number];
  isLastPlaced: boolean;
  isWinningCell: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function Disc3D({ player, age, position, isLastPlaced, isWinningCell }: Disc3DProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const matRef = React.useRef<THREE.MeshStandardMaterial>(null);
  const spawn = React.useRef<number | null>(null);

  const base = PLAYER_COLOR_HEX[player];
  const hot = PLAYER_COLOR_HOT[player];
  const charT = clamp01((age - 6) / (MAX_AGE - 6));
  const glowT = clamp01((age - 8) / (MAX_AGE - 8));

  const surfaceColor = React.useMemo(
    () => new THREE.Color(base).lerp(new THREE.Color(PLAYER_COLOR_CHAR), charT * 0.7),
    [base, charT],
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    if (spawn.current === null) spawn.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - spawn.current;
    const drop = 0.42;
    if (t < drop) {
      const e = easeOutCubic(t / drop);
      g.position.set(position[0], position[1] + (1 - e) * 4.6, position[2]);
      g.scale.setScalar(0.82 + e * 0.18);
    } else {
      const bounce = isLastPlaced && t < drop + 0.3 ? Math.sin((t - drop) * 22) * 0.05 : 0;
      g.position.set(position[0], position[1] + bounce, position[2]);
      g.scale.setScalar(1);
    }
    if (matRef.current) {
      const flick = glowT > 0 ? 0.5 + Math.sin(state.clock.elapsedTime * 14) * 0.3 * glowT : 0;
      matRef.current.emissiveIntensity = glowT * 1.2 + flick * glowT + (isWinningCell ? 0.7 : 0);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, DISC_THICKNESS, 44]} />
        <meshStandardMaterial
          ref={matRef}
          color={surfaceColor}
          emissive={hot}
          emissiveIntensity={0}
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>
      {/* colorblind-safe second cue: gold (P2) carries a concentric ring */}
      {player === 2 && (
        <mesh position={[0, 0, DISC_THICKNESS / 2 + 0.012]}>
          <ringGeometry args={[DISC_RADIUS * 0.5, DISC_RADIUS * 0.64, 44]} />
          <meshStandardMaterial color={PLAYER_COLOR_CHAR} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
