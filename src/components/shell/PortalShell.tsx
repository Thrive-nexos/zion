"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeftRight, Clock, Lock, MoreHorizontal, PlayCircle } from "lucide-react";
import { usePersona, useHydrated, useDemo } from "@/lib/demo/store";
import { switchPersona } from "@/lib/services/session";
import { defaultPersonaFor, PERSONAS } from "@/lib/seed/people";
import { ROLE_LABEL } from "@/lib/rbac";
import { DEMO_NOW, fmtDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Logo, PageSkeleton } from "@/components/ui/Misc";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { PersonaSwitcher } from "./PersonaSwitcher";
import { PORTALS, type PortalId } from "./portal-nav";

/** Each portal has its own visual identity; these are its surface tokens. */
const THEMES: Record<PortalId, { aside: string; active: string; idle: string; label: string; main: string; dark: boolean }> = {
  learn: { aside: "bg-azure border-r-2 border-ink text-ink", active: "bg-ink text-white", idle: "text-ink hover:bg-white/60", label: "text-ink", main: "bg-white", dark: false },
  guardian: { aside: "bg-gold border-r-2 border-ink text-ink", active: "bg-ink text-white", idle: "text-ink hover:bg-white/60", label: "text-ink", main: "bg-white", dark: false },
  school: { aside: "bg-iris border-r-2 border-ink text-white", active: "bg-white text-ink", idle: "text-white/85 hover:bg-white/15 hover:text-white", label: "text-gold", main: "bg-sand", dark: true },
  teacher: { aside: "bg-tangerine border-r-2 border-ink text-ink", active: "bg-ink text-white", idle: "text-ink hover:bg-white/60", label: "text-ink", main: "bg-white", dark: false },
  tutor: { aside: "bg-pink border-r-2 border-ink text-ink", active: "bg-ink text-white", idle: "text-ink hover:bg-white/60", label: "text-ink", main: "bg-white", dark: false },
  admin: { aside: "bg-ink text-white border-r-2 border-white/10", active: "bg-gold text-ink", idle: "text-white/70 hover:bg-white/10 hover:text-white", label: "text-gold", main: "bg-[#161616] text-white/80", dark: true },
};

