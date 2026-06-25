"use client";

/**
 * DataTunnel — sparse glassy "data blocks" floating at intervals down the road.
 *
 * Each block is a low-opacity box/panel that slowly bobs on Y and rotates,
 * giving parallax depth cues between the camera and the horizon. Kept to a
 * small count (<=12) for performance and to avoid clutter.
 *
 * No textures; colour/opacity tuned for the glass aesthetic. Reduced motion
 * freezes the bob/rotation.
 */
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThemeColor } from "./use-theme-color";

const FALLBACK_PRIMARY = "#38bdf8";
const FALLBACK_ACCENT = "#8b5cf6";

const BLOCK_COUNT = 11;

interface DataTunnelProps {
  count?: number;
  reducedMotion?: boolean;
}

export function DataTunnel({
  count = BLOCK_COUNT,
  reducedMotion = false,
}: DataTunnelProps) {
  const primary = useThemeColor("--primary", FALLBACK_PRIMARY);
  const accent = useThemeColor("--accent", FALLBACK_ACCENT);

  // Deterministic-ish layout so blocks alternate sides down the road.
  const blocks = useMemo(() => {
    const out: {
      pos: [number, number, number];
      rot: [number, number, number];
      scale: [number, number, number];
      side: number;
      phase: number;
      hue: THREE.Color;
    }[] = [];
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const z = -6 - i * 8.5;
      const x = side * (3.2 + (i % 3) * 0.6);
      const y = 0.5 + ((i * 1.7) % 3);
      out.push({
        pos: [x, y, z],
        rot: [0, side * 0.5, side * 0.15],
        scale: [
          0.9 + (i % 2) * 0.4,
          0.6 + (i % 3) * 0.3,
          0.9 + (i % 2) * 0.4,
        ],
        side,
        phase: i * 1.3,
        hue: i % 2 === 0 ? primary : accent,
      });
    }
    return out;
  }, [count, primary, accent]);

  const refs = useRef<(THREE.Mesh | null)[]>([]);

  // One shared unit box used to derive edge frames (avoids per-render leaks).
  const sharedBox = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => sharedBox.dispose(), [sharedBox]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < blocks.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const b = blocks[i];
      m.position.y = b.pos[1] + Math.sin(t * 0.6 + b.phase) * 0.25;
      m.rotation.y = b.rot[1] + Math.sin(t * 0.3 + b.phase) * 0.15;
      m.rotation.z = b.rot[2] + Math.cos(t * 0.25 + b.phase) * 0.08;
    }
  });

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={b.pos}
          rotation={b.rot}
          scale={b.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={b.hue}
            transparent
            opacity={0.12}
            roughness={0.1}
            metalness={0.3}
            emissive={b.hue}
            emissiveIntensity={0.35}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Bright edge frames via a second wire box per block for definition */}
      {blocks.map((b, i) => (
        <lineSegments
          key={`wire-${i}`}
          position={b.pos}
          rotation={b.rot}
          scale={[b.scale[0] * 1.001, b.scale[1] * 1.001, b.scale[2] * 1.001]}
        >
          <edgesGeometry args={[sharedBox]} />
          <lineBasicMaterial
            color={b.hue}
            transparent
            opacity={0.5}
            toneMapped={false}
            depthWrite={false}
          />
        </lineSegments>
      ))}
    </group>
  );
}
