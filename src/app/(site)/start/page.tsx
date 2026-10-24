import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SiteHero } from "@/components/shell/PageHeader";
import { ROLE_SLUGS, type RoleSlug } from "@/features/onboarding/roles";
import { defaultPersonaFor } from "@/lib/seed/people";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = { title: "Choose a role" };

export default function StartPage() {
  return (
    <main id="main">
      <SiteHero
        eyebrow="Enter the demo"
        title={<>Who are you <em>today?</em></>}
        description="Pick a role to walk through its fictional onboarding, or jump straight into a ready-made persona. Nothing you type leaves this browser, so please don't enter real personal details."
      />
      <section className="bg-ivory pb-24">
        <ul className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(ROLE_SLUGS) as RoleSlug[]).map((slug, i) => {
            const r = ROLE_SLUGS[slug];
            const p = defaultPersonaFor(r.role);
            return (
              <li key={slug}>
                <Link href={`/start/${slug}`} className="group flex h-full flex-col rounded-3xl border border-line bg-paper p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-5xl font-semibold" style={{ color: r.accent }}>0{i + 1}</span>
                    <ArrowRight className="size-6 text-muted transition-transform group-hover:translate-x-1 group-hover:text-iris" aria-hidden />
                  </div>
                  <h2 className="mt-6 text-3xl text-ink">{r.title}</h2>
                  <p className="mt-2 text-sm text-muted">{r.tagline}</p>
                  <ul className="mt-5 grid gap-1.5 text-sm text-body">
                    {r.points.map((pt) => <li key={pt} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden />{pt}</li>)}
                  </ul>
                  <div className="mt-auto flex items-center gap-3 border-t border-hair pt-4 text-xs text-muted">
                    <Avatar name={p.name} size={32} />
                    <span>Demo persona: <strong className="text-ink">{p.name}</strong></span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
