import type { Metadata } from "next";
import { AdminFinance } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Finance (mock)" };

export default function Page() {
  return <AdminFinance />;
}
