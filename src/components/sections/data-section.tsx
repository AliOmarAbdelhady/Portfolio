"use client";

import * as React from "react";
import { motion, useReducedMotion, useInView } from "motion/react";
import {
  Cpu,
  Database,
  Rocket,
  Layers,
  TrendingUp,
  Activity,
  BarChart3,
  LineChart,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DASHBOARD_METRICS } from "@/lib/constants";
import { PROJECTS } from "@/data/projects";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCounter } from "@/components/ui/stat-counter";
import { Badge } from "@/components/ui/badge";

const EASE = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Static dataset for the dashboard                                          */
/* -------------------------------------------------------------------------- */

/** The full set of chart color tokens from globals.css. */
type ChartToken = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

/** Icon + chart-token accent per metric card. */
const METRIC_META: {
  icon: typeof Cpu;
  token: ChartToken;
  trend: number[];
}[] = [
  { icon: Cpu, token: "chart-1", trend: [4, 6, 5, 8, 7, 10, 12] },
  { icon: Database, token: "chart-3", trend: [10, 12, 11, 15, 18, 22, 30] },
  { icon: Rocket, token: "chart-4", trend: [8, 9, 11, 12, 14, 16, 18] },
  { icon: Layers, token: "chart-2", trend: [20, 24, 27, 31, 35, 38, 40] },
];

/** Map chart tokens to raw CSS var references for SVG/CSS gradients. */
const CHART_VAR: Record<ChartToken, string> = {
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
};

/** Tailwind color utility per token (for non-SVG elements). */
const CHART_UTIL: Record<ChartToken, string> = {
  "chart-1": "text-chart-1",
  "chart-2": "text-chart-2",
  "chart-3": "text-chart-3",
  "chart-4": "text-chart-4",
  "chart-5": "text-chart-5",
};

/** Aggregate live PROJECTS into "Projects by domain" buckets. */
const DOMAIN_BUCKETS: { label: string; value: number; token: ChartToken }[] = (() => {
  const counts = new Map<string, number>();
  for (const p of PROJECTS) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  const tokens: ChartToken[] = [
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
    "chart-1",
  ];
  return Array.from(counts.entries())
    .map(([label, value], i) => ({
      label,
      value,
      token: tokens[i % tokens.length],
    }))
    .sort((a, b) => b.value - a.value);
})();

/** Representative 14-point "commit / build activity" series. */
const ACTIVITY_SERIES = [
  8, 12, 9, 15, 18, 14, 22, 19, 26, 24, 31, 28, 35, 38,
];

/** Capability chips for the caption row. */
const CAPABILITIES = [
  "Data Cleaning",
  "Feature Engineering",
  "Exploratory Analysis",
  "Statistical Modeling",
  "Visualization",
  "Storytelling",
] as const;

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                              */
/* -------------------------------------------------------------------------- */

/** Mini SVG sparkline rendered as an inline trend indicator on metric cards. */
function TrendSparkline({
  data,
  token,
  reduce,
}: {
  data: number[];
  token: ChartToken;
  reduce: boolean | null;
}) {
  const w = 96;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return [x, y] as const;
  });
  const stroke = CHART_VAR[token];
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="overflow-visible"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${token}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: EASE }}
        points={points.map(([x, y]) => `${x},${y}`).join(" ")}
      />
      <motion.circle
        cx={last[0]}
        cy={last[1]}
        r="2.4"
        fill={stroke}
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.9 }}
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bar chart — Projects by domain                                            */
/* -------------------------------------------------------------------------- */

