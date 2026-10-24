import type { School } from "@/lib/domain/types";
import { CITIES, NIGERIA_OUTLINE, project } from "@/lib/seed/catalog";
import { cn } from "@/lib/utils";

const OUTLINE = NIGERIA_OUTLINE.map(([lon, lat]) => project(lon, lat));
const PATH = `M${OUTLINE.map((p) => `${p.x},${p.y}`).join(" L")} Z`;

/**
 * Stylised (not survey-accurate) map of Nigeria. No map tiles or third-party
 * map services are loaded; school positions are city-level only.
 */
export function NigeriaMap({
  schools, selectedId, onSelect, className, tone = "light", showCities = true,
}: {
  schools: School[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  tone?: "light" | "dark";
  showCities?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <svg viewBox="-4 -4 108 96" className={cn("w-full", className)} role="group" aria-label="Stylised map of Nigeria showing school locations by city">
      <defs>
        <linearGradient id={`ng-fill-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dark ? "#2a1f78" : "#efebff"} />
          <stop offset="1" stopColor={dark ? "#1c1550" : "#e6f5ff"} />
        </linearGradient>
      </defs>
      <path d={PATH} fill={`url(#ng-fill-${tone})`} stroke={dark ? "#7b5cff" : "#cfc4ff"} strokeWidth="0.6" strokeLinejoin="round" />
      {/* Niger and Benue rivers, simplified */}
      <path d={`M${project(3.6, 11.7).x},${project(3.6, 11.7).y} Q${project(5.2, 9.5).x},${project(5.2, 9.5).y} ${project(6.75, 7.8).x},${project(6.75, 7.8).y} T${project(6.3, 4.5).x},${project(6.3, 4.5).y}`} fill="none" stroke={dark ? "#8fd0ff" : "#8fd0ff"} strokeOpacity="0.55" strokeWidth="0.7" />
      <path d={`M${project(6.75, 7.8).x},${project(6.75, 7.8).y} Q${project(9.5, 8.3).x},${project(9.5, 8.3).y} ${project(12.4, 9.3).x},${project(12.4, 9.3).y}`} fill="none" stroke="#8fd0ff" strokeOpacity="0.55" strokeWidth="0.7" />
      {showCities &&
        Object.entries(CITIES).map(([name, c]) => {
          const p = project(c.lon, c.lat);
          return (
            <text key={name} x={p.x + 1.4} y={p.y - 1.2} fontSize="2.3" fill={dark ? "#cfc4ff" : "#6b6585"} aria-hidden>
              {name}
            </text>
          );
        })}
      {schools.map((s) => {
        const sel = s.id === selectedId;
        const content = (
          <>
            <circle cx={s.map.x} cy={s.map.y} r={sel ? 2.6 : 1.6} fill={s.verification === "verified" ? "#7b5cff" : "#f2b544"} stroke={dark ? "#120d2e" : "#fffdf8"} strokeWidth="0.5" />
            {sel && <circle cx={s.map.x} cy={s.map.y} r="4.4" fill="none" stroke="#f2b544" strokeWidth="0.6" />}
          </>
        );
        return onSelect ? (
          <g
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={`${s.name}, ${s.area}, ${s.city}${sel ? " (selected)" : ""}`}
            aria-pressed={sel}
            onClick={() => onSelect(s.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(s.id))}
            className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[#f2b544] [&:focus-visible>circle:first-child]:stroke-[1.2]"
          >
            {content}
          </g>
        ) : (
          <g key={s.id} aria-hidden>{content}</g>
        );
      })}
    </svg>
  );
}
