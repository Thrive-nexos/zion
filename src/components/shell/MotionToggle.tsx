"use client";

import { setMotionPref, useMotionPref, type MotionPref } from "@/lib/demo/motion";
import { cn } from "@/lib/utils";

const OPTIONS: { id: MotionPref; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "full", label: "Full" },
  { id: "reduced", label: "Reduced" },
];

export function MotionToggle({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const pref = useMotionPref();
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">Motion preference</legend>
      <span className={cn("text-xs font-semibold", tone === "dark" ? "text-iris-soft" : "text-muted")} aria-hidden>Motion</span>
      <div className={cn("flex rounded-full p-0.5", tone === "dark" ? "bg-white/10" : "bg-sand")}>
        {OPTIONS.map((o) => (
          <label key={o.id} className={cn(
            "cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold",
            pref === o.id ? (tone === "dark" ? "bg-gold text-ink" : "bg-ink text-ivory") : tone === "dark" ? "text-iris-soft hover:text-white" : "text-muted hover:text-ink",
          )}>
            <input type="radio" name="motion-pref" value={o.id} checked={pref === o.id} onChange={() => setMotionPref(o.id)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