function DomainBarChart({ reduce }: { reduce: boolean | null }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const max = Math.max(...DOMAIN_BUCKETS.map((d) => d.value));

  return (
    <div ref={ref} className="flex h-full flex-col">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
          Projects by Domain
        </h3>
      </div>

      {/* Plot area */}
      <div className="mt-6 flex flex-1 items-end gap-3 sm:gap-4">
        {DOMAIN_BUCKETS.map((d, i) => {
          const pct = (d.value / max) * 100;
          const color = CHART_VAR[d.token];
          return (
            <div
              key={d.label}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex w-full flex-1 items-end justify-center">
                {/* Value label */}
                <motion.span
                  className={cn(
                    "absolute -top-1 font-mono text-xs tabular-nums",
                    CHART_UTIL[d.token],
                  )}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={
                    inView || reduce
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 6 }
                  }
                  transition={{
                    duration: 0.4,
                    ease: EASE,
                    delay: reduce ? 0 : 0.15 * i + (pct / 100) * 0.6,
                  }}
                >
                  {d.value}
                </motion.span>

                {/* Bar */}
                <motion.div
                  className="relative w-full max-w-[42px] overflow-hidden rounded-t-md"
                  style={{
                    background: `linear-gradient(to top, ${color}, color-mix(in oklab, ${color} 35%, transparent))`,
                    boxShadow: `0 0 18px color-mix(in oklab, ${color} 40%, transparent)`,
                  }}
                  initial={reduce ? false : { height: "0%" }}
                  animate={
                    inView || reduce ? { height: `${Math.max(pct, 8)}%` } : { height: "0%" }
                  }
                  transition={{
                    duration: reduce ? 0 : 0.9,
                    ease: EASE,
                    delay: reduce ? 0 : 0.12 * i,
                  }}
                >
                  {/* Top sheen */}
                  <span className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 to-transparent" />
                </motion.div>
              </div>

              {/* X-axis label */}
              <span className="line-clamp-1 max-w-full text-center font-mono text-[10px] leading-tight text-muted-foreground">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
        {DOMAIN_BUCKETS.map((d) => (
          <span
            key={d.label}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: CHART_VAR[d.token] }}
            />
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Activity area chart (SVG sparkline/area)                                  */
/* -------------------------------------------------------------------------- */

function ActivityAreaChart({ reduce }: { reduce: boolean | null }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const w = 320;
  const h = 120;
  const pad = 8;
  const max = Math.max(...ACTIVITY_SERIES);
  const min = Math.min(...ACTIVITY_SERIES);
  const span = max - min || 1;
  const step = (w - pad * 2) / (ACTIVITY_SERIES.length - 1);

  const points = ACTIVITY_SERIES.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M${points[0][0].toFixed(1)},${(h - pad).toFixed(1)} ` +
    points.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` L${points[points.length - 1][0].toFixed(1)},${(h - pad).toFixed(1)} Z`;

  const stroke = CHART_VAR["chart-1"];
  const last = points[points.length - 1];
  const peak = points[points.length - 1];

  return (
    <div ref={ref} className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-chart-1" />
          <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
            Build Activity
          </h3>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          last 14 cycles
        </span>
      </div>

      <div className="relative mt-4 flex-1">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="img"
          aria-label="Build activity over the last fourteen cycles, trending upward."
        >
          <defs>
            <linearGradient id="activity-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={pad}
              x2={w - pad}
              y1={pad + t * (h - pad * 2)}
              y2={pad + t * (h - pad * 2)}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border/40"
              strokeDasharray="3 4"
            />
          ))}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#activity-area)"
            initial={reduce ? false : { opacity: 0 }}
            animate={inView || reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.8, ease: EASE, delay: reduce ? 0 : 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={stroke}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={inView || reduce ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: reduce ? 0 : 1.4, ease: EASE }}
            style={{ filter: `drop-shadow(0 0 6px color-mix(in oklab, ${stroke} 55%, transparent))` }}
          />

          {/* Peak marker */}
          <motion.circle
            cx={peak[0]}
            cy={peak[1]}
            r="3.5"
            fill={stroke}
            initial={reduce ? false : { scale: 0 }}
            animate={inView || reduce ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 1.3 }}
          />
        </svg>

        {/* Peak callout */}
        <div
          className="pointer-events-none absolute -translate-x-1/2"
          style={{
            left: `${(last[0] / w) * 100}%`,
            top: `${(last[1] / h) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <span className="rounded-md border border-chart-1/40 bg-card/80 px-1.5 py-0.5 font-mono text-[10px] text-chart-1 backdrop-blur-md">
            peak
          </span>
        </div>
      </div>

      {/* Axis labels */}
      <div className="mt-2 flex justify-between font-mono text-[10px] text-text-soft">
        <span>w1</span>
        <span>now</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Capability radial / ring summary                                         */
/* -------------------------------------------------------------------------- */

const CAPABILITY_RINGS = [
  { label: "Cleaning", value: 92, token: "chart-3" as const },
  { label: "Features", value: 88, token: "chart-2" as const },
  { label: "Statistics", value: 80, token: "chart-1" as const },
  { label: "Visuals", value: 90, token: "chart-4" as const },
];

function CapabilityRings({ reduce }: { reduce: boolean | null }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4">
      {CAPABILITY_RINGS.map((c, i) => {
        const r = 26;
        const circ = 2 * Math.PI * r;
        const offset = circ * (1 - c.value / 100);
        const color = CHART_VAR[c.token];
        return (
          <div key={c.label} className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-border/50"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={reduce ? false : { strokeDashoffset: circ }}
                  animate={
                    inView || reduce
                      ? { strokeDashoffset: offset }
                      : { strokeDashoffset: circ }
                  }
                  transition={{
                    duration: reduce ? 0 : 1.1,
                    ease: EASE,
                    delay: reduce ? 0 : 0.15 * i,
                  }}
                  style={{ filter: `drop-shadow(0 0 4px color-mix(in oklab, ${color} 50%, transparent))` }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tabular-nums text-foreground">
                {c.value}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">{c.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export default function DataSection() {
  const reduce = useReducedMotion();

  return (
    <section id="data" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="06"
          station="Insight Chamber"
          title={
            <span className="text-gradient">Insight Chamber</span>
          }
          subtitle="A live readout of the data-science pipeline — from raw datasets to decision-ready intelligence, with every metric traceable to real work."
        />

        {/* ---------- KPI metric grid ---------- */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DASHBOARD_METRICS.map((m, i) => {
            const meta = METRIC_META[i] ?? METRIC_META[0];
            const Icon = meta.icon;
            return (
              <Reveal key={m.label} delay={i * 0.06}>
                <GlassCard className="h-full p-5">
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface",
                        CHART_UTIL[meta.token],
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="gap-1 py-0">
                      <TrendingUp className="h-3 w-3" />
                      live
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <div className="font-display text-3xl font-bold tabular-nums text-foreground md:text-4xl">
                      <StatCounter value={m.value} suffix={m.suffix} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {m.label}
                    </p>
                  </div>

                  {/* Trend sparkline */}
                  <div className="mt-3 border-t border-border/60 pt-3">
                    <div className="flex items-end justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-text-soft">
                        trend
                      </span>
                      <TrendSparkline
                        data={meta.trend}
                        token={meta.token}
                        reduce={reduce}
                      />
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>

        {/* ---------- Chart panels ---------- */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* Bar chart */}
          <Reveal delay={0.05}>
            <GlassCard strong className="h-full p-6">
              <DomainBarChart reduce={reduce} />
            </GlassCard>
          </Reveal>

          {/* Activity area chart */}
          <Reveal delay={0.1}>
            <GlassCard strong className="h-full p-6">
              <ActivityAreaChart reduce={reduce} />
            </GlassCard>
          </Reveal>
        </div>

        {/* ---------- Capability rings + caption ---------- */}
        <Reveal delay={0.05}>
          <GlassCard className="mt-6 p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              {/* Rings */}
              <div>
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-chart-2" />
                  <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
                    Pipeline Proficiency
                  </h3>
                </div>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Self-assessed coverage across the core data-science workflow.
                </p>
                <div className="mt-5">
                  <CapabilityRings reduce={reduce} />
                </div>
              </div>

              {/* Caption / capability chips */}
              <div className="lg:border-l lg:border-border/60 lg:pl-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
                    Data-Science Capability
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  Every dataset is treated as raw signal waiting to be cleaned,
                  engineered, and interrogated. I move from ingestion through
                  feature engineering, statistical profiling, and visualization
                  to surface decisions that hold up under scrutiny.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {CAPABILITIES.map((c) => (
                    <Badge key={c} variant="tertiary">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
