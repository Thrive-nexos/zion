import type { Metadata } from "next";
import { LearnHome } from "@/features/learner/LearnHome";

export const metadata: Metadata = { title: "Learner home" };

export default function Page() {
  return <LearnHome />;
}
