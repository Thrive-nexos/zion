import type { Metadata } from "next";
import { TeacherToday } from "@/features/teacher/TeacherPages";

export const metadata: Metadata = { title: "Teacher · today" };

export default function Page() {
  return <TeacherToday />;
}
