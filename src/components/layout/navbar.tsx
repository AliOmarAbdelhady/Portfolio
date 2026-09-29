"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Menu, Command } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";

import { cn } from "@/lib/utils";
import { scrollToSection } from "@/lib/scroll";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/data/social-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Navbar({
  onOpenCommandPalette,
}: {
  /** Open the command palette. Passed from page.tsx where CommandPalette mounts. */
  onOpenCommandPalette?: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [active, setActive] = React.useState<string>(NAV_ITEMS[0]?.id ?? "hero");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Track scroll position to toggle the blurred bar.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the active section via IntersectionObserver.
  React.useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        // Bias the root viewport so mid-page sections activate appropriately.
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    scrollToSection(id);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <motion.header
        initial={prefersReducedMotion ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border/60 bg-background/70 backdrop-blur-xl shadow-lg shadow-background/5"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
        >
          {/* Brand */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "hero")}
            className="group flex items-center gap-2.5"
            aria-label={`${SITE.name} — home`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 group-hover:opacity-90" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary/70" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-semibold tracking-tight text-foreground">
                {SITE.shortName}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                @{SITE.githubUsername}
              </span>
            </span>
          </a>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.filter((item) => item.id !== "hero").map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative rounded-md px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-0 rounded-md border border-primary/40 bg-primary/10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenCommandPalette}
                  aria-label="Open command palette"
                  className="hidden sm:inline-flex"
                >
                  <Command className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Command palette (⌘K)</TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenCommandPalette}
              aria-label="Open command palette"
              className="sm:hidden"
            >
              <Command className="h-4 w-4" />
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild aria-label="GitHub profile">
                  <a
                    href={SITE.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>GitHub</TooltipContent>
            </Tooltip>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[82vw] sm:max-w-sm">
                <SheetHeader className="space-y-3">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px] shadow-primary/70" />
                    <span className="font-display">Navigation</span>
                  </SheetTitle>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    The Neural Road
                  </p>
                </SheetHeader>

                <nav
                  aria-label="Mobile"
                  className="mt-4 flex flex-col gap-1 px-4"
                >
                  {NAV_ITEMS.map((item) => {
                    const isActive = active === item.id;
                    return (
                      <SheetClose asChild key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => handleNavClick(e, item.id)}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "flex items-baseline justify-between rounded-lg px-3 py-3 transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-surface hover:text-foreground",
                          )}
                        >
                          <span className="font-display text-sm font-medium">
                            {item.label}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                            {item.station}
                          </span>
                        </a>
                      </SheetClose>
                    );
                  })}
                </nav>

                <div className="mt-auto space-y-4 px-4 pb-8 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="flex flex-wrap gap-2">
                    {SOCIAL_LINKS.map((link) => (
                      <SheetClose asChild key={link.id}>
                        <a
                          href={link.href}
                          target={
                            link.href.startsWith("mailto:") ||
                            link.href.startsWith("tel:")
                              ? undefined
                              : "_blank"
                          }
                          rel="noopener noreferrer"
                          className="rounded-md border border-border bg-surface/50 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        {/* Animated bottom hairline when active */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />
          )}
        </AnimatePresence>
      </motion.header>
    </TooltipProvider>
  );
}
