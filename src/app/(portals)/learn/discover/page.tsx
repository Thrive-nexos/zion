import type { Metadata } from "next";
import { Discover } from "@/features/learner/LearnPages";

export const metadata: Metadata = { title: "Discover courses" };

export default function Page() {
  return <Discover />;
}
