import Link from "next/link";
import { Clock, Globe2, ShieldCheck, Star } from "lucide-react";
import type { Tutor } from "@/lib/domain/types";
import { ageBandLabel, subjectById } from "@/lib/seed/catalog";
import { tzAbbrev } from "@/lib/time";
import { naira } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SampleLabel } from "@/components/ui/Badge";

export function TutorCard({ t }: { t: Tutor }) {
  const checks = [t.credentials.identity, t.credentials.qualification, t.credentials.subjectTest.status, t.credentials.safeguarding.status, t.credentials.demoClass.status, t.credentials.backgroundCheck];
  const passed = checks.filter((c) => c === "passed" || c === "simulated_pass").length;
  return (
    <Link href={`/tutors/${t.slug}`} className="group grid gap-4 rounded-3xl border border-line bg-paper p-5 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <Avatar name={t.name} hue={t.hue} size={60} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-sans text-lg font-bold text-ink group-hover:text-iris-600">{t.name}</h3>
          <p className="text-sm text-body">{t.headline}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1"><Globe2 className="size-3.5" aria-hidden />{t.city} · {tzAbbrev(t.timezone)}</span>
            <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />Replies in ~{t.responseHours}h</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold text-ink tabular">{naira(t.ratePerHourNGN)}</p>
          <p className="text-xs text-muted">per hour</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {t.subjects.map((s) => <Badge key={s} tone="iris">{subjectById(s).name}</Badge>)}
        {t.ageBands.map((b) => <Badge key={b} tone="neutral">{ageBandLabel(b)}</Badge>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hair pt-3">
        {t.stage === "probation" ? (
          <Badge tone="amber" icon={<ShieldCheck className="size-3" aria-hidden />}>On probation · observed sessions</Badge>
        ) : (
          <Badge tone="leaf" icon={<ShieldCheck className="size-3" aria-hidden />}>{passed}/6 checks passed</Badge>
        )}
        <span className="flex items-center gap-1 text-sm font-semibold text-ink"><Star className="size-4 fill-gold text-gold" aria-hidden />{t.rating.toFixed(1)} <SampleLabel>({t.reviewCount} sample reviews)</SampleLabel></span>
      </div>
      <p className="text-xs text-muted">Trial: {naira(t.trialRateNGN)} for 30 min</p>
    </Link>
  );
}
