"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native <dialog> wrapper: focus trapping, Esc and inert background come from the platform. */
export function Dialog({
  open, onClose, title, description, children, className, wide,
}: { open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; children: ReactNode; className?: string; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto w-[min(100vw-1.5rem,32rem)] max-h-[min(90vh,52rem)] overflow-y-auto rounded-lg border-2 border-ink bg-white p-0 text-body shadow-[8px_8px_0_0_#111]",
        wide && "w-[min(100vw-1.5rem,48rem)]",
        className,
      )}
    >
      {open && (
        <div className="p-5 sm:p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id="dialog-title" className="text-2xl text-ink">{title}</h2>
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            <button onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink" aria-label="Close dialog">
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
