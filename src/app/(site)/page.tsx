import { Hero } from "@/features/home/Hero";
import {
  ClassroomTransition, Competitions, Ticker, DirectoryTeaser, Discovery, FinalCta, Mission, ParentConfidence, Pathways, SchoolSaas, Transparency, TutorsShowcase,
} from "@/features/home/HomeSections";

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <Ticker />
      <ClassroomTransition />
      <Mission />
      <Pathways />
      <Discovery />
      <SchoolSaas />
      <TutorsShowcase />
      <ParentConfidence />
      <Competitions />
      <DirectoryTeaser />
      <Transparency />
      <FinalCta />
    </main>
  );
}
