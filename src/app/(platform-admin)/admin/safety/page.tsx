import type { Metadata } from "next";
import { AdminSafety } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Safety reports" };

export default function Page() {
  return <AdminSafety />;
}
