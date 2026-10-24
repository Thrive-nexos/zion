import type { Metadata } from "next";
import { Inbox } from "@/features/messaging/Inbox";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
  return <Inbox variant="tutor" />;
}
