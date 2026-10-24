"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, RotateCcw, Users } from "lucide-react";
import { resetStore, toast, useDemo, useHydrated } from "@/lib/demo/store";
import { switchPersona } from "@/lib/services/session";
import { PERSONAS } from "@/lib/seed/people";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/rbac";
import { Avatar } from "@/components/ui/Avatar";
import { Dialog } from "@/components/ui/Dialog";
import { DemoBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function PersonaSwitcher({ tone = "light", compact }: { tone?: "light" | "dark"; compact?: boolean }) {
  const s = useDemo();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const current = PERSONAS.find((p) => p.id === s.personaId)!;

  const choose = (id: string) => {
    switchPersona(id);
    const p = PERSONAS.find((x) => x.id === id)!;
    setOpen(false);
    router.push(ROLE_HOME[p.role]);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-semibold transition-colors",
          tone === "light" ? "border-line bg-paper text-ink hover:border-iris" : "border-white/20 bg-white/10 text-white hover:bg-white/20",
        )}
        aria-haspopup="dialog"
        aria-label={`Demo persona: ${current.name}. Switch persona`}
      >
        <Avatar name={current.name} size={28} />
        {!compact && <span className="hidden max-w-[9rem] truncate sm:inline">{hydrated ? current.shortName : "Demo"}</span>}
        <Users className="size-4 opacity-60" aria-hidden />
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Switch demo persona"
        description="Each persona is fictional and sees only what their role allows. Switching is instant, there are no passwords in this demo."
        wide
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {PERSONAS.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => choose(p.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors hover:border-iris hover:bg-iris-wash/50",
                  p.id === current.id ? "border-iris bg-iris-wash/60" : "border-line bg-paper",
                )}
              >
                <Avatar name={p.name} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-semibold text-ink">
                    {p.name} {p.id === current.id && <Check className="size-4 text-iris" aria-label="current" />}
                  </span>
                  <span className="block text-xs font-semibold text-iris-600">{ROLE_LABEL[p.role]} · {p.title}</span>
                  <span className="mt-1 block text-xs leading-snug text-muted">{p.blurb}</span>
                </span>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-4">
          <p className="flex items-center gap-2 text-xs text-muted"><DemoBadge /> Data lives only in this browser.</p>
          <button
            onClick={() => {
              resetStore();
              setOpen(false);
              toast({ tone: "info", title: "Demo data reset", body: "Everything is back to the original fictional seed." });
            }}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-ember hover:bg-ember-wash"
          >
            <RotateCcw className="size-4" aria-hidden /> Reset demo data
          </button>
        </div>
      </Dialog>
    </>
  );
}
