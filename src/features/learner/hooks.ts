"use client";

import { useDemo, usePersona } from "@/lib/demo/store";
import { studentById } from "@/lib/selectors";

/** Current learner context. Portal shells guarantee the persona is a learner before children render. */
export function useLearner() {
  const s = useDemo();
  const persona = usePersona();
  const student = studentById(s, persona.subjectId)!;
  const isKid = student.ageBand === "kids";
  const isMinor = student.age < 18;
  return { s, persona, student, isKid, isMinor };
}
