"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Tutor } from "@/lib/domain/types";
import { useReducedMotion } from "@/lib/demo/motion";
import { DemoBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Placeholder for a tutor's intro video: an animated caption reel built from
 * the tutor's script. Real tutors would upload a moderated video file.
 */
export function IntroReel({ t }: { t: Tutor }) {
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(0);
  const lines = t.intro.script;

  useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setLine((n) => {
      if (n >= lines.length - 1) {
        setPlaying(false);
        return n;
      }
      return n + 1;
    }), reduced ? 2600 : 2000);
    return () => clearInterval(i);
  }, [playing, lines.length, reduced]);

  return (
    <figure className="relative overflow-hidden rounded-lg border-2 border-ink bg-ink text-white">
      <div className="relative aspect-video" style={{ background: ["#1F5BFF", "#FF3D8B", "#00B85C", "#FF6A13"][t.hue % 4] }}>
        <div className="absolute inset-0 grid place-items-center">
          <Avatar name={t.name} hue={t.hue} size={120} className={playing && !reduced ? "animate-float" : ""} />
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-ink px-5 pb-5 pt-4">
          <p aria-live="polite" className="min-h-[3.5rem] font-display text-2xl font-extrabold leading-snug">“{lines[line]}”</p>
          <div className="mt-3 flex gap-1" aria-hidden>
            {lines.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= line ? "bg-gold" : "bg-white/20"}`} />)}
          </div>
        </figcaption>
        <span className="absolute left-3 top-3"><DemoBadge label="Intro video placeholder" /></span>
      </div>
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => { if (line >= lines.length - 1) setLine(0); setPlaying((p) => !p); }}
          className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
          aria-label={playing ? "Pause intro" : "Play intro"}
        >
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />} {playing ? "Pause" : line > 0 ? "Replay" : "Play intro"}
        </button>
        <span className="text-xs text-white/60">{t.intro.seconds}s · captions on</span>
      </div>
    </figure>
  );
}
