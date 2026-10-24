"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { leaderboard } from "@/lib/selectors";
import { Tabs } from "@/components/ui/Tabs";
import { SampleLabel } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function HomeLeaderboard() {
  const s = useDemo();
  const t = s.tournaments.find((x) => x.id === "trn-harmattan")!;
  const [div, setDiv] = useState(t.divisions[1].id);
  const rows = leaderboard(s, t, div).slice(0, 5);
  return (
    <div className="rounded-3xl glass-dark p-5 text-white sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Live · {t.title}</p>
          <p className="text-sm text-iris-soft">Round 1, verified results only</p>
        </div>
        <Tabs variant="dark" label="Division" value={div} onChange={setDiv} tabs={t.divisions.map((d) => ({ id: d.id, label: `${d.name} ${d.ages}` }))} />
      </div>
      <ol className="mt-5 grid gap-2">
        {rows.map((r) => (
          <li key={r.schoolId} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5", r.rank === 1 ? "bg-gold/15" : "bg-white/5")}>
            <span className={cn("grid size-8 place-items-center rounded-full text-sm font-bold tabular", r.rank === 1 ? "bg-gold text-ink" : "bg-white/10")}>{r.rank}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{r.school.name}</span>
              <span className="text-xs text-iris-soft">{r.school.city}</span>
            </span>
            <span className="font-display text-xl tabular">{r.points}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <SampleLabel className="text-iris-soft">Fictional schools and scores</SampleLabel>
        <Link href={`/competitions/${t.slug}`} className="text-sm font-semibold text-gold hover:underline">Full leaderboard & rules →</Link>
      </div>
    </div>
  );
}
