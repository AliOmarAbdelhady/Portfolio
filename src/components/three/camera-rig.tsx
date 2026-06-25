"use client";

/**
 * CameraRig — drives the camera along the Neural Road.
 *
 * The camera advances FORWARD along -Z as page progress goes 0 -> 1 (z from
 * +8 down to -22, per PROJECT_PLAN §9), with a gentle vertical bob, subtle
 * pointer parallax, and a tiny roll/pitch that eases through section
 * transitions. All targets are lerped each frame for buttery motion.
 *
 * Reads scrollState + pointerState from the shared, non-React runtime store so
 * the per-frame loop never triggers a re-render.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { pointerState, scrollState } from "@/lib/runtime-state";
import { lerp, smoothstep } from "@/lib/utils";

// Camera path endpoints (plan §9).
const START_Z = 8;
const END_Z = -22;

// Subtle parallax / bob amplitudes.
const PARALLAY_X = 1.4;
const PARALLAY_Y = 0.9;
const BOB_AMP = 0.12;
const BOB_FREQ = 0.6;

export function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const { camera } = useThree();
  const tRef = useRef(0);

  useFrame((_, delta) => {
    // Frame-rate independent smoothing factor.
    const smooth = 1 - Math.pow(0.001, delta);
    tRef.current += delta;

    const progress = scrollState.progress;

    // Forward travel along -Z.
    const targetZ = lerp(START_Z, END_Z, progress);

    // Vertical bob — frozen when the user prefers reduced motion.
    const bob = reducedMotion
      ? 0
      : Math.sin(tRef.current * BOB_FREQ * Math.PI * 2) * BOB_AMP;
    const baseY = 1.6 + bob;

    // Pointer parallax (pointerState.nx/ny are -1..1). Reduced under reduced
    // motion so the scene stays calm.
    const pFactor = reducedMotion ? 0.15 : 1;
    const targetX = pointerState.nx * PARALLAY_X * pFactor;
    const targetY = baseY + pointerState.ny * PARALLAY_Y * pFactor;

    camera.position.x = lerp(camera.position.x, targetX, smooth);
    camera.position.y = lerp(camera.position.y, targetY, smooth);
    camera.position.z = lerp(camera.position.z, targetZ, smooth);

    // Tiny roll + pitch that pulses near section boundaries (every ~1/N of the
    // page) so transitions feel "alive" without being nauseating.
    const boundary = Math.abs(Math.sin(progress * Math.PI * 6));
    const targetRoll = (pointerState.nx * 0.04 + boundary * 0.012) * pFactor;
    const targetPitch =
      (-pointerState.ny * 0.03 - smoothstep(0, 0.15, boundary) * 0.01) * pFactor;

    camera.rotation.z = lerp(camera.rotation.z, targetRoll, smooth);
    // Keep looking slightly down the road; nudge pitch only.
    camera.rotation.x = lerp(camera.rotation.x, targetPitch, smooth);
    // Yaw follows pointer for a hint of "looking around".
    const targetYaw = -pointerState.nx * 0.05 * pFactor;
    camera.rotation.y = lerp(camera.rotation.y, targetYaw, smooth);

    camera.updateProjectionMatrix();
  });

  return null;
}

/** Camera placement shared with the Canvas (plan §9 start depth). */
export const DEFAULT_CAMERA = {
  fov: 62,
  near: 0.1,
  far: 120,
  position: [0, 1.6, START_Z] as [number, number, number],
} as const;
