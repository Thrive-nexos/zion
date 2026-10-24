"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, PlayCircle } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonLink } from "@/components/ui/Button";
import { canRun3D, useReducedMotion } from "@/lib/demo/motion";
import { cn } from "@/lib/utils";
import { UniversePoster } from "./UniversePoster";

const LearningUniverse = dynamic(() => import("./three/LearningUniverse"), { ssr: false });

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STAGES = [
  {
    kicker: "Built for Nigerian schools, families & tutors",
    title: (
      <>
        School. Home. Tutor.<br />
        <em>Finally on one page.</em>
      </>
    ),
    body: "One place where Nigerian schools, vetted tutors and parents work around each learner, from Primary 1 phonics to a nurse's dosing refresher.",
  },
  {
    kicker: "01 / Words",
    title: (
      <>
        Books open.<br /><em className="normal-case">ẹ ọ ṣ ụ ƙ ɗ</em> included.
      </>
    ),
    body: "English with Yorùbá, Igbo, Hausa and Pidgin, with proper diacritics rather than as an afterthought.",
  },
  {
    kicker: "02 / Practice",
    title: (
      <>
        Small wins<br /><em>stack up.</em>
      </>
    ),
    body: "Two short checks a week, every subject. Primary 4 fractions and SS 2 physics follow the same rhythm.",
  },
  {
    kicker: "03 / People",
    title: (
      <>
        Teachers, tutors, parents.<br /><em>Same page.</em>
      </>
    ),
    body: "Everyone who helps a learner sees what they need, and nothing they shouldn't. Keep scrolling to see the classroom.",
  },
];

export function Hero() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [mode, setMode] = useState<"poster" | "3d">("poster");
  const [lite, setLite] = useState(false);
  const [inView, setInView] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false);

  // Device capabilities can only be read in the browser, after hydration.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (reduced) {
      setMode("poster");
      return;
    }
    if (canRun3D()) {
      setLite(window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) < 6);
      setMode("3d");
      const t = setTimeout(() => setCanvasReady(true), 120);
      return () => clearTimeout(t);
    }
  }, [reduced]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Pause rendering when the hero is off screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useIsoLayoutEffect(() => {
    if (reduced || !section.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          progress.current = p;
          const n = STAGES.length;
          stageRefs.current.forEach((el, i) => {
            if (!el) return;
            const center = i / (n - 1);
            const dist = Math.abs(p - center) * (n - 1);
            const o = i === 0 ? Math.max(0, 1 - p * (n - 1) * 1.6) : Math.max(0, 1 - dist * 1.7);
            el.style.opacity = String(o);
            el.style.transform = `translate3d(0, ${(p - center) * -60}px, 0)`;
            el.style.visibility = o < 0.01 ? "hidden" : "visible";
            const dot = dotRefs.current[i];
            if (dot) dot.dataset.active = String(dist < 0.5);
          });
        },
      });
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section className="relative overflow-hidden border-b-2 border-ink bg-gold pt-16 text-ink" aria-labelledby="hero-title" data-header-clear>
        <UniversePoster className="absolute inset-0 size-full" />
        <div className="container-page relative grid min-h-[88svh] content-end gap-10 pb-16">
          <div className="max-w-3xl">
            <p className="eyebrow">{STAGES[0].kicker}</p>
            <h1 id="hero-title" className="mt-4 text-5xl uppercase leading-[0.9] sm:text-7xl lg:text-8xl">{STAGES[0].title}</h1>
            <p className="mt-6 max-w-xl text-lg font-medium">{STAGES[0].body}</p>
            <HeroCtas />
          </div>
          <ul className="grid gap-4 border-t-2 border-ink pt-6 sm:grid-cols-3">
            {STAGES.slice(1).map((s) => (
              <li key={s.kicker}>
                <p className="eyebrow">{s.kicker}</p>
                <p className="mt-1 text-sm font-medium">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="relative h-[420vh] border-b-2 border-ink bg-gold text-ink" aria-labelledby="hero-title" data-hero data-header-clear>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <UniversePoster className={cn("absolute inset-0 size-full transition-opacity duration-700", canvasReady && mode === "3d" ? "opacity-0" : "opacity-100")} />
        {mode === "3d" && (
          <div className={cn("absolute inset-0 z-[1] transition-opacity duration-700", canvasReady ? "opacity-100" : "opacity-0")}>
            <LearningUniverse progress={progress} active={inView} lite={lite} />
          </div>
        )}
        <div className="grid-paper pointer-events-none absolute inset-0 opacity-60" aria-hidden />

        <div className="container-page pointer-events-none relative z-[2] flex h-full items-end pb-16 pt-20 sm:pb-24 sm:pt-24">
          <div className="relative w-full max-w-[52rem]">
            {STAGES.map((s, i) => (
              <div
                key={i}
                ref={(el) => { stageRefs.current[i] = el; }}
                className={cn(i === 0 ? "relative" : "absolute inset-x-0 bottom-0")}
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
                aria-hidden={i !== 0 ? true : undefined}
              >
                <p className="eyebrow inline-block bg-ink px-2 py-1 text-gold">{s.kicker}</p>
                {i === 0 ? (
                  <h1 id="hero-title" className="mt-4 text-balance text-[clamp(2.2rem,min(7vw,9.5svh),6.2rem)] uppercase leading-[0.88]">{s.title}</h1>
                ) : (
                  <p className="mt-4 font-display text-[clamp(2.1rem,min(6.6vw,9svh),5.6rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] [font-stretch:116%]">{s.title}</p>
                )}
                <p className="mt-4 max-w-xl bg-gold/80 text-base font-medium leading-relaxed sm:mt-6 sm:text-xl">{s.body}</p>
                {i === 0 && <HeroCtas />}
              </div>
            ))}
          </div>
        </div>

        <ol className="absolute right-4 top-1/2 z-[2] hidden -translate-y-1/2 gap-3 sm:grid" aria-hidden>
          {["Start", "Words", "Practice", "People"].map((l, i) => (
            <li key={l} className="flex items-center justify-end gap-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink/60">
              {l}
              <span ref={(el) => { dotRefs.current[i] = el; }} data-active={i === 0} className="size-2.5 border-2 border-ink bg-transparent transition-all data-[active=true]:h-7 data-[active=true]:bg-ink" />
            </li>
          ))}
        </ol>
        <div className="absolute bottom-5 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-1 font-mono text-[0.7rem] font-semibold uppercase text-ink/70" aria-hidden>
          Scroll
          <ArrowDown className="size-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

function HeroCtas() {
  return (
    <div className="pointer-events-auto mt-6 flex flex-wrap gap-3 sm:mt-8">
      <ButtonLink href="/walkthrough" variant="primary" className="shadow-[4px_4px_0_0_#FF3D8B] sm:h-14 sm:px-7 sm:text-base" icon={<PlayCircle className="size-5" />}>
        Watch the 3-minute demo
      </ButtonLink>
      <ButtonLink href="/start" variant="outline" className="sm:h-14 sm:px-7 sm:text-base">
        Choose a role & explore
      </ButtonLink>
    </div>
  );
}
