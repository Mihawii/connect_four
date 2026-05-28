"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

export function GameCanvas() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 38 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#0a0a0d"]} />
        <fog attach="fog" args={["#0a0a0d", 14, 24]} />
        <Scene />
      </Canvas>
    </div>
  );
}
