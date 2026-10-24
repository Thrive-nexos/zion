import type { Metadata } from "next";
import { GuardianHome } from "@/features/guardian/GuardianPages";

export const metadata: Metadata = { title: "Family overview" };

export default function Page() {
  return <GuardianHome />;
}
