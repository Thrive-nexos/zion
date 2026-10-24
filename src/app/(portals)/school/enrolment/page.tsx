import type { Metadata } from "next";
import { Enrolment } from "@/features/school/SchoolOps";

export const metadata: Metadata = { title: "Enrolment" };

export default function Page() {
  return <Enrolment />;
}
