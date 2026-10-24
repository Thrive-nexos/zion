import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SiteHero } from "@/components/shell/PageHeader";
import { Photo } from "@/components/ui/Photo";
import { Marketplace } from "@/features/tutors/Marketplace";

export const metadata: Metadata = { title: "Find a tutor" };

export default async function TutorsPage({ searchParams }: { searchParams: Promise<{ subject?: string; age?: string }> }) {
  const sp = await searchParams;
  return (
    <main id="main">
      <SiteHero
        eyebrow="Tutor marketplace"
        title={<>Vetted tutors, <em>hourly in naira.</em></>}
        description="Every tutor here passed identity, qualification, subject and safeguarding checks plus an observed demo class. Guardians approve every booking for under-18s."
        aside={
          <div className="relative hidden lg:block">
            <Photo id="lasu-front" className="aspect-[4/3] rounded-3xl" sizes="40vw" />
            <p className="absolute -bottom-5 left-6 flex items-center gap-2 rounded-2xl glass px-4 py-3 text-sm font-semibold text-ink shadow-soft"><ShieldCheck className="size-5 text-leaf" aria-hidden /> 6-stage vetting · probation for new tutors</p>
          </div>
        }
      />
      <section className="bg-ivory pb-24">
        <div className="container-page">
          <Marketplace initialSubject={sp.subject} initialAge={sp.age} />
        </div>
      </section>
    </main>
  );
}
