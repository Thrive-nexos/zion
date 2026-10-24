"use client";

import { useState } from "react";
import type { AgeBand } from "@/lib/domain/types";
import { COURSES } from "@/lib/seed/learning";
import { AGE_BANDS } from "@/lib/seed/catalog";
import { CourseCard } from "@/components/CourseCard";
import { ButtonLink } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

export function CourseDiscovery() {
  const [band, setBand] = useState<AgeBand | "all">("all");
  const list = COURSES.filter((c) => c.provider.type !== "school" && (band === "all" || c.ageBands.includes(band))).slice(0, 6);
  return (
    <div className="grid gap-6">
      <Tabs label="Filter courses by age group" value={band} onChange={setBand} tabs={[{ id: "all" as const, label: "All ages" }, ...AGE_BANDS.map((b) => ({ id: b.id, label: b.label }))]} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {list.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
      <div>
        <ButtonLink href={band === "all" ? "/courses" : `/courses?age=${band}`} variant="outline">Browse the full library</ButtonLink>
      </div>
    </div>
  );
}
