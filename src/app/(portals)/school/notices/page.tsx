import type { Metadata } from "next";
import { Notices } from "@/features/school/SchoolOps";

export const metadata: Metadata = { title: "Notices" };

export default function Page() {
  return <Notices />;
}
