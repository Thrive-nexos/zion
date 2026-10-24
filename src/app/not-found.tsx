import Link from "next/link";
import { Logo } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-ink px-4 text-center text-white">
      <div className="grid max-w-md justify-items-center gap-5">
        <Link href="/" aria-label="Lumen Learn home"><Logo tone="light" /></Link>
        <p className="font-display text-8xl font-semibold text-gold">404</p>
        <h1 className="text-3xl">This page wandered off the timetable.</h1>
        <p className="text-iris-soft">The link may be mistyped, or the item may only exist in another browser&apos;s demo data.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <ButtonLink href="/" variant="gold">Back home</ButtonLink>
          <ButtonLink href="/start" variant="light">Choose a role</ButtonLink>
        </div>
      </div>
    </main>
  );
}
