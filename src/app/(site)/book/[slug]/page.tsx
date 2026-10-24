import type { Metadata } from "next";
import { BookingFlow } from "@/features/booking/BookingFlow";
import { HydrationGate } from "@/components/shell/HydrationGate";

export const metadata: Metadata = { title: "Book a session" };

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ trial?: string }> }) {
  const { slug } = await params;
  const { trial } = await searchParams;
  return (
    <main id="main" className="min-h-dvh bg-ivory pb-24 pt-24 sm:pt-28">
      <div className="container-page">
        <HydrationGate>
          <BookingFlow slug={slug} trial={trial === "1"} />
        </HydrationGate>
      </div>
    </main>
  );
}
