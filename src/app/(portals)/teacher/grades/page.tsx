import type { Metadata } from "next";
import { Gradebook } from "@/features/school/SchoolOps";

export const metadata: Metadata = { title: "Gradebook" };

export default function Page() {
  return <Gradebook scope="teacher" />;
}
