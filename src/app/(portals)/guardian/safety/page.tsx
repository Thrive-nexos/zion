import type { Metadata } from "next";
import { GuardianSafety } from "@/features/guardian/GuardianPages";

export const metadata: Metadata = { title: "Safety & blocks" };

export default function Page() {
  return <GuardianSafety />;
}
