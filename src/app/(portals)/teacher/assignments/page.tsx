import type { Metadata } from "next";
import { TeacherAssignments } from "@/features/teacher/TeacherPages";

export const metadata: Metadata = { title: "Assignments" };

export default function Page() {
  return <TeacherAssignments />;
}
