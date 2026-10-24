import type { Metadata } from "next";
import { TutorToday } from "@/features/tutor-portal/TutorStudio";

export const metadata: Metadata = { title: "Tutor studio" };

export default function Page() {
  return <TutorToday />;
}
