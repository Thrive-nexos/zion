import type { Metadata } from "next";
import { TestsList } from "@/features/learner/LearnPages";

export const metadata: Metadata = { title: "Weekly checks" };

export default function Page() {
  return <TestsList />;
}
