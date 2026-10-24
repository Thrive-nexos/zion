import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-muted/70 transition-colors focus:border-iris focus:outline-none focus:ring-4 focus:ring-iris/15 aria-[invalid=true]:border-ember";

export function FieldShell({ id, label, hint, error, children, optional }: { id: string; label: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; optional?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs font-medium text-ember">{error}</p>}
    </div>
  );
}

type Common = { label: ReactNode; hint?: ReactNode; error?: string; optional?: boolean };

export const TextField = forwardRef<HTMLInputElement, ComponentProps<"input"> & Common>(function TextField(
  { label, hint, error, optional, className, id: idProp, ...rest }, ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <input
        ref={ref} id={id} className={cn(control, className)} aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...rest}
      />
    </FieldShell>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, ComponentProps<"select"> & Common>(function SelectField(
  { label, hint, error, optional, className, id: idProp, children, ...rest }, ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <select
        ref={ref} id={id} className={cn(control, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%236b6585%22 stroke-width=%221.6%22 fill=%22none%22/></svg>')] bg-[length:12px_8px] bg-[right_0.9rem_center] bg-no-repeat pr-9", className)}
        aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
});

export const TextareaField = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea"> & Common>(function TextareaField(
  { label, hint, error, optional, className, id: idProp, ...rest }, ref,
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        ref={ref} id={id} className={cn(control, "min-h-24 resize-y", className)} aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...rest}
      />
    </FieldShell>
  );
});

export const CheckboxField = forwardRef<HTMLInputElement, Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode; error?: string }>(
  function CheckboxField({ label, description, error, className, id: idProp, ...rest }, ref) {
    const auto = useId();
    const id = idProp ?? auto;
    return (
      <div className={cn("grid gap-1", className)}>
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-paper p-3.5 transition-colors has-[:checked]:border-iris has-[:checked]:bg-iris-wash/60">
          <input ref={ref} id={id} type="checkbox" className="mt-0.5 size-[18px] shrink-0 accent-iris" aria-invalid={!!error || undefined} {...rest} />
          <span className="grid gap-0.5">
            <span className="text-sm font-semibold text-ink">{label}</span>
            {description && <span className="text-xs text-muted">{description}</span>}
          </span>
        </label>
        {error && <p role="alert" className="text-xs font-medium text-ember">{error}</p>}
      </div>
    );
  },
);
