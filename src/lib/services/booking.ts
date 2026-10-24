"use client";

import { z } from "zod";
import type { Booking } from "@/lib/domain/types";
import { commit, getState, nowISO, toast, uid } from "@/lib/demo/store";
import { priceFor, PRICING_RULES } from "@/lib/pricing";
import { bookingsForStudent, studentById, timetableFor, tutorOf } from "@/lib/selectors";
import { isMinor } from "@/lib/seed/people";
import { subjectById } from "@/lib/seed/catalog";
import { LIVE_CLASSES } from "@/lib/seed/learning";
import { dayOffsetOf, fmtDateTime, overlaps, watISO } from "@/lib/time";
import { naira } from "@/lib/utils";
import { DemoError, actor, guard, latency } from "./core";

export interface Conflict {
  kind: "tutor_booked" | "learner_booked" | "school_timetable" | "live_class";
  message: string;
}

/** Checks a proposed slot against the tutor's bookings, the learner's bookings, school hours and live classes. */
export function findConflicts(tutorId: string, studentId: string, startsAt: string, minutes: number, ignoreBookingId?: string): Conflict[] {
  const s = getState();
  const out: Conflict[] = [];
  const active = (b: Booking) => !["cancelled", "declined"].includes(b.status) && b.id !== ignoreBookingId;
  for (const b of s.bookings.filter((b) => b.tutorId === tutorId && active(b))) {
    if (overlaps(b.startsAt, b.minutes, startsAt, minutes)) out.push({ kind: "tutor_booked", message: `The tutor already has a session at ${fmtDateTime(b.startsAt)}.` });
  }
  for (const b of bookingsForStudent(s, studentId).filter(active)) {
    if (b.tutorId !== tutorId && overlaps(b.startsAt, b.minutes, startsAt, minutes)) {
      out.push({ kind: "learner_booked", message: `The learner has another tutoring session at ${fmtDateTime(b.startsAt)}.` });
    }
  }
  const st = studentById(s, studentId);
  if (st?.classId) {
    const day = dayOffsetOf(startsAt);
    const slots = timetableFor(st.classId).filter((t) => t.day === day);
    if (slots.length) {
      const first = slots[0].start;
      const last = slots[slots.length - 1].end;
      if (overlaps(watISO(day, first), toMin(last) - toMin(first), startsAt, minutes)) {
        out.push({ kind: "school_timetable", message: `Clashes with school hours (${first}–${last} WAT). Lessons are blocked during the school day.` });
      }
    }
    for (const lc of LIVE_CLASSES.filter((l) => l.classId === st.classId)) {
      if (overlaps(lc.startsAt, lc.minutes, startsAt, minutes)) out.push({ kind: "live_class", message: `Clashes with the live class “${lc.title}”.` });
    }
  }
  return out;
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const bookingSchema = z.object({
  tutorId: z.string(),
  studentId: z.string(),
  subjectId: z.string(),
  startsAt: z.string().min(10, "Pick a time slot"),
  minutes: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  isTrial: z.boolean(),
  goals: z.string().trim().max(300).optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export async function createBooking(input: BookingInput) {
  const p = actor();
  if (p.role !== "guardian" && p.role !== "learner") throw new DemoError("Only guardians and learners can book sessions.");
  const d = bookingSchema.parse(input);
  const s0 = getState();
  const tutor = tutorOf(s0, d.tutorId);
  const st = studentById(s0, d.studentId);
  if (!tutor || !st) throw new DemoError("Tutor or learner not found");
  if (tutor.stage !== "approved" && tutor.stage !== "probation") throw new DemoError("This tutor isn't accepting bookings.");
  if (s0.blocks.some((b) => b.blockedId === tutor.id)) throw new DemoError("You've blocked this tutor.");
  if (p.role === "guardian" && !st.guardianIds.includes(p.subjectId)) throw new DemoError("You can only book for your own children.");
  if (p.role === "learner" && st.id !== p.subjectId) throw new DemoError("Learners can only book for themselves.");
  const conflicts = findConflicts(d.tutorId, d.studentId, d.startsAt, d.minutes);
  if (conflicts.length) throw new DemoError(conflicts[0].message);
  await latency(500, 900);

  const minutes = d.isTrial ? PRICING_RULES.trialMinutes : d.minutes;
  const needsGuardian = isMinor(st) && p.role === "learner";
  const booking: Booking = {
    id: uid("bk"), tutorId: d.tutorId, studentId: d.studentId, guardianId: st.guardianIds[0] ?? null, subjectId: d.subjectId, startsAt: d.startsAt, minutes,
    isTrial: d.isTrial, status: needsGuardian ? "pending_guardian" : "awaiting_payment", price: priceFor(tutor.ratePerHourNGN, minutes, d.isTrial, tutor.trialRateNGN),
    meetingLink: null, requestedBy: p.role, createdAt: nowISO(), attendance: null, feedback: null,
    reference: `LL-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  };
  commit((s) => ({
    ...s,
    bookings: [...s.bookings, booking],
    approvals: needsGuardian ? [{
      id: uid("apr"), kind: "booking", studentId: st.id, guardianId: st.guardianIds[0], refId: booking.id,
      title: `${st.firstName} wants ${booking.isTrial ? "a trial" : "a session"} with ${tutor.name}`,
      detail: `${subjectById(d.subjectId).name} · ${fmtDateTime(d.startsAt)} WAT · ${minutes} min`, amountNGN: booking.price.total, status: "pending",
      requestedAt: nowISO(s), decidedAt: null,
    }, ...s.approvals] : s.approvals,
  }), { action: "booking.create", entity: `booking:${booking.id}`, summary: `Requested ${minutes}-min ${subjectById(d.subjectId).short} with ${tutor.name} (${booking.reference})` });
  return booking;
}

/** Simulated checkout. Never touches a payment provider. */
export async function payForBooking(bookingId: string, method: "demo_card" | "demo_transfer") {
  const p = guard("bookings.create", ["guardian", "learner"]);
  const b = getState().bookings.find((x) => x.id === bookingId);
  if (!b) throw new DemoError("Booking not found");
  if (b.status !== "awaiting_payment") throw new DemoError("This booking isn't awaiting payment.");
  await latency(900, 1500);
  const tutor = tutorOf(getState(), b.tutorId)!;
  commit((s) => ({
    ...s,
    bookings: s.bookings.map((x) => (x.id === bookingId ? { ...x, status: "confirmed", meetingLink: `https://lumen.example/room/${x.reference.toLowerCase()}` } : x)),
    expenses: b.guardianId ? [{
      id: uid("exp"), guardianId: b.guardianId, studentId: b.studentId, category: "Tutoring", label: `${tutor.name} · ${b.isTrial ? "trial" : `${b.minutes} min`} · ${b.reference}`,
      amount: b.price.total, at: nowISO(s), status: "simulated",
    }, ...s.expenses] : s.expenses,
    ledger: [...s.ledger, {
      id: uid("led"), tutorId: b.tutorId, bookingId, kind: "session_earning", amount: b.price.subtotal - b.price.trialDiscount, at: b.startsAt, status: "pending",
      memo: `Upcoming ${b.minutes} min session · ${b.reference} (held until completed)`,
    }],
  }), { action: "payment.simulated", entity: `booking:${bookingId}`, summary: `Simulated ${method === "demo_card" ? "card" : "transfer"} payment of ${naira(b.price.total)} by ${p.name}` });
}

export async function cancelBooking(bookingId: string) {
  await latency();
  commit((s) => ({
    ...s,
    bookings: s.bookings.map((x) => (x.id === bookingId ? { ...x, status: "cancelled" } : x)),
    ledger: s.ledger.filter((l) => !(l.bookingId === bookingId && l.status === "pending")),
  }), { action: "booking.cancel", entity: `booking:${bookingId}`, summary: "Booking cancelled; any simulated payment refunded" });
  toast({ tone: "info", title: "Booking cancelled", body: "Any simulated payment was refunded in full (no real money moved).", demo: true });
}

export async function joinSession(bookingId: string, who: "tutor" | "learner") {
  await latency(300, 600);
  commit((s) => ({
    ...s,
    bookings: s.bookings.map((x) => {
      if (x.id !== bookingId) return x;
      const att = x.attendance ?? { tutorJoinedAt: null, learnerJoinedAt: null, minutes: 0 };
      return { ...x, status: "in_session", attendance: { ...att, [who === "tutor" ? "tutorJoinedAt" : "learnerJoinedAt"]: x.startsAt } };
    }),
  }), { action: "session.join", entity: `booking:${bookingId}`, summary: `${who === "tutor" ? "Tutor" : "Learner"} joined the session (attendance logged)` });
}

/** Completes a session: attendance is finalised, earnings become available minus commission. */
export async function completeSession(bookingId: string) {
  await latency(500, 900);
  const b = getState().bookings.find((x) => x.id === bookingId);
  if (!b) throw new DemoError("Booking not found");
  commit((s) => ({
    ...s,
    bookings: s.bookings.map((x) => (x.id === bookingId ? {
      ...x, status: "completed",
      attendance: { tutorJoinedAt: x.attendance?.tutorJoinedAt ?? x.startsAt, learnerJoinedAt: x.attendance?.learnerJoinedAt ?? x.startsAt, minutes: x.minutes },
    } : x)),
    ledger: [
      ...s.ledger.map((l) => (l.bookingId === bookingId && l.kind === "session_earning" ? { ...l, status: "available" as const, memo: `${b.minutes} min session · ${b.reference}` } : l)),
      ...(s.ledger.some((l) => l.bookingId === bookingId && l.kind === "session_earning") ? [] : [{
        id: uid("led"), tutorId: b.tutorId, bookingId, kind: "session_earning" as const, amount: b.price.subtotal - b.price.trialDiscount, at: b.startsAt, status: "available" as const, memo: `${b.minutes} min session · ${b.reference}`,
      }]),
      { id: uid("led"), tutorId: b.tutorId, bookingId, kind: "commission", amount: -b.price.commission, at: b.startsAt, status: "available", memo: "Platform commission (15%)" },
    ],
  }), { action: "session.complete", entity: `booking:${bookingId}`, summary: `Session ${b.reference} completed; ${naira(b.price.tutorShare)} credited to tutor` });
}

export async function leaveFeedback(bookingId: string, rating: number, comment: string) {
  if (rating < 1 || rating > 5) throw new DemoError("Choose 1–5 stars");
  await latency();
  commit((s) => ({ ...s, bookings: s.bookings.map((x) => (x.id === bookingId ? { ...x, feedback: { rating, comment: comment.trim() } } : x)) }), {
    action: "session.feedback", entity: `booking:${bookingId}`, summary: `Left ${rating}-star feedback`,
  });
  toast({ tone: "success", title: "Thanks for the feedback", body: "It's shared with the tutor and used in quality reviews." });
}

export async function requestPayout(tutorId: string, amount: number) {
  guard("tutor.earnings");
  if (amount <= 0) throw new DemoError("Nothing available to pay out yet.");
  await latency(800, 1300);
  commit((s) => ({
    ...s,
    ledger: [
      ...s.ledger.map((l) => (l.tutorId === tutorId && l.status === "available" ? { ...l, status: "paid_out" as const } : l)),
      { id: uid("led"), tutorId, bookingId: null, kind: "payout", amount: -amount, at: nowISO(s), status: "paid_out", memo: "Payout to GTB •••• 2231 (simulated)" },
    ],
  }), { action: "payout.simulated", entity: `tutor:${tutorId}`, summary: `Simulated payout of ${naira(amount)}` });
  toast({ tone: "success", title: `${naira(amount)} payout requested`, body: "Simulated. Production would initiate a bank transfer via the payment provider and reconcile by webhook.", demo: true });
}

export async function updateAvailability(tutorId: string, availability: { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; start: string; end: string }[]) {
  guard("tutor.profile");
  for (const w of availability) if (w.start >= w.end) throw new DemoError("Each window must end after it starts.");
  await latency();
  commit((s) => ({ ...s, tutors: s.tutors.map((t) => (t.id === tutorId ? { ...t, availability } : t)) }), {
    action: "tutor.availability", entity: `tutor:${tutorId}`, summary: `Updated weekly availability (${availability.length} windows)`,
  });
  toast({ tone: "success", title: "Availability saved", body: "Learners see the new slots in their own time zone." });
}

export { PRICING_RULES };
