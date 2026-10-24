"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Accessible tabs with roving focus (arrow keys, Home/End). Controlled. */
export function Tabs<T extends string>({
  tabs, value, onChange, label, className, variant = "pill",
}: {
  tabs: { id: T; label: ReactNode; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
  variant?: "pill" | "underline" | "dark";
}) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = tabs.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };
  return (
    <div role="tablist" aria-label={label} className={cn("no-scrollbar flex gap-1 overflow-x-auto", variant === "underline" && "gap-5 border-b border-hair", className)}>
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`${base}-${t.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "shrink-0 text-sm font-semibold transition-colors",
              variant === "pill" && (selected ? "rounded-full bg-ink px-4 py-2 text-ivory" : "rounded-full px-4 py-2 text-muted hover:bg-sand hover:text-ink"),
              variant === "dark" && (selected ? "rounded-full bg-gold px-4 py-2 text-ink" : "rounded-full px-4 py-2 text-iris-soft hover:bg-white/10 hover:text-white"),
              variant === "underline" && (selected ? "-mb-px border-b-2 border-iris pb-3 text-ink" : "-mb-px border-b-2 border-transparent pb-3 text-muted hover:text-ink"),
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn("ml-1.5 rounded-full px-1.5 text-xs tabular", selected ? "bg-white/20" : "bg-sand text-muted")}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
