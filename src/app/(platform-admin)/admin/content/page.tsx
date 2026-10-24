import type { Metadata } from "next";
import { AdminContent } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Content" };

export default function Page() {
  return <AdminContent />;
}
