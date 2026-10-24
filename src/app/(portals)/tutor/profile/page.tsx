import type { Metadata } from "next";
import { TutorProfileAdmin } from "@/features/tutor-portal/TutorStudio";

export const metadata: Metadata = { title: "Profile & vetting" };

export default function Page() {
  return <TutorProfileAdmin />;
}
