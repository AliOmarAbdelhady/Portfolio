"use client";

/**
 * ImmersiveCanvas (DEFAULT export) — the fixed, full-viewport WebGL background
 * for "The Neural Road".
 *
 * Renders a transparent <Canvas> pinned behind page content (position: fixed,
 * inset: 0, z-index: 0, pointer-events: none). The body's layered gradient
 * shows through the transparent clear colour.
 *
 * MUST be imported via next/dynamic with { ssr:false } from the page, e.g.:
 *
 *   const ImmersiveCanvas = dynamic(
 *     () => import("@/components/three/immersive-canvas"),
 *     { ssr: false },
 *   );
 *
 * Composition:
 *   <CameraRig/>        — scroll/pointer-driven camera
 *   <NeuralRoad/>       — glowing scrolling grid + rails
 *   <ParticleField/>    — rising additive motes
 *   <AICore/>           — distorted emissive core at hero depth
 *   <DataTunnel/>       — sparse glassy blocks for parallax
 *   fog + ambient/directional lighting
 *   <Effects/>          — Bloom (disabled on mobile / reduced motion)
 *
 * Performance: dpr clamped to [1, 1.5] on mobile and [1, 2] otherwise;
 * antialias off (Bloom softens edges); high-performance powerPreference.
 * Under reduced motion or hard mobile, the scene is rendered lighter (fewer
 * particles, no Bloom, calmer animation handled inside each component).
 */
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";

import { useIsMobile } from "@/hooks/use-media-query";
import { useThemeColor } from "./use-theme-color";
import { CameraRig, DEFAULT_CAMERA } from "./camera-rig";
import { NeuralRoad } from "./neural-road";
import { ParticleField } from "./particle-field";
import { AICore } from "./ai-core";
import { DataTunnel } from "./data-tunnel";
import { Effects } from "./effects";

const FALLBACK_FOG = "#030712";

/** Applies scene fog reactively to the theme's --fog-color token. */
function SceneFog() {
  const fogColor = useThemeColor("--fog-color", FALLBACK_FOG);
  const { scene } = useThree();
  useEffect(() => {
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(fogColor);
    } else {
      scene.fog = new THREE.Fog(fogColor, 8, 90);
    }
    // Keep the background transparent so the body gradient shows through.
    scene.background = null;
  }, [scene, fogColor]);
  return null;
}

interface ImmersiveCanvasProps {
  /** Force-disable Bloom/heavy FX (e.g. from a user setting). */
  lightMode?: boolean;
}

export default function ImmersiveCanvas({ lightMode = false }: ImmersiveCanvasProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  // Hard gates: reduced motion OR explicit light mode OR mobile => lighter FX.
  const heavyEffectsDisabled =
    lightMode || isMobile || Boolean(prefersReducedMotion);

  const particleCount = isMobile ? 400 : 1400;
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];

  // Camera initial props (R3F accepts position array).
  const cameraProps = useMemo(
    () => ({
      fov: DEFAULT_CAMERA.fov ?? 62,
      near: DEFAULT_CAMERA.near ?? 0.1,
      far: DEFAULT_CAMERA.far ?? 120,
      position: [0, 1.6, 8] as [number, number, number],
    }),
    [],
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={dpr}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
        }}
        camera={cameraProps}
        onCreated={({ gl }) => {
          // Transparent clear so the body's layered gradient shows through.
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <SceneFog />

          {/* Lighting: soft ambient + a key directional for the glassy blocks */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 10, 4]} intensity={0.6} />

          <CameraRig reducedMotion={Boolean(prefersReducedMotion)} />
          <NeuralRoad reducedMotion={Boolean(prefersReducedMotion)} />
          <ParticleField
            count={particleCount}
            reducedMotion={Boolean(prefersReducedMotion)}
          />
          <AICore reducedMotion={Boolean(prefersReducedMotion)} />
          <DataTunnel reducedMotion={Boolean(prefersReducedMotion)} />

          {/* Bloom is the heaviest pass — skip it entirely when gated. */}
          <Effects enabled={!heavyEffectsDisabled} />
        </Suspense>
      </Canvas>
    </div>
  );
}
