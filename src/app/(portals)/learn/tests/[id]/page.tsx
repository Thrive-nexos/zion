import type { Metadata } from "next";
import { TestRunner } from "@/features/learner/TestRunner";

export const metadata: Metadata = { title: "Weekly check" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TestRunner testId={id} />;
}
