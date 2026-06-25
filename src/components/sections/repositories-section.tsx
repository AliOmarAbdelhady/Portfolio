"use client";

import * as React from "react";
import {
  Star,
  GitFork,
  ExternalLink,
  ArrowRight,
  Database,
  Users,
  AlertCircle,
} from "lucide-react";
import { Github } from "@/components/ui/brand-icons";

import { cn, formatCompact } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import {
  REPO_CATEGORIES,
  type Repository,
  type RepoCategory,
  type RepoStatus,
} from "@/data/repositories";
import type { GitHubProfile } from "@/lib/github";
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

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

type Filter = RepoCategory | "All";

/** Map the most common languages to a representative accent color. */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Shell: "#89e051",
  Jupyter: "#DA5B0B",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Vue: "#41b883",
  SQL: "#e38c00",
  Text: "#8b949e",
};

function languageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "var(--primary)";
}

/** Badge variant for a repo's status. */
const STATUS_VARIANT: Record<
  RepoStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  Completed: "success",
  "In Progress": "default",
  Experimental: "tertiary",
};

type ApiResponse = {
  repositories: Repository[];
  fallback: Repository[];
  hasLive: boolean;
  profile: GitHubProfile | null;
  fetchedAt?: string;
};

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                      */
/* ------------------------------------------------------------------ */

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
      onClick={(e) => e.stopPropagation()}
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

function ShowcaseTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-tertiary/30 bg-tertiary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-tertiary">
      Showcase
    </span>
  );
}

function LanguageDot({ language }: { language: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-soft">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: languageColor(language),
          boxShadow: `0 0 8px -1px ${languageColor(language)}`,
        }}
      />
      {language}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Profile stat strip                                                  */
/* ------------------------------------------------------------------ */

