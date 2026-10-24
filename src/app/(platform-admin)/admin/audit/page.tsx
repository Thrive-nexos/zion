import type { Metadata } from "next";
import { AdminAudit } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Audit log" };

export default function Page() {
  return <AdminAudit />;
}
