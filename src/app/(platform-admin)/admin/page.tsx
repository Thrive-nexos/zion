import type { Metadata } from "next";
import { AdminOverview } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Platform overview" };

export default function Page() {
  return <AdminOverview />;
}
