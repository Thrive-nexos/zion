"use client";

import { CheckCircle2, AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { dismissToast, useToasts } from "@/lib/demo/store";
import { cn } from "@/lib/utils";
import { DemoBadge } from "./Badge";

const ICON = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: ShieldAlert };
const TONE = {
  info: "text-iris-600",
  success: "text-leaf",
  warning: "text-amber",
  danger: "text-ember",
};

export function Toaster() {
  const toasts = useToasts();
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-3 top-3 z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:items-end">
      {toasts.map((t) => {
        const Icon = ICON[t.tone];
        return (
          <div key={t.id} role={t.tone === "danger" ? "alert" : "status"} className="pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-md border-2 border-ink bg-white p-3.5 shadow-hard">
            <Icon className={cn("mt-0.5 size-5 shrink-0", TONE[t.tone])} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.demo && <DemoBadge />}
              </div>
              {t.body && <p className="mt-0.5 text-sm text-muted">{t.body}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="rounded-full p-1 text-muted hover:bg-sand hover:text-ink" aria-label="Dismiss notification">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
