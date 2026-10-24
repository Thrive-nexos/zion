import type { Metadata } from "next";
import Image from "next/image";
import credits from "@/data/photo-credits.json";
import { SiteHero } from "@/components/shell/PageHeader";

export const metadata: Metadata = { title: "Credits" };

export default function Page() {
  return (
    <main id="main">
      <SiteHero eyebrow="Credits" title="Photo & asset credits" description="Photographs come from Wikimedia Commons under CC0, CC BY and CC BY-SA licences. Each was resized, colour-graded and re-encoded as WebP; under CC BY-SA, these adapted versions are shared under the same licence." />
      <section className="bg-ivory pb-24">
        <div className="container-page grid gap-8">
          <ul className="grid gap-4 md:grid-cols-2">
            {credits.map((c) => (
              <li key={c.id} className="flex gap-4 rounded-3xl border border-line bg-paper p-4">
                <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-sand">
                  <Image src={`/images/photos/${c.id}-800.webp`} alt={c.alt} fill sizes="112px" className="object-cover" />
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink">{c.title}</p>
                  <p className="text-body">By {c.author} · {c.licenseUrl ? <a href={c.licenseUrl} className="font-semibold text-iris-600 underline" rel="noopener noreferrer" target="_blank">{c.license}</a> : c.license}</p>
                  <p className="text-muted">Used for: {c.use}</p>
                  <p className="text-muted">Changes: {c.changes}</p>
                  <a href={c.sourceUrl} className="text-iris-600 underline" rel="noopener noreferrer" target="_blank">Source on Wikimedia Commons</a>
                </div>
              </li>
            ))}
          </ul>
          <div className="grid gap-4 rounded-3xl border border-line bg-paper p-6 text-sm text-body md:grid-cols-2">
            <div>
              <h2 className="font-sans text-base font-bold text-ink">Original work</h2>
              <p className="mt-1">The 3D learning universe, illustrations (kids and teens pathways, lesson boards), generated avatars, the stylised Nigeria map and the logo are original to this project and generated in code.</p>
            </div>
            <div>
              <h2 className="font-sans text-base font-bold text-ink">People in photos</h2>
              <p className="mt-1">We use photos of adults and campus scenes only. Children&apos;s pathways use illustrations: we don&apos;t publish photographs of identifiable children without documented guardian consent. Photos show real public events; the people pictured are not associated with Lumen and are not the fictional personas in this demo.</p>
            </div>
            <div>
              <h2 className="font-sans text-base font-bold text-ink">Fonts & libraries</h2>
              <p className="mt-1">Fraunces and Plus Jakarta Sans (SIL Open Font License) via Google Fonts. Icons: Lucide (ISC). Three.js, React Three Fiber, Drei (MIT). GSAP (Standard “No Charge” license).</p>
            </div>
            <div>
              <h2 className="font-sans text-base font-bold text-ink">Full manifest</h2>
              <p className="mt-1">See <code className="rounded bg-sand px-1">ASSET_SOURCES.md</code> in the project folder for the complete manifest, candidates considered and rejected, and the reproducible fetch script.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
