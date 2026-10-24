"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { AgeBand } from "@/lib/domain/types";
import { useDemo } from "@/lib/demo/store";
import { AGE_BANDS, SUBJECTS } from "@/lib/seed/catalog";
import { cn, naira } from "@/lib/utils";
import { EmptyState } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { SampleLabel } from "@/components/ui/Badge";
import { TutorCard } from "./TutorCard";

type Sort = "recommended" | "price_low" | "price_high" | "rating";

export function Marketplace({ initialSubject, initialAge }: { initialSubject?: string; initialAge?: string }) {
  const s = useDemo();
  const [subject, setSubject] = useState(initialSubject ?? "");
  const [age, setAge] = useState<AgeBand | "">((initialAge as AgeBand) ?? "");
  const [maxRate, setMaxRate] = useState(30000);
  const [lang, setLang] = useState("");
  const [when, setWhen] = useState<"" | "weekday_evening" | "weekend">("");
  const [diaspora, setDiaspora] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const [panel, setPanel] = useState(false);

  const languages = useMemo(() => [...new Set(s.tutors.flatMap((t) => t.languages))].sort(), [s.tutors]);
  const blocked = useMemo(() => new Set(s.blocks.map((b) => b.blockedId)), [s.blocks]);

  const list = useMemo(() => {
    const out = s.tutors.filter((t) =>
      (t.stage === "approved" || t.stage === "probation") && !blocked.has(t.id) &&
      (!subject || t.subjects.includes(subject)) && (!age || t.ageBands.includes(age)) && t.ratePerHourNGN <= maxRate &&
      (!lang || t.languages.includes(lang)) && (!diaspora || t.timezone !== "Africa/Lagos") &&
      (!when || t.availability.some((w) => (when === "weekend" ? w.day >= 5 : w.day < 5 && w.start >= "16:00"))),
    );
    const score = (t: (typeof out)[number]) => (t.featured ? 2 : 0) + t.rating + (t.stage === "approved" ? 1 : 0);
    return out.sort((a, b) =>
      sort === "price_low" ? a.ratePerHourNGN - b.ratePerHourNGN : sort === "price_high" ? b.ratePerHourNGN - a.ratePerHourNGN : sort === "rating" ? b.rating - a.rating : score(b) - score(a),
    );
  }, [s.tutors, subject, age, maxRate, lang, when, diaspora, sort, blocked]);

  const reset = () => { setSubject(""); setAge(""); setMaxRate(30000); setLang(""); setWhen(""); setDiaspora(false); };
  const active = [subject, age, lang, when].filter(Boolean).length + (maxRate < 30000 ? 1 : 0) + (diaspora ? 1 : 0);

  const filters = (
    <div className="grid gap-5" data-tour="tutor-filters">
      <fieldset>
        <legend className="text-sm font-bold text-ink">Subject</legend>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm" aria-label="Subject">
          <option value="">Any subject</option>
          {SUBJECTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold text-ink">Learner&apos;s age group</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[{ id: "" as const, label: "Any" }, ...AGE_BANDS].map((b) => (
            <button key={b.id || "any"} type="button" aria-pressed={age === b.id} onClick={() => setAge(b.id as AgeBand | "")} className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", age === b.id ? "bg-ink text-ivory" : "bg-sand text-body hover:bg-iris-wash")}>{b.label}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="flex w-full justify-between text-sm font-bold text-ink"><span>Max rate per hour</span><span className="tabular text-iris-600">{naira(maxRate)}</span></legend>
        <input type="range" min={5000} max={30000} step={500} value={maxRate} onChange={(e) => setMaxRate(Number(e.target.value))} className="mt-3 w-full accent-iris" aria-label="Maximum hourly rate in naira" />
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold text-ink">When</legend>
        <div className="mt-2 grid gap-1.5">
          {([["", "Any time"], ["weekday_evening", "Weekday evenings"], ["weekend", "Weekends"]] as const).map(([v, l]) => (
            <label key={v || "any"} className="flex items-center gap-2 text-sm text-body"><input type="radio" name="when" checked={when === v} onChange={() => setWhen(v)} className="accent-iris" />{l}</label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold text-ink">Language</legend>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm" aria-label="Language">
          <option value="">Any language</option>
          {languages.map((l) => <option key={l}>{l}</option>)}
        </select>
      </fieldset>
      <label className="flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={diaspora} onChange={(e) => setDiaspora(e.target.checked)} className="accent-iris" />Diaspora tutors (other time zones)</label>
      {active > 0 && <Button variant="ghost" size="sm" onClick={reset} icon={<X className="size-4" />}>Clear {active} filter{active > 1 ? "s" : ""}</Button>}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-3xl border border-line bg-paper p-5">{filters}</div>
      </aside>
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3" data-tour="tutor-filters">
          <p className="text-sm text-muted" aria-live="polite"><strong className="text-ink">{list.length}</strong> vetted tutor{list.length === 1 ? "" : "s"} · <SampleLabel>ratings are sample data</SampleLabel></p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setPanel((p) => !p)} aria-expanded={panel} icon={<SlidersHorizontal className="size-4" />}>Filters{active ? ` (${active})` : ""}</Button>
            <label className="flex items-center gap-2 text-sm text-muted">Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink">
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        {panel && <div className="rounded-3xl border border-line bg-paper p-5 lg:hidden">{filters}</div>}
        <div className="grid gap-4 xl:grid-cols-2">
          {list.map((t) => <TutorCard key={t.id} t={t} />)}
        </div>
        {list.length === 0 && <EmptyState title="No tutors match those filters" body="Try a higher price limit or another time of day." action={<Button size="sm" onClick={reset}>Clear filters</Button>} />}
      </div>
    </div>
  );
}