function ProfileStrip({ profile }: { profile: GitHubProfile }) {
  const stats = [
    { icon: Database, label: "Public Repos", value: profile.public_repos },
    { icon: Users, label: "Followers", value: profile.followers },
  ];

  return (
    <Reveal delay={0.05}>
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
        <a
          href={profile.html_url || SITE.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground">
            @{SITE.githubUsername}
          </span>
          <span className="hidden h-4 w-px bg-border sm:inline-block" />
          <span className="hidden items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-tertiary sm:inline-flex">
            Live
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
          </span>
        </a>
        <div className="flex items-center gap-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-semibold text-foreground">
                {formatCompact(value)}
              </span>
              <span className="hidden font-mono text-[11px] uppercase tracking-wider text-text-soft sm:inline">
                {label}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Repository card                                                     */
/* ------------------------------------------------------------------ */

function RepositoryCard({
  repo,
  onOpen,
}: {
  repo: Repository;
  onOpen: (r: Repository) => void;
}) {
  const tech = repo.technologies.slice(0, 3);
  const extra = repo.technologies.length - tech.length;
  const isLive = !repo.showcase;

  return (
    <GlassCard
      tilt
      glow
      data-cursor="view"
      className="group relative flex h-full flex-col p-5 text-left transition-transform duration-300 hover:-rotate-[0.4deg]"
    >
      {/* Top row: status + showcase / year */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[repo.status]}>
            {repo.status}
          </Badge>
          {repo.showcase ? <ShowcaseTag /> : null}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-soft">
          {repo.year}
        </span>
      </div>

      {/* Language dot + name */}
      <div className="mb-2">
        <LanguageDot language={repo.language} />
      </div>
      <h3 className="break-words font-mono text-lg font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
        {repo.name}
      </h3>

      {/* Description */}
      <p className="mt-2 mb-4 text-sm leading-relaxed text-muted-foreground">
        {repo.description}
      </p>

      {/* Tech badges */}
      <div className="mb-4 mt-auto flex flex-wrap items-center gap-1.5">
        {tech.map((t) => (
          <TechBadge key={t} name={t} />
        ))}
        {extra > 0 ? (
          <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-text-soft">
            +{extra}
          </span>
        ) : null}
      </div>

      {/* Live-only metrics */}
      {isLive && (repo.stars ?? 0) + (repo.forks ?? 0) > 0 ? (
        <div className="mb-4 flex items-center gap-4 font-mono text-xs text-text-soft">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-warning" />
            {formatCompact(repo.stars ?? 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5 text-tertiary" />
            {formatCompact(repo.forks ?? 0)}
          </span>
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/70 pt-4">
        <IconLink
          href={repo.githubUrl}
          label={`${repo.name} on GitHub`}
          icon={Github}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(repo);
          }}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:text-accent"
        >
          Inspect
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Details dialog                                                      */
/* ------------------------------------------------------------------ */

function RepositoryDialog({
  repo,
  open,
  onOpenChange,
}: {
  repo: Repository | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {repo ? (
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[repo.status]}>
                  {repo.status}
                </Badge>
                <Badge variant="secondary">{repo.category}</Badge>
                {repo.showcase ? <ShowcaseTag /> : null}
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-soft">
                  {repo.year}
                </span>
              </div>
              <DialogTitle className="font-mono">{repo.name}</DialogTitle>
              <DialogDescription>
                <LanguageDot language={repo.language} />
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm leading-relaxed text-foreground/90">
              {repo.description}
            </p>

            {/* Detail grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Category" value={repo.category} />
              <DetailRow label="Status" value={repo.status} />
              <DetailRow label="Year" value={repo.year} />
              <DetailRow
                label="Source"
                value={repo.showcase ? "Showcase capsule" : "Live from GitHub"}
              />
            </div>

            {/* Live metrics */}
            {!repo.showcase ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-surface/50 p-4 text-center">
                  <Star className="mx-auto mb-1 h-4 w-4 text-warning" />
                  <div className="font-mono text-lg font-semibold text-foreground">
                    {formatCompact(repo.stars ?? 0)}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-soft">
                    Stars
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface/50 p-4 text-center">
                  <GitFork className="mx-auto mb-1 h-4 w-4 text-tertiary" />
                  <div className="font-mono text-lg font-semibold text-foreground">
                    {formatCompact(repo.forks ?? 0)}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-soft">
                    Forks
                  </div>
                </div>
              </div>
            ) : null}

            {/* Tech stack */}
            <div>
              <h4 className="mb-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-tertiary">
                Technologies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {repo.technologies.length > 0 ? (
                  repo.technologies.map((t) => <TechBadge key={t} name={t} />)
                ) : (
                  <span className="font-mono text-xs text-text-soft">
                    Not specified
                  </span>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              <Button asChild variant="outline" size="sm">
                <a
                  href={repo.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  View Code
                </a>
              </Button>
              {repo.demoUrl ? (
                <Button asChild variant="glow" size="sm">
                  <a
                    href={repo.demoUrl}
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2">
      <span className="font-mono text-[11px] uppercase tracking-widest text-text-soft">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading skeleton                                                    */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="glass-card flex h-full flex-col gap-4 rounded-2xl p-5">
      <div className="flex justify-between">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted/60" />
        <div className="h-4 w-10 animate-pulse rounded bg-muted/60" />
      </div>
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted/60" />
      <div className="h-5 w-2/3 animate-pulse rounded bg-muted/60" />
      <div className="h-3 w-full animate-pulse rounded bg-muted/40" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-muted/40" />
      <div className="mt-auto flex gap-1.5">
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted/50" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-muted/50" />
      </div>
      <div className="h-px w-full animate-pulse bg-border/60" />
      <div className="flex justify-between">
        <div className="h-9 w-9 animate-pulse rounded-md bg-muted/50" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted/50" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                        */
/* ------------------------------------------------------------------ */

export default function RepositoriesSection() {
  const [filter, setFilter] = React.useState<Filter>("All");
  const [selected, setSelected] = React.useState<Repository | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    // loading already initialised to true; no synchronous setState here.
    fetch("/api/repositories")
      .then(async (res) => {
        if (!res.ok) throw new Error("request failed");
        return (await res.json()) as ApiResponse;
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setError(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  /**
   * Live repos always render first. The curated fallback is appended so the
   * vault is never empty; when there is no live data, every item is a
   * clearly-labelled showcase capsule.
   */
  const repos = React.useMemo<Repository[]>(() => {
    if (!data) return [];
    const live = data.hasLive ? data.repositories : [];
    return [...live, ...data.fallback];
  }, [data]);

  const filtered = React.useMemo(() => {
    if (filter === "All") return repos;
    return repos.filter((r) => r.category === filter);
  }, [filter, repos]);

  const counts = React.useMemo(() => {
    const map = new Map<Filter, number>();
    map.set("All", repos.length);
    for (const c of REPO_CATEGORIES) {
      if (c === "All") continue;
      map.set(c, repos.filter((r) => r.category === c).length);
    }
    return map;
  }, [repos]);

  const openRepo = React.useCallback((r: Repository) => {
    setSelected(r);
    setDialogOpen(true);
  }, []);

  return (
    <section id="repositories" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="04"
          station="Code Vault"
          title={
            <>
              The <span className="text-gradient">Code Vault</span>
            </>
          }
          subtitle="A live feed of public repositories pulled straight from GitHub, fused with curated showcase capsules so the archive is never empty. Open any capsule for the full breakdown."
        />

        {/* Profile stat strip (live only) */}
        {!loading && !error && data?.profile ? (
          <div className="mt-8">
            <ProfileStrip profile={data.profile} />
          </div>
        ) : null}

        {/* Filter chips */}
        {!loading && !error ? (
          <Reveal delay={0.05} className="mt-8">
            <div
              role="tablist"
              aria-label="Filter repositories by category"
              className="flex flex-wrap items-center gap-2"
            >
              {REPO_CATEGORIES.map((f) => {
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
        ) : null}

        {/* Body */}
        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <GlassCard className="flex flex-col items-center gap-3 p-10 text-center">
              <AlertCircle className="h-8 w-8 text-warning" />
              <p className="font-mono text-sm text-muted-foreground">
                The vault uplink is temporarily unavailable.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(false);
                  setLoading(true);
                  // Re-trigger the effect by reloading data via fetch.
                  fetch("/api/repositories")
                    .then((r) => r.json())
                    .then((payload) => {
                      setData(payload);
                      setLoading(false);
                    })
                    .catch(() => {
                      setError(true);
                      setLoading(false);
                    });
                }}
              >
                <ArrowRight className="h-4 w-4" />
                Retry uplink
              </Button>
            </GlassCard>
          ) : filtered.length === 0 ? (
            <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
              No repositories match this filter.
            </p>
          ) : (
            <StaggerGroup
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              stagger={0.07}
            >
              {filtered.map((repo) => (
                <StaggerItem key={repo.id} className="h-full">
                  <RepositoryCard repo={repo} onOpen={openRepo} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </div>

      <RepositoryDialog
        repo={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
