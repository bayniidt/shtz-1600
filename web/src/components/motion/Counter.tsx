"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: string;
  suffix?: string;
  className?: string;
}

/** Splits a display value ("4000+", "10年+") into an animated number + literal tail. */
export function Counter({ value, suffix = "", className }: CounterProps) {
  const match = value.match(/^(\d[\d,]*)(.*)$/);
  const numeric = match ? Number(match[1].replace(/,/g, "")) : null;
  const tail = match ? match[2] : "";
  const { ref, value: animated } = useCountUp(numeric ?? 0);

  if (numeric === null) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={className}>
      <span ref={ref}>{animated.toLocaleString("en-US")}</span>
      <span className={cn("tabular-nums")}>{tail}</span>
      {suffix}
    </span>
  );
}
