import type { Metadata } from "next";
import { TutorEarnings } from "@/features/tutor-portal/TutorStudio";

export const metadata: Metadata = { title: "Earnings" };

export default function Page() {
  return <TutorEarnings />;
}
