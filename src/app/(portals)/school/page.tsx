import type { Metadata } from "next";
import { SchoolOverview } from "@/features/school/SchoolCore";

export const metadata: Metadata = { title: "School overview" };

export default function Page() {
  return <SchoolOverview />;
}
