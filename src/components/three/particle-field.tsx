"use client";

/**
 * ParticleField — instanced floating motes rising along the road.
 *
 * A single <points> cloud of N particles distributed around the road corridor.
 * Each frame every particle drifts upward (and slightly toward camera) and is
 * recycled once it passes the spawn ceiling, giving an infinite rising field.
 * Colours come from the --particle-a/-b/-c theme tokens with per-vertex colour
 * so the cloud shifts hue across its volume.
 *
 * Performance: additive blending, depthWrite off, frustumCulled off. Count is
 * halved on mobile and the motion is slowed/near-frozen under reduced motion.
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useThemeColor } from "./use-theme-color";

const FALLBACK_A = "#38bdf8";
const FALLBACK_B = "#8b5cf6";
const FALLBACK_C = "#f8fafc";

interface FieldProps {
  count: number;
  reducedMotion?: boolean;
}

export function ParticleField({ count, reducedMotion = false }: FieldProps) {
  const colA = useThemeColor("--particle-a", FALLBACK_A);
  const colB = useThemeColor("--particle-b", FALLBACK_B);
  const colC = useThemeColor("--particle-c", FALLBACK_C);

  // Geometry: positions + per-vertex colour + a random speed/phase packed for
  // cheap CPU updates.
  const { positions, colors, vel } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vel = new Float32Array(count * 2); // [riseSpeed, swayPhase]
    const palette = [colA, colB, colC];
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread across road width, near-to-far depth, low above the floor.
      positions[i3 + 0] = (Math.random() - 0.5) * 14;
      positions[i3 + 1] = Math.random() * 9 - 1.5;
      positions[i3 + 2] = 18 - Math.random() * 130;

      tmp.copy(palette[i % 3]);
      colors[i3 + 0] = tmp.r;
      colors[i3 + 1] = tmp.g;
      colors[i3 + 2] = tmp.b;

      vel[i * 2 + 0] = 0.4 + Math.random() * 1.1; // rise speed
      vel[i * 2 + 1] = Math.random() * Math.PI * 2; // sway phase
    }
    return { positions, colors, vel };
  }, [count, colA, colB, colC]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;

    // Slow everything way down under reduced motion (near-static drift).
    const speedScale = reducedMotion ? 0.05 : 1;
    const dts = Math.min(delta, 0.05) * speedScale;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const rise = vel[i * 2 + 0];
      const phase = vel[i * 2 + 1];

      let y = attr.getY(i3);
      y += rise * dts;
      // Sway in X for organic motion.
      const x = attr.getX(i3) + Math.sin(t * 0.5 + phase) * dts * 0.25;

      // Recycle when above the ceiling.
      if (y > 8.5) {
        y = -1.5;
        attr.setZ(i3, 18 - Math.random() * 130);
      }
      attr.setY(i3, y);
      attr.setX(i3, x);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        sizeAttenuation
        vertexColors
        transparent
        opacity={reducedMotion ? 0.5 : 0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
