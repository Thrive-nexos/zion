import type { Curriculum, Facility, School, SchoolType, SchoolVerification } from "@/lib/domain/types";
import { hashString, prng, slugify } from "@/lib/utils";
import { CITIES, project } from "./catalog";

/** All schools are fictional. Names were chosen to be distinctive; any resemblance is coincidental. */
const RAW: {
  name: string; motto: string; city: string; area: string; type: SchoolType; curricula: Curriculum[];
  fees: [number, number]; founded: number; students: number; ratio: number; verification: SchoolVerification;
  facilities: Facility[]; accent: string; onPlatform?: boolean; optIn?: boolean; description: string;
}[] = [
  {
    name: "Iroko Gate Schools", motto: "Rooted. Rising. Kind.", city: "Lagos", area: "Lekki Phase 1",
    type: "Primary & Secondary", curricula: ["Nigerian (NERDC)", "British (Cambridge)"], fees: [650_000, 1_150_000],
    founded: 2009, students: 940, ratio: 14, verification: "verified", onPlatform: true, optIn: true, accent: "#7b5cff",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Music studio", "School bus", "Sick bay & nurse", "Solar backup", "Accessible ramps"],
    description: "A two-campus day school with a strong maths and coding culture and a bilingual Yorùbá–English primary programme.",
  },
  {
    name: "Harmattan Crest College", motto: "Clear skies, clear minds.", city: "Kano", area: "Nassarawa GRA",
    type: "Secondary", curricula: ["Nigerian (NERDC)"], fees: [220_000, 380_000], founded: 1998, students: 1210, ratio: 22,
    verification: "verified", optIn: true, onPlatform: true, accent: "#e0a43a",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Boarding", "Sick bay & nurse"],
    description: "Known for strong WAEC science outcomes and a long-running inter-house debate culture in Hausa and English.",
  },
  {
    name: "Kestrel Lagoon Academy", motto: "Look further.", city: "Lagos", area: "Ikoyi",
    type: "Primary & Secondary", curricula: ["British (Cambridge)"], fees: [1_800_000, 2_900_000], founded: 2013, students: 610, ratio: 10,
    verification: "verified", optIn: true, accent: "#3f8fd8",
    facilities: ["Science labs", "ICT lab", "Library", "Swimming pool", "Music studio", "Art studio", "Sick bay & nurse", "Solar backup", "Accessible ramps"],
    description: "Cambridge pathway school with small classes and a marine-science club that monitors the lagoon shoreline.",
  },
  {
    name: "Savannah Lantern International School", motto: "Carry the light.", city: "Abuja", area: "Gwarinpa",
    type: "Primary & Secondary", curricula: ["IB", "British (Cambridge)"], fees: [2_100_000, 3_400_000], founded: 2011, students: 780, ratio: 9,
    verification: "verified", optIn: true, onPlatform: true, accent: "#2c9f84",
    facilities: ["Science labs", "ICT lab", "Library", "Swimming pool", "Sports field", "Art studio", "Music studio", "Boarding", "Sick bay & nurse", "Accessible ramps"],
    description: "IB Primary Years and Diploma programmes with service learning across the FCT.",
  },
  {
    name: "Coral Bay Montessori", motto: "Follow the child.", city: "Port Harcourt", area: "Old GRA",
    type: "Nursery & Primary", curricula: ["Montessori"], fees: [450_000, 720_000], founded: 2016, students: 230, ratio: 8,
    verification: "site_visit_scheduled", accent: "#ef7f6a",
    facilities: ["Library", "Art studio", "Sick bay & nurse", "Accessible ramps"],
    description: "Mixed-age Montessori classrooms with a garden-based science curriculum.",
  },
  {
    name: "Nine Rivers Science College", motto: "Ask. Test. Share.", city: "Enugu", area: "Independence Layout",
    type: "Secondary", curricula: ["Nigerian (NERDC)"], fees: [280_000, 460_000], founded: 2004, students: 1040, ratio: 19,
    verification: "verified", optIn: true, accent: "#5966e8",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Boarding", "Solar backup"],
    description: "STEM-focused college with an annual science fair and a student-run robotics club.",
  },
  {
    name: "Bluewater Heights Academy", motto: "Steady and deep.", city: "Calabar", area: "State Housing",
    type: "Primary & Secondary", curricula: ["Nigerian (NERDC)", "British (Cambridge)"], fees: [320_000, 540_000], founded: 2007, students: 690, ratio: 16,
    verification: "verified", accent: "#2b8fb5",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Music studio", "School bus"],
    description: "Strong creative-arts programme and a Calabar carnival music ensemble.",
  },
  {
    name: "Mango Grove Primary", motto: "Grow in the shade of kindness.", city: "Ibadan", area: "Bodija",
    type: "Nursery & Primary", curricula: ["Nigerian (NERDC)"], fees: [140_000, 240_000], founded: 2001, students: 420, ratio: 18,
    verification: "verified", optIn: true, accent: "#d79a2b",
    facilities: ["Library", "Sports field", "Art studio", "Sick bay & nurse"],
    description: "Neighbourhood primary school with a reading-buddies programme and Yorùbá storytelling hour.",
  },
  {
    name: "Brass Compass College", motto: "True north.", city: "Benin City", area: "GRA",
    type: "Secondary", curricula: ["Nigerian (NERDC)"], fees: [210_000, 360_000], founded: 1995, students: 1150, ratio: 23,
    verification: "documents_submitted", accent: "#b9783b",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Art studio"],
    description: "Long-established day college with a bronze-casting heritage arts club.",
  },
  {
    name: "Highmist Academy", motto: "Above the clouds, below the stars.", city: "Jos", area: "Rayfield",
    type: "Primary & Secondary", curricula: ["British (Cambridge)", "Nigerian (NERDC)"], fees: [380_000, 620_000], founded: 2006, students: 560, ratio: 13,
    verification: "verified", optIn: true, accent: "#6a7fd8",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Boarding", "Music studio", "Solar backup"],
    description: "Cool-climate boarding school with an astronomy club and outdoor geography fieldwork.",
  },
  {
    name: "Sahel Star Schools", motto: "Shine where you stand.", city: "Kaduna", area: "Barnawa",
    type: "Primary & Secondary", curricula: ["Nigerian (NERDC)"], fees: [160_000, 290_000], founded: 2010, students: 880, ratio: 21,
    verification: "verified", optIn: true, accent: "#c7863a",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "School bus"],
    description: "Community-anchored school with strong girls' STEM participation and Hausa literacy.",
  },
  {
    name: "Ivory Quill International", motto: "Write your own future.", city: "Abuja", area: "Maitama",
    type: "Primary & Secondary", curricula: ["American", "British (Cambridge)"], fees: [2_500_000, 3_900_000], founded: 2015, students: 470, ratio: 8,
    verification: "verified", accent: "#8a6ff0",
    facilities: ["Science labs", "ICT lab", "Library", "Swimming pool", "Art studio", "Music studio", "Sick bay & nurse", "Solar backup", "Accessible ramps"],
    description: "American-curriculum school with an emphasis on writing and debate.",
  },
  {
    name: "Ember & Oak Montessori", motto: "Small hands, big ideas.", city: "Lagos", area: "Yaba",
    type: "Nursery & Primary", curricula: ["Montessori", "Nigerian (NERDC)"], fees: [380_000, 600_000], founded: 2018, students: 190, ratio: 9,
    verification: "documents_submitted", accent: "#e46f4c",
    facilities: ["Library", "Art studio", "Sick bay & nurse", "Accessible ramps"],
    description: "Montessori early-years school near the Yaba tech corridor with a maker-space for under-11s.",
  },
  {
    name: "Palmline Collegiate", motto: "Bend, never break.", city: "Owerri", area: "New Owerri",
    type: "Secondary", curricula: ["Nigerian (NERDC)"], fees: [240_000, 400_000], founded: 2003, students: 930, ratio: 20,
    verification: "verified", optIn: true, accent: "#4c9f5b",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Boarding"],
    description: "Secondary school with a strong Igbo language and literature department.",
  },
  {
    name: "Granite Hollow Grammar School", motto: "Firm foundations.", city: "Abeokuta", area: "Ibara",
    type: "Secondary", curricula: ["Nigerian (NERDC)"], fees: [170_000, 300_000], founded: 1999, students: 1020, ratio: 24,
    verification: "verified", accent: "#7c8794",
    facilities: ["Science labs", "Library", "Sports field", "Art studio"],
    description: "Grammar school with a celebrated adire textile design elective.",
  },
  {
    name: "Sundial Meadow College", motto: "Every hour counts.", city: "Ilorin", area: "GRA",
    type: "Primary & Secondary", curricula: ["Nigerian (NERDC)", "Blended"], fees: [190_000, 330_000], founded: 2012, students: 640, ratio: 17,
    verification: "verified", optIn: true, accent: "#d3a336",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "School bus", "Solar backup"],
    description: "Blended-learning pioneer running a flipped classroom model in the senior school.",
  },
  {
    name: "Northstar Kites School", motto: "Rise with the wind.", city: "Lagos", area: "Ikeja GRA",
    type: "Primary & Secondary", curricula: ["Nigerian (NERDC)", "British (Cambridge)"], fees: [520_000, 880_000], founded: 2008, students: 820, ratio: 15,
    verification: "verified", optIn: true, onPlatform: true, accent: "#4f6bd8",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Music studio", "School bus", "Sick bay & nurse"],
    description: "Inter-school quiz champions three seasons running, with a strong peer-tutoring culture.",
  },
  {
    name: "Indigo Dyepit Academy", motto: "Colour the world.", city: "Kano", area: "Bompai",
    type: "Primary & Secondary", curricula: ["Nigerian (NERDC)"], fees: [150_000, 270_000], founded: 2014, students: 710, ratio: 20,
    verification: "verified", optIn: true, accent: "#3c4fb8",
    facilities: ["Science labs", "ICT lab", "Library", "Art studio", "Sports field"],
    description: "Arts-and-sciences school drawing on Kano's textile heritage in its design technology lessons.",
  },
  {
    name: "Tidewater International School", motto: "Rise with every tide.", city: "Port Harcourt", area: "Trans-Amadi",
    type: "Primary & Secondary", curricula: ["British (Cambridge)", "American"], fees: [1_400_000, 2_300_000], founded: 2010, students: 520, ratio: 11,
    verification: "verified", accent: "#2a9bb8",
    facilities: ["Science labs", "ICT lab", "Library", "Swimming pool", "Sports field", "Music studio", "Sick bay & nurse", "Solar backup"],
    description: "International school with an environmental-science focus on the Niger Delta.",
  },
  {
    name: "Lakeshore Light Academy", motto: "Learning lights the way.", city: "Maiduguri", area: "Old GRA",
    type: "Primary & Secondary", curricula: ["Nigerian (NERDC)", "Blended"], fees: [90_000, 180_000], founded: 2017, students: 650, ratio: 26,
    verification: "documents_submitted", accent: "#d38b3c",
    facilities: ["Library", "ICT lab", "Solar backup", "Sick bay & nurse"],
    description: "Community school rebuilding after disruption, with radio-linked blended lessons for distance learners.",
  },
  {
    name: "Hilltop Ember College", motto: "Climb together.", city: "Enugu", area: "GRA",
    type: "Secondary", curricula: ["Nigerian (NERDC)", "British (Cambridge)"], fees: [420_000, 700_000], founded: 2005, students: 760, ratio: 14,
    verification: "verified", optIn: true, accent: "#c25a4a",
    facilities: ["Science labs", "ICT lab", "Library", "Sports field", "Boarding", "Music studio"],
    description: "Boarding college with a respected mentoring scheme pairing seniors with new JSS 1 students.",
  },
];

