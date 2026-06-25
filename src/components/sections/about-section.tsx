import {
  GraduationCap,
  MapPin,
  GitFork,
  ExternalLink,
} from "lucide-react";

import { SITE, FOCUS_AREAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedBorder } from "@/components/ui/animated-border";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/reveal";

/** A single quick-fact row inside the identity node. */
function FactRow({
  icon: Icon,
  label,
  children,
  href,
  external,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface/60 text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-sm text-foreground">{children}</span>
      </span>
      {external && href ? (
        <ExternalLink
          className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2">{content}</div>
  );
}

/** ORCID identifier rendered as a small "iD" text badge (no lucide icon exists). */
function OrcidBadge() {
  return (
    <span
      className="inline-flex h-5 items-center rounded border border-accent/40 bg-accent/10 px-1.5 font-mono text-[10px] font-semibold leading-none text-accent"
      aria-hidden="true"
    >
      iD
    </span>
  );
}

/**
 * AboutSection — "Identity Node" (station 01).
 *
 * Two-column layout: narrative bio on the left, holographic identity card on
 * the right. The card sits in a GlassCard with pointer tilt plus an animated
 * neon ring accent. Renders client primitives but holds no local state, so no
 * "use client" directive is required at this level.
 */
export default function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:gap-20">
          {/* --- LEFT: narrative --- */}
          <div className="flex flex-col">
            <SectionHeading
              index="01"
              station="Identity Node"
              title={
                <>
                  Engineering the bridge between{" "}
                  <span className="text-gradient">interfaces, models, and decisions</span>
                </>
              }
              subtitle="A focused look at who I am and how I build."
            />

            <StaggerGroup className="mt-8 flex flex-col gap-5" stagger={0.12}>
              <StaggerItem>
                <p className="text-base leading-relaxed text-text-soft md:text-lg">
                  I&apos;m {SITE.name}, a {SITE.role.toLowerCase()} at{" "}
                  {SITE.institutionShort} in {SITE.location}. My work lives at
                  the intersection of software engineering and applied
                  intelligence, where I build systems that turn raw data into
                  interactive, decision-ready experiences.
                </p>
              </StaggerItem>

              <StaggerItem>
                <p className="text-base leading-relaxed text-text-soft md:text-lg">
                  I focus on connecting interfaces to models to decisions,
                  spanning web platforms, computer vision pipelines, machine
                  learning systems, and data science tooling. Whether I&apos;m
                  training a vision model or shipping a full-stack interface
                  around it, the goal is the same: turn capable models into
                  products people can actually use.
                </p>
              </StaggerItem>

              <StaggerItem>
                <p className="text-base leading-relaxed text-text-soft md:text-lg">
                  Beyond coursework, I treat research software as a craft,
                  versioning experiments the way I version production code and
                  documenting the path from prototype to deployment. The result
                  is a portfolio of intelligent systems engineered to be
                  measurable, reproducible, and genuinely useful.
                </p>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((area) => (
                    <Badge key={area} variant="accent">
                      {area}
                    </Badge>
                  ))}
                </div>
              </StaggerItem>
            </StaggerGroup>
          </div>

          {/* --- RIGHT: identity node --- */}
          <Reveal
            delay={0.15}
            className="flex md:items-start md:justify-end"
          >
            <AnimatedBorder className="w-full max-w-md md:ml-auto">
              <GlassCard
                tilt
                glow
                strong
                className="relative h-full overflow-hidden p-6 md:p-7"
              >
                {/* Subtle scanline + grid texture inside the node */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06] bg-grid"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 scanlines opacity-[0.04]"
                  aria-hidden="true"
                />

                <div className="relative z-[3] flex flex-col gap-5">
                  {/* Header: avatar + identity */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/40 ring-offset-2 ring-offset-background">
                      <AvatarImage
                        src={SITE.avatarUrl}
                        alt={SITE.name}
                      />
                      <AvatarFallback className="font-display text-lg font-semibold text-primary">
                        AO
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-xl font-bold text-foreground">
                        {SITE.name}
                      </h3>
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                        {SITE.role}
                      </p>
                    </div>
                  </div>

                  {/* Institution + location summary */}
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className="text-foreground">
                      {SITE.institution}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <MapPin
                        className="h-3.5 w-3.5 text-primary"
                        aria-hidden="true"
                      />
                      {SITE.location}
                    </span>
                  </div>

                  <Separator />

                  {/* Quick facts */}
                  <div className="flex flex-col gap-1">
                    <FactRow
                      icon={GraduationCap}
                      label="Institution"
                    >
                      {SITE.institutionShort} — {SITE.institution}
                    </FactRow>
                    <FactRow icon={MapPin} label="Location">
                      {SITE.location}
                    </FactRow>
                    <FactRow
                      icon={GitFork}
                      label="GitHub"
                      href={SITE.githubUrl}
                      external
                    >
                      @{SITE.githubUsername}
                    </FactRow>
                    <FactRow
                      icon={OrcidBadge}
                      label="ORCID"
                      href={SITE.orcid}
                      external
                    >
                      {SITE.orcidId}
                    </FactRow>
                  </div>

                  <Separator />

                  {/* Availability footer */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span
                      className={cn(
                        "relative flex h-2 w-2",
                      )}
                      aria-hidden="true"
                    >
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full animate-ping rounded-full",
                          SITE.available
                            ? "bg-success/70"
                            : "bg-muted-foreground/60",
                        )}
                      />
                      <span
                        className={cn(
                          "relative inline-flex h-2 w-2 rounded-full",
                          SITE.available ? "bg-success" : "bg-muted-foreground",
                        )}
                      />
                    </span>
                    <span className="uppercase tracking-[0.2em] text-muted-foreground">
                      {SITE.available
                        ? "Open to opportunities"
                        : "Currently engaged"}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </AnimatedBorder>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
