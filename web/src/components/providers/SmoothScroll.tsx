"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight Lenis-style smooth scrolling.
 *
 * meetsocial ships Lenis (html.lenis) with default easing; we reproduce the
 * same feel with a wheel-hijacking lerp loop and bail out entirely on touch
 * devices / reduced-motion so native momentum scrolling stays intact.
 */
export function SmoothScroll() {
  const [enabled, setEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.matchMedia("(pointer: coarse)").matches,
  );
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // Keep `enabled` reactive to preference changes after mount.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setEnabled(!mq.matches && !window.matchMedia("(pointer: coarse)").matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const doc = document.documentElement;
    target.current = window.scrollY;
    current.current = window.scrollY;

    const maxScroll = () => doc.scrollHeight - window.innerHeight;

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const frame = () => {
      current.current = lerp(current.current, target.current, 0.11);
      if (Math.abs(target.current - current.current) < 0.4) {
        current.current = target.current;
      }
      window.scrollTo(0, current.current);
      raf.current = requestAnimationFrame(frame);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      const el = event.target as HTMLElement | null;
      if (el?.closest("[data-native-scroll]")) return;
      event.preventDefault();
      target.current = Math.min(
        Math.max(target.current + event.deltaY, 0),
        maxScroll(),
      );
    };

    const syncFromNative = () => {
      if (Math.abs(window.scrollY - current.current) > 2) {
        target.current = window.scrollY;
        current.current = window.scrollY;
      }
    };

    const anchorScroll = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!href || !href.startsWith("#") || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      event.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      target.current = Math.min(Math.max(top, 0), maxScroll());
    };

    raf.current = requestAnimationFrame(frame);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", syncFromNative, { passive: true });
    document.addEventListener("click", anchorScroll);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", syncFromNative);
      document.removeEventListener("click", anchorScroll);
    };
  }, [enabled]);

  return null;
}
