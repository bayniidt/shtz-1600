"use client";

import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  /** Fraction of the element that must be visible. Defaults to 0.18. */
  threshold?: number;
  /** Reveal only once. Defaults to true. */
  once?: boolean;
  /** Extra root margin, e.g. "0px 0px -10% 0px". */
  rootMargin?: string;
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.18,
  once = true,
  rootMargin = "0px 0px -8% 0px",
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      // Environment without IO (very old browsers / test runners): show content.
      queueMicrotask(() => setInView(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, inView };
}
