import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { MotionToggle } from "./MotionToggle";

const COLS = [
  { title: "Learn", links: [["/courses", "Course library"], ["/tutors", "Find a tutor"], ["/competitions", "Quiz tournaments"], ["/schools", "School directory"]] },
  { title: "Demo portals", links: [["/learn", "Learner"], ["/guardian", "Parent / guardian"], ["/school", "School admin"], ["/teacher", "Teacher"], ["/tutor", "Tutor"], ["/admin", "Platform admin"]] },
  { title: "Trust", links: [["/safeguarding", "Safeguarding"], ["/schools/methodology", "Ranking methodology"], ["/become-a-tutor", "How tutors are vetted"], ["/demo-notes", "What's real in this demo"]] },
  { title: "Project", links: [["/walkthrough", "3-minute walkthrough"], ["/for-schools", "For schools"], ["/credits", "Photo & asset credits"], ["/start", "Choose a role"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-gold text-ink">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.1fr_2fr]">
        <div className="grid content-start gap-5">
          <p className="max-w-sm text-[0.95rem] font-medium leading-relaxed">
            A Nigeria-first learning ecosystem prototype. Every school, learner, tutor, rating and ranking here is fictional sample data.
            Payments, video links, identity checks and outbound messages are simulated.
          </p>
          <p className="flex max-w-sm items-start gap-2 border-2 border-ink bg-white p-3 text-sm font-semibold shadow-hard">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            No public profiles for children. No unsupervised contact. No advertising to under-18s.
          </p>
          <MotionToggle tone="light" />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLS.map((c) => (
            <div key={c.title}>
              <h2 className="eyebrow text-ink">{c.title}</h2>
              <ul className="mt-4 grid gap-2.5 text-[0.95rem] font-semibold">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="underline-offset-4 hover:underline">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container-page overflow-hidden" aria-hidden>
        <p className="select-none whitespace-nowrap font-display text-[clamp(3.5rem,15.5vw,13rem)] font-black uppercase leading-[0.8] tracking-[-0.05em] [font-stretch:125%]">
          Lumen Learn
        </p>
      </div>
      <div className="border-t-2 border-ink bg-ink text-white">
        <div className="container-page flex flex-col gap-2 py-5 font-mono text-[0.72rem] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Lumen Learn prototype · working brand name, easily renamed</p>
          <p>Photos: Wikimedia Commons contributors (CC0 / CC BY / CC BY-SA) · <Link href="/credits" className="underline hover:text-gold">Full credits</Link></p>
        </div>
      </div>
    </footer>
  );
}
