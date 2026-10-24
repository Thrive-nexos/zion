import type { Metadata } from "next";
import { Verification } from "@/features/school/SchoolCore";

export const metadata: Metadata = { title: "Verification" };

export default function Page() {
  return <Verification />;
}
