"use client";

import * as React from "react";
import { ArrowUp, Mail, Phone } from "lucide-react";
import {
  Github,
  Linkedin,
  Orcid,
  Facebook,
  Instagram,
} from "@/components/ui/brand-icons";
import { scrollToSection } from "@/lib/scroll";

import { NAV_ITEMS, SITE } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/data/social-links";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Icon mapping for social links (ORCID has no lucide icon → styled "iD"). */
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  github: <Github className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  orcid: <Orcid className="h-4 w-4" />,
};

function scrollToTop() {
  scrollToSection("hero");
}

export default function Footer() {
  const year = React.useMemo(() => new Date().getFullYear(), []);
  const quickLinks = NAV_ITEMS.filter((item) => item.id !== "hero");

  return (
    <TooltipProvider delayDuration={200}>
      <footer id="footer" className="relative mt-24 border-t border-border/60">
        {/* Glassy top hairline glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="mx-auto w-full max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
            {/* Brand + tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/70" />
                </span>
                <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {SITE.shortName}
                </span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {SITE.headline}
              </p>
              <p className="font-mono text-xs text-text-soft">
                {SITE.role} · {SITE.institutionShort}
              </p>

              {/* Social links */}
              <div className="flex items-center gap-2 pt-2">
                {SOCIAL_LINKS.map((link) => {
                  // mailto: and tel: open in the same tab.
                  const isExternal =
                    !link.href.startsWith("mailto:") &&
                    !link.href.startsWith("tel:");
                  return (
                    <Tooltip key={link.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          asChild
                          aria-label={link.label}
                        >
                          <a
                            href={link.href}
                            target={isExternal ? "_blank" : undefined}
                            rel="noopener noreferrer"
                          >
                            {SOCIAL_ICONS[link.icon]}
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{link.label}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <nav aria-label="Footer" className="space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-text-soft">
                Navigate
              </h2>
              <ul className="space-y-2">
                {quickLinks.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Channels */}
            <div className="space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-text-soft">
                Channels
              </h2>
              <ul className="space-y-2">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("mailto:") ||
                        link.href.startsWith("tel:")
                          ? undefined
                          : "_blank"
                      }
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
            <div className="text-center font-mono text-xs text-text-soft sm:text-left">
              <p>
                Built with Next.js · React Three Fiber · GSAP
              </p>
              <p className="mt-1">
                © {year} {SITE.name}. All rights reserved.
              </p>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToTop}
                  aria-label="Back to top"
                >
                  <ArrowUp className="h-4 w-4" />
                  Back to top
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scroll to top</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
