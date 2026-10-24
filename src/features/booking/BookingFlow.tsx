"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, CreditCard, Landmark, Lock, ShieldCheck } from "lucide-react";
import type { Booking } from "@/lib/domain/types";
import { useDemo, usePersona, toast } from "@/lib/demo/store";
import { createBooking, findConflicts, payForBooking } from "@/lib/services/booking";
import { run } from "@/lib/services/core";
import { switchPersona } from "@/lib/services/session";
import { isMinor } from "@/lib/seed/people";
import { subjectById } from "@/lib/seed/catalog";
import { priceFor, PRICING_RULES } from "@/lib/pricing";
import { slotsFor } from "@/lib/slots";
import { fmtDay, fmtTime, LAGOS_TZ, tzAbbrev, tzOffsetMinutes } from "@/lib/time";
import { cn, naira } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextareaField } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Misc";

type Step = "details" | "slot" | "review" | "pay" | "done";

export function BookingFlow({ slug, trial }: { slug: string; trial: boolean }) {
  const s = useDemo();
  const persona = usePersona();
  const router = useRouter();
  const tutor = s.tutors.find((t) => t.slug === slug);
  const learners = persona.role === "guardian"
    ? s.students.filter((x) => x.guardianIds.includes(persona.subjectId))
    : persona.role === "learner" ? s.students.filter((x) => x.id === persona.subjectId) : [];
  const [step, setStep] = useState<Step>("details");
  const [studentId, setStudentId] = useState(learners[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState(tutor?.subjects[0] ?? "");
  const [isTrial, setIsTrial] = useState(trial);
  const [minutes, setMinutes] = useState<30 | 60 | 90>(60);
  const [goals, setGoals] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [method, setMethod] = useState<"demo_card" | "demo_transfer">("demo_card");
  const [busy, setBusy] = useState(false);

  const length = isTrial ? PRICING_RULES.trialMinutes : minutes;
  const slots = useMemo(() => (tutor ? slotsFor(tutor, 14, length) : []), [tutor, length]);
  const byDay = useMemo(() => {
    const m = new Map<string, typeof slots>();
    slots.forEach((sl) => m.set(fmtDay(sl.startsAt), [...(m.get(fmtDay(sl.startsAt)) ?? []), sl]));
    return [...m.entries()];
  }, [slots]);

  if (!tutor) return <EmptyState title="Tutor not found" action={<ButtonLink href="/tutors" size="sm">All tutors</ButtonLink>} />;

  if (!["guardian", "learner"].includes(persona.role)) {
    return (
      <div className="mx-auto grid max-w-lg gap-4 rounded-3xl border border-line bg-paper p-6 text-center">
        <Lock className="mx-auto size-8 text-iris" aria-hidden />
        <h1 className="text-3xl text-ink">Bookings are made by guardians or learners</h1>
        <p className="text-sm text-muted">You&apos;re viewing as {persona.name}. Switch to a parent to book for a child.</p>
        <Button onClick={() => switchPersona("p-adaeze")}>Continue as Mrs Okafor (parent)</Button>
      </div>
    );
  }

  const student = learners.find((l) => l.id === studentId);
  const minorSelf = persona.role === "learner" && student && isMinor(student);
  const price = priceFor(tutor.ratePerHourNGN, length, isTrial, tutor.trialRateNGN);
  const tutorAhead = tzOffsetMinutes(tutor.timezone) - tzOffsetMinutes(LAGOS_TZ);

  const pick = (startsAt: string) => {
    const c = findConflicts(tutor.id, studentId, startsAt, length);
    if (c.length) {
      setConflictMsg(c.map((x) => x.message).join(" "));
      setSlot(null);
      return;
    }
    setConflictMsg(null);
    setSlot(startsAt);
  };

  const submit = async () => {
    if (!slot) return;
    setBusy(true);
    const b = await run(() => createBooking({ tutorId: tutor.id, studentId, subjectId, startsAt: slot, minutes: length as 30 | 60 | 90, isTrial, goals }));
    setBusy(false);
    if (!b) return;
    setBooking(b);
    if (b.status === "pending_guardian") {
      toast({ tone: "info", title: "Sent to your guardian", body: "They'll approve the time and the price before anything is booked." });
      setStep("done");
    } else setStep("pay");
  };

  const pay = async () => {
    if (!booking) return;
    setBusy(true);
    const r = await run(() => payForBooking(booking.id, method).then(() => true));
    setBusy(false);
    if (r) {
      toast({ tone: "success", title: "Booking confirmed", body: "Simulated payment, no money moved.", demo: true });
      setStep("done");
    }
  };

  const STEPS: { id: Step; label: string }[] = [
    { id: "details", label: "Details" }, { id: "slot", label: "Time" }, { id: "review", label: "Review" },
    ...(minorSelf ? [] : [{ id: "pay" as Step, label: "Payment" }]), { id: "done", label: "Done" },
  ];
  const idx = STEPS.findIndex((x) => x.id === step);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid content-start gap-6">
        <Link href={`/tutors/${tutor.slug}`} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden /> {tutor.name}</Link>
        <ol className="flex flex-wrap gap-2" aria-label="Booking steps">
          {STEPS.map((x, i) => (
            <li key={x.id} aria-current={x.id === step ? "step" : undefined} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", i === idx ? "bg-ink text-ivory" : i < idx ? "bg-leaf-wash text-leaf" : "bg-sand text-muted")}>
              {i < idx ? <Check className="size-3.5" aria-hidden /> : <span className="tabular">{i + 1}</span>}{x.label}
            </li>
          ))}
        </ol>

        {step === "details" && (
          <section className="grid gap-5 rounded-3xl border border-line bg-paper p-5 sm:p-6">
            <h1 className="text-3xl text-ink">Who is this for?</h1>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-semibold text-ink">Learner</legend>
              {learners.map((l) => (
                <label key={l.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line p-3 has-[:checked]:border-iris has-[:checked]:bg-iris-wash/60">
                  <input type="radio" name="learner" checked={studentId === l.id} onChange={() => { setStudentId(l.id); setSlot(null); }} className="accent-iris" />
                  <Avatar name={`${l.firstName} ${l.lastName}`} hue={l.avatarHue} size={36} />
                  <span><span className="block font-semibold text-ink">{l.firstName}</span><span className="text-xs text-muted">Age {l.age}{l.classId ? " · school timetable checked automatically" : ""}</span></span>
                </label>
              ))}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-ink">Subject
                <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-xl border border-line bg-paper px-3 py-2.5 font-normal">
                  {tutor.subjects.map((x) => <option key={x} value={x}>{subjectById(x).name}</option>)}
                </select>
              </label>
              <fieldset className="grid gap-1.5">
                <legend className="text-sm font-semibold text-ink">Session</legend>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" aria-pressed={isTrial} onClick={() => { setIsTrial(true); setSlot(null); }} className={cn("rounded-full px-3 py-2 text-sm font-semibold", isTrial ? "bg-ink text-ivory" : "bg-sand text-body")}>Trial · 30 min</button>
                  {([60, 90] as const).map((m) => (
                    <button key={m} type="button" aria-pressed={!isTrial && minutes === m} onClick={() => { setIsTrial(false); setMinutes(m); setSlot(null); }} className={cn("rounded-full px-3 py-2 text-sm font-semibold", !isTrial && minutes === m ? "bg-ink text-ivory" : "bg-sand text-body")}>{m} min</button>
                  ))}
                </div>
              </fieldset>
            </div>
            <TextareaField label="Goals for these sessions" optional value={goals} onChange={(e) => setGoals(e.target.value)} maxLength={300} placeholder="e.g. word problems before mock exams" hint="Shared with the tutor. Please don't include personal contact details." />
            <div><Button onClick={() => setStep("slot")} disabled={!studentId}>Choose a time</Button></div>
          </section>
        )}

        {step === "slot" && (
          <section className="grid gap-4 rounded-3xl border border-line bg-paper p-5 sm:p-6" data-tour="slot-picker">
            <div>
              <h1 className="text-3xl text-ink">Pick a time</h1>
              <p className="mt-1 text-sm text-muted">
                Times shown in <strong className="text-ink">your time zone (WAT)</strong>. {tutor.name.split(" ")[1]} is in {tutor.city}
                {tutorAhead === 0 ? ", same time as you." : ` (${tzAbbrev(tutor.timezone)}), ${Math.abs(tutorAhead / 60)} hour${Math.abs(tutorAhead) === 60 ? "" : "s"} ${tutorAhead > 0 ? "ahead of" : "behind"} you.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-paper ring-1 ring-line" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-sand" /> Conflict (tap to see why)</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {byDay.map(([day, list]) => (
                <div key={day}>
                  <p className="mb-2 text-sm font-bold text-ink">{day}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((sl) => {
                      const conflicts = findConflicts(tutor.id, studentId, sl.startsAt, length);
                      const selected = slot === sl.startsAt;
                      return (
                        <button
                          key={sl.startsAt}
                          type="button"
                          onClick={() => pick(sl.startsAt)}
                          aria-pressed={selected}
                          aria-label={`${day} ${fmtTime(sl.startsAt)} WAT${conflicts.length ? ", unavailable: " + conflicts[0].message : ""}`}
                          className={cn(
                            "rounded-xl px-3 py-2 text-sm font-semibold tabular transition-colors",
                            selected ? "bg-iris text-white" : conflicts.length ? "bg-sand text-muted line-through decoration-ember/60" : "border border-line bg-paper text-ink hover:border-iris",
                          )}
                        >
                          {fmtTime(sl.startsAt)}
                          {tutor.timezone !== LAGOS_TZ && <span className="ml-1 text-[0.65rem] font-normal opacity-70">({sl.tutorLocal} {tzAbbrev(tutor.timezone)})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {conflictMsg && <p role="alert" className="flex items-start gap-2 rounded-2xl bg-ember-wash p-3 text-sm text-ember"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />{conflictMsg}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("details")}>Back</Button>
              <Button onClick={() => setStep("review")} disabled={!slot}>Review booking</Button>
            </div>
          </section>
        )}

        {step === "review" && slot && student && (
          <section className="grid gap-4 rounded-3xl border border-line bg-paper p-5 sm:p-6">
            <h1 className="text-3xl text-ink">Review</h1>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Learner", student.firstName], ["Tutor", tutor.name], ["Subject", subjectById(subjectId).name],
                ["When (WAT)", `${fmtDay(slot)}, ${fmtTime(slot)}–${fmtTime(new Date(new Date(slot).getTime() + length * 60_000))}`],
                ...(tutor.timezone !== LAGOS_TZ ? [[`Tutor's time (${tzAbbrev(tutor.timezone)})`, `${fmtTime(slot, tutor.timezone)}`]] : []),
                ["Session", isTrial ? "Trial lesson · 30 min" : `${length} minutes`],
              ].map(([k, v]) => <div key={k} className="rounded-2xl bg-ivory p-3"><dt className="text-xs font-bold uppercase tracking-wider text-muted">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>)}
            </dl>
            {minorSelf ? (
              <p className="flex items-start gap-2 rounded-2xl bg-iris-wash p-4 text-sm text-iris-600"><ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />Because you&apos;re under 18, this request goes to your guardian first. Nothing is booked or charged until they approve.</p>
            ) : (
              <p className="flex items-start gap-2 rounded-2xl bg-sand p-4 text-sm text-body"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />Messages with the tutor happen in a thread you can read. The class link appears after payment.</p>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep("slot")}>Back</Button>
              <Button loading={busy} onClick={submit}>{minorSelf ? "Send to my guardian" : "Continue to payment"}</Button>
            </div>
          </section>
        )}

        {step === "pay" && booking && (
          <section className="grid gap-4 rounded-3xl border border-line bg-paper p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-3xl text-ink">Checkout</h1>
              <DemoBadge label="Simulated checkout" />
            </div>
            <p className="rounded-2xl border border-dashed border-amber/50 bg-amber-wash p-4 text-sm text-amber">
              No payment provider is connected. No card or bank details are collected, and no money moves. In production this step would hand off to a licensed Nigerian payment provider (e.g. Paystack or Flutterwave) and confirm by webhook.
            </p>
            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="sr-only">Payment method</legend>
              {([["demo_card", "Card (simulated)", CreditCard], ["demo_transfer", "Bank transfer (simulated)", Landmark]] as const).map(([v, l, Icon]) => (
                <label key={v} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line p-4 has-[:checked]:border-iris has-[:checked]:bg-iris-wash/60">
                  <input type="radio" name="method" checked={method === v} onChange={() => setMethod(v)} className="accent-iris" />
                  <Icon className="size-5 text-iris" aria-hidden /><span className="font-semibold text-ink">{l}</span>
                </label>
              ))}
            </fieldset>
            <Button variant="gold" size="lg" loading={busy} onClick={pay}>Pay {naira(booking.price.total)} (simulated)</Button>
          </section>
        )}

        {step === "done" && booking && (
          <section className="grid gap-4 rounded-3xl bg-ink p-6 text-white sm:p-8">
            <span className="grid size-14 place-items-center rounded-full bg-gold text-ink"><Check className="size-7" aria-hidden /></span>
            <h1 className="text-4xl">{booking.status === "pending_guardian" ? "Request sent" : "You're booked"}</h1>
            <p className="text-iris-soft">
              {booking.status === "pending_guardian"
                ? "Your guardian will see this in their Approvals. Once they approve and pay, the class link appears here."
                : `Reference ${booking.reference}. The class link, reminders and attendance are all on the booking page.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/bookings/${booking.id}`} variant="gold">View booking</ButtonLink>
              <Button variant="light" onClick={() => router.push(persona.role === "guardian" ? "/guardian/schedule" : "/learn")}>Back to {persona.role === "guardian" ? "family schedule" : "my dashboard"}</Button>
            </div>
          </section>
        )}
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-line bg-paper p-5">
          <div className="flex items-center gap-3">
            <Avatar name={tutor.name} hue={tutor.hue} size={44} />
            <div><p className="font-semibold text-ink">{tutor.name}</p><p className="text-xs text-muted">{naira(tutor.ratePerHourNGN)}/hr · {tutor.city}</p></div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            <Row k={`${isTrial ? "Trial" : `${length} min`} at ${naira(tutor.ratePerHourNGN)}/hr`} v={naira(price.subtotal)} />
            {price.trialDiscount > 0 && <Row k="Trial discount" v={`−${naira(price.trialDiscount)}`} />}
            <Row k={`Service fee (${PRICING_RULES.serviceFeeRate * 100}%, min ₦${PRICING_RULES.minServiceFee})`} v={naira(price.platformFee)} />
            <Row k="VAT on service fee (7.5%)" v={naira(price.vat)} />
            <div className="flex justify-between border-t border-hair pt-2 font-bold text-ink"><dt>Total</dt><dd className="tabular">{naira(price.total)}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted">Tutor receives {naira(price.tutorShare)} after 15% commission. Full refund if cancelled 12+ hours before.</p>
          {isTrial && <Badge tone="gold" className="mt-3">Trial lesson</Badge>}
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="font-semibold text-ink tabular">{v}</dd></div>;
}
