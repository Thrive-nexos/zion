import type { Metadata } from "next";
import { MyCourses } from "@/features/learner/LearnPages";

export const metadata: Metadata = { title: "My courses" };

export default function Page() {
  return <MyCourses />;
}
