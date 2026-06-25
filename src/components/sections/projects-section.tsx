"use client";

import * as React from "react";
import { ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";

import { cn } from "@/lib/utils";
import {
  PROJECTS,
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategory,
} from "@/data/projects";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { TechBadge } from "@/components/ui/tech-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  StaggerGroup,
  StaggerItem,
  Reveal,
} from "@/components/ui/reveal";

/** Map a project's `accent` to the matching Badge variant. */
const ACCENT_VARIANT: Record<
  Project["accent"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  primary: "default",
  secondary: "secondary",
  tertiary: "tertiary",
  success: "success",
  warning: "warning",
  danger: "danger",
};

type Filter = ProjectCategory | "All";

/** Compact icon button linking out — used in card + dialog footers. */
function IconLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface/60 text-muted-foreground transition-all",
        "hover:border-primary/50 hover:text-primary hover:shadow-[0_0_18px_-4px] hover:shadow-primary/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

/** A single project card. */
function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (p: Project) => void;
}) {
  const tech = project.technologies.slice(0, 4);
  const extra = project.technologies.length - tech.length;

  return (
    <GlassCard
      tilt
      glow
      data-cursor="view"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.title}`}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project);
        }
      }}
      className="group flex h-full cursor-pointer flex-col p-5 text-left"
    >
      {/* Top row: category + year */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <Badge variant={ACCENT_VARIANT[project.accent]}>
          {project.category}
        </Badge>
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-soft">
          {project.year}
        </span>
      </div>

      {/* Title + subtitle */}
      <div className="mb-3">
        <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-tertiary">
          {project.subtitle}
        </p>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      {/* Tech badges */}
      <div className="mb-5 mt-auto flex flex-wrap items-center gap-1.5">
        {tech.map((t) => (
          <TechBadge key={t} name={t} />
        ))}
        {extra > 0 ? (
          <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-text-soft">
            +{extra}
          </span>
        ) : null}
      </div>

      {/* Footer: links + details */}
      <div className="flex items-center justify-between border-t border-border/70 pt-4">
        <div className="flex items-center gap-2">
          {project.githubUrl ? (
            <IconLink
              href={project.githubUrl}
              label={`${project.title} on GitHub`}
              icon={Github}
            />
          ) : null}
          {project.demoUrl ? (
            <IconLink
              href={project.demoUrl}
              label={`${project.title} live demo`}
              icon={ExternalLink}
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(project);
          }}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:text-primary-glow"
        >
          Details
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>
    </GlassCard>
  );
}

/** Full-details modal body. */
function ProjectDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {project ? (
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant={ACCENT_VARIANT[project.accent]}>
                  {project.category}
                </Badge>
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-soft">
                  {project.year}
                  {project.featured ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-warning">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </span>
                  ) : null}
                </span>
              </div>
              <DialogTitle>{project.title}</DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-wider text-tertiary">
                {project.subtitle}
              </DialogDescription>
            </DialogHeader>

            {/* Long description */}
            <p className="text-sm leading-relaxed text-foreground/90">
              {project.longDescription}
            </p>

            {/* Problem / Solution two-up */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface/50 p-4">
                <h4 className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-danger">
                  Problem
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {project.problem}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface/50 p-4">
                <h4 className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-success">
                  Solution
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {project.solution}
                </p>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Key Features
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {project.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-foreground/90"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech stack */}
            <div>
              <h4 className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-tertiary">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <TechBadge key={t} name={t} />
                ))}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              {project.githubUrl ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    View Code
                  </a>
                </Button>
              ) : null}
              {project.demoUrl ? (
                <Button asChild variant="glow" size="sm">
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Build Archive — station 03.
 * Filterable grid of project cards with a details Dialog.
 */
export default function ProjectsSection() {
  const [filter, setFilter] = React.useState<Filter>("All");
  const [selected, setSelected] = React.useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (filter === "All") return PROJECTS;
    return PROJECTS.filter((p) => p.category === filter);
  }, [filter]);

  const filters: Filter[] = ["All", ...PROJECT_CATEGORIES];

  const openProject = React.useCallback((p: Project) => {
    setSelected(p);
    setDialogOpen(true);
  }, []);

  const counts = React.useMemo(() => {
    const map = new Map<Filter, number>();
    map.set("All", PROJECTS.length);
    for (const c of PROJECT_CATEGORIES) {
      map.set(c, PROJECTS.filter((p) => p.category === c).length);
    }
    return map;
  }, []);

  return (
    <section id="projects" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="03"
          station="Build Archive"
          title={
            <>
              Selected <span className="text-gradient">Builds</span>
            </>
          }
          subtitle="A curated archive of shipped projects across web, AI, computer vision, and data science. Filter by domain, then open any build for the full breakdown."
        />

        {/* Filter chips */}
        <Reveal delay={0.05} className="mt-10">
          <div
            role="tablist"
            aria-label="Filter projects by category"
            className="flex flex-wrap items-center gap-2"
          >
            {filters.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_18px_-6px] shadow-primary/50"
                      : "border-border bg-surface/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {f}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px]",
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-text-soft",
                    )}
                  >
                    {counts.get(f) ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Grid */}
        <StaggerGroup
          className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          stagger={0.07}
        >
          {filtered.map((project) => (
            <StaggerItem key={project.id} className="h-full">
              <ProjectCard project={project} onOpen={openProject} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
            No builds in this archive yet.
          </p>
        ) : null}
      </div>

      <ProjectDialog
        project={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