export function PortalShell({ portal, children }: { portal: PortalId; children: ReactNode }) {
  const cfg = PORTALS[portal];
  const theme = THEMES[portal];
  const pathname = usePathname();
  const persona = usePersona();
  const hydrated = useHydrated();
  const [more, setMore] = useState(false);
  const all = cfg.groups.flatMap((g) => g.items);
  const mobile = all.filter((i) => i.mobile).slice(0, 4);
  const isActive = (href: string) => (href === all[0].href ? pathname === href : pathname.startsWith(href));

  return (
    <div className={cn("min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]", portal === "admin" && "bg-[#161616]")} data-portal={portal} {...(theme.dark && portal === "admin" ? { "data-theme-dark": true } : {})}>
      {/* Desktop sidebar */}
      <aside className={cn("sticky top-0 hidden h-dvh flex-col overflow-y-auto px-4 py-5 lg:flex", theme.aside)} {...(theme.dark ? { "data-theme-dark": true } : {})}>
        <Link href="/" className="px-2" aria-label="Lumen Learn home"><Logo tone={theme.dark ? "light" : "dark"} /></Link>
        <p className={cn("eyebrow mt-6 px-3", theme.label)}>{cfg.name}</p>
        <nav aria-label={`${cfg.name} navigation`} className="mt-2 grid gap-4">
          {cfg.groups.map((g, gi) => (
            <div key={gi} className="grid gap-0.5">
              {g.label && <p className={cn("eyebrow px-3 pb-1 pt-2", theme.dark ? "text-white/55" : "text-ink/60")}>{g.label}</p>}
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn("flex items-center gap-3 rounded px-3 py-2 text-sm font-bold transition-colors", isActive(item.href) ? theme.active : theme.idle)}
                >
                  <item.icon className="size-[1.1rem] shrink-0" aria-hidden />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto grid gap-3 pt-6">
          <div className={cn("flex items-center gap-2 px-3 py-2 font-mono text-[0.68rem]", theme.dark ? "border border-white/25 text-white/85" : "border-2 border-ink bg-white text-ink")}>
            <Clock className="size-3.5" aria-hidden /> Demo clock: {fmtDateTime(DEMO_NOW)} WAT
          </div>
          <ButtonLink href="/walkthrough" variant={theme.dark ? "light" : "outline"} size="sm" icon={<PlayCircle className="size-4" />}>Guided demo</ButtonLink>
        </div>
      </aside>

      <div className={cn("min-w-0", theme.main)}>
        {/* Top bar */}
        <header className={cn("sticky top-0 z-40 border-b-2", portal === "admin" ? "border-white/10 bg-[#161616]" : "border-ink bg-white")}>
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="lg:hidden" aria-label="Lumen Learn home"><Logo tone={portal === "admin" ? "light" : "dark"} className="[&>span]:hidden sm:[&>span]:inline-flex" /></Link>
            <p className={cn("hidden text-sm font-extrabold uppercase tracking-tight lg:block", portal === "admin" ? "text-white" : "text-ink")}>{cfg.name}</p>
            <DemoBadge label="Demo · fictional data" className="hidden sm:inline-flex" />
            <div className="ml-auto flex items-center gap-2">
              {portal === "learn" && <LearnerSwitch />}
              <PersonaSwitcher tone={portal === "admin" ? "dark" : "light"} />
            </div>
          </div>
        </header>

        <main id="main" className="px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">
          {!hydrated ? <PageSkeleton /> : persona.role !== cfg.role ? <WrongRole portal={portal} /> : children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label={`${cfg.name} quick navigation`} className={cn("fixed inset-x-0 bottom-0 z-40 border-t-2 pb-[env(safe-area-inset-bottom)] lg:hidden", portal === "admin" ? "border-white/10 bg-[#0d0d0d]" : "border-ink bg-white")}>
        <ul className="grid grid-cols-5">
          {mobile.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-bold", isActive(item.href) ? (portal === "admin" ? "bg-gold text-ink" : "bg-ink text-white") : portal === "admin" ? "text-white/70" : "text-ink")}
              >
                <item.icon className="size-5" aria-hidden />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <button onClick={() => setMore(true)} className={cn("flex w-full flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-bold", portal === "admin" ? "text-white/70" : "text-ink")}>
              <MoreHorizontal className="size-5" aria-hidden /> More
            </button>
          </li>
        </ul>
      </nav>
      <Dialog open={more} onClose={() => setMore(false)} title={`${cfg.name} menu`}>
        <nav aria-label={`${cfg.name} full navigation`} className="grid gap-1">
          {all.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMore(false)} className={cn("flex items-center gap-3 rounded px-3 py-3 text-sm font-bold", isActive(item.href) ? "bg-ink text-white" : "text-ink hover:bg-gold")}>
              <item.icon className="size-5" aria-hidden /> {item.label}
            </Link>
          ))}
          <Link href="/walkthrough" onClick={() => setMore(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-sand"><PlayCircle className="size-5" aria-hidden /> Guided demo</Link>
        </nav>
      </Dialog>
    </div>
  );
}

function WrongRole({ portal }: { portal: PortalId }) {
  const cfg = PORTALS[portal];
  const persona = usePersona();
  const target = defaultPersonaFor(cfg.role);
  return (
    <div className="mx-auto mt-10 grid max-w-lg gap-5 rounded-3xl border border-line bg-paper p-6 text-center shadow-soft sm:p-8">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-iris-wash text-iris-600"><Lock className="size-6" aria-hidden /></div>
      <div>
        <h1 className="text-3xl text-ink">This is the {ROLE_LABEL[cfg.role].toLowerCase()} area</h1>
        <p className="mt-2 text-sm text-muted">
          You&apos;re viewing the demo as <strong className="text-ink">{persona.name}</strong> ({ROLE_LABEL[persona.role]}). Role-based access keeps each area to the people who need it, the same rule the real API would enforce.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-sand p-3 text-left">
        <Avatar name={target.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{target.name}</p>
          <p className="text-xs text-muted">{target.title}</p>
        </div>
      </div>
      <Button onClick={() => switchPersona(target.id)} icon={<ArrowLeftRight className="size-4" />}>Continue as {target.shortName}</Button>
      <p className="text-xs text-muted">Demo only: real accounts sign in with a password and, for staff and admins, a second factor.</p>
    </div>
  );
}

function LearnerSwitch() {
  const s = useDemo();
  const learners = PERSONAS.filter((p) => p.role === "learner");
  const current = learners.find((p) => p.id === s.personaId);
  if (!current) return null;
  return (
    <label className="hidden items-center gap-2 text-xs font-semibold text-muted md:flex">
      Learner
      <select
        value={current.id}
        onChange={(e) => switchPersona(e.target.value)}
        className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-semibold text-ink"
      >
        {learners.map((l) => <option key={l.id} value={l.id}>{l.shortName} · {l.title}</option>)}
      </select>
    </label>
  );
}
