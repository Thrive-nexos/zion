import type { Metadata } from "next";
import { Assignments } from "@/features/learner/LearnPages";

export const metadata: Metadata = { title: "Assignments" };

export default function Page() {
  return <Assignments />;
}
