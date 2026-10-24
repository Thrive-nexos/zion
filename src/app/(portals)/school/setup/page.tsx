import type { Metadata } from "next";
import { Setup } from "@/features/school/SchoolCore";

export const metadata: Metadata = { title: "Branches & terms" };

export default function Page() {
  return <Setup />;
}
