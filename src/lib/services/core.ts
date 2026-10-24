"use client";

import type { Role } from "@/lib/domain/types";
import { getState, toast } from "@/lib/demo/store";
import { AccessDenied, assertCan, type Permission } from "@/lib/rbac";
import { personaById } from "@/lib/seed/people";
import { sleep } from "@/lib/utils";

/** Simulated network latency so loading states are real, but short. */
export async function latency(min = 280, max = 650) {
  await sleep(min + Math.random() * (max - min));
}

export function actor() {
  const p = personaById(getState().personaId)!;
  return p;
}

/** Throws AccessDenied if the active persona's role lacks the permission. */
export function guard(permission: Permission, roles?: Role[]) {
  const p = actor();
  if (roles && !roles.includes(p.role)) throw new AccessDenied(p.role, permission);
  assertCan(p.role, permission);
  return p;
}

export class DemoError extends Error {}

/**
 * Wraps a service call for UI use: runs it, and turns failures into a toast
 * instead of an unhandled promise. Returns undefined on failure.
 */
export async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    toast({ tone: e instanceof AccessDenied ? "warning" : "danger", title: e instanceof AccessDenied ? "Not allowed for this role" : "Couldn't complete that", body: msg });
    return undefined;
  }
}
