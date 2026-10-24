import type { Metadata } from "next";
import { Attendance } from "@/features/school/SchoolOps";

export const metadata: Metadata = { title: "Attendance" };

export default async function Page({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const sp = await searchParams;
  return <Attendance scope="teacher" initialClass={sp.class} />;
}
