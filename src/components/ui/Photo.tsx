import Image from "next/image";
import Link from "next/link";
import credits from "@/data/photo-credits.json";
import { cn } from "@/lib/utils";

export type PhotoId =
  | "lagos-island" | "lasu-instructor" | "lasu-learners" | "lasu-front" | "nsukka-teaching" | "midwifery-workshop"
  | "university-lab" | "graduates" | "library-shelf" | "kenneth-dike-library" | "campus-library";

export const photoCredit = (id: PhotoId) => credits.find((c) => c.id === id)!;

/**
 * Licensed photograph with an on-image attribution chip (required for CC BY / BY-SA).
 * All photos are listed with full licence details on /credits and in ASSET_SOURCES.md.
 */
export function Photo({
  id, className, sizes = "(min-width: 1024px) 50vw, 100vw", priority, credit = "corner", imgClassName, alt,
}: { id: PhotoId; className?: string; sizes?: string; priority?: boolean; credit?: "corner" | "none"; imgClassName?: string; alt?: string }) {
  const c = photoCredit(id);
  return (
    // Position: callers may pass `absolute`; otherwise the figure is the positioning context for the fill image.
    <figure className={cn(!(className ?? "").split(" ").includes("absolute") && "relative", "overflow-hidden bg-sand", className)}>
      <Image
        src={`/images/photos/${id}-1600.webp`}
        alt={alt ?? c.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
      />
      {credit === "corner" && (
        <figcaption className="absolute bottom-2 right-2 max-w-[80%] truncate bg-ink px-2 py-0.5 font-mono text-[0.62rem] text-white">
          <Link href="/credits" className="hover:underline">
            Photo: {c.author} · {c.license}
          </Link>
        </figcaption>
      )}
    </figure>
  );
}
