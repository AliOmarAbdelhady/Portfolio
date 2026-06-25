"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Database,
  Split,
  BrainCircuit,
  Gauge,
  Rocket,
  ScanLine,
  Workflow,
  Boxes,
  Target,
  GitBranch,
  Sparkles,
  Eye,
  Layers,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import {
  StaggerGroup,
  StaggerItem,
  Reveal,
} from "@/components/ui/reveal";

/* -------------------------------------------------------------------------- */
/*  Pipeline stage definitions                                                */
/* -------------------------------------------------------------------------- */

type Stage = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const PIPELINE: Stage[] = [
  {
    icon: Database,
    title: "Input Data",
    description: "Raw images, sensors, and structured datasets ingested.",
  },
  {
    icon: Split,
    title: "Preprocessing",
    description: "Cleaning, augmentation, normalization, and feature splits.",
  },
  {
    icon: BrainCircuit,
    title: "Model",
    description: "Training and tuning neural architectures end-to-end.",
  },
  {
    icon: Gauge,
    title: "Evaluation",
    description: "Metrics, validation, and robustness benchmarking.",
  },
  {
    icon: Rocket,
    title: "Deployment",
    description: "Packaging inference into reliable, monitored services.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Flowing "data packet" along the connector                                 */
/* -------------------------------------------------------------------------- */

/** A small glowing dot that travels along a path, looped. */
function DataPacket({
  horizontal,
  delay = 0,
  duration = 3.2,
}: {
  horizontal: boolean;
  delay?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const travel = horizontal ? { x: ["0%", "100%"] } : { y: ["0%", "100%"] };

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_4px] shadow-primary/60"
      initial={{ opacity: 0 }}
      animate={{
        ...travel,
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        opacity: { duration, times: [0, 0.15, 0.85, 1], delay },
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  One pipeline node                                                         */
/* -------------------------------------------------------------------------- */

function PipelineNode({
  stage,
  index,
}: {
  stage: Stage;
  index: number;
}) {
  const Icon = stage.icon;
  return (
    <StaggerItem className="flex flex-1 flex-col items-center">
      <GlassCard
        strong
        className="group relative flex w-full flex-col items-center gap-3 p-5 text-center md:p-6"
      >
        {/* Node index badge */}
        <span className="absolute right-3 top-3 font-mono text-[10px] tracking-widest text-muted-foreground/70">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-xl transition-opacity duration-500 group-hover:bg-primary/40" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
        </div>

        <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
          {stage.title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground md:text-[13px]">
          {stage.description}
        </p>
      </GlassCard>
    </StaggerItem>
  );
}

/* -------------------------------------------------------------------------- */
/*  Connector between nodes                                                   */
/* -------------------------------------------------------------------------- */

function Connector() {
  // Horizontal connector (md+) — sits at node icon height.
  return (
    <>
      <div
        aria-hidden
        className="relative hidden h-px w-8 shrink-0 self-center md:block lg:w-12"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-tertiary to-accent bg-[length:200%_100%] animate-gradient-pan" />
        <DataPacket horizontal delay={0.4} />
      </div>
      {/* Vertical connector (mobile) */}
      <div
        aria-hidden
        className="relative h-8 w-px shrink-0 self-center md:hidden"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary via-tertiary to-accent bg-[length:100%_200%] animate-gradient-pan" />
        <DataPacket horizontal={false} delay={0.4} />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Computer Vision Scanner panel                                             */
/* -------------------------------------------------------------------------- */

const CV_BRACKETS = [
  "left-3 top-3 border-l-2 border-t-2",
  "right-3 top-3 border-r-2 border-t-2",
  "left-3 bottom-3 border-l-2 border-b-2",
  "right-3 bottom-3 border-r-2 border-b-2",
];

function VisionScanner() {
  return (
    <GlassCard strong className="relative flex flex-col overflow-hidden p-5 md:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
            Computer Vision Scanner
          </h3>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-success">
          <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-success" />
          Live
        </span>
      </div>

      {/* Framed viewport */}
      <div className="scanlines relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background-secondary/60 via-card to-muted">
        {/* Faint grid backdrop */}
        <div className="bg-grid absolute inset-0 opacity-50" />

        {/* Placeholder "captured" imagery — abstract detection field */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-28 w-28 md:h-32 md:w-32">
            <div className="absolute inset-0 animate-pulse-glow rounded-full border border-dashed border-primary/50" />
            <div className="absolute inset-4 rounded-full border border-accent/40" />
            <div className="absolute inset-8 rounded-full bg-primary/10" />
            <Eye className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary/80" strokeWidth={1.5} />
          </div>
        </div>

        {/* Moving horizontal scanline */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_2px] shadow-primary/50" />

        {/* Corner brackets */}
        {CV_BRACKETS.map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={cn(
              "pointer-events-none absolute h-5 w-5 border-primary/70",
              pos,
            )}
          />
        ))}

        {/* Detection label */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-primary/90">
          <span className="flex items-center gap-1.5 rounded bg-background/60 px-2 py-1 backdrop-blur-sm">
            <span className="h-1 w-1 animate-blink bg-primary" />
            DETECTING…
          </span>
          <span className="rounded bg-background/60 px-2 py-1 backdrop-blur-sm">
            CONF 0.97
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Real-time perception: object detection, segmentation, and feature
        extraction pipelines turning pixels into structured signals.
      </p>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  AI Workflow capability panel                                              */
/* -------------------------------------------------------------------------- */

type Capability = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const CAPABILITIES: Capability[] = [
  {
    icon: Boxes,
    title: "Retrieval Augmented Generation",
    description: "Grounding LLMs in private knowledge with vector search.",
  },
  {
    icon: BrainCircuit,
    title: "Large Language Models",
    description: "Fine-tuning, prompting, and agentic orchestration.",
  },
  {
    icon: ScanLine,
    title: "Detection & Segmentation",
    description: "Locating and delineating objects in images and video.",
  },
  {
    icon: Target,
    title: "Evaluation & Metrics",
    description: "Rigorous benchmarking against held-out validation sets.",
  },
];

function WorkflowPanel() {
  return (
    <GlassCard strong className="flex h-full flex-col p-5 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Workflow className="h-4 w-4 text-accent" strokeWidth={1.75} />
        <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
          AI Workflow
        </h3>
      </div>

      <StaggerGroup className="flex flex-col gap-3" stagger={0.07}>
        {CAPABILITIES.map(({ icon: Icon, title, description }) => (
          <StaggerItem
            key={title}
            className="group flex items-start gap-3 rounded-xl border border-border/60 bg-surface/50 p-3 transition-colors hover:border-primary/40 hover:bg-surface"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm font-medium text-foreground">
                {title}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Footer chips */}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <GitBranch className="h-3 w-3" strokeWidth={2} />
          PyTorch
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3 w-3" strokeWidth={2} />
          LangChain
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Layers className="h-3 w-3" strokeWidth={2} />
          OpenCV
        </span>
      </div>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function AiLabSection() {
  return (
    <section id="ai-lab" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="05"
          station="Vision Lab"
          title={
            <>
              From raw data to <span className="text-gradient">deployed intelligence</span>
            </>
          }
          subtitle="An end-to-end view of how I build, evaluate, and ship machine learning and computer vision systems."
        />

        {/* ---------- Pipeline ---------- */}
        <Reveal delay={0.1} className="mt-14">
          <StaggerGroup
            className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-0"
            stagger={0.12}
          >
            {PIPELINE.map((stage, i) => (
              <React.Fragment key={stage.title}>
                <PipelineNode stage={stage} index={i} />
                {i < PIPELINE.length - 1 && <Connector />}
              </React.Fragment>
            ))}
          </StaggerGroup>
        </Reveal>

        {/* ---------- Showcase row ---------- */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal delay={0.1}>
            <VisionScanner />
          </Reveal>
          <Reveal delay={0.2}>
            <WorkflowPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default AiLabSection;
