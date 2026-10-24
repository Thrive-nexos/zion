import type { Metadata } from "next";
import { Gradebook } from "@/features/school/SchoolOps";

export const metadata: Metadata = { title: "Grades" };

export default function Page() {
  return <Gradebook scope="school" />;
}
