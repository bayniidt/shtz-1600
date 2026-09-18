import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase",
            tone === "light"
              ? "bg-white/10 text-white/75"
              : "bg-brand-soft text-brand",
          )}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-balance text-[clamp(1.75rem,3.2vw,3rem)] leading-[1.15] font-bold",
          tone === "light" ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-3xl text-pretty text-[15px] leading-relaxed md:text-base",
            tone === "light" ? "text-white/65" : "text-ink-3",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
