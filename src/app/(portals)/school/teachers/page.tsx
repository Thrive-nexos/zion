import type { Metadata } from "next";
import { Teachers } from "@/features/school/SchoolCore";

export const metadata: Metadata = { title: "Teachers" };

export default function Page() {
  return <Teachers />;
}
