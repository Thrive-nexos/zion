import type { Metadata } from "next";
import { ClassDetail } from "@/features/school/SchoolCore";

export const metadata: Metadata = { title: "Class roster" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClassDetail classId={id} />;
}
