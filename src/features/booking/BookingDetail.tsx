"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Lock, Star, Video } from "lucide-react";
import { useDemo, usePersona } from "@/lib/demo/store";
import { cancelBooking, completeSession, joinSession, leaveFeedback, payForBooking } from "@/lib/services/booking";
import { run } from "@/lib/services/core";
import { studentById, tutorOf } from "@/lib/selectors";
import { subjectById } from "@/lib/seed/catalog";
import { fmtDateTime, fmtTime, tzAbbrev } from "@/lib/time";
import { cn, naira } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { TextareaField } from "@/components/ui/Field";

const ORDER = ["requested", "approved", "paid", "in_session", "completed", "feedback", "payout"] as const;

export function BookingDetail({ id }: { id: string }) {
  const s = useDemo();
  const persona = usePersona();
  const b = s.bookings.find((x) => x.id === id);
  const [busy, setBusy] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!b) return <EmptyState title="Booking not found" body="It may have been created in another browser, demo data lives only in this one." action={<ButtonLink href="/tutors" size="sm">Find a tutor</ButtonLink>} />;
  const tutor = tutorOf(s, b.tutorId)!;
  const student = studentById(s, b.studentId);
  const isGuardian = persona.role === "guardian" && b.guardianId === persona.subjectId;
  const isLearner = persona.role === "learner" && persona.subjectId === b.studentId;
  const isTutor = persona.role === "tutor" && persona.subjectId === b.tutorId;
  const isAdmin = persona.role === "platform_admin";
  if (!isGuardian && !isLearner && !isTutor && !isAdmin) {
    return <EmptyState icon={<Lock className="size-5" />} title="You don't have access to this booking" body="Only the learner, their guardian, the tutor and platform staff can view a booking." />;
  }
  const ledger = s.ledger.filter((l) => l.bookingId === b.id);
  const paidOut = ledger.some((l) => l.status === "paid_out");
  const earned = ledger.some((l) => l.kind === "session_earning" && l.status !== "pending");

  const reached = {
    requested: true,
    approved: b.status !== "pending_guardian" && b.status !== "declined",
    paid: ["confirmed", "in_session", "completed"].includes(b.status),
    in_session: ["in_session", "completed"].includes(b.status),
    completed: b.status === "completed",
    feedback: !!b.feedback,
    payout: paidOut,
  };
  const LABELS = { requested: "Requested", approved: "Guardian approved", paid: "Paid (simulated)", in_session: "Session started", completed: "Completed", feedback: "Feedback", payout: "Tutor paid out" };

  const act = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    await run(fn);
    setBusy(null);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="grid content-start gap-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-iris-600">Booking {b.reference}</p>
          <h1 className="mt-1 text-4xl text-ink">{subjectById(b.subjectId).name} with {tutor.name}</h1>
          <p className="mt-1 text-muted">For {student?.firstName} · {fmtDateTime(b.startsAt)} WAT{tutor.timezone !== "Africa/Lagos" ? ` (${fmtTime(b.startsAt, tutor.timezone)} ${tzAbbrev(tutor.timezone)} for the tutor)` : ""} · {b.minutes} min{b.isTrial ? " · trial" : ""}</p>
        </header>

        <ol className="grid gap-0 rounded-3xl border border-line bg-paper p-5" aria-label="Booking progress">
          {ORDER.map((k, i) => (
            <li key={k} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn("grid size-7 place-items-center rounded-full text-xs font-bold", reached[k] ? "bg-leaf text-white" : "bg-sand text-muted")}>{reached[k] ? <Check className="size-4" aria-hidden /> : i + 1}</span>
                {i < ORDER.length - 1 && <span className={cn("h-6 w-0.5", reached[ORDER[i + 1]] ? "bg-leaf" : "bg-line")} />}
              </div>
              <p className={cn("pt-1 text-sm", reached[k] ? "font-semibold text-ink" : "text-muted")}>{LABELS[k]}{k === "approved" && b.requestedBy === "guardian" && reached[k] ? " (booked by guardian)" : ""}<span className="sr-only">{reached[k] ? ": done" : ": not yet"}</span></p>
            </li>
          ))}
        </ol>

        {b.status === "declined" && <p className="rounded-2xl bg-sand p-4 text-sm text-muted">The guardian declined this request. Nothing was charged.</p>}
        {b.status === "cancelled" && <p className="rounded-2xl bg-sand p-4 text-sm text-muted">Cancelled. Any simulated payment was refunded.</p>}

        {["confirmed", "in_session"].includes(b.status) && (
          <section className="rounded-3xl bg-ink p-5 text-white">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold"><Video className="size-4" aria-hidden /> Class room</p>
            <p className="mt-2 break-all font-mono text-sm text-iris-soft">{b.meetingLink}</p>
            <p className="mt-1"><DemoBadge label="Placeholder link" /></p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(isLearner || isGuardian) && !b.attendance?.learnerJoinedAt && <Button variant="gold" size="sm" loading={busy === "jl"} onClick={() => act("jl", () => joinSession(b.id, "learner"))}>Join as learner</Button>}
              {isTutor && !b.attendance?.tutorJoinedAt && <Button variant="gold" size="sm" loading={busy === "jt"} onClick={() => act("jt", () => joinSession(b.id, "tutor"))}>Join as tutor</Button>}
              {isTutor && <Button variant="light" size="sm" loading={busy === "done"} onClick={() => act("done", () => completeSession(b.id))}>Mark session complete</Button>}
            </div>
            <p className="mt-3 text-xs text-white/60">Attendance: tutor {b.attendance?.tutorJoinedAt ? "joined" : "not yet"} · learner {b.attendance?.learnerJoinedAt ? "joined" : "not yet"}. Recorded automatically; sessions are not recorded on video in this demo.</p>
          </section>
        )}

        {b.status === "awaiting_payment" && isGuardian && (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gold/40 bg-gold-wash p-5">
            <p className="font-semibold text-ink">Approved, payment needed to confirm.</p>
            <Button variant="dark" loading={busy === "pay"} onClick={() => act("pay", () => payForBooking(b.id, "demo_card"))}>Pay {naira(b.price.total)} (simulated)</Button>
          </section>
        )}
        {b.status === "pending_guardian" && (
          <p className="rounded-2xl bg-iris-wash p-4 text-sm text-iris-600">Waiting for the guardian&apos;s approval. {isGuardian && <Link href="/guardian/approvals" className="font-semibold underline">Review in Approvals</Link>}</p>
        )}

        {b.status === "completed" && (isLearner || isGuardian) && !b.feedback && (
          <section className="grid gap-3 rounded-3xl border border-line bg-paper p-5">
            <h2 className="font-sans text-base font-bold text-ink">How did it go?</h2>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}><Star className={cn("size-7", n <= rating ? "fill-gold text-gold" : "text-line")} aria-hidden /></button>
              ))}
            </div>
            <TextareaField label="Comment" optional value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} />
            <div><Button loading={busy === "fb"} onClick={() => act("fb", () => leaveFeedback(b.id, rating, comment))}>Send feedback</Button></div>
          </section>
        )}
        {b.feedback && <p className="rounded-2xl bg-sand p-4 text-sm text-body">Feedback: {"★".repeat(b.feedback.rating)} {b.feedback.comment && `“${b.feedback.comment}”`}</p>}
      </div>

      <aside className="grid content-start gap-4">
        <div className="rounded-3xl border border-line bg-paper p-5">
          <div className="flex items-center gap-3"><Avatar name={tutor.name} hue={tutor.hue} size={44} /><div><Link href={`/tutors/${tutor.slug}`} className="font-semibold text-ink hover:text-iris-600">{tutor.name}</Link><p className="text-xs text-muted">{tutor.city}</p></div></div>
          <dl className="mt-4 grid gap-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Session</dt><dd className="tabular">{naira(b.price.subtotal - b.price.trialDiscount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Service fee + VAT</dt><dd className="tabular">{naira(b.price.platformFee + b.price.vat)}</dd></div>
            <div className="flex justify-between border-t border-hair pt-1.5 font-bold text-ink"><dt>Total</dt><dd className="tabular">{naira(b.price.total)}</dd></div>
            {(isTutor || isAdmin) && <div className="flex justify-between text-leaf"><dt>Tutor net</dt><dd className="tabular">{naira(b.price.tutorShare)}</dd></div>}
          </dl>
          <div className="mt-3 flex flex-wrap gap-1.5"><Badge tone={b.status === "completed" ? "neutral" : b.status === "confirmed" ? "leaf" : "amber"}>{b.status.replace("_", " ")}</Badge>{earned && <Badge tone="leaf">Earning released</Badge>}{paidOut && <Badge tone="iris">Paid out (sim.)</Badge>}</div>
        </div>
        {isGuardian && ["confirmed", "awaiting_payment"].includes(b.status) && (
          <Button variant="ghost" loading={busy === "cancel"} onClick={() => act("cancel", () => cancelBooking(b.id))}>Cancel booking</Button>
        )}
        <p className="text-xs text-muted">Messages about this booking happen in the guardian-visible thread. <Link href={isTutor ? "/tutor/messages" : "/guardian/messages"} className="font-semibold text-iris-600">Open messages</Link></p>
      </aside>
    </div>
  );
}
