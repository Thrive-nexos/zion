import type { Metadata } from "next";
import { Timetable } from "@/features/school/SchoolCore";

export const metadata: Metadata = { title: "Timetable" };

export default async function Page({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const sp = await searchParams;
  return <Timetable key={sp.class ?? "default"} initialClass={sp.class} />;
}
