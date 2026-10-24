import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const text = tone === "dark" ? "text-ink" : "text-white";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* Mark: an open exercise book on a danfo-yellow tile with an ink keyline. */}
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="3" fill="#FFC800" stroke="#111" strokeWidth="2" />
        <path d="M7 22c3-1.4 6-1.4 9 .5 3-1.9 6-1.9 9-.5V10.5c-3-1.4-6-1.4-9 .5-3-1.9-6-1.9-9-.5z" fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 11v11.5" stroke="#111" strokeWidth="2" />
        <circle cx="25.5" cy="6.5" r="2.5" fill="#FF3D8B" stroke="#111" strokeWidth="1.5" />
      </svg>
      <span className={cn("font-display text-[1.05rem] font-black uppercase leading-none tracking-[-0.02em] [font-stretch:120%]", text)}>
        Lumen<span className={tone === "dark" ? "text-iris" : "text-gold"}>Learn</span>
      </span>
    </span>
  );
}

export function Eyebrow({ children, className, tone = "iris" }: { children: ReactNode; className?: string; tone?: "iris" | "gold" | "light" }) {
  const color = tone === "iris" ? "text-ink" : tone === "gold" ? "text-gold-600" : "text-gold";
  return (
    <p className={cn("eyebrow flex items-center gap-2", color, className)}>
      <span className={cn("inline-block h-2.5 w-2.5 shrink-0", tone === "light" ? "bg-gold" : "bg-pink")} aria-hidden />
      {children}
    </p>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 rounded-lg border-2 border-dashed border-ink/30 bg-white px-6 py-10 text-center">
      {icon && <div className="grid size-12 place-items-center rounded-md border-2 border-ink bg-gold text-ink">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="grid gap-4" role="status" aria-label="Loading">
      <SkeletonBlock className="h-10 w-2/3" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </div>
      <SkeletonBlock className="h-64" />
    </div>
  );
}

export function SectionTitle({ eyebrow, title, body, className, align = "left", tone = "dark" }: {
  eyebrow?: ReactNode; title: ReactNode; body?: ReactNode; className?: string; align?: "left" | "center"; tone?: "dark" | "light";
}) {
  return (
    <div className={cn("grid gap-3", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow && <Eyebrow tone={tone === "light" ? "light" : "iris"}>{eyebrow}</Eyebrow>}
      <h2 className={cn("text-balance text-[2.3rem] leading-[0.98] sm:text-5xl lg:text-[3.5rem]", tone === "dark" ? "text-ink" : "text-white")}>{title}</h2>
      {body && <p className={cn("max-w-2xl text-lg leading-relaxed", align === "center" && "mx-auto", tone === "dark" ? "text-muted" : "text-white/80")}>{body}</p>}
    </div>
  );
}

/** Small stat used in hero rails; intentionally typographic rather than a boxed card. */
export function Figure({ value, label, className }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-0.5", className)}>
      <span className="font-display text-3xl font-semibold text-ink tabular">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
