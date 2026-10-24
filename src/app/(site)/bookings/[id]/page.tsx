import type { Metadata } from "next";
import { BookingDetail } from "@/features/booking/BookingDetail";
import { HydrationGate } from "@/components/shell/HydrationGate";

export const metadata: Metadata = { title: "Booking" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main id="main" className="min-h-dvh bg-ivory pb-24 pt-24 sm:pt-28">
      <div className="container-page">
        <HydrationGate>
          <BookingDetail id={id} />
        </HydrationGate>
      </div>
    </main>
  );
}
