"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, PlayCircle, X } from "lucide-react";
import { Logo } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PersonaSwitcher } from "./PersonaSwitcher";

const NAV = [
  { href: "/courses", label: "Courses" },
  { href: "/tutors", label: "Tutors" },
  { href: "/schools", label: "Schools" },
  { href: "/competitions", label: "Competitions" },
  { href: "/for-schools", label: "For schools" },
  { href: "/safeguarding", label: "Safeguarding" },
];

export function SiteHeader({ overlay: overlayProp }: { overlay?: boolean }) {
  const pathname = usePathname();
  const overlay = overlayProp ?? pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The header is transparent while it sits over the bright home hero, solid everywhere else.
  useEffect(() => {
    const onScroll = () => setScrolled(!document.elementFromPoint(8, 72)?.closest("[data-header-clear]"));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigation (adjusting state during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const clear = overlay && !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 text-ink transition-[background,border-color] duration-200",
        clear ? "border-b-2 border-transparent bg-transparent" : "border-b-2 border-ink bg-white",
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0" aria-label="Lumen Learn home">
          <Logo />
        </Link>
        <span className="hidden whitespace-nowrap border border-dashed border-ink bg-white px-2 py-0.5 font-mono text-[0.64rem] font-semibold uppercase tracking-wider md:inline xl:hidden 2xl:inline">
          Demo · fictional data
        </span>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={pathname.startsWith(n.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded px-3 py-2 text-sm font-bold transition-colors hover:bg-ink hover:text-white",
                pathname.startsWith(n.href) && "bg-ink text-white",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          <ButtonLink href="/walkthrough" variant="outline" size="sm" className="hidden sm:inline-flex" icon={<PlayCircle className="size-4" />}>
            3-min demo
          </ButtonLink>
          <PersonaSwitcher tone="light" compact />
          <ButtonLink href="/start" variant="gold" size="sm" className="hidden md:inline-flex">
            Enter the demo
          </ButtonLink>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-md border-2 border-ink bg-white xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main mobile" className="container-page grid gap-1 border-t-2 border-ink bg-white pb-5 pt-3 xl:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-3 py-3 text-lg font-black uppercase tracking-tight text-ink [font-stretch:115%] hover:bg-gold">
              {n.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <ButtonLink href="/walkthrough" variant="outline" icon={<PlayCircle className="size-4" />}>3-min demo</ButtonLink>
            <ButtonLink href="/start" variant="gold">Enter the demo</ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
