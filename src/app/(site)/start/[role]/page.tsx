import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHero } from "@/components/shell/PageHeader";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { isRoleSlug, ROLE_SLUGS, type RoleSlug } from "@/features/onboarding/roles";

export function generateStaticParams() {
  return Object.keys(ROLE_SLUGS).map((role) => ({ role }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> {
  const { role } = await params;
  return { title: isRoleSlug(role) ? `${ROLE_SLUGS[role].title} onboarding` : "Onboarding" };
}

export default async function OnboardingPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!isRoleSlug(role)) notFound();
  const meta = ROLE_SLUGS[role as RoleSlug];
  return (
    <main id="main">
      <SiteHero eyebrow={`Onboarding · ${meta.title}`} title={meta.tagline} description="A short, fictional onboarding. Use made-up details. Nothing is sent anywhere." />
      <section className="bg-ivory pb-24">
        <div className="container-page max-w-3xl">
          <OnboardingFlow slug={role as RoleSlug} />
        </div>
      </section>
    </main>
  );
}