export const SCHOOLS: School[] = RAW.map((r, i) => {
  const rand = prng(hashString(r.name));
  const city = CITIES[r.city];
  const jitter = () => (rand() - 0.5) * 2.2;
  const p = project(city.lon, city.lat);
  const score = (base: number) => Math.round(Math.min(97, Math.max(52, base + (rand() - 0.5) * 22)));
  const facilitiesBase = 48 + r.facilities.length * 4.5;
  return {
    id: i === 0 ? "sch-iroko" : `sch-${slugify(r.name).split("-").slice(0, 2).join("-")}`,
    tenantId: i === 0 ? "sch-iroko" : `sch-${slugify(r.name).split("-").slice(0, 2).join("-")}`,
    slug: slugify(r.name),
    name: r.name,
    motto: r.motto,
    city: r.city,
    state: city.state,
    area: r.area,
    type: r.type,
    curricula: r.curricula,
    facilities: r.facilities,
    feeRangeNGN: r.fees,
    founded: r.founded,
    students: r.students,
    studentsPerTeacher: r.ratio,
    verification: r.verification,
    scores: {
      academics: score(76),
      safeguarding: r.verification === "verified" ? score(84) : score(66),
      facilities: Math.round(Math.min(96, facilitiesBase + rand() * 6)),
      teaching: score(100 - r.ratio * 1.2),
      parentVoice: score(78),
    },
    map: { x: p.x + jitter(), y: p.y + jitter() },
    accent: r.accent,
    onPlatform: !!r.onPlatform,
    competitionOptIn: !!r.optIn,
    description: r.description,
  };
});

export const HOME_SCHOOL_ID = "sch-iroko";

/** Transparent, published weights for the directory score. */
export const SCORE_WEIGHTS = {
  academics: 0.3,
  safeguarding: 0.25,
  teaching: 0.2,
  facilities: 0.15,
  parentVoice: 0.1,
} as const;

export function compositeScore(s: School) {
  const w = SCORE_WEIGHTS;
  return Math.round(
    s.scores.academics * w.academics + s.scores.safeguarding * w.safeguarding + s.scores.teaching * w.teaching +
      s.scores.facilities * w.facilities + s.scores.parentVoice * w.parentVoice,
  );
}
