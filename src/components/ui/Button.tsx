import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "dark" | "outline" | "ghost" | "danger" | "light";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white border-2 border-ink hover:bg-iris hover:border-iris",
  gold: "bg-gold text-ink border-2 border-ink shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lift active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  dark: "bg-ink text-white border-2 border-ink hover:bg-[#2a2a2a]",
  outline: "border-2 border-ink bg-white text-ink hover:bg-gold",
  ghost: "text-ink hover:bg-sand",
  danger: "bg-ember text-white border-2 border-ink hover:bg-[#c40f33]",
  light: "bg-transparent text-white border-2 border-white hover:bg-white hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-md",
  md: "h-11 px-5 text-[0.95rem] gap-2 rounded-md",
  lg: "h-14 px-7 text-base gap-2.5 rounded-md",
};

const base =
  "inline-flex select-none items-center justify-center font-bold tracking-[-0.01em] whitespace-nowrap transition-[background,color,box-shadow,transform,border-color] duration-150 disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0";

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, VARIANTS[variant], SIZES[size], className);
}

export function Button({
  variant = "primary", size = "md", loading, children, className, icon, ...rest
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean; icon?: ReactNode }) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary", size = "md", className, children, icon, ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
