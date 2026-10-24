"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Ban, BookOpenCheck, CheckCircle2, CircleDashed, FileText, Flag, Globe2, Languages, NotebookPen, PlayCircle, ShieldCheck, Star, Users } from "lucide-react";
import type { CheckStatus } from "@/lib/domain/types";
import { useDemo, usePersona } from "@/lib/demo/store";
import { blockUser, reportConcern } from "@/lib/services/guardian";
import { run } from "@/lib/services/core";
import { ageBandLabel, subjectById } from "@/lib/seed/catalog";
import { REVIEWS } from "@/lib/seed/tutors";
import { slotsFor } from "@/lib/slots";
import { fmtDate, fmtDay, fmtTime, LAGOS_TZ, tzAbbrev, WEEKDAYS_LONG } from "@/lib/time";
import { naira } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, DemoBadge, SampleLabel } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { IntroReel } from "./IntroReel";

const STATUS: Record<CheckStatus, { label: string; tone: "leaf" | "amber" | "ember" | "neutral" }> = {
  passed: { label: "Passed", tone: "leaf" },
  simulated_pass: { label: "Verified (simulated)", tone: "leaf" },
  pending: { label: "Pending", tone: "amber" },
  failed: { label: "Failed", tone: "ember" },
  not_started: { label: "Not started", tone: "neutral" },
};

const PORTFOLIO_ICON = { worksheet: FileText, lesson_plan: NotebookPen, student_project: BookOpenCheck, video_note: PlayCircle };

