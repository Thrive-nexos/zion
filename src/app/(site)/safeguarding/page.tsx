import type { Metadata } from "next";
import Link from "next/link";
import { AlertOctagon, Ban, Eye, FileLock2, Lock, Megaphone, MessageSquareLock, ShieldCheck, UserCheck, Users } from "lucide-react";
import { SiteHero } from "@/components/shell/PageHeader";
import { VISIBILITY_RULES } from "@/lib/rbac";
import { MODERATION_EXAMPLES } from "@/lib/moderation";
import { ModerationPlayground } from "@/features/home/ModerationPlayground";

export const metadata: Metadata = { title: "Safeguarding" };

const PILLARS = [
  { icon: UserCheck, t: "Guardian consent", b: "Under-18 accounts activate only after a guardian approves. Bookings, paid courses, competitions and new contacts all need guardian approval." },
  { icon: Lock, t: "Role-based access", b: "Six roles, each seeing only what it needs. Every access to a child's record by staff or admins is written to an audit log." },
  { icon: MessageSquareLock, t: "Moderated, logged messaging", b: "No private chats with minors. Contact details, other apps, secrecy, meeting requests and image requests are held or blocked before delivery." },
  { icon: Ban, t: "Report & block", b: "One tap from any profile or thread. Blocking stops messages and bookings immediately." },
  { icon: AlertOctagon, t: "Escalation", b: "High-severity reports reach a Designated Safeguarding Lead within 4 hours, critical ones within 1 hour; accounts can be restricted instantly." },
  { icon: Eye, t: "No public child profiles", b: "Children never have public pages. Leaderboards show school names; learners see each other only by pseudonym." },
  { icon: Megaphone, t: "No child-targeted ads", b: "No advertising to under-18s and no use of children's data for marketing, ever." },
  { icon: FileLock2, t: "Minimal data", b: "This demo collects no real identity documents. Production stores documents encrypted, access-logged and deleted on schedule." },
];

export default function Page() {
  return (
    <main id="main">
      <SiteHero
        tone="dark"
        eyebrow="Safeguarding is non-negotiable"
        title={<>Every design decision starts with <em>the child&apos;s safety.</em></>}
        description="These rules are built into the product, not added as policy. In this demo they're enforced in the browser; in production the same rules run on the server and in the database."
      />
      <section className="bg-ivory py-20">
        <div className="container-page grid gap-12">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <li key={p.t} className="rounded-3xl border border-line bg-paper p-5">
                <p.icon className="size-6 text-iris" aria-hidden />
                <h2 className="mt-3 font-sans text-base font-bold text-ink">{p.t}</h2>
                <p className="mt-1.5 text-sm text-body">{p.b}</p>
              </li>
            ))}
          </ul>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="grid content-start gap-4">
              <h2 className="text-3xl text-ink">Who sees what</h2>
              <ul className="grid gap-2">
                {VISIBILITY_RULES.map((r) => <li key={r} className="flex gap-2 text-body"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden />{r}</li>)}
              </ul>
              <h2 className="mt-6 text-3xl text-ink">How a report is handled</h2>
              <ol className="grid gap-2 text-body">
                <li><strong>1. Received</strong>: logged with time, reporter role and target; the reporter gets an acknowledgement.</li>
                <li><strong>2. Triaged</strong>: severity set; high/critical go to the Designated Safeguarding Lead.</li>
                <li><strong>3. Protected</strong>: threads can be locked and accounts restricted while we review.</li>
                <li><strong>4. Resolved</strong>: outcome recorded; where required, authorities are contacted following Nigerian law and our policy.</li>
              </ol>
              <p className="text-sm text-muted">See it working: <Link href="/admin/safety" className="font-semibold text-iris-600">the platform safety queue</Link> and <Link href="/guardian/safety" className="font-semibold text-iris-600">the guardian report form</Link>.</p>
            </div>
            <div className="grid content-start gap-4">
              <ModerationPlayground />
              <ul className="grid gap-2 text-sm">
                {MODERATION_EXAMPLES.map((m) => <li key={m.body} className="flex justify-between gap-3 rounded-xl bg-paper px-3 py-2"><span className="text-body">“{m.body}”</span><span className="shrink-0 font-semibold text-muted">{m.note}</span></li>)}
              </ul>
              <p className="flex gap-2 rounded-2xl bg-ink p-4 text-sm text-iris-soft"><Users className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />If a child is in immediate danger, contact emergency services (112) first. This demo is not a reporting service.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
