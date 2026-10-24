import type { Metadata } from "next";
import { Progress } from "@/features/learner/LearnPages";

export const metadata: Metadata = { title: "Progress" };

export default function Page() {
  return <Progress />;
}
