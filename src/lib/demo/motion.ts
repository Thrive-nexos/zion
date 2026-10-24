"use client";

import { useSyncExternalStore } from "react";

export type MotionPref = "auto" | "full" | "reduced";

const KEY = "lumen-motion";
let pref: MotionPref = "auto";
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = localStorage.getItem(KEY);
    if (v === "full" || v === "reduced" || v === "auto") pref = v;
  } catch {}
}

export function setMotionPref(v: MotionPref) {
  pref = v;
  try {
    localStorage.setItem(KEY, v);
  } catch {}
  applyMotionAttr();
  listeners.forEach((l) => l());
}

function systemReduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function effectiveReduced() {
  load();
  return pref === "reduced" || (pref === "auto" && systemReduced());
}

export function applyMotionAttr() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.motion = effectiveReduced() ? "reduced" : "full";
}

function subscribe(l: () => void) {
  listeners.add(l);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    applyMotionAttr();
    l();
  };
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(l);
    mq.removeEventListener("change", onChange);
  };
}

export function useMotionPref() {
  return useSyncExternalStore(subscribe, () => (load(), pref), () => "auto" as MotionPref);
}

/** true when animation should be minimised (OS setting or in-app toggle). Server render assumes motion is allowed. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, effectiveReduced, () => false);
}

/**
 * Heuristic for whether to run WebGL scenes. Low-power devices, data-saver,
 * missing WebGL and reduced motion all get the illustrated fallback instead.
 */
export function canRun3D() {
  if (typeof window === "undefined") return false;
  if (effectiveReduced()) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 3) return false;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
