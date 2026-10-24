import type { Metadata } from "next";
import { Approvals } from "@/features/guardian/GuardianPages";

export const metadata: Metadata = { title: "Approvals" };

export default function Page() {
  return <Approvals />;
}
