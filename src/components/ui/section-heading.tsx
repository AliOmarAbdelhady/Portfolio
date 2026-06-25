import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  index: string;
  station: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

/**
 * Station-style section heading: mono index + station label, big display title,
 * optional subtitle. Pairs with the "station" navigation concept.
 */
export function SectionHeading({
  index,
  station,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">
        <span className="text-glow">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
        <span>{station}</span>
      </div>
      <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base text-muted-foreground md:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
