import type { Metadata } from "next";
import { LiveClasses } from "@/features/learner/LearnPages";

export const metadata: Metadata = { title: "Live classes" };

export default function Page() {
  return <LiveClasses />;
}
