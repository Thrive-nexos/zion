import type { Metadata } from "next";
import Link from "next/link";
import { Check, FlaskConical, Hammer } from "lucide-react";
import { SiteHero } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "What's real in this demo" };

const WORKING = [
  "All six role portals, with role-based access enforced on every screen and service call",
  "School management: verification view, branches & terms, classes, enrolment with guardian invitations, teacher assignment, timetables, attendance, gradebook, report cards, notices, fees, analytics",
  "Automatic delivery of school lessons, teachers and live classes to enrolled learners",
  "Learner library, lessons with notes, live-class attendance, two weekly checks per subject, assignments, achievements",
  "Guardian approvals, schedule, spending, moderated messaging, report & block",
  "Tutor marketplace with filters, profiles, vetting record and sample reviews",
  "Booking with time-zone conversion, conflict checks (tutor, learner, school hours, live classes), guardian approval for minors, price breakdown",
  "Tutor qualification workflow including reviewer rubric, decision, probation and appeal",
  "Quiz tournaments with divisions, scoring, provisional/verified results, opt-in and appeals",
  "School directory with search, filters, stylised map and transparent score methodology",
  "Platform console: approvals, vetting, safety queue, moderation, disputes, content, competitions, finance (mock) and audit log",
  "Persistence in this browser (localStorage) with one-click reset; deterministic seed data",
];

const SIMULATED = [
  ["Payments & payouts", "No payment provider is connected. Checkout, fee payments, refunds and payouts update a mock ledger only."],
  ["Video classes", "Zoom / Google Meet / Lumen Room links are placeholders. Joining records attendance locally."],
  ["Identity & background checks", "Shown as “verified (simulated)”. No documents are collected or stored."],
  ["Email, SMS & push", "Invitations, reminders and alerts are shown as toasts and audit entries; nothing is sent."],
  ["Authentication", "Persona switching replaces sign-in. No passwords, MFA codes are demo-only."],
  ["File uploads", "Assignment and evidence uploads are placeholders."],
  ["Recorded lessons & intro videos", "Procedural placeholders (lesson boards, caption reels) stand in for media."],
  ["Data", "All people, schools, ratings and rankings are fictional. Data lives only in this browser."],
];

export default function Page() {
  return (
    <main id="main">
      <SiteHero eyebrow="Demo notes" title={<>What&apos;s functional, and <em>what needs a backend.</em></>} description="This is an interactive prototype. Everything below marked “working” runs end-to-end in your browser. Anything simulated carries a visible Demo label in the interface." />
      <section className="bg-ivory pb-24">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-line bg-paper p-6">
            <h2 className="flex items-center gap-2 text-2xl text-leaf"><Check className="size-6" aria-hidden /> Working in the demo</h2>
            <ul className="mt-4 grid gap-2.5 text-sm text-body">{WORKING.map((w) => <li key={w} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden />{w}</li>)}</ul>
          </div>
          <div className="rounded-3xl border border-dashed border-amber/50 bg-amber-wash/40 p-6">
            <h2 className="flex items-center gap-2 text-2xl text-amber"><FlaskConical className="size-6" aria-hidden /> Simulated</h2>
            <dl className="mt-4 grid gap-3 text-sm">{SIMULATED.map(([k, v]) => <div key={k}><dt className="font-semibold text-ink">{k}</dt><dd className="text-body">{v}</dd></div>)}</dl>
          </div>
          <div className="rounded-3xl bg-ink p-6 text-white lg:col-span-2">
            <h2 className="flex items-center gap-2 text-2xl"><Hammer className="size-6 text-gold" aria-hidden /> Production roadmap</h2>
            <ol className="mt-4 grid gap-4 text-sm text-iris-soft md:grid-cols-5">
              {[
                ["Phase 1 · Foundation", "PostgreSQL with tenant-scoped rows and row-level security; auth with guardian-linked child accounts and staff MFA; audited RBAC; API layer replacing the in-browser store."],
                ["Phase 2 · Schools", "School onboarding & verification ops, bulk import, timetables, attendance with SMS alerts via a notification worker, gradebook, report-card PDFs."],
                ["Phase 3 · Learning", "Media pipeline (transcoding, captions, low-bandwidth renditions), live classes via Zoom/Google Meet APIs with attendance webhooks, item bank for weekly checks."],
                ["Phase 4 · Marketplace", "Identity & background-check providers, payment provider integration (NGN), escrowed payouts, disputes, scheduling engine with calendar sync."],
                ["Phase 5 · Scale & trust", "Moderation classifier + human review, safeguarding case management, analytics warehouse, offline sync, accessibility audit, NDPR/NDPA compliance review."],
              ].map(([t, b]) => <li key={t}><p className="font-semibold text-gold">{t}</p><p className="mt-1">{b}</p></li>)}
            </ol>
            <p className="mt-5 text-sm text-iris-soft">The README in the project folder has the full architecture, run commands and known limitations. <Link href="/walkthrough" className="font-semibold text-gold">Try the 3-minute walkthrough →</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
