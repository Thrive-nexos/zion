import type { Metadata } from "next";
import { SiteHero } from "@/components/shell/PageHeader";
import { Photo } from "@/components/ui/Photo";
import { CourseLibrary } from "@/features/courses/CourseLibrary";

export const metadata: Metadata = { title: "Course library" };

export default async function Page({ searchParams }: { searchParams: Promise<{ age?: string }> }) {
  const sp = await searchParams;
  return (
    <main id="main">
      <SiteHero
        eyebrow="Course library"
        title={<>From Primary 4 fractions to <em>nursing refreshers.</em></>}
        description="School-linked courses arrive automatically for enrolled learners. Lumen and tutor-led courses can be joined directly, with guardian approval for under-18s."
        aside={<Photo id="library-shelf" className="hidden aspect-[4/3] rounded-3xl lg:block" sizes="40vw" />}
      />
      <section className="bg-ivory pb-24">
        <div className="container-page">
          <CourseLibrary key={sp.age ?? "all"} initialAge={sp.age} />
        </div>
      </section>
    </main>
  );
}
