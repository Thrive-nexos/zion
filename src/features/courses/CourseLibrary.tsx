"use client";

import { useState } from "react";
import type { AgeBand } from "@/lib/domain/types";
import { COURSES } from "@/lib/seed/learning";
import { AGE_BANDS } from "@/lib/seed/catalog";
import { CourseCard } from "@/components/CourseCard";
import { Tabs } from "@/components/ui/Tabs";

export function CourseLibrary({ initialAge }: { initialAge?: string }) {
  const [band, setBand] = useState<AgeBand | "all">(AGE_BANDS.some((b) => b.id === initialAge) ? (initialAge as AgeBand) : "all");
  const [source, setSource] = useState<"all" | "platform" | "school" | "tutor">("all");
  const list = COURSES.filter((c) => (band === "all" || c.ageBands.includes(band)) && (source === "all" || c.provider.type === source));
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs label="Age group" value={band} onChange={setBand} tabs={[{ id: "all" as const, label: "All ages" }, ...AGE_BANDS.map((b) => ({ id: b.id, label: `${b.label} · ${b.ages}` }))]} />
        <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} aria-label="Course source" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm">
          <option value="all">All sources</option><option value="platform">Lumen courses</option><option value="school">School-linked (examples)</option><option value="tutor">Tutor-led</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">{list.map((c) => <CourseCard key={c.id} course={c} />)}</div>
    </div>
  );
}
