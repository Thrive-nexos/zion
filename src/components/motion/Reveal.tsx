"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { effectiveReduced } from "@/lib/demo/motion";

/**
 * Fades/raises `[data-reveal]` descendants as they enter the viewport.
 * Content is visible by default (no-JS and reduced motion), so nothing is
 * ever hidden behind an animation that might not run.
 */
export function RevealGroup({ children, className, stagger = 0.08 }: { children: ReactNode; className?: string; stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || effectiveReduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      gsap.set(items, { opacity: 0, y: 28 });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger }),
      });
    }, ref);
    return () => ctx.revert();
  }, [stagger]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Scrubbed clip-path reveal: an image grows from a rounded window to full bleed. */
export function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || effectiveReduced()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { clipPath: "inset(14% 18% 14% 18%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ref.current, start: "top 85%", end: "center 45%", scrub: 0.5 } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
