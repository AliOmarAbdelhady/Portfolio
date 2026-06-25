"use client";

/**
 * AICore — the central glowing object hovering at hero depth.
 *
 * A distorted, emissive icosahedron in cyan-violet with a slow rotation, a
 * pulsing scale, and an optional wireframe overlay shell. A soft coloured point
 * light at its centre makes the surrounding particles/fog catch the light.
 *
 * Positioned a few units down the -Z road so it sits near the hero depth.
 */
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useThemeColor } from "./use-theme-color";

const FALLBACK_PRIMARY = "#38bdf8";
const FALLBACK_ACCENT = "#8b5cf6";

interface AICoreProps {
  /** Z position along the road (default places it at hero depth). */
  z?: number;
  reducedMotion?: boolean;
}

export function AICore({
  z = -3.5,
  reducedMotion = false,
}: AICoreProps) {
  const primary = useThemeColor("--primary", FALLBACK_PRIMARY);
  const accent = useThemeColor("--accent", FALLBACK_ACCENT);

  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const spin = reducedMotion ? 0 : 1;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.15 * spin;
      coreRef.current.rotation.x += delta * 0.06 * spin;
      // Pulse scale.
      const pulse = reducedMotion ? 1 : 1 + Math.sin(t * 1.2) * 0.05;
      coreRef.current.scale.setScalar(pulse);
    }
    if (wireRef.current) {
      // Counter-rotate the shell for a layered look.
      wireRef.current.rotation.y -= delta * 0.08 * spin;
      wireRef.current.rotation.z += delta * 0.04 * spin;
      const pulse = reducedMotion ? 1 : 1 + Math.sin(t * 1.2 + 1) * 0.06;
      wireRef.current.scale.setScalar(1.18 * pulse);
    }
    if (groupRef.current) {
      // Gentle hover.
      const hover = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.18;
      groupRef.current.position.y = 1.4 + hover;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.4, z]}>
      {/* Solid distorted core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.95, 4]} />
        <MeshDistortMaterial
          color={accent}
          emissive={primary}
          emissiveIntensity={1.1}
          roughness={0.15}
          metalness={0.6}
          distort={reducedMotion ? 0.1 : 0.35}
          speed={reducedMotion ? 0.3 : 1.4}
          toneMapped={false}
        />
      </mesh>

      {/* Wireframe overlay shell */}
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshBasicMaterial
          color={primary}
          wireframe
          transparent
          opacity={0.35}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Soft inner light so nearby particles/fog pick up colour */}
      <pointLight
        color={primary}
        intensity={reducedMotion ? 6 : 14}
        distance={12}
        decay={2}
      />
      <pointLight
        color={accent}
        intensity={reducedMotion ? 3 : 7}
        distance={9}
        decay={2}
      />
    </group>
  );
}
