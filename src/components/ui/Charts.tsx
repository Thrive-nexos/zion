import { cn } from "@/lib/utils";

/** Small, dependency-free SVG charts. Every chart has a text alternative. */

export function ProgressRing({ value, size = 56, stroke = 6, color = "var(--color-iris)", track = "var(--color-sand)", label, children }: {
  value: number; size?: number; stroke?: number; color?: string; track?: string; label: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${Math.round(v)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: "stroke-dashoffset 0.8s var(--ease-out-soft)" }}
        />
      </svg>
      <span className="absolute text-xs font-bold text-ink tabular">{children ?? `${Math.round(v)}%`}</span>
    </div>
  );
}

export function Bars({ data, max, height = 120, className, color = "var(--color-iris)", label, format = (n: number) => String(n) }: {
  data: { label: string; value: number; highlight?: boolean }[]; max?: number; height?: number; className?: string; color?: string; label: string;
  format?: (n: number) => string;
}) {
  const m = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <figure className={cn("w-full", className)}>
      <div className="flex items-end gap-1.5" style={{ height }} aria-hidden>
        {data.map((d) => (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-md transition-[height] duration-700"
              style={{ height: `${Math.max(2, (d.value / m) * 100)}%`, background: d.highlight ? "var(--color-gold)" : color, opacity: d.highlight ? 1 : 0.85 }}
            />
            <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[0.65rem] text-white group-hover:block tabular">
              {format(d.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5" aria-hidden>
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[0.65rem] text-muted">{d.label}</span>
        ))}
      </div>
      <figcaption className="sr-only">
        {label}: {data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}
      </figcaption>
    </figure>
  );
}

export function Sparkline({ values, width = 120, height = 36, color = "var(--color-iris)", label }: { values: number[]; width?: number; height?: number; color?: string; label: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - 4 - ((v - min) / span) * (height - 8)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} role="img" aria-label={`${label}: ${values.join(", ")}`} className="overflow-visible">
      <path d={`${d} L${width},${height} L0,${height} Z`} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={color} />
    </svg>
  );
}

export function Meter({ value, max = 100, tone = "iris", label, className }: { value: number; max?: number; tone?: "iris" | "gold" | "leaf" | "ember" | "azure"; label: string; className?: string }) {
  const color = { iris: "bg-iris", gold: "bg-gold", leaf: "bg-leaf", ember: "bg-ember", azure: "bg-azure-600" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-sand", className)} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className={cn("h-full rounded-full transition-[width] duration-700", color)} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}
