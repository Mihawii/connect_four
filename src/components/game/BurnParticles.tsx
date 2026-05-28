"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BurnParticlesProps {
  position: [number, number, number];
  onComplete?: () => void;
  duration?: number;
  particleCount?: number;
}

export function BurnParticles({
  position,
  onComplete,
  duration = 0.9,
  particleCount = 40,
}: BurnParticlesProps) {
  const groupRef = React.useRef<THREE.Points>(null);
  const startTime = React.useRef<number | null>(null);
  const velocities = React.useMemo(() => {
    const v = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.5 + Math.random() * 2;
      v[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      v[i * 3 + 1] = Math.cos(phi) * speed + 1.0;
      v[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    return v;
  }, [particleCount]);

  const positionsArr = React.useMemo(() => new Float32Array(particleCount * 3), [particleCount]);

  useFrame((state) => {
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startTime.current;
    if (t > duration) {
      onComplete?.();
      return;
    }
    const fade = Math.max(0, 1 - t / duration);
    for (let i = 0; i < particleCount; i++) {
      positionsArr[i * 3] = velocities[i * 3] * t;
      positionsArr[i * 3 + 1] = velocities[i * 3 + 1] * t - 0.5 * 9.8 * t * t * 0.2;
      positionsArr[i * 3 + 2] = velocities[i * 3 + 2] * t;
    }
    if (groupRef.current) {
      const geo = groupRef.current.geometry;
      const attr = geo.getAttribute("position") as THREE.BufferAttribute;
      attr.needsUpdate = true;
      const mat = groupRef.current.material as THREE.PointsMaterial;
      mat.opacity = fade;
      mat.size = 0.18 * (1 - t / duration) + 0.05;
    }
  });

  return (
    <points ref={groupRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionsArr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#FF5722"
        size={0.18}
        sizeAttenuation
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
