"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type TransitionEvent } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/cta-button";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import type { FlowSectionContent } from "@/types";

/**
 * Scroll-driven radial wheel for the Flow Ai section.
 *
 * Mechanism reverse-engineered from meetsocial.com's home page `.ind_r4`
 * block (see `docs/research/BEHAVIORS.md`):
 *
 *  - a tall track (100vh + N steps) holds a `sticky` 100vh stage;
 *  - scroll progress picks a node index, and the rotor snaps so that node
 *    rotates to the 12 o'clock position (`.flow-rotor` transform);
 *  - every node carries its own counter-rotation (`360 - i * step`), so while
 *    a node is in the middle of the journey its badge tilts, and once active
 *    its content is perfectly upright;
 *  - the active node fades its detail panel in, the others stay hidden.
 */
const STEP_VH = 60;

function toPoints(raw?: string): string[] {
  return (raw ?? "")
    .split(/[/\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function FlowSection({ content }: { content: FlowSectionContent }) {
  const features = content.features;
  const count = Math.max(features.length, 1);
  const step = 360 / count;
  const [active, setActive] = useState(0);
  const [robotRotation, setRobotRotation] = useState(360);
  const trackRef = useRef<HTMLElement | null>(null);
  const settled = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const sync = () => {
      const distance = track.offsetHeight - window.innerHeight;
      if (distance <= 0) return;
      const progress = Math.min(
        Math.max(-track.getBoundingClientRect().top / distance, 0),
        1,
      );
      const index = Math.min(count - 1, Math.round(progress * (count - 1)));
      if (index !== settled.current) {
        settled.current = index;
        setActive(index);
      }
    };

    // Deferred so the effect body itself stays free of synchronous renders.
    queueMicrotask(sync);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [count]);

  const handleRotorTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    setRobotRotation(360 - active * step);
  };

  return (
    <section
      ref={trackRef}
      className="flow-wheel relative bg-brand-soft/70"
      style={{ height: `calc(100vh + ${count * STEP_VH}vh)` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div aria-hidden className="grain-grid absolute inset-0 opacity-70" />
        <div
          aria-hidden
          className="absolute top-[57%] left-1/2 size-[var(--wheel)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(235,52,7,.14),rgba(235,52,7,0)_62%)]"
        />

        <Reveal className="absolute top-[7vh] left-[5vw] z-3 w-[84vw] md:w-[26vw] lg:w-[min(38vw,36ch)]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
            <span className="size-1.5 rounded-full bg-current" />
            {content.eyebrow}
          </span>
          <h2 className="mt-4 text-[clamp(1.5rem,3vw,2.75rem)] leading-[1.15] font-bold text-balance text-ink">
            {content.title}
          </h2>
          <p className="mt-4 hidden text-[14px] leading-relaxed text-ink-3 md:block">
            {content.description}
          </p>
        </Reveal>

        {/* rotor: dotted ring + node spokes + orbit diamonds */}
        <div className="absolute top-[57%] left-1/2 size-[var(--wheel)] -translate-x-1/2 -translate-y-1/2">
          <div
            aria-hidden
            className="absolute inset-[15%] rounded-full border border-dashed border-brand/15"
          />

          <div
            className="flow-rotor absolute inset-0 size-full"
            style={{ transform: `rotate(${-360 + active * step}deg)` }}
            onTransitionEnd={handleRotorTransitionEnd}
          >
            <div
              aria-hidden
              className="flow-robot absolute inset-[26%] overflow-hidden rounded-full opacity-[0.16] mix-blend-multiply"
              style={{ transform: `rotate(${robotRotation}deg)` }}
            >
              <Image
                src={assetPath("/shtz/robot.jpg")}
                alt=""
                fill
                sizes="(min-width: 1024px) 36vw, 72vw"
                className="scale-[1.16] object-cover"
              />
            </div>

            <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full text-brand/30">
              <circle
                cx="50"
                cy="50"
                r="49"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.45"
                strokeDasharray="0.05 2.45"
                strokeLinecap="round"
              />
            </svg>

            {features.map((feature, i) => (
              <span
                key={`orbit-${feature.title}`}
                aria-hidden
                className="absolute bottom-1/2 left-1/2 h-1/2 w-px origin-bottom"
                style={{ transform: `rotate(${360 - i * step + step / 2}deg)` }}
              >
                <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-brand/40" />
              </span>
            ))}

            {features.map((feature, i) => {
              const isActive = i === active;
              const points = toPoints(feature.points);

              return (
                <div
                  key={feature.title}
                  data-active={isActive}
                  className="flow-node absolute bottom-1/2 left-1/2 h-1/2 w-px origin-bottom"
                  style={{ transform: `rotate(${360 - i * step}deg)` }}
                >
                  <div className="absolute top-0 left-1/2 flex w-[min(80vw,64vh)] -translate-x-1/2 flex-col items-center">
                    <span className="flow-index grid size-7 place-items-center rounded-full border border-line bg-white/90 text-[11px] font-semibold text-ink-4 tabular-nums transition-colors duration-500">
                      {i + 1}
                    </span>
                    <span aria-hidden className="mt-1 h-2.5 w-px bg-line" />
                    <span aria-hidden className="block h-[4.5vh] w-px bg-line" />

                    <div className="flow-panel flex flex-col items-center">
                      {feature.mark ? (
                        <span className="mt-3 rounded-full border border-brand/25 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-brand uppercase">
                          {feature.mark}
                        </span>
                      ) : null}
                      <CtaButton href={content.cta.href} size="md" className="mt-4 rounded-full">
                        {feature.title}
                      </CtaButton>
                      <p className="mt-4 max-w-[52vh] text-center text-[13px] leading-relaxed text-ink-2 md:text-[14px]">
                        {feature.description}
                      </p>
                      {points.length > 0 ? (
                        <ul className="mt-5 flex max-w-[58vh] flex-wrap items-start justify-center gap-x-6 gap-y-2.5">
                          {points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-2 text-[12px] leading-snug text-ink-2 md:text-[13px]"
                            >
                              <span
                                aria-hidden
                                className="mt-[5px] size-1.5 shrink-0 rotate-45 bg-brand/60"
                              />
                              {point}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-[5vh] z-3 flex items-end justify-between gap-6 px-[5vw]">
          <div className="flex flex-col gap-4">
            <CtaButton href={content.cta.href} size="lg">
              {content.cta.label}
              <Arrow />
            </CtaButton>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold tracking-[0.18em] text-ink-4 tabular-nums">
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <span aria-hidden className="h-px w-24 bg-line md:w-40">
                <span
                  className="block h-px bg-brand transition-[width] duration-500 ease-[var(--ease-brand)]"
                  style={{ width: `${((active + 1) / count) * 100}%` }}
                />
              </span>
            </div>
          </div>

          <ul className="hidden flex-wrap justify-end gap-2 md:flex">
            {content.orbit.map((item) => (
              <li
                key={item.label}
                className="rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[12px] font-medium text-ink-3"
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-4 transition-transform duration-300 group-hover:translate-x-1")}
      aria-hidden="true"
    >
      <path
        d="M2 8h11M9 3.5 13.5 8 9 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
