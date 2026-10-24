import type { Metadata } from "next";
import { HydrationGate } from "@/components/shell/HydrationGate";
import { SchoolProfile } from "@/features/directory/Directory";
import { SCHOOLS } from "@/lib/seed/schools";

export function generateStaticParams() {
  return SCHOOLS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: SCHOOLS.find((s) => s.slug === slug)?.name ?? "School" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main id="main" className="bg-ivory pb-24 pt-24 sm:pt-28">
      <div className="container-page">
        <HydrationGate>
          <SchoolProfile slug={slug} />
        </HydrationGate>
      </div>
    </main>
  );
}
