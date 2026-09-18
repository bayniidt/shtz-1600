"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  as?: ElementType;
  threshold?: number;
  style?: CSSProperties;
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  threshold = 0.18,
  style,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });

  return (
    <Tag
      ref={ref}
      className={cn("reveal-init", inView && "reveal-in", className)}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </Tag>
  );
}
