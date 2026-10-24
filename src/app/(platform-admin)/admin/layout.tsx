import type { Metadata } from "next";
import { PortalShell } from "@/components/shell/PortalShell";

export const metadata: Metadata = { title: { default: "Platform console", template: "%s · Lumen Learn demo" } };

/** Platform administration lives in its own route group, separate from tenant (school) portals. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell portal="admin">{children}</PortalShell>;
}
