import type { Metadata } from "next";
import { ChildDetail } from "@/features/guardian/GuardianPages";

export const metadata: Metadata = { title: "Child overview" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChildDetail childId={id} />;
}
