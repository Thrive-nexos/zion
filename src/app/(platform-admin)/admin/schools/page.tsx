import type { Metadata } from "next";
import { AdminSchools } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "School approvals" };

export default function Page() {
  return <AdminSchools />;
}
