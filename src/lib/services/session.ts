"use client";

import { commit, getState, nowISO } from "@/lib/demo/store";
import { ROLE_LABEL } from "@/lib/rbac";
import { personaById } from "@/lib/seed/people";
import type { TourState } from "@/lib/seed";

export function switchPersona(personaId: string) {
  const p = personaById(personaId);
  if (!p || getState().personaId === personaId) return;
  commit((s) => ({ ...s, personaId }), {
    action: "session.switch_persona", entity: `persona:${personaId}`, tenantId: p.tenantId,
    summary: `Demo sign-in as ${p.name} (${ROLE_LABEL[p.role]})`, actor: p.name, actorRole: p.role,
  });
}

export function completeOnboarding(role: string, summary: string) {
  commit((s) => ({ ...s, onboarded: { ...s.onboarded, [role]: { at: nowISO(s), summary } } }), {
    action: "onboarding.complete", entity: `role:${role}`, summary: `Completed demo onboarding: ${summary}`,
  });
}

export function setTour(patch: Partial<TourState>) {
  commit((s) => ({ ...s, tour: { ...s.tour, ...patch } }));
}
