import type { Metadata } from "next";
import { SiteHero } from "@/components/shell/PageHeader";
import { Photo } from "@/components/ui/Photo";
import { SCORE_WEIGHTS } from "@/lib/seed/schools";

export const metadata: Metadata = { title: "Score methodology" };

const ROWS: { key: keyof typeof SCORE_WEIGHTS; label: string; what: string; sources: string; limits: string }[] = [
  { key: "academics", label: "Academics", what: "Exam readiness relative to curriculum and intake.", sources: "Production: school-submitted, externally verifiable exam outcomes (BECE, WAEC, NECO, IGCSE). Demo: fictional.", limits: "Selective schools score higher partly because of who they admit." },
  { key: "safeguarding", label: "Safeguarding", what: "Policies, trained staff, a named lead and how concerns are handled.", sources: "Verification checklist, policy review, anonymised incident handling.", limits: "A good policy doesn't guarantee good practice; we re-verify annually." },
  { key: "teaching", label: "Teaching capacity", what: "Learners per teacher and staff training.", sources: "Staff records submitted at verification.", limits: "Says nothing about individual teachers' quality." },
  { key: "facilities", label: "Facilities", what: "Verified labs, libraries, sports, power backup and accessibility.", sources: "Verification visit checklist.", limits: "More facilities often means higher fees." },
  { key: "parentVoice", label: "Parent voice", what: "Guardian survey: communication, safety and satisfaction.", sources: "Verified guardians only, minimum response threshold. Demo: fictional.", limits: "Small samples are noisy; shown with ranges in production." },
];

export default function Page() {
  return (
    <main id="main">
      <SiteHero
        eyebrow="Transparency"
        title={<>How the Lumen school score <em>works, and doesn&apos;t.</em></>}
        description="A score can help you shortlist. It can't tell you whether a school is right for your child. Here's exactly what goes in."
        aside={<Photo id="campus-library" className="hidden aspect-[4/3] rounded-3xl lg:block" sizes="40vw" />}
      />
      <section className="bg-ivory pb-24">
        <div className="container-page grid gap-10">
          <div className="rounded-3xl bg-ink p-6 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">The formula</p>
            <p className="mt-3 font-display text-2xl leading-relaxed sm:text-3xl">
              Score = {ROWS.map((r, i) => <span key={r.key}>{i > 0 && " + "}<span className="text-gold">{SCORE_WEIGHTS[r.key] * 100}%</span> × {r.label}</span>)}
            </p>
            <p className="mt-3 text-sm text-iris-soft">Each component is 0–100. Weights are published and changes are announced 30 days ahead.</p>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-line bg-paper">
            <table className="w-full min-w-[48rem] text-sm">
              <caption className="sr-only">Score components</caption>
              <thead className="bg-ivory text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Component</th><th>Weight</th><th>What it measures</th><th>Sources</th><th>Limitations</th></tr></thead>
              <tbody>{ROWS.map((r) => <tr key={r.key} className="border-t border-hair align-top"><td className="px-4 py-3 font-semibold text-ink">{r.label}</td><td className="py-3 font-semibold tabular">{SCORE_WEIGHTS[r.key] * 100}%</td><td className="py-3 pr-4">{r.what}</td><td className="py-3 pr-4 text-muted">{r.sources}</td><td className="py-3 pr-4 text-muted">{r.limits}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { t: "What we never do", b: "Sell rankings, let schools pay for position, or rank on fees. Advertising never affects scores." },
              { t: "Corrections", b: "Schools can challenge any figure with evidence. Corrections are logged and visible on the profile." },
              { t: "In this demo", b: "Every school, score and ranking is fictional sample data and must not be treated as authoritative or as a description of any real school." },
            ].map((x) => <div key={x.t} className="rounded-3xl border border-line bg-paper p-5"><h2 className="font-sans text-base font-bold text-ink">{x.t}</h2><p className="mt-2 text-sm text-body">{x.b}</p></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}
