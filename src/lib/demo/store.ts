"use client";

/**
 * In-browser demo store.
 *
 * Stands in for the database: services in `src/lib/services` read and write it
 * the way API handlers would read and write PostgreSQL. State persists to
 * localStorage so the demo survives reloads, and can be reset at any time.
 */
import { useSyncExternalStore } from "react";
import type { AuditEvent, Role, TenantId, Toast } from "@/lib/domain/types";
import { buildSeed, STATE_VERSION, type DemoState } from "@/lib/seed";
import { personaById } from "@/lib/seed/people";
import { DEMO_NOW, toWAT } from "@/lib/time";

const KEY = "lumen-learn-demo";
const SEED = buildSeed();

let state: DemoState = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode, quota). The demo keeps working in memory.
  }
}

export function hydrateStore() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.version === STATE_VERSION) state = parsed;
    }
  } catch {
    state = SEED;
  }
  emit();
  hydrationListeners.forEach((l) => l());
}

const hydrationListeners = new Set<() => void>();

export function getState() {
  return state;
}

/** The demo clock: fixed start, advanced one minute per committed action. */
export function nowISO(s: DemoState = state) {
  return toWAT(new Date(DEMO_NOW.getTime() + s.tick * 60_000));
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

/** Apply an immutable update, optionally recording an audit event. */
export function commit(
  mutate: (draft: DemoState) => DemoState,
  audit?: { action: string; entity: string; summary: string; tenantId?: TenantId; actor?: string; actorRole?: Role | "system" },
) {
  let next = mutate(state);
  next = { ...next, tick: next.tick + 1 };
  if (audit) {
    const persona = personaById(next.personaId);
    const event: AuditEvent = {
      id: uid("aud"),
      at: nowISO(next),
      actor: audit.actor ?? persona?.name ?? "Unknown",
      actorRole: audit.actorRole ?? persona?.role ?? "system",
      action: audit.action,
      entity: audit.entity,
      tenantId: audit.tenantId ?? persona?.tenantId ?? "platform",
      summary: audit.summary,
    };
    next = { ...next, audit: [event, ...next.audit].slice(0, 400) };
  }
  state = next;
  persist();
  emit();
}

export function resetStore() {
  const tour = state.tour;
  state = { ...buildSeed(), tour: { ...tour, active: false } };
  persist();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, () => state, () => SEED);
}

export function useHydrated() {
  return useSyncExternalStore(
    (l) => {
      hydrationListeners.add(l);
      return () => hydrationListeners.delete(l);
    },
    () => hydrated,
    () => false,
  );
}

export function usePersona() {
  const s = useDemo();
  return personaById(s.personaId)!;
}

// ───────────── Toasts (ephemeral, not persisted) ─────────────

let toasts: Toast[] = [];
const toastListeners = new Set<() => void>();

export function toast(t: Omit<Toast, "id">) {
  const item = { ...t, id: uid("t") };
  toasts = [...toasts.slice(-3), item];
  toastListeners.forEach((l) => l());
  setTimeout(() => dismissToast(item.id), t.tone === "danger" ? 9000 : 6000);
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  toastListeners.forEach((l) => l());
}

const EMPTY: Toast[] = [];
export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toasts,
    () => EMPTY,
  );
}
