import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, FileText, PlayCircle, Radio, Stethoscope, Target } from "lucide-react";
import { COURSES } from "@/lib/seed/learning";
import { ageBandLabel, subjectById } from "@/lib/seed/catalog";
import { TUTORS } from "@/lib/seed/tutors";
import { SCHOOLS } from "@/lib/seed/schools";
import { naira } from "@/lib/utils";
import { SiteHero } from "@/components/shell/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: COURSES.find((c) => c.slug === slug)?.title ?? "Course" };
}

const KIND_ICON = { video: PlayCircle, live: Radio, reading: FileText, practice: Target };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COURSES.find((x) => x.slug === slug);
  if (!c) notFound();
  const provider = c.provider.type === "school" ? `School-linked · ${SCHOOLS.find((s) => s.id === (c.provider as { tenantId: string }).tenantId)?.name}` : c.provider.type === "tutor" ? `Tutor-led · ${TUTORS.find((t) => t.id === (c.provider as { tutorId: string }).tutorId)?.name}` : "Lumen course";
  return (
    <main id="main">
      <SiteHero eyebrow={`${subjectById(c.subjectId).name} · ${c.level}`} title={c.title} description={c.summary}>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {c.ageBands.map((b) => <Badge key={b} tone="iris">{ageBandLabel(b)}</Badge>)}
          <Badge>{provider}</Badge>
          <Badge tone="neutral" icon={<Clock className="size-3" aria-hidden />}>{c.weeks} weeks</Badge>
        </div>
      </SiteHero>
      <section className="bg-ivory pb-24">
        <div className="container-page grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid content-start gap-6">
            {c.professional && <p className="flex gap-3 rounded-2xl border border-amber/40 bg-amber-wash p-4 text-sm text-amber"><Stethoscope className="mt-0.5 size-5 shrink-0" aria-hidden /><span><strong>{c.professional.field}:</strong> {c.professional.disclaimer}</span></p>}
            <div className="rounded-3xl border border-line bg-paper p-6">
              <h2 className="text-2xl text-ink">What you&apos;ll be able to do</h2>
              <ul className="mt-3 grid gap-2">{c.outcomes.map((o) => <li key={o} className="flex gap-2 text-body"><Target className="mt-0.5 size-4 shrink-0 text-iris" aria-hidden />{o}</li>)}</ul>
            </div>
            <div className="rounded-3xl border border-line bg-paper p-6">
              <h2 className="text-2xl text-ink">Lessons</h2>
              <ol className="mt-3 grid gap-2">
                {c.lessons.map((l, i) => {
                  const Icon = KIND_ICON[l.kind];
                  return <li key={l.id} className="flex items-center gap-3 rounded-xl bg-ivory px-3 py-2.5"><Icon className="size-4 text-iris" aria-hidden /><span className="flex-1 text-sm font-semibold text-ink">{i + 1}. {l.title}</span><span className="text-xs text-muted">{l.minutes} min</span></li>;
                })}
              </ol>
            </div>
          </div>
          <aside className="grid content-start gap-4">
            <div className="rounded-3xl border border-line bg-paper p-6">
              <p className="font-display text-4xl font-semibold text-ink">{c.priceNGN ? naira(c.priceNGN) : "Included"}</p>
              <p className="text-sm text-muted">{c.provider.type === "school" ? "Included for enrolled learners at this school" : "One-off · payment simulated in this demo"}</p>
              <div className="mt-4 grid gap-2">
                {c.provider.type === "school" ? (
                  <ButtonLink href="/learn/courses">Open as an enrolled learner</ButtonLink>
                ) : (
                  <ButtonLink href="/learn/discover">Join from the learner portal</ButtonLink>
                )}
                <ButtonLink href={`/tutors?subject=${c.subjectId}`} variant="outline">Find a tutor for {subjectById(c.subjectId).short}</ButtonLink>
              </div>
              <p className="mt-3 text-xs text-muted">Under-18s request courses; their guardian approves before anything is charged.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
