"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Video } from "lucide-react";
import type { LiveClass } from "@/lib/domain/types";
import { useDemo } from "@/lib/demo/store";
import { run } from "@/lib/services/core";
import { joinLiveClass } from "@/lib/services/learning";
import { liveHost } from "@/lib/selectors";
import { fmtDateTime, relativeToDemo } from "@/lib/time";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export const PROVIDER_LABEL = { zoom: "Zoom", google_meet: "Google Meet", lumen_room: "Lumen Room" } as const;

export function LiveClassCard({ lc, studentId, compact, featured }: { lc: LiveClass; studentId: string; compact?: boolean; featured?: boolean }) {
  const s = useDemo();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const joined = s.liveJoins.some((j) => j.liveClassId === lc.id && j.studentId === studentId);
  const past = new Date(lc.startsAt).getTime() + lc.minutes * 60_000 < new Date("2026-10-27T10:00:00+01:00").getTime();

  const join = async () => {
    setBusy(true);
    await run(() => joinLiveClass(lc.id));
    setBusy(false);
    setOpen(true);
  };

  return (
    <div className={cn("rounded-3xl border p-5", featured ? "border-transparent bg-ink text-white" : "border-line bg-paper")}>
      <div className="flex items-start gap-4">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", featured ? "bg-white/10 text-gold" : "bg-azure-wash text-azure-600")}><Video className="size-5" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-bold uppercase tracking-wider", featured ? "text-gold" : "text-azure-600")}>{past ? "Recorded" : relativeToDemo(lc.startsAt)} · {PROVIDER_LABEL[lc.provider]}</p>
          <h3 className={cn("mt-0.5 font-sans text-lg font-bold leading-snug", featured ? "text-white" : "text-ink")}>{lc.title}</h3>
          <p className={cn("text-sm", featured ? "text-iris-soft" : "text-muted")}>{fmtDateTime(lc.startsAt)} WAT · {lc.minutes} min · with {liveHost(s, lc)}</p>
          {!compact && (
            <p className={cn("mt-2 flex flex-wrap items-center gap-2 break-all text-xs", featured ? "text-white/60" : "text-muted")}>
              <span className="font-mono">{lc.link}</span> <DemoBadge label="Placeholder link" />
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {past ? (
          lc.recordingAvailable ? <Button size="sm" variant={featured ? "light" : "outline"} onClick={() => setOpen(true)}>Watch recording</Button> : <span className="text-sm text-muted">No recording</span>
        ) : joined ? (
          <span className={cn("flex items-center gap-1.5 text-sm font-semibold", featured ? "text-gold" : "text-leaf")}><CheckCircle2 className="size-4" aria-hidden /> Joined, attendance recorded</span>
        ) : (
          <Button size="sm" variant={featured ? "gold" : "primary"} loading={busy} onClick={join}>Join class</Button>
        )}
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title={past ? "Recording (demo)" : "You're in! (simulated)"} description={`${PROVIDER_LABEL[lc.provider]} integration is not connected in this demo.`}>
        <div className="grid gap-4 text-sm text-body">
          <div className="grid aspect-video place-items-center rounded-2xl bg-ink text-center text-iris-soft">
            <div>
              <Video className="mx-auto size-8 text-gold" aria-hidden />
              <p className="mt-2 font-semibold text-white">{lc.title}</p>
              <p className="text-xs">Video would play here</p>
            </div>
          </div>
          <p>In production, Lumen would create the meeting through the {PROVIDER_LABEL[lc.provider]} API, open it in a new tab, and record attendance from the provider&apos;s join webhook. Here, attendance is recorded when you press Join.</p>
          <p className="inline-flex flex-wrap items-center gap-1.5 break-all text-muted">
            <ExternalLink className="size-4" aria-hidden /> <span className="font-mono">{lc.link}</span> <DemoBadge label="Not a real meeting" />
          </p>
        </div>
      </Dialog>
    </div>
  );
}
