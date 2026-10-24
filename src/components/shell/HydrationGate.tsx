"use client";

import type { ReactNode } from "react";
import { useHydrated } from "@/lib/demo/store";
import { PageSkeleton } from "@/components/ui/Misc";

/** Renders a skeleton until the persisted demo state (persona, bookings…) has loaded from this browser. */
export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  return hydrated ? <>{children}</> : <PageSkeleton />;
}
