import type { Metadata } from "next";
import { TutorSessions } from "@/features/tutor-portal/TutorStudio";

export const metadata: Metadata = { title: "Sessions" };

export default function Page() {
  return <TutorSessions />;
}
