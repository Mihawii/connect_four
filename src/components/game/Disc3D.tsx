"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { MAX_AGE, type Player } from "@/lib/engine/types";
import {
  DISC_RADIUS,
  DISC_THICKNESS,
  PLAYER_COLOR_HEX,
  PLAYER_COLOR_HOT,
} from "./constants";
import * as THREE from "three";

interface Disc3DProps {
  player: Player;
  age: number;
  position: [number, number, number];
  isLastPlaced: boolean;
  isWinningCell: boolean;
  bornAt: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function Disc3D({ player, age, position, isLastPlaced, isWinningCell, bornAt }: Disc3DProps) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const matRef = React.useRef<THREE.MeshStandardMaterial>(null);

  const baseColor = PLAYER_COLOR_HEX[player];
  const hotColor = PLAYER_COLOR_HOT[player];

  const burnIntensity = Math.max(0, age - 6) / (MAX_AGE - 6);
  const emissiveStrength = burnIntensity * 1.5 + (isWinningCell ? 1.2 : 0);
  const lerpedColor = React.useMemo(() => {
    const c = new THREE.Color(baseColor).lerp(new THREE.Color(hotColor), burnIntensity * 0.6);
    return c;
  }, [baseColor, hotColor, burnIntensity]);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const tSinceBirth = (state.clock.elapsedTime * 1000 - bornAt) / 1000;
    const dropDuration = 0.45;
    if (tSinceBirth < dropDuration) {
      const t = easeOutCubic(Math.min(1, tSinceBirth / dropDuration));
      m.position.y = position[1] + (1 - t) * 4;
      m.scale.setScalar(0.6 + t * 0.4);
    } else {
      m.position.y = position[1];
      m.scale.setScalar(1);
    }
    if (burnIntensity > 0.4) {
      const flick = 1 + Math.sin(state.clock.elapsedTime * 18) * 0.12 * burnIntensity;
      m.scale.multiplyScalar(flick);
    }
    if (isLastPlaced && tSinceBirth > dropDuration && tSinceBirth < dropDuration + 0.3) {
      const bounce = Math.sin((tSinceBirth - dropDuration) * 20) * 0.05;
      m.position.y = position[1] + bounce;
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = emissiveStrength;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, DISC_THICKNESS, 36]} />
      <meshStandardMaterial
        ref={matRef}
        color={lerpedColor}
        emissive={hotColor}
        emissiveIntensity={emissiveStrength}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  );
}
