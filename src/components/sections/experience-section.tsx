"use client";

import * as React from "react";
import { Briefcase, MapPin, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/reveal";
import { EXPERIENCE, type ExperienceItem } from "@/data/experience";

/** Map an accent token to the Badge variant that shares its hue. */
const ACCENT_BADGE_VARIANT: Record<
  ExperienceItem["accent"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  primary: "default",
  secondary: "secondary",
  tertiary: "tertiary",
  success: "success",
  warning: "warning",
  danger: "danger",
};

/** Soft accent tint used on the card's leading icon tile. */
const ACCENT_TILE: Record<ExperienceItem["accent"], string> = {
  primary: "border-primary/30 bg-primary/10 text-primary",
  secondary: "border-border bg-secondary text-secondary-foreground",
  tertiary: "border-tertiary/30 bg-tertiary/10 text-tertiary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

/** Solid accent color for the highlight bullet dots. */
const ACCENT_DOT: Record<ExperienceItem["accent"], string> = {
  primary: "bg-primary",
  secondary: "bg-secondary-foreground",
  tertiary: "bg-tertiary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Label + icon for the entry type chip. */
const TYPE_META: Record<
  ExperienceItem["type"],
  { label: string; icon: typeof Briefcase }
> = {
  internship: { label: "Internship", icon: GraduationCap },
  role: { label: "Role", icon: Briefcase },
};

/** A single experience entry rendered as a rich glass card. */
function ExperienceEntry({ item }: { item: ExperienceItem }) {
  const type = TYPE_META[item.type];
  const TypeIcon = type.icon;

  return (
    <StaggerItem className="h-full">
      <GlassCard
        tilt
        glow
        className="group flex h-full flex-col gap-4 p-5 md:p-6"
      >
        {/* Header: icon tile + role/org + period */}
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-500 group-hover:scale-105",
              ACCENT_TILE[item.accent],
            )}
          >
            <Briefcase className="h-5 w-5" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={ACCENT_BADGE_VARIANT[item.accent]}>
                <TypeIcon className="h-3 w-3" aria-hidden />
                {type.label}
              </Badge>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                {item.period}
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-lg font-bold leading-tight text-foreground md:text-xl">
              {item.role}
            </h3>
            <p className="font-mono text-xs text-muted-foreground">
              {item.org}
              <span className="mx-1.5 text-text-soft">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {item.location}
              </span>
            </p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-text-soft">
          {item.summary}
        </p>

        {/* Highlights */}
        <ul className="flex flex-col gap-2">
          {item.highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90"
            >
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_8px]",
                  ACCENT_DOT[item.accent],
                )}
                aria-hidden
              />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </GlassCard>
    </StaggerItem>
  );
}

/**
 * ExperienceSection — "Command Log" (station 07).
 *
 * Professional experience: internships and active roles rendered as rich glass
 * cards with period, role, org, location, a summary, responsibility highlights,
 * and tech/skill tags. Mirrors the project-card aesthetic so the new section
 * feels native to the Neural Road.
 */
export default function ExperienceSection() {
  return (
    <section id="experience" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="07"
          station="Command Log"
          title={
            <>
              Mission <span className="text-gradient">history</span>
            </>
          }
          subtitle="Internships and active roles — where I've shipped software, AI, and robotics work alongside real teams."
        />

        <StaggerGroup
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          stagger={0.08}
        >
          {EXPERIENCE.map((item) => (
            <ExperienceEntry key={item.id} item={item} />
          ))}
        </StaggerGroup>

        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-muted-foreground/80 md:text-sm">
            <span className="font-mono text-muted-foreground">note —</span>{" "}
            Full references and detailed responsibilities available on request
            and in the résumé.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
