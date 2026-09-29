"use client";

import dynamic from "next/dynamic";

import { CinemaScroll } from "@/components/layout/cinema-scroll";
import { BackgroundFx } from "@/components/layout/background-fx";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CommandPalette, {
  useCommandPalette,
} from "@/components/layout/command-palette";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { ChatWidget } from "@/components/chat/chat-widget";

import HeroSection from "@/components/sections/hero-section";
import AboutSection from "@/components/sections/about-section";
import SkillsSection from "@/components/sections/skills-section";
import ProjectsSection from "@/components/sections/projects-section";
import RepositoriesSection from "@/components/sections/repositories-section";
import AiLabSection from "@/components/sections/ai-lab-section";
import DataSection from "@/components/sections/data-section";
import ExperienceSection from "@/components/sections/experience-section";
import TimelineSection from "@/components/sections/timeline-section";
import ContactSection from "@/components/sections/contact-section";

/**
 * The 3D background is client-only + lazy. `ssr:false` requires this page to be
 * a Client Component (it is). Falls back to nothing while the scene hydrates.
 */
const ImmersiveCanvas = dynamic(
  () => import("@/components/three/immersive-canvas"),
  { ssr: false, loading: () => null },
);

export default function HomePage() {
  const palette = useCommandPalette();

  return (
    <>
      {/* Fixed cinematic WebGL background (z-0, lazy, client-only).
          Degrades to the CSS gradient if WebGL is unavailable. */}
      <CanvasErrorBoundary>
        <ImmersiveCanvas />
      </CanvasErrorBoundary>

      {/* Overlays + progress + cursor: above the canvas, outside the track —
          the track's transform would otherwise trap fixed children. */}
      <BackgroundFx />
      <ScrollProgress />
      <CustomCursor />

      {/* App shell */}
      <Navbar onOpenCommandPalette={() => palette.setOpen(true)} />

      {/* Virtual-scroll stage: ONLY flowing content lives in the track. */}
      <CinemaScroll>
        <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
          <HeroSection />
          <AboutSection />
          <SkillsSection />
          <ProjectsSection />
          <RepositoriesSection />
          <AiLabSection />
          <DataSection />
          <ExperienceSection />
          <TimelineSection />
          <ContactSection />
        </main>

        <Footer />
      </CinemaScroll>

      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />

      {/* Ali Abdelhady AI assistant — floating launcher (⌘J), lazy panel */}
      <ChatWidget />
    </>
  );
}
