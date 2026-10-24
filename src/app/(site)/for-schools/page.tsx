import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, CalendarDays, ClipboardCheck, Coins, GraduationCap, Link2, ScrollText, ShieldCheck, Trophy, UserPlus, Users } from "lucide-react";
import { SiteHero } from "@/components/shell/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Photo } from "@/components/ui/Photo";
import { DemoBadge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "For schools" };

const FLOW = [
  { icon: BadgeCheck, t: "Get verified", b: "Submit references, name your safeguarding lead, book a (simulated) site visit." },
  { icon: CalendarDays, t: "Set up terms & classes", b: "Branches, sessions, classes, rooms and timetables." },
  { icon: UserPlus, t: "Invite learners & guardians", b: "Each enrolment sends a guardian invitation. Accounts activate on acceptance." },
  { icon: GraduationCap, t: "Assign teachers", b: "One change updates every learner's timetable, live classes and courses." },
  { icon: ClipboardCheck, t: "Run the term", b: "Attendance, assignments, weekly checks, CA and exam scores." },
  { icon: ScrollText, t: "Publish report cards", b: "Generated from the gradebook, reviewed, then published to guardians." },
];

export default function Page() {
  return (
    <main id="main">
      <SiteHero
        tone="dark"
        eyebrow="Lumen for schools"
        title={<>One system for <em>the whole school year.</em></>}
        description="Multi-branch school management connected to e-learning, guardians and vetted tutors, designed around the Nigerian term calendar and curricula."
        aside={<Photo id="nsukka-teaching" className="hidden aspect-[4/3] rounded-3xl lg:block" sizes="40vw" />}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/school" variant="gold" size="lg">Open the school demo</ButtonLink>
          <ButtonLink href="/start/school-admin" variant="light" size="lg">Try school onboarding</ButtonLink>
        </div>
      </SiteHero>
      <section className="bg-ivory py-20">
        <div className="container-page grid gap-12">
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((f, i) => (
              <li key={f.t} className="rounded-3xl border border-line bg-paper p-6">
                <div className="flex items-center justify-between"><f.icon className="size-6 text-iris" aria-hidden /><span className="font-display text-3xl text-line">0{i + 1}</span></div>
                <h2 className="mt-4 font-sans text-lg font-bold text-ink">{f.t}</h2>
                <p className="mt-1 text-sm text-body">{f.b}</p>
              </li>
            ))}
          </ol>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { icon: Link2, t: "Linked learning", b: "School courses, live classes and weekly checks reach enrolled learners automatically, no separate LMS logins." },
              { icon: Users, t: "Guardians included", b: "Absence alerts, notices, fees and report cards in one guardian app, with consent built in." },
              { icon: Trophy, t: "Inter-school competitions", b: "Opt in to verified quiz leagues by age division with published rules and appeals." },
              { icon: Coins, t: "Fees", b: "Invoices, part-payments and reminders. Payment collection would use a licensed NGN provider (simulated here)." },
              { icon: ShieldCheck, t: "Tenant isolation", b: "Every school's records are isolated by tenant at the database level, with audited access." },
              { icon: ArrowRight, t: "Tutors when needed", b: "Guardians can add vetted tutors; school timetables automatically block clashing bookings." },
            ].map((x) => (
              <div key={x.t} className="flex gap-3 rounded-3xl bg-paper p-5"><x.icon className="mt-0.5 size-5 shrink-0 text-iris" aria-hidden /><div><h2 className="font-sans text-base font-bold text-ink">{x.t}</h2><p className="text-sm text-body">{x.b}</p></div></div>
            ))}
          </div>
          <p className="text-center text-sm text-muted">Pricing for schools is not part of this demo. <DemoBadge label="No sales contact form" /></p>
        </div>
      </section>
    </main>
  );
}
