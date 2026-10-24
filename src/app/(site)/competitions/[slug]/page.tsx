import type { Metadata } from "next";
import { SiteHero } from "@/components/shell/PageHeader";
import { HydrationGate } from "@/components/shell/HydrationGate";
import { TournamentDetail } from "@/features/competitions/CompetitionPages";
import { TOURNAMENTS } from "@/lib/seed/community";

export function generateStaticParams() {
  return TOURNAMENTS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: TOURNAMENTS.find((t) => t.slug === slug)?.title ?? "Tournament" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TOURNAMENTS.find((x) => x.slug === slug);
  return (
    <main id="main">
      <SiteHero tone="dark" eyebrow={t?.season ?? "Tournament"} title={t?.title ?? "Tournament not found"} description={t ? `Subjects: ${t.subjects.join(", ")}.` : undefined} />
      <section className="bg-ivory py-16">
        <div className="container-page">
          <HydrationGate>
            <TournamentDetail slug={slug} />
          </HydrationGate>
        </div>
      </section>
    </main>
  );
}
