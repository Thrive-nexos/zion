import type { Metadata } from "next";
import { SiteHero } from "@/components/shell/PageHeader";
import { HydrationGate } from "@/components/shell/HydrationGate";
import { ApplyFlow } from "@/features/tutor-vetting/ApplyFlow";

export const metadata: Metadata = { title: "Become a tutor" };

export default function Page() {
  return (
    <main id="main">
      <SiteHero
        eyebrow="Tutor qualification"
        title={<>Six stages before you <em>teach a child.</em></>}
        description="Application → evidence → subject test → safeguarding & pedagogy test → observed demo class → decision, then probation. Every step below works with simulated checks."
      />
      <section className="bg-ivory pb-24">
        <div className="container-page">
          <HydrationGate>
            <ApplyFlow />
          </HydrationGate>
        </div>
      </section>
    </main>
  );
}
