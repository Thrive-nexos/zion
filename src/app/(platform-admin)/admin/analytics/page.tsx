import type { Metadata } from "next";
import { AdminAnalytics } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Platform analytics" };

export default function Page() {
  return <AdminAnalytics />;
}
