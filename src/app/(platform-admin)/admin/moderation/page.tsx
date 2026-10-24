import type { Metadata } from "next";
import { AdminModeration } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Moderation" };

export default function Page() {
  return <AdminModeration />;
}
