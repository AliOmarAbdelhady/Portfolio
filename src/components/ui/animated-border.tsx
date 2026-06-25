import { cn } from "@/lib/utils";

type AnimatedBorderProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

/**
 * Wraps content in a slowly-rotating conic neon border (see .animated-border
 * in globals.css). The inner layer masks the gradient so only a thin ring shows.
 */
export function AnimatedBorder({
  children,
  className,
  innerClassName,
}: AnimatedBorderProps) {
  return (
    <div className={cn("animated-border rounded-2xl", className)}>
      <div
        className={cn(
          "relative z-[2] rounded-2xl border border-transparent",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
