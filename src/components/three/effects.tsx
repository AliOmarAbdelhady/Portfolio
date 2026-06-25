"use client";

/**
 * Effects — post-processing Bloom, guarded for mobile + reduced motion.
 *
 * Bloom is expensive on integrated GPUs and can be uncomfortable for
 * motion-sensitive users, so this component renders nothing when either flag is
 * set. The parent always renders <Effects/>; the gating happens here.
 */
import { Bloom, EffectComposer } from "@react-three/postprocessing";

interface EffectsProps {
  enabled: boolean;
}

export function Effects({ enabled }: EffectsProps) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.5}
        mipmapBlur
        radius={0.7}
      />
    </EffectComposer>
  );
}
