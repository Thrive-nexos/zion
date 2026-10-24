"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, Route, X } from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import { setTour, switchPersona } from "@/lib/services/session";
import { run } from "@/lib/services/core";
import { personaById } from "@/lib/seed/people";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CHAPTERS, resolveRoute, STEPS, TOTAL_SECONDS } from "./steps";

export function startTour() {
  setTour({ active: true, step: 0, startedAt: Date.now(), completed: false });
}

export function TourPanel() {
  const { tour } = useDemo();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [elapsed, setElapsed] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const step = STEPS[tour.step];

  // Navigate + switch persona when the step changes.
  useEffect(() => {
    if (!tour.active || !step) return;
    switchPersona(step.persona);
    const target = resolveRoute(step);
    if (window.location.pathname + window.location.search !== target) router.push(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.active, tour.step]);

  // Highlight the step's target once it renders.
  useEffect(() => {
    if (!tour.active || !step?.target) return;
    let el: Element | null = null;
    const t = setInterval(() => {
      // Prefer a visible match (responsive layouts may render a target twice).
      const all = [...document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`)];
      el = all.find((n) => n.offsetParent !== null) ?? null;
      if (el) {
        el.setAttribute("data-tour-active", "true");
        el.scrollIntoView({ block: "center", behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth" });
        clearInterval(t);
      }
    }, 150);
    const stop = setTimeout(() => clearInterval(t), 30000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
      document.querySelectorAll("[data-tour-active]").forEach((n) => n.removeAttribute("data-tour-active"));
    };
  }, [tour.active, tour.step, pathname, step?.target]);

  useEffect(() => {
    if (!tour.active || !tour.startedAt) return;
    const i = setInterval(() => setElapsed(Math.round((Date.now() - tour.startedAt!) / 1000)), 1000);
    return () => clearInterval(i);
  }, [tour.active, tour.startedAt]);

  if (!tour.active || !step) return null;

  const go = (n: number) => {
    if (n >= STEPS.length) {
      setTour({ active: false, completed: true });
      router.push("/walkthrough?complete=1");
      return;
    }
    setTour({ step: Math.max(0, n) });
  };

  const doAction = async () => {
    if (!step.action) return;
    setBusy(true);
    const next = await run(step.action.run);
    setBusy(false);
    setDone((d) => ({ ...d, [tour.step]: true }));
    if (typeof next === "string") router.push(next);
  };

  const persona = personaById(step.persona);
  const pct = ((tour.step + 1) / STEPS.length) * 100;
  const mm = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

  return (
    <aside
      aria-label="Guided demo walkthrough"
      className={cn(
        "fixed inset-x-2 bottom-2 z-[80] rounded-lg border-2 border-ink bg-ink text-white shadow-[6px_6px_0_0_#FFC800] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[25rem]",
      )}
    >
      <div className="h-1 overflow-hidden rounded-t-3xl bg-white/10">
        <div className="h-full bg-gold transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold">
            <Route className="size-3.5" aria-hidden /> Chapter {step.chapter} · {CHAPTERS[step.chapter]}
          </p>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[0.7rem] tabular text-iris-soft" title="Target: 3 minutes">
              <Clock className="size-3" aria-hidden /> {mm(elapsed)} / {mm(TOTAL_SECONDS)}
            </span>
            <button onClick={() => setCollapsed((c) => !c)} className="rounded-full px-2 py-1 text-xs text-iris-soft hover:bg-white/10" aria-expanded={!collapsed}>
              {collapsed ? "Show" : "Hide"}
            </button>
            <button onClick={() => setTour({ active: false })} className="rounded-full p-1.5 text-iris-soft hover:bg-white/10 hover:text-white" aria-label="Exit walkthrough">
              <X className="size-4" />
            </button>
          </div>
        </div>
        {!collapsed && (
          <>
            <h2 className="mt-2 font-display text-xl leading-tight text-white" aria-live="polite">{step.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-iris-soft">{step.body}</p>
            <p className="mt-2 text-xs text-white/60">Viewing as <strong className="text-white/90">{persona?.name}</strong> · {persona?.title}</p>
          </>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="light" size="sm" onClick={() => go(tour.step - 1)} disabled={tour.step === 0} icon={<ChevronLeft className="size-4" />}>
            Back
          </Button>
          {step.action && (
            <Button variant="gold" size="sm" onClick={doAction} loading={busy} disabled={done[tour.step]}>
              {done[tour.step] ? "Done ✓" : step.action.label}
            </Button>
          )}
          <Button variant="primary" size="sm" className="ml-auto" onClick={() => go(tour.step + 1)}>
            {tour.step === STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[0.7rem] text-white/50 tabular">Step {tour.step + 1} of {STEPS.length}</span>
          <DemoBadge label="Guided demo" className="border-gold/40 bg-white/5 text-gold" />
        </div>
      </div>
    </aside>
  );
}
