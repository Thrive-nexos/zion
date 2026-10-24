import type { Metadata } from "next";
import { CourseView } from "@/features/learner/LearnPages";

export const metadata: Metadata = { title: "Course" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseView courseId={id} />;
}
