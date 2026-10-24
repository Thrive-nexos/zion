import { Atom, BookOpen, Compass, Flame, Star, Trophy, Zap } from "lucide-react";
import type { Achievement } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const ICONS = { spark: Zap, streak: Flame, star: Star, atom: Atom, book: BookOpen, trophy: Trophy, compass: Compass };

export function AchievementIcon({ icon, earned, label, size = "md" }: { icon: Achievement["icon"]; earned: boolean; label: string; size?: "md" | "lg" }) {
  const Icon = ICONS[icon];
  return (
    <span
      className={cn(
        "grid place-items-center rounded-md border-2",
        size === "lg" ? "size-16" : "size-11",
        earned ? "border-ink bg-gold text-ink shadow-hard" : "border-dashed border-ink/30 bg-white text-ink/30",
      )}
      role="img"
      aria-label={`${label}${earned ? " (earned)" : " (not yet earned)"}`}
    >
      <Icon className={size === "lg" ? "size-7" : "size-5"} aria-hidden />
    </span>
  );
}
