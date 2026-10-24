import type { Metadata } from "next";
import { Expenses } from "@/features/guardian/GuardianPages";

export const metadata: Metadata = { title: "Spending" };

export default function Page() {
  return <Expenses />;
}
