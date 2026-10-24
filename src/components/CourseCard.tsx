import Link from "next/link";
import { BookOpen, Clock, School2, Stethoscope, UserRound } from "lucide-react";
import type { Course } from "@/lib/domain/types";
import { ageBandLabel, subjectById } from "@/lib/seed/catalog";
import { naira } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

/** Course colour comes from the brand brights, keyed by subject hue, so the grid reads as a printed timetable. */
const CARD_COLORS = [
  { bg: "#1F5BFF", fg: "#fff" }, { bg: "#00B85C", fg: "#111" }, { bg: "#FF3D8B", fg: "#111" },
  { bg: "#FF6A13", fg: "#111" }, { bg: "#FFC800", fg: "#111" }, { bg: "#8B5CF6", fg: "#fff" },
];

export function CourseCard({ course, href }: { course: Course; href?: string }) {
  const subject = subjectById(course.subjectId);
  const tone = CARD_COLORS[Math.round(course.hue / 40) % CARD_COLORS.length];
  const ProviderIcon = course.provider.type === "school" ? School2 : course.provider.type === "tutor" ? UserRound : BookOpen;
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className="group relative flex h-full flex-col overflow-hidden border-2 border-ink bg-white shadow-hard transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-28 overflow-hidden border-b-2 border-ink" style={{ background: tone.bg, color: tone.fg }}>
        <span className="absolute right-3 top-3 font-mono text-[0.68rem] font-semibold uppercase opacity-80">{course.weeks} wks</span>
        <span className="absolute bottom-2 left-4 font-display text-[2.6rem] font-black uppercase leading-none tracking-[-0.04em] [font-stretch:120%]">{subject.short}</span>
        {course.professional && (
          <span className="absolute left-3 top-3 flex items-center gap-1 border-2 border-ink bg-white px-1.5 py-0.5 text-[0.68rem] font-bold text-ink">
            <Stethoscope className="size-3" aria-hidden /> Educational only
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {course.ageBands.map((b) => <Badge key={b} tone="iris">{ageBandLabel(b)}</Badge>)}
          <Badge tone="neutral">{course.level}</Badge>
        </div>
        <h3 className="text-xl leading-tight text-ink">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-muted">{course.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><ProviderIcon className="size-3.5" aria-hidden />{course.provider.type === "school" ? "School-linked" : course.provider.type === "tutor" ? "Tutor-led" : "Lumen course"}</span>
          <span className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{course.weeks} wks · {course.lessons.length} lessons</span>
          <span className="font-bold text-ink">{course.priceNGN ? naira(course.priceNGN) : "Included"}</span>
        </div>
      </div>
    </Link>
  );
}
