import type { Metadata } from "next";
import { TutorSchedule } from "@/features/tutor-portal/TutorStudio";

export const metadata: Metadata = { title: "Availability" };

export default function Page() {
  return <TutorSchedule />;
}
