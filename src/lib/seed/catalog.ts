import type { AgeBand, Subject } from "@/lib/domain/types";

export const SUBJECTS: Subject[] = [
  { id: "math", name: "Mathematics", short: "Maths", hue: 258 },
  { id: "eng", name: "English Language", short: "English", hue: 14 },
  { id: "bsc", name: "Basic Science", short: "Basic Sci.", hue: 160 },
  { id: "phy", name: "Physics", short: "Physics", hue: 205 },
  { id: "chem", name: "Chemistry", short: "Chem", hue: 180 },
  { id: "bio", name: "Biology", short: "Bio", hue: 128 },
  { id: "comp", name: "Computing & Coding", short: "Coding", hue: 230 },
  { id: "yor", name: "Yorùbá", short: "Yorùbá", hue: 38 },
  { id: "hau", name: "Hausa", short: "Hausa", hue: 48 },
  { id: "igb", name: "Igbo", short: "Igbo", hue: 28 },
  { id: "fre", name: "French", short: "French", hue: 330 },
  { id: "civ", name: "Civic & Social Studies", short: "Civic", hue: 290 },
  { id: "art", name: "Creative Arts & Music", short: "Arts", hue: 350 },
  { id: "econ", name: "Economics & Finance", short: "Econ", hue: 95 },
  { id: "health", name: "Health Sciences", short: "Health", hue: 172 },
  { id: "data", name: "Data & Digital Skills", short: "Data", hue: 215 },
];

export const subjectById = (id: string) => SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];

export const AGE_BANDS: { id: AgeBand; label: string; ages: string; promise: string }[] = [
  { id: "kids", label: "Kids", ages: "5–11", promise: "Play-first numeracy, reading and curiosity, always guardian-led." },
  { id: "teens", label: "Teens", ages: "12–17", promise: "Curriculum mastery, BECE/WAEC/NECO readiness and real coding." },
  { id: "university", label: "University", ages: "17–25", promise: "Course companions, study groups and exam strategy." },
  { id: "adults", label: "Adults", ages: "18+", promise: "Languages, digital skills and second chances, on your schedule." },
  { id: "professionals", label: "Professionals", ages: "Career", promise: "Refreshers and upskilling. Educational only, never a licence." },
];

export const ageBandLabel = (b: AgeBand) => AGE_BANDS.find((a) => a.id === b)?.label ?? b;

/** Approximate Nigeria outline as [lon, lat] pairs, simplified for a stylised map. */
export const NIGERIA_OUTLINE: [number, number][] = [
  [2.69, 6.37], [2.72, 7.1], [2.74, 8.0], [2.69, 8.5], [3.1, 9.1], [3.6, 9.9], [3.6, 10.6], [3.75, 11.4],
  [3.62, 11.7], [4.1, 12.9], [4.15, 13.45], [4.9, 13.75], [5.85, 13.75], [6.4, 13.6], [7.3, 13.1],
  [8.1, 13.3], [9.0, 12.85], [10.0, 13.15], [10.7, 13.35], [11.6, 13.35], [12.3, 13.1], [13.3, 13.65],
  [14.1, 13.05], [14.55, 12.2], [14.2, 11.3], [13.65, 10.8], [13.25, 10.05], [12.9, 9.2], [12.25, 8.5],
  [11.95, 7.55], [11.55, 6.95], [11.1, 6.45], [10.6, 7.0], [10.2, 6.9], [9.75, 6.55], [9.3, 6.2],
  [8.8, 5.75], [8.55, 4.65], [7.9, 4.45], [7.1, 4.4], [6.4, 4.3], [5.85, 4.45], [5.45, 5.0],
  [5.0, 5.65], [4.6, 6.15], [4.0, 6.35], [3.4, 6.4],
];

export function project(lon: number, lat: number) {
  return { x: +(((lon - 2.4) / 12.5) * 100).toFixed(2), y: +(((14.1 - lat) / 10) * 85).toFixed(2) };
}

export const CITIES: Record<string, { state: string; lon: number; lat: number }> = {
  Lagos: { state: "Lagos", lon: 3.38, lat: 6.52 },
  Ibadan: { state: "Oyo", lon: 3.9, lat: 7.38 },
  Abeokuta: { state: "Ogun", lon: 3.35, lat: 7.15 },
  Ilorin: { state: "Kwara", lon: 4.54, lat: 8.5 },
  Abuja: { state: "FCT", lon: 7.49, lat: 9.06 },
  Kaduna: { state: "Kaduna", lon: 7.44, lat: 10.52 },
  Kano: { state: "Kano", lon: 8.52, lat: 12.0 },
  Jos: { state: "Plateau", lon: 8.89, lat: 9.9 },
  Maiduguri: { state: "Borno", lon: 13.15, lat: 11.85 },
  Enugu: { state: "Enugu", lon: 7.5, lat: 6.44 },
  Owerri: { state: "Imo", lon: 7.03, lat: 5.48 },
  "Port Harcourt": { state: "Rivers", lon: 7.01, lat: 4.82 },
  "Benin City": { state: "Edo", lon: 5.62, lat: 6.34 },
  Calabar: { state: "Cross River", lon: 8.33, lat: 4.95 },
};
