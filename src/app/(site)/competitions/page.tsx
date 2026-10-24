import type { Metadata } from "next";
import { SiteHero } from "@/components/shell/PageHeader";
import { TournamentList } from "@/features/competitions/CompetitionPages";

export const metadata: Metadata = { title: "Quiz tournaments" };

export default function Page() {
  return (
    <main id="main">
      <SiteHero tone="dark" eyebrow="Quiz tournaments" title={<>School versus school. <em>Fair, verified, opt-in.</em></>} description="Divisions by age, published scoring, invigilated rounds, statistical integrity checks and an independent appeal path. All schools and scores shown are fictional." />
      <section className="bg-ivory py-16">
        <div className="container-page">
          <TournamentList />
        </div>
      </section>
    </main>
  );
}
