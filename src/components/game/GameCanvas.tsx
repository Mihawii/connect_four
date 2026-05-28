"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";

export function GameCanvas() {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 13], fov: 36 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <fog attach="fog" args={["#2f271f", 20, 36]} />
        <Scene />
      </Canvas>
    </div>
  );
}
