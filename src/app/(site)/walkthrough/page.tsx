import type { Metadata } from "next";
import { SiteHero } from "@/components/shell/PageHeader";
import { HydrationGate } from "@/components/shell/HydrationGate";
import { WalkthroughIntro } from "@/features/walkthrough/WalkthroughIntro";

export const metadata: Metadata = { title: "3-minute guided demo" };

export default async function Page({ searchParams }: { searchParams: Promise<{ complete?: string }> }) {
  const sp = await searchParams;
  return (
    <main id="main">
      <SiteHero
        tone="dark"
        eyebrow="Guided walkthrough"
        title={<>The whole ecosystem <em>in three minutes.</em></>}
        description="Four short chapters, each on the real screens: a parent finds a vetted tutor, a learner attends and completes a check, a school assigns a teacher, and a tutor sees hourly earnings."
      />
      <section className="bg-ivory py-16">
        <div className="container-page">
          <HydrationGate>
            <WalkthroughIntro complete={sp.complete === "1"} />
          </HydrationGate>
        </div>
      </section>
    </main>
  );
}
