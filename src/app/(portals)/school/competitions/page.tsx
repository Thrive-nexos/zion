import type { Metadata } from "next";
import { SchoolCompetitions } from "@/features/competitions/CompetitionPages";

export const metadata: Metadata = { title: "Competitions" };

export default function Page() {
  return <SchoolCompetitions />;
}