export function TutorProfile({ slug }: { slug: string }) {
  const s = useDemo();
  const persona = usePersona();
  const t = s.tutors.find((x) => x.slug === slug);
  const [tz, setTz] = useState<string>(LAGOS_TZ);
  if (!t) return <EmptyState title="Tutor not found" action={<ButtonLink href="/tutors" size="sm">All tutors</ButtonLink>} />;
  const reviews = REVIEWS.filter((r) => r.tutorId === t.id);
  const blocked = s.blocks.some((b) => b.blockerId === persona.subjectId && b.blockedId === t.id);
  const preview = slotsFor(t, 7).slice(0, 8);
  const c = t.credentials;
  const checks: { label: string; status: CheckStatus; detail: string }[] = [
    { label: "Identity", status: c.identity, detail: "Government ID matched via an identity provider. Simulated in this demo, no documents collected." },
    { label: "Qualifications", status: c.qualification, detail: t.qualifications.join(" · ") },
    { label: "Subject test", status: c.subjectTest.status, detail: c.subjectTest.score !== null ? `${c.subjectTest.score}% (pass mark 70%)` : "—" },
    { label: "Safeguarding test", status: c.safeguarding.status, detail: c.safeguarding.score !== null ? `${c.safeguarding.score}% (pass mark 80%)` : "—" },
    { label: "Observed demo class", status: c.demoClass.status, detail: c.demoClass.score !== null ? `Rubric ${c.demoClass.score}% across 5 criteria` : "—" },
    { label: "Background check", status: c.backgroundCheck, detail: "Police/enhanced check reference recorded. Simulated." },
  ];

  return (
    <div className="grid gap-8">
      <Link href="/tutors" className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden /> All tutors</Link>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-8">
          <header className="flex flex-wrap items-start gap-5">
            <Avatar name={t.name} hue={t.hue} size={88} ring />
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl text-ink sm:text-5xl">{t.name}</h1>
              <p className="mt-1 text-lg text-body">{t.headline}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
                <span className="flex items-center gap-1"><Globe2 className="size-4" aria-hidden />{t.city} · {tzAbbrev(t.timezone)}</span>
                <span className="flex items-center gap-1"><Languages className="size-4" aria-hidden />{t.languages.join(", ")}</span>
                <span className="flex items-center gap-1"><Users className="size-4" aria-hidden />{t.sessionsTaught.toLocaleString()} sessions · {t.yearsExperience} yrs</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.subjects.map((x) => <Badge key={x} tone="iris">{subjectById(x).name}</Badge>)}
                {t.ageBands.map((b) => <Badge key={b}>{ageBandLabel(b)}</Badge>)}
                {t.stage === "probation" && <Badge tone="amber">On probation</Badge>}
              </div>
            </div>
          </header>

          <IntroReel t={t} />

          <section aria-labelledby="about">
            <h2 id="about" className="text-2xl text-ink">About</h2>
            <p className="mt-2 text-[1.02rem] leading-relaxed text-body">{t.bio}</p>
            <ul className="mt-4 flex flex-wrap gap-2">{t.specialties.map((x) => <li key={x} className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-body">{x}</li>)}</ul>
          </section>

          <section aria-labelledby="vetting" data-tour="vetting-record" className="rounded-3xl border border-line bg-paper p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="vetting" className="flex items-center gap-2 text-2xl text-ink"><ShieldCheck className="size-6 text-leaf" aria-hidden /> Vetting record</h2>
              <Link href="/become-a-tutor" className="text-sm font-semibold text-iris-600 hover:underline">How vetting works</Link>
            </div>
            <ul className="mt-4 grid gap-2">
              {checks.map((ck) => (
                <li key={ck.label} className="flex items-start gap-3 rounded-2xl bg-ivory p-3">
                  {ck.status === "passed" || ck.status === "simulated_pass" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden /> : <CircleDashed className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">{ck.label} <Badge tone={STATUS[ck.status].tone}>{STATUS[ck.status].label}</Badge></p>
                    <p className="text-sm text-muted">{ck.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            {t.stage === "probation" && <p className="mt-3 text-sm text-amber">New tutor: the first 10 sessions are observed and reviewed before full approval.</p>}
          </section>

          <section aria-labelledby="portfolio">
            <h2 id="portfolio" className="text-2xl text-ink">Portfolio</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {t.portfolio.map((p, i) => {
                const Icon = PORTFOLIO_ICON[p.kind];
                return (
                  <li key={p.title} className="overflow-hidden rounded-3xl border border-line bg-paper">
                    <div className="grid h-28 place-items-center" style={{ background: ["#FFF3BF", "#DDF7E8", "#FFE3EF", "#E7EDFF"][i % 4] }}>
                      <Icon className="size-9 text-ink/70" aria-hidden />
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-iris-600">{p.kind.replace("_", " ")}</p>
                      <p className="font-semibold text-ink">{p.title}</p>
                      <p className="text-sm text-muted">{p.summary}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-muted">Portfolio items are fictional samples. Learner work is only shown with guardian consent and anonymised.</p>
          </section>

          <section aria-labelledby="reviews">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="reviews" className="text-2xl text-ink">Reviews</h2>
              <SampleLabel>All reviews are fictional sample data</SampleLabel>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted"><Star className="size-4 fill-gold text-gold" aria-hidden /><strong className="text-ink">{t.rating.toFixed(1)}</strong> average from {t.reviewCount} sample reviews · only verified bookings can review</p>
            <ul className="mt-4 grid gap-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-line bg-paper p-4">
                  <p className="flex items-center gap-1 text-sm" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-4 ${i < r.rating ? "fill-gold text-gold" : "text-line"}`} aria-hidden />)}</p>
                  <p className="mt-2 text-body">“{r.body}”</p>
                  <p className="mt-1 text-xs text-muted">{r.author} · {fmtDate(r.date)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-line bg-paper p-5 shadow-soft">
            <p className="font-display text-4xl font-semibold text-ink tabular">{naira(t.ratePerHourNGN)}<span className="font-sans text-base font-medium text-muted"> / hour</span></p>
            <p className="text-sm text-muted">Trial lesson: {naira(t.trialRateNGN)} for 30 minutes</p>
            <div className="mt-4 grid gap-2">
              {blocked ? (
                <p className="rounded-xl bg-sand p-3 text-sm text-muted">You&apos;ve blocked this tutor.</p>
              ) : (
                <>
                  <ButtonLink href={`/book/${t.slug}`} size="lg" variant="primary">Book a session</ButtonLink>
                  <ButtonLink href={`/book/${t.slug}?trial=1`} variant="outline">Book a 30-min trial</ButtonLink>
                </>
              )}
            </div>
            <p className="mt-3 text-xs text-muted">Under-18s need a guardian&apos;s approval. Payment is simulated in this demo. <DemoBadge /></p>
          </div>

          <div className="rounded-3xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-sans text-base font-bold text-ink">Next available</h2>
              <select value={tz} onChange={(e) => setTz(e.target.value)} className="rounded-lg border border-line bg-paper px-2 py-1 text-xs" aria-label="Show times in time zone">
                <option value={LAGOS_TZ}>WAT (Lagos)</option>
                <option value="Europe/London">London</option>
                <option value="America/Toronto">Toronto</option>
                <option value="America/New_York">New York</option>
              </select>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {preview.map((sl) => (
                <li key={sl.startsAt} className="rounded-xl bg-ivory px-3 py-2 text-sm"><span className="block text-xs text-muted">{fmtDay(sl.startsAt, tz)}</span><span className="font-semibold text-ink tabular">{fmtTime(sl.startsAt, tz)} {tzAbbrev(tz)}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Tutor&apos;s own hours ({tzAbbrev(t.timezone)}): {t.availability.map((w) => `${WEEKDAYS_LONG[w.day].slice(0, 3)} ${w.start}–${w.end}`).join(" · ")}</p>
          </div>

          {persona.role === "guardian" && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" icon={<Flag className="size-4" />} onClick={() => run(() => reportConcern({ category: "tutor_conduct", subject: `Concern about ${t.name}`, detail: "Raised from the tutor profile by a guardian.", targetLabel: `Tutor · ${t.name}` }))}>Report</Button>
              <Button size="sm" variant="ghost" disabled={blocked} icon={<Ban className="size-4" />} onClick={() => run(() => blockUser(t.id, t.name))}>{blocked ? "Blocked" : "Block"}</Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
