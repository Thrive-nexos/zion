import type { Metadata } from "next";
import { ReportCards } from "@/features/school/SchoolOps";

export const metadata: Metadata = { title: "Report cards" };

export default function Page() {
  return <ReportCards />;
}
