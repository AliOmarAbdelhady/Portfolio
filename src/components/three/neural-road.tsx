"use client";

/**
 * NeuralRoad — the glowing perspective road receding into the distance.
 *
 * Built from three pieces, all neon and theme-aware:
 *   1. A ground grid of thin emissive lines (custom BufferGeometry lineSegments)
 *      with a per-frame scrolling offset so it reads as forward motion.
 *   2. Two bright "rail" lines flanking the road.
 *   3. A faint cross-horizon glow plane.
 *
 * Colour comes from the --grid-color CSS token (read at mount and on theme
 * change via useThemeColor). A fallback is always provided.
 */
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState } from "@/lib/runtime-state";
import { useThemeColor } from "./use-theme-color";

const FALLBACK_GRID = "#38bdf8";

// Road geometry extents.
const HALF_WIDTH = 7;
const LENGTH = 140;
const CELL = 2.2; // distance between grid lines along Z
const NEAR_Z = 18; // closest grid line (behind/below camera start)

export function NeuralRoad({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const color = useThemeColor("--grid-color", FALLBACK_GRID);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const railMatRef = useRef<THREE.LineBasicMaterial>(null);
  const offsetRef = useRef(0);

  // Build the grid once: a set of lines along X (rungs) and along Z (rails).
  const { rungGeometry, railGeometry } = useMemo(() => {
    const rungPositions: number[] = [];
    const cells = Math.ceil(LENGTH / CELL);
    for (let i = 0; i <= cells; i++) {
      const z = NEAR_Z - i * CELL;
      rungPositions.push(-HALF_WIDTH, -1.6, z, HALF_WIDTH, -1.6, z);
    }
    const railPositions: number[] = [
      // left rail
      -HALF_WIDTH, -1.6, NEAR_Z, -HALF_WIDTH, -1.6, NEAR_Z - LENGTH,
      // right rail
      HALF_WIDTH, -1.6, NEAR_Z, HALF_WIDTH, -1.6, NEAR_Z - LENGTH,
      // inner-left soft glow line
      -HALF_WIDTH + 0.9, -1.5, NEAR_Z, -HALF_WIDTH + 0.9, -1.5, NEAR_Z - LENGTH,
      // inner-right soft glow line
      HALF_WIDTH - 0.9, -1.5, NEAR_Z, HALF_WIDTH - 0.9, -1.5, NEAR_Z - LENGTH,
    ];

    const rungGeometry = new THREE.BufferGeometry();
    rungGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(rungPositions, 3),
    );
    const railGeometry = new THREE.BufferGeometry();
    railGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(railPositions, 3),
    );
    return { rungGeometry, railGeometry };
  }, []);

  // Dispose geometries on unmount.
  useEffect(() => {
    return () => {
      rungGeometry.dispose();
      railGeometry.dispose();
    };
  }, [rungGeometry, railGeometry]);

  useFrame((_, delta) => {
    if (reducedMotion) return;

    // Advance the scrolling offset — combine an idle drift with forward push
    // from scroll velocity/progress so the road "races" as the user scrolls.
    const drift = 0.9; // cells/sec baseline
    const push = Math.min(Math.abs(scrollState.velocity) * 0.0006, 2.5);
    offsetRef.current += (drift + push) * delta;

    // Recompute rung Z positions with wraparound for an infinite road.
    // Cell count MUST match the build loop (ceil(LENGTH/CELL) + 1 rungs) so we
    // never write past the buffer end.
    const cells = Math.ceil(LENGTH / CELL);
    const rungCount = cells + 1;
    const attr = rungGeometry.getAttribute("position") as THREE.BufferAttribute;
    const span = rungCount * CELL;
    const wrapped = ((offsetRef.current % span) + span) % span;
    for (let i = 0; i < rungCount; i++) {
      const z = NEAR_Z - i * CELL + wrapped;
      const base = i * 6; // 2 verts * 3 components
      attr.setZ(base, z);
      attr.setZ(base + 3, z);
    }
    attr.needsUpdate = true;

    // Subtle rail opacity pulse.
    if (railMatRef.current) {
      const t = performance.now() * 0.001;
      railMatRef.current.opacity = 0.7 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Rungs (cross lines) — the moving "rungs of the ladder" */}
      <lineSegments geometry={rungGeometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={matRef}
          color={color}
          transparent
          opacity={0.45}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Rails + side glow lines */}
      <lineSegments geometry={railGeometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={railMatRef}
          color={color}
          transparent
          opacity={0.8}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Faint horizon glow disc far down the road */}
      <mesh position={[0, -1.4, NEAR_Z - LENGTH + 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
