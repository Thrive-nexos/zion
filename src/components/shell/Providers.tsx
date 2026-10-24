"use client";

import { useEffect, type ReactNode } from "react";
import { hydrateStore } from "@/lib/demo/store";
import { applyMotionAttr } from "@/lib/demo/motion";
import { Toaster } from "@/components/ui/Toaster";
import { TourPanel } from "@/features/walkthrough/TourPanel";
import { switchPersona } from "@/lib/services/session";
import { personaById } from "@/lib/seed/people";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    hydrateStore();
    applyMotionAttr();
    // Deep links for presentations: ?persona=p-coker opens any page as that demo persona.
    const requested = new URLSearchParams(window.location.search).get("persona");
    if (requested && personaById(requested)) switchPersona(requested);
  }, []);
  return (
    <>
      {children}
      <Toaster />
      <TourPanel />
    </>
  );
}
