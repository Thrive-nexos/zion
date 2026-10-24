import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminTutors } from "@/features/platform-admin/AdminPages";

export const metadata: Metadata = { title: "Tutor vetting" };

export default function Page() {
  return (
    <Suspense>
      <AdminTutors />
    </Suspense>
  );
}
