import type { ReactNode } from "react";
import { FlaskConical, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "iris" | "gold" | "azure" | "leaf" | "ember" | "amber" | "dark";

const TONES: Record<Tone, string> = {
  neutral: "bg-sand text-body",
  iris: "bg-iris-wash text-iris-600",
  gold: "bg-gold-wash text-gold-600",
  azure: "bg-azure-wash text-azure-600",
  leaf: "bg-leaf-wash text-leaf",
  ember: "bg-ember-wash text-ember",
  amber: "bg-amber-wash text-amber",
  dark: "bg-ink text-white",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold leading-5 whitespace-nowrap ring-1 ring-inset ring-ink/15", TONES[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/**
 * Marks anything simulated: payments, video links, identity checks, emails.
 * Always visible next to the control, never only in a footnote.
 */
export function DemoBadge({ label = "Demo", title, className }: { label?: string; title?: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-sm border border-dashed border-ink bg-gold px-1.5 py-px font-mono text-[0.66rem] font-semibold uppercase tracking-wide text-ink", className)}
      title={title ?? "Simulated in this demo. No real service is called."}
    >
      <FlaskConical className="size-3" aria-hidden />
      {label}
      <span className="sr-only">: {title ?? "simulated in this demo, no real service is called"}</span>
    </span>
  );
}

/** For ratings, rankings and testimonials that are fictional sample data. */
export function SampleLabel({ className, children = "Sample data" }: { className?: string; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[0.72rem] font-medium text-muted", className)}>
      <Info className="size-3" aria-hidden />
      {children}
    </span>
  );
}
