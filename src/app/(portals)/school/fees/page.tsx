import type { Metadata } from "next";
import { Fees } from "@/features/school/SchoolOps";

export const metadata: Metadata = { title: "Fees" };

export default function Page() {
  return <Fees />;
}
