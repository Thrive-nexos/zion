import type { Metadata } from "next";
import { Schedule } from "@/features/guardian/GuardianPages";

export const metadata: Metadata = { title: "Family schedule" };

export default function Page() {
  return <Schedule />;
}
