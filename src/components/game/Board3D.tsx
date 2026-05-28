"use client";

import * as React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { COLS, ROWS } from "@/lib/engine/types";
import {
  BOARD_HEIGHT,
  BOARD_THICKNESS,
  BOARD_WIDTH,
  DISC_RADIUS,
  FRAME_PAD,
  slotToWorld,
} from "./constants";

function ProceduralBoard() {
  const woodColor = "#5a3a1a";
  const slotCells = React.useMemo(() => {
    const cells: Array<[number, number, number]> = [];
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) cells.push(slotToWorld(c, r));
    }
    return cells;
  }, []);

  return (
    <group>
      <mesh receiveShadow castShadow position={[0, 0, -BOARD_THICKNESS / 2]}>
        <boxGeometry args={[BOARD_WIDTH + FRAME_PAD * 2, BOARD_HEIGHT + FRAME_PAD * 2, BOARD_THICKNESS]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} metalness={0.05} />
      </mesh>
      {slotCells.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <cylinderGeometry args={[DISC_RADIUS * 1.05, DISC_RADIUS * 1.05, BOARD_THICKNESS + 0.02, 36]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

interface Board3DProps {
  modelUrl?: string;
}

export function Board3D({ modelUrl = "/models/board.glb" }: Board3DProps) {
  return (
    <group>
      <ProceduralBoard />
      <React.Suspense fallback={null}>
        <GltfDecoration modelUrl={modelUrl} />
      </React.Suspense>
    </group>
  );
}

function GltfDecoration({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  const cloned = React.useMemo(() => scene.clone(true), [scene]);
  const box = React.useMemo(() => new THREE.Box3().setFromObject(cloned), [cloned]);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const targetWidth = BOARD_WIDTH + FRAME_PAD * 2;
  const targetHeight = BOARD_HEIGHT + FRAME_PAD * 2;
  const scale = Math.min(targetWidth / Math.max(size.x, 0.001), targetHeight / Math.max(size.y, 0.001));
  return (
    <group
      position={[-center.x * scale, -center.y * scale, -center.z * scale - BOARD_THICKNESS - 0.05]}
      scale={[scale, scale, scale]}
    >
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload("/models/board.glb");
