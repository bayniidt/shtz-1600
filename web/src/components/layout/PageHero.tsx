import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20",
        className,
      )}
    >
      <div aria-hidden className="grain-grid absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[640px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(30,150,212,.22) 0%, rgba(242,242,242,0) 66%)",
        }}
      />
      <div className="container-x relative">
        {eyebrow ? (
          <Reveal className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] text-brand uppercase">
            <span className="size-1.5 rounded-full bg-brand" />
            {eyebrow}
          </Reveal>
        ) : null}
        <Reveal delay={60}>
          <h1 className="mt-5 max-w-4xl text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.12] font-bold text-ink">
            {title}
          </h1>
        </Reveal>
        {description ? (
          <Reveal delay={120}>
            <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-3">
              {description}
            </p>
          </Reveal>
        ) : null}
        {actions ? (
          <Reveal delay={180} className="mt-9 flex flex-wrap gap-4">
            {actions}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
