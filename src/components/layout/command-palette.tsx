"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import {
  Search,
  CornerDownLeft,
  Moon,
  Sun,
  Mail,
  Copy,
  Check,
  Compass,
} from "lucide-react";
import { Github } from "@/components/ui/brand-icons";
import { scrollToSection } from "@/lib/scroll";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type CommandPaletteProps = {
  /** Controlled open state (page.tsx wires ⌘K to this). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CommandIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const close = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset transient palette state (search + copied flag) whenever it opens.
  React.useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset of ephemeral UI state on open
    setSearch("");
    setCopied(false);
  }, [open]);

  const goSection = (id: string) => {
    close();
    // Defer so the dialog unmounts before smooth scroll kicks in.
    setTimeout(() => scrollToSection(id), 60);
  };

  const openExternal = (url: string) => {
    close();
    setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 60);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); no-op.
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    close();
  };

  const isDark = resolvedTheme === "dark";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="overflow-hidden border-primary/20 bg-popover/90 p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search sections and quick actions. Use arrow keys to navigate, enter to
          select, escape to close.
        </DialogDescription>

        <Command
          label="Command Palette"
          className="flex flex-col"
          shouldFilter={search.trim().length > 0}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border/60 px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              placeholder="Search stations, actions…"
              className="flex h-14 w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-soft sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <Command.List
            ref={listRef}
            className="max-h-[50vh] overflow-y-auto overflow-x-hidden p-2"
          >
            <Command.Empty>
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Search className="h-6 w-6 text-muted-foreground/50" />
                <p className="font-mono text-sm text-muted-foreground">
                  No matches found.
                </p>
              </div>
            </Command.Empty>

            {/* Navigation group */}
            <Command.Group
              heading={
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-soft">
                  Stations
                </span>
              }
            >
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`go ${item.label} ${item.station} ${item.id}`}
                  onSelect={() => goSection(item.id)}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 font-mono text-sm",
                    "text-foreground/90 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary",
                    "aria-disabled:opacity-50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <CommandIcon>
                      <Compass className="h-4 w-4" />
                    </CommandIcon>
                    <span className="flex flex-col leading-tight">
                      <span>{item.label}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {item.station}
                      </span>
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-text-soft opacity-0 transition-opacity group-data-[selected=true]:opacity-100">
                    {item.index}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions group */}
            <Command.Group
              heading={
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-text-soft">
                  Actions
                </span>
              }
            >
              <Command.Item
                value={`theme toggle switch ${isDark ? "light" : "dark"} mode`}
                onSelect={toggleTheme}
                className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm text-foreground/90 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <CommandIcon>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </CommandIcon>
                Toggle theme ({isDark ? "light" : "dark"})
              </Command.Item>

              <Command.Item
                value="github open profile repository"
                onSelect={() => openExternal(SITE.githubUrl)}
                className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm text-foreground/90 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <CommandIcon>
                  <Github className="h-4 w-4" />
                </CommandIcon>
                Open GitHub
              </Command.Item>

              <Command.Item
                value="orcid open profile researcher"
                onSelect={() => openExternal(SITE.orcid)}
                className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm text-foreground/90 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <CommandIcon>
                  <span className="font-mono text-[10px] font-bold leading-none">
                    iD
                  </span>
                </CommandIcon>
                Open ORCID
              </Command.Item>

              <Command.Item
                value="copy email address clipboard contact"
                onSelect={copyEmail}
                className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm text-foreground/90 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <CommandIcon>
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </CommandIcon>
                {copied ? "Email copied" : "Copy email"}
                <span className="ml-auto truncate text-[10px] text-muted-foreground">
                  {SITE.email}
                </span>
              </Command.Item>

              <Command.Item
                value="email compose mailto contact"
                onSelect={() => {
                  close();
                  setTimeout(
                    () => (window.location.href = `mailto:${SITE.email}`),
                    60,
                  );
                }}
                className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 font-mono text-sm text-foreground/90 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <CommandIcon>
                  <Mail className="h-4 w-4" />
                </CommandIcon>
                Compose email
              </Command.Item>
            </Command.Group>

            {/* Footer hint */}
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-text-soft">
                <CornerDownLeft className="h-3 w-3" /> select
              </span>
              <span className="font-mono text-[10px] text-text-soft">
                The Neural Road
              </span>
            </div>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook that wires the global ⌘K / Ctrl+K shortcut to a CommandPalette.
 * Drop `const palette = useCommandPalette()` in page.tsx and render
 * `<CommandPalette open={palette.open} onOpenChange={palette.setOpen} />`.
 */
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen, toggle: () => setOpen((p) => !p) } as const;
}
