import type { Metadata } from "next";
import { SiteHero } from "@/components/shell/PageHeader";
import { Photo } from "@/components/ui/Photo";
import { Directory } from "@/features/directory/Directory";

export const metadata: Metadata = { title: "School directory" };

export default async function Page({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const sp = await searchParams;
  return (
    <main id="main">
      <SiteHero
        eyebrow="School discovery"
        title={<>Find a school <em>with your eyes open.</em></>}
        description="Search by city, curriculum, fees and facilities. Every score shows its formula. All schools and rankings here are fictional sample data, not authoritative."
        aside={<Photo id="kenneth-dike-library" className="hidden aspect-[4/3] rounded-3xl lg:block" sizes="40vw" alt="Patterned concrete facade of a university library in Ibadan (generic campus architecture, not a listed school)" />}
      />
      <section className="bg-ivory pb-24">
        <div className="container-page">
          <Directory initialCity={sp.city} />
        </div>
      </section>
    </main>
  );
}
