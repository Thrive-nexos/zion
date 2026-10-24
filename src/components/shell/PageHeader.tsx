import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Header for pages inside a portal. Typography-led; actions sit on the right. */
export function PageHeader({ eyebrow, title, description, actions, className, dark }: {
  eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string; dark?: boolean;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 pb-5", dark ? "border-white/15" : "border-ink", className)}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow && (
          <p className={cn("eyebrow flex items-center gap-2", dark ? "text-gold" : "text-muted")}>
            <span className={cn("inline-block size-2.5", dark ? "bg-gold" : "bg-pink")} aria-hidden />
            {eyebrow}
          </p>
        )}
        <h1 className={cn("mt-2 text-balance text-3xl leading-[1.02] sm:text-[2.6rem]", dark ? "text-white" : "text-ink")}>{title}</h1>
        {description && <p className={cn("mt-2 text-[0.95rem] leading-relaxed", dark ? "text-white/70" : "text-muted")}>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Banner for public (site) pages that sit below the fixed header.
 * "light" is white graph paper; "dark" is a full electric-blue block.
 */
export function SiteHero({ eyebrow, title, description, children, tone = "light", aside }: {
  eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; children?: ReactNode; tone?: "light" | "dark"; aside?: ReactNode;
}) {
  const blue = tone === "dark";
  return (
    <section className={cn("relative overflow-hidden border-b-2 border-ink pb-14 pt-28 sm:pb-20 sm:pt-36", blue ? "bg-iris text-white" : "grid-paper bg-white")}>
      <div className={cn("container-page relative grid gap-10", !!aside && "lg:grid-cols-[1.4fr_1fr] lg:items-end")}>
        <div>
          {eyebrow && (
            <p className={cn("eyebrow flex items-center gap-2", blue ? "text-white" : "text-ink")}>
              <span className={cn("inline-block size-2.5", blue ? "bg-gold" : "bg-pink")} aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className={cn("mt-4 max-w-5xl text-balance text-[2.6rem] leading-[0.95] sm:text-6xl lg:text-[4.6rem]", blue ? "text-white [--marker:#FFC800]" : "text-ink")}>{title}</h1>
          {description && <p className={cn("mt-6 max-w-2xl text-lg leading-relaxed", blue ? "text-white/85" : "text-muted")}>{description}</p>}
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}

/** A plain bordered surface. Portals style their own content; this is only the shared frame. */
export function Panel({ title, action, children, className, dark, id }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; dark?: boolean; id?: string }) {
  return (
    <section id={id} className={cn("rounded-lg border-2 p-5 sm:p-6", dark ? "border-white/15 bg-[#1a1a1a] text-white/80" : "border-ink bg-white", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className={cn("font-sans text-base font-extrabold tracking-tight", dark ? "text-white" : "text-ink")}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
