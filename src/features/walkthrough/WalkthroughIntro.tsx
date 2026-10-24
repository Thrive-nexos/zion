"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Clock, FlaskConical, PlayCircle } from "lucide-react";
import { resetStore, useDemo } from "@/lib/demo/store";
import { Button } from "@/components/ui/Button";
import { CHAPTERS, STEPS, TOTAL_SECONDS } from "./steps";
import { startTour } from "./TourPanel";

export function WalkthroughIntro({ complete }: { complete: boolean }) {
  const { tour } = useDemo();
  const [fresh, setFresh] = useState(true);
  const chapters = Object.entries(CHAPTERS).map(([n, title]) => ({ n: Number(n), title, steps: STEPS.filter((s) => s.chapter === Number(n)) }));
  return (
    <div className="grid gap-10">
      {complete && tour.completed && (
        <div role="status" className="grid gap-4 rounded-3xl bg-ink p-6 text-white sm:p-8">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold"><CheckCircle2 className="size-5" aria-hidden /> Walkthrough complete</p>
          <h2 className="text-4xl">That was the whole loop.</h2>
          <p className="max-w-2xl text-iris-soft">A parent booked a vetted tutor, a learner attended and was assessed, a school fixed a staffing gap that flowed to every learner, and a tutor got paid by the hour. Everything you saw changed real state in this demo.</p>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden />Working: roles, approvals, scheduling & conflicts, assessment, attendance, assignments, ledger, audit log.</p>
            <p className="flex gap-2"><FlaskConical className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />Simulated: payment, payout, video links, identity checks, notifications.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Link href="/admin/audit" className="font-semibold text-gold underline-offset-4 hover:underline">See every action in the audit log →</Link></div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {chapters.map((c) => (
          <div key={c.n} className="rounded-3xl border border-line bg-paper p-5">
            <p className="font-display text-4xl font-semibold text-iris">0{c.n}</p>
            <h2 className="mt-2 font-sans text-lg font-bold text-ink">{c.title}</h2>
            <ul className="mt-3 grid gap-1.5 text-sm text-muted">{c.steps.map((s) => <li key={s.title}>• {s.title}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-paper p-5">
        <Button size="lg" variant="gold" icon={<PlayCircle className="size-5" />} onClick={() => { if (fresh) resetStore(); startTour(); }}>Start the walkthrough</Button>
        <label className="flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={fresh} onChange={(e) => setFresh(e.target.checked)} className="accent-iris" />Start from fresh demo data (recommended)</label>
        <span className="ml-auto flex items-center gap-1.5 text-sm text-muted"><Clock className="size-4" aria-hidden /> About {Math.round(TOTAL_SECONDS / 60)} minutes · {STEPS.length} steps · switches personas for you</span>
      </div>
      <p className="text-sm text-muted">Each step opens the real screen. Press <strong>Do it for me</strong>-style buttons to perform the action through the same services the interface uses, or do it yourself and press Next.</p>
    </div>
  );
}
