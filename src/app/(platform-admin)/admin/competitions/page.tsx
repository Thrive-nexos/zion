import type { Metadata } from "next";
import { AdminCompetitions } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Competitions admin" };

export default function Page() {
  return <AdminCompetitions />;
}
