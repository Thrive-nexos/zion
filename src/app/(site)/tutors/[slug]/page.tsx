import type { Metadata } from "next";
import { TUTORS } from "@/lib/seed/tutors";
import { TutorProfile } from "@/features/tutors/TutorProfile";
import { HydrationGate } from "@/components/shell/HydrationGate";

export function generateStaticParams() {
  return TUTORS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = TUTORS.find((x) => x.slug === slug);
  return { title: t ? `${t.name}, tutor` : "Tutor" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main id="main" className="bg-ivory pb-24 pt-24 sm:pt-28">
      <div className="container-page">
        <HydrationGate>
          <TutorProfile slug={slug} />
        </HydrationGate>
      </div>
    </main>
  );
}
