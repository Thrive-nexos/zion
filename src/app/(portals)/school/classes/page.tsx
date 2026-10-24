import type { Metadata } from "next";
import { Classes } from "@/features/school/SchoolCore";

export const metadata: Metadata = { title: "Classes" };

export default function Page() {
  return <Classes />;
}
