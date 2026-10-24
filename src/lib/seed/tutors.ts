import type { AvailabilityWindow, Booking, LedgerEntry, Tutor, TutorApplication, TutorCredentials, TutorReview } from "@/lib/domain/types";
import { priceFor } from "@/lib/pricing";
import { watISO } from "@/lib/time";
import { slugify } from "@/lib/utils";

const passed = (subject: number, safeguarding: number, demo: number): TutorCredentials => ({
  identity: "simulated_pass",
  qualification: "simulated_pass",
  subjectTest: { status: "passed", score: subject },
  safeguarding: { status: "passed", score: safeguarding },
  demoClass: { status: "passed", score: demo },
  backgroundCheck: "simulated_pass",
});

const weekdayEvenings = (start = "16:00", end = "20:00"): AvailabilityWindow[] =>
  ([0, 1, 2, 3, 4] as const).map((day) => ({ day, start, end }));

type Raw = Omit<Tutor, "id" | "slug" | "credentials" | "stage" | "portfolio" | "intro"> & {
  credentials?: TutorCredentials; stage?: Tutor["stage"]; portfolio?: Tutor["portfolio"]; intro?: string[];
};

const RAW: Raw[] = [
  {
    name: "Mr Emeka Nwosu", pronoun: "he", headline: "Makes algebra click for JSS & SS learners", city: "Enugu", timezone: "Africa/Lagos",
    subjects: ["math"], specialties: ["BECE algebra", "WAEC Mathematics", "Further Maths", "Exam confidence"], ageBands: ["teens"],
    ratePerHourNGN: 12_500, trialRateNGN: 5_000, rating: 4.9, reviewCount: 86, sessionsTaught: 1240, yearsExperience: 9,
    languages: ["English", "Igbo"], responseHours: 2, hue: 258, featured: true,
    bio: "Former head of maths at a secondary school in Enugu. I teach with stories, diagrams and lots of small wins, and I send a short progress note to guardians after every session.",
    qualifications: ["B.Sc. (Ed) Mathematics (sample)", "TRCN registration (reference recorded) (sample)"],
    // The Wednesday lunchtime clinic overlaps school hours, which the booking flow refuses for school-linked learners.
    availability: [...weekdayEvenings("16:00", "20:00"), { day: 2, start: "13:00", end: "14:00" }, { day: 5, start: "09:00", end: "13:00" }],
    portfolio: [
      { title: "Simultaneous equations in the market", kind: "worksheet", summary: "Ten word problems built around a Lagos market day." },
      { title: "Balance-scale algebra", kind: "lesson_plan", summary: "A 60-minute plan that starts with a physical balance and ends with BECE questions." },
      { title: "From 38% to 71%", kind: "student_project", summary: "Anonymised progress chart from a learner's eight-week programme (shared with guardian consent, sample)." },
      { title: "Two-minute factorising trick", kind: "video_note", summary: "Short explainer clip (placeholder in demo)." },
    ],
    intro: ["Hello, I'm Emeka.", "I help learners stop fearing algebra.", "We start with what you know,", "and build one small win at a time.", "Every session ends with a note for your guardian."],
  },
  {
    name: "Dr Folake Ajayi", pronoun: "she", headline: "Chemistry from a London lab to your screen", city: "London (UK)", timezone: "Europe/London",
    subjects: ["chem", "bio"], specialties: ["WAEC Chemistry", "IGCSE Chemistry", "Organic chemistry", "University entry"], ageBands: ["teens", "university"],
    ratePerHourNGN: 25_000, trialRateNGN: 8_000, rating: 4.8, reviewCount: 41, sessionsTaught: 420, yearsExperience: 12,
    languages: ["English", "Yorùbá"], responseHours: 6, hue: 180, featured: true,
    bio: "Research chemist and part-time tutor in the UK diaspora. I schedule in your time zone and explain every reaction with everyday examples from home.",
    qualifications: ["PhD Chemistry (sample)", "UK enhanced background check (reference recorded) (sample)"],
    availability: [...([0, 1, 2, 3] as const).map((day) => ({ day, start: "17:00", end: "20:00" })), { day: 5, start: "10:00", end: "14:00" }],
  },
  {
    name: "Ms Zainab Lawan", pronoun: "she", headline: "Hausa & English literacy for young readers", city: "Kano", timezone: "Africa/Lagos",
    subjects: ["hau", "eng"], specialties: ["Phonics", "Hausa reading", "Story writing"], ageBands: ["kids"],
    ratePerHourNGN: 6_000, trialRateNGN: 2_500, rating: 4.9, reviewCount: 57, sessionsTaught: 690, yearsExperience: 7,
    languages: ["Hausa", "English", "Arabic"], responseHours: 3, hue: 48, featured: true,
    bio: "Primary teacher who loves phonics games. Guardians are welcome to sit in, and I keep sessions short and joyful.",
    qualifications: ["NCE Primary Education (sample)"], availability: weekdayEvenings("15:00", "18:00"),
  },
  {
    name: "Mr Tamuno Briggs", pronoun: "he", headline: "Physics without memorising, WAEC & JAMB", city: "Port Harcourt", timezone: "Africa/Lagos",
    subjects: ["phy", "math"], specialties: ["WAEC Physics", "UTME Physics", "Mechanics"], ageBands: ["teens", "university"],
    ratePerHourNGN: 10_000, trialRateNGN: 4_000, rating: 4.7, reviewCount: 63, sessionsTaught: 800, yearsExperience: 8,
    languages: ["English", "Kalabari"], responseHours: 4, hue: 205,
    bio: "Engineer-turned-tutor. I use real machines, generators, okadas and boreholes, to explain physics.",
    qualifications: ["B.Eng Mechanical (sample)"], availability: weekdayEvenings("17:00", "21:00"),
  },
  {
    name: "Mrs Ngozi Eze", pronoun: "she", headline: "Igbo language & culture for families", city: "Owerri", timezone: "Africa/Lagos",
    subjects: ["igb"], specialties: ["Conversational Igbo", "Diaspora families", "Proverbs & storytelling"], ageBands: ["kids", "adults"],
    ratePerHourNGN: 7_500, trialRateNGN: 3_000, rating: 4.9, reviewCount: 38, sessionsTaught: 350, yearsExperience: 15,
    languages: ["Igbo", "English"], responseHours: 5, hue: 28,
    bio: "Retired Igbo teacher who now teaches families across Nigeria and abroad to speak together at home.",
    qualifications: ["B.A. Igbo (sample)"], availability: [{ day: 5, start: "09:00", end: "15:00" }, { day: 6, start: "14:00", end: "18:00" }, { day: 2, start: "17:00", end: "19:00" }],
  },
  {
    name: "Mr Yusuf Abdullahi", pronoun: "he", headline: "Python, web & data for teens and beginners", city: "Abuja", timezone: "Africa/Lagos",
    subjects: ["comp", "data"], specialties: ["Python", "Scratch", "Web basics", "Data analysis"], ageBands: ["teens", "university", "adults"],
    ratePerHourNGN: 15_000, trialRateNGN: 5_000, rating: 4.8, reviewCount: 72, sessionsTaught: 910, yearsExperience: 6,
    languages: ["English", "Hausa"], responseHours: 2, hue: 230, featured: true,
    bio: "Software engineer at a fintech by day. I teach project-first: every learner ships something real in four weeks.",
    qualifications: ["B.Sc. Computer Science (sample)"], availability: [...weekdayEvenings("18:00", "21:00"), { day: 6, start: "10:00", end: "14:00" }],
  },
  {
    name: "Ms Efe Okotie", pronoun: "she", headline: "English, essays & UTME Use of English", city: "Benin City", timezone: "Africa/Lagos",
    subjects: ["eng"], specialties: ["Essay writing", "Comprehension", "UTME English"], ageBands: ["teens", "university"],
    ratePerHourNGN: 8_000, trialRateNGN: 3_000, rating: 4.6, reviewCount: 44, sessionsTaught: 520, yearsExperience: 5,
    languages: ["English", "Urhobo"], responseHours: 3, hue: 14,
    bio: "Writer and English teacher. I help learners find their voice and finish their essays on time.",
    qualifications: ["B.A. English (sample)"], availability: weekdayEvenings("16:00", "19:00"),
  },
  {
    name: "Mr Ifeanyi Okeke", pronoun: "he", headline: "Economics, accounting & money skills", city: "Lagos", timezone: "Africa/Lagos",
    subjects: ["econ", "math"], specialties: ["WAEC Economics", "Financial literacy", "Accounting basics"], ageBands: ["teens", "adults"],
    ratePerHourNGN: 9_000, trialRateNGN: 3_500, rating: 4.7, reviewCount: 29, sessionsTaught: 260, yearsExperience: 6,
    languages: ["English", "Igbo", "Pidgin"], responseHours: 4, hue: 95,
    bio: "Chartered-accountant trainee who makes economics practical: budgets, inflation and small-business maths.",
    qualifications: ["B.Sc. Economics (sample)"], availability: weekdayEvenings("18:00", "21:00"),
  },
  {
    name: "Mrs Bunmi Adeyemi", pronoun: "she", headline: "Yorùbá for children and diaspora adults", city: "Ibadan", timezone: "Africa/Lagos",
    subjects: ["yor"], specialties: ["Tones & pronunciation", "Children's songs", "Oríkì & culture"], ageBands: ["kids", "adults"],
    ratePerHourNGN: 7_000, trialRateNGN: 2_500, rating: 5.0, reviewCount: 52, sessionsTaught: 600, yearsExperience: 18,
    languages: ["Yorùbá", "English"], responseHours: 6, hue: 38,
    bio: "Teaching Yorùbá with songs and stories for 18 years. Families often learn side by side.",
    qualifications: ["B.A. (Ed) Yorùbá (sample)"], availability: [{ day: 5, start: "10:00", end: "16:00" }, ...([1, 3] as const).map((day) => ({ day, start: "16:00", end: "19:00" }))],
  },
  {
    name: "Mr Chukwudi Obi", pronoun: "he", headline: "Calculus & university maths support", city: "Toronto (CA)", timezone: "America/Toronto",
    subjects: ["math"], specialties: ["Calculus", "Linear algebra", "Engineering maths"], ageBands: ["university"],
    ratePerHourNGN: 22_000, trialRateNGN: 7_000, rating: 4.8, reviewCount: 19, sessionsTaught: 180, yearsExperience: 7,
    languages: ["English", "Igbo"], responseHours: 8, hue: 268,
    bio: "Graduate teaching assistant in Canada. I schedule early mornings Toronto time, which is your afternoon in Nigeria.",
    qualifications: ["M.Sc. Applied Mathematics (sample)"], availability: ([0, 1, 2, 3, 4] as const).map((day) => ({ day, start: "07:00", end: "10:00" })),
  },
  {
    name: "Ms Mfon Etim", pronoun: "she", headline: "Biology & health sciences, clearly explained", city: "Calabar", timezone: "Africa/Lagos",
    subjects: ["bio", "health"], specialties: ["WAEC Biology", "Anatomy basics", "Nursing entrance prep"], ageBands: ["teens", "professionals"],
    ratePerHourNGN: 11_000, trialRateNGN: 4_000, rating: 4.7, reviewCount: 33, sessionsTaught: 300, yearsExperience: 6,
    languages: ["English", "Efik", "Ibibio"], responseHours: 5, hue: 128,
    bio: "Registered nurse and biology tutor. My exam-prep sessions are educational support only, not clinical training or certification.",
    qualifications: ["B.N.Sc. (sample)"], availability: weekdayEvenings("18:00", "21:00"),
  },
  {
    name: "Mr Tersoo Agber", pronoun: "he", headline: "Creative arts, drawing & music theory", city: "Makurdi", timezone: "Africa/Lagos",
    subjects: ["art"], specialties: ["Drawing", "Music theory", "Keyboard basics"], ageBands: ["kids", "teens"],
    ratePerHourNGN: 6_500, trialRateNGN: 2_500, rating: 4.8, reviewCount: 24, sessionsTaught: 210, yearsExperience: 9,
    languages: ["English", "Tiv"], responseHours: 6, hue: 350,
    bio: "Illustrator and church keyboardist. Lessons are playful, with a small project every week.",
    qualifications: ["B.A. Fine & Applied Arts (sample)"], availability: [{ day: 5, start: "09:00", end: "14:00" }, { day: 2, start: "16:00", end: "18:00" }],
  },
  {
    name: "Mme Amarachi Duru", pronoun: "she", headline: "French for school and travel", city: "Lagos", timezone: "Africa/Lagos",
    subjects: ["fre"], specialties: ["JSS French", "DELF prep", "Conversation"], ageBands: ["teens", "adults"],
    ratePerHourNGN: 9_500, trialRateNGN: 3_500, rating: 4.6, reviewCount: 21, sessionsTaught: 190, yearsExperience: 5,
    languages: ["French", "English", "Igbo"], responseHours: 4, hue: 330,
    bio: "Studied in Lomé and Dakar. I teach French through West African music and news.",
    qualifications: ["B.A. French (sample)"], availability: weekdayEvenings("17:00", "20:00"),
  },
  {
    name: "Mr Kabir Danjuma", pronoun: "he", headline: "Spreadsheets & data skills for adults", city: "Kaduna", timezone: "Africa/Lagos",
    subjects: ["data"], specialties: ["Excel/Sheets", "Dashboards", "Business records"], ageBands: ["adults", "professionals"],
    ratePerHourNGN: 13_000, trialRateNGN: 4_500, rating: 4.7, reviewCount: 27, sessionsTaught: 240, yearsExperience: 8,
    languages: ["English", "Hausa"], responseHours: 3, hue: 215,
    bio: "Data analyst helping traders, teachers and NGO staff get organised with spreadsheets.",
    qualifications: ["B.Sc. Statistics (sample)"], availability: [...weekdayEvenings("19:00", "21:30"), { day: 6, start: "12:00", end: "16:00" }],
  },
  {
    name: "Ms Ireti Balogun", pronoun: "she", headline: "Early numeracy through play", city: "Abeokuta", timezone: "Africa/Lagos",
    subjects: ["math"], specialties: ["Number sense", "Montessori maths", "Dyscalculia-aware"], ageBands: ["kids"],
    ratePerHourNGN: 7_000, trialRateNGN: 2_500, rating: 4.9, reviewCount: 46, sessionsTaught: 480, yearsExperience: 10,
    languages: ["English", "Yorùbá"], responseHours: 3, hue: 38,
    bio: "Montessori-trained. Sessions use beads, cards and stories. A guardian is always present for under-8s.",
    qualifications: ["Montessori diploma (sample)"], availability: weekdayEvenings("15:30", "18:30"),
  },
  {
    // Still on probation: visible to guardians with a clear label.
    name: "Mr Daniel Akpan", pronoun: "he", headline: "Basic science experiments at home", city: "Uyo", timezone: "Africa/Lagos",
    subjects: ["bsc", "phy"], specialties: ["Kitchen experiments", "JSS Basic Science"], ageBands: ["kids", "teens"],
    ratePerHourNGN: 6_000, trialRateNGN: 2_000, rating: 4.5, reviewCount: 6, sessionsTaught: 7, yearsExperience: 3,
    languages: ["English", "Ibibio"], responseHours: 6, hue: 160, stage: "probation",
    credentials: { ...passed(78, 92, 74), demoClass: { status: "passed", score: 70 } },
    bio: "Science graduate who runs safe kitchen experiments with learners and their guardians.",
    qualifications: ["B.Sc. Physics (sample)"], availability: weekdayEvenings("16:00", "19:00"),
  },
];

export const TUTORS: Tutor[] = RAW.map((r, i) => {
  const slug = slugify(r.name.replace(/^(Mr|Mrs|Ms|Dr|Mme)\s+/, ""));
  return {
    ...r,
    id: i === 0 ? "tut-emeka" : i === 1 ? "tut-folake" : `tut-${slug.split("-")[0]}`,
    slug,
    stage: r.stage ?? "approved",
    credentials: r.credentials ?? passed(86 + (i % 9), 90 + (i % 8), 80 + (i % 15)),
    portfolio: r.portfolio ?? [
      { title: `${r.specialties[0]} starter pack`, kind: "worksheet", summary: "Sample worksheet from the tutor's portfolio (fictional)." },
      { title: "A typical first session", kind: "lesson_plan", summary: "How the first hour is structured, including the guardian check-in." },
    ],
    intro: { seconds: 45, script: r.intro ?? [`Hello, I'm ${r.name.split(" ").slice(1, 2).join("")}.`, r.headline + ".", "Guardians are always welcome to join.", "Book a short trial to see if we're a good fit."] },
  };
});

export const tutorById = (id: string) => TUTORS.find((t) => t.id === id);

const REVIEW_TEXT = [
  "Patient and very clear. My child now explains the steps back to me.",
  "Sessions start on time and the progress notes after each class are really helpful.",
  "Good balance of practice and encouragement. Homework is manageable.",
  "Made a difficult topic feel simple. We've booked a weekly slot.",
  "Kind, prepared and professional. The trial session sold us.",
];

export const REVIEWS: TutorReview[] = TUTORS.flatMap((t, ti) =>
  [0, 1, 2].map((k) => ({
    id: `rev-${t.id}-${k}`,
    tutorId: t.id,
    author: ["Parent of a JSS 2 learner", "Parent of a Primary 4 learner", "University learner", "Adult learner", "Parent of an SS 1 learner"][(ti + k) % 5],
    rating: k === 2 && ti % 3 === 0 ? 4 : 5,
    body: REVIEW_TEXT[(ti * 2 + k) % REVIEW_TEXT.length],
    date: watISO(-(k * 9 + ti + 3), "12:00"),
  })),
);

// ── Emeka's session history with Chidera and others (sample) ──

const past = (n: number, day: number, student: string, guardian: string | null, minutes = 60): Booking => {
  const startsAt = watISO(day, "17:00");
  return {
    id: `bk-past-${n}`, tutorId: "tut-emeka", studentId: student, guardianId: guardian, subjectId: "math", startsAt, minutes, isTrial: false,
    status: "completed", price: priceFor(12_500, minutes, false), meetingLink: `https://lumen.example/room/em-${n}`, requestedBy: "guardian",
    createdAt: watISO(day - 3, "09:00"),
    attendance: { tutorJoinedAt: startsAt, learnerJoinedAt: startsAt, minutes },
    feedback: { rating: 5, comment: "Great session." }, reference: `LL-${(48210 + n).toString(36).toUpperCase()}`,
  };
};

export const BOOKINGS: Booking[] = [
  past(1, -21, "stu-chidera", "gdn-adaeze"),
  past(2, -14, "stu-chidera", "gdn-adaeze"),
  past(3, -12, "stu-ext-1", "gdn-ext-1"),
  past(4, -7, "stu-chidera", "gdn-adaeze"),
  past(5, -6, "stu-ext-2", "gdn-ext-2", 90),
  past(6, -5, "stu-ext-1", "gdn-ext-1"),
  past(7, -2, "stu-ext-3", "gdn-ext-3"),
  {
    id: "bk-upcoming-1", tutorId: "tut-emeka", studentId: "stu-chidera", guardianId: "gdn-adaeze", subjectId: "math", startsAt: watISO(1, "17:00"), minutes: 60,
    isTrial: false, status: "confirmed", price: priceFor(12_500, 60, false), meetingLink: "https://lumen.example/room/em-upc-1", requestedBy: "guardian",
    createdAt: watISO(-2, "09:00"), attendance: null, feedback: null, reference: "LL-11ZQ8",
  },
];

/** Builds the tutor ledger from completed bookings: earning + commission, older ones paid out. */
export function ledgerFromBookings(bookings: Booking[]): LedgerEntry[] {
  const out: LedgerEntry[] = [];
  for (const b of bookings.filter((x) => x.status === "completed")) {
    const old = new Date(b.startsAt).getTime() < new Date(watISO(-8, "00:00")).getTime();
    out.push({
      id: `led-${b.id}-earn`, tutorId: b.tutorId, bookingId: b.id, kind: "session_earning", amount: b.price.subtotal - b.price.trialDiscount,
      at: b.startsAt, status: old ? "paid_out" : "available", memo: `${b.minutes} min session · ${b.reference}`,
    });
    out.push({
      id: `led-${b.id}-comm`, tutorId: b.tutorId, bookingId: b.id, kind: "commission", amount: -b.price.commission,
      at: b.startsAt, status: old ? "paid_out" : "available", memo: "Platform commission (15%)",
    });
  }
  return out;
}

export const PAYOUT_SEED: LedgerEntry[] = [
  { id: "led-payout-1", tutorId: "tut-emeka", bookingId: null, kind: "payout", amount: -42_500, at: watISO(-9, "12:00"), status: "paid_out", memo: "Weekly payout to GTB •••• 2231 (simulated)" },
  { id: "led-adj-1", tutorId: "tut-emeka", bookingId: null, kind: "adjustment", amount: 2_500, at: watISO(-10, "12:00"), status: "paid_out", memo: "Bonus: 5-star month (sample)" },
];

export const TUTOR_APPLICATIONS: TutorApplication[] = [
  {
    id: "tapp-1", applicantName: "Ms Hauwa Garba", subjects: ["bio", "health"], stage: "demo_class", submittedAt: watISO(-9, "10:00"),
    evidence: [
      { label: "Government ID: verified via provider (simulated)", provided: true },
      { label: "Degree certificate (reference recorded)", provided: true },
      { label: "Two professional references", provided: true },
      { label: "Background check consent", provided: true },
    ],
    subjectTestScore: 88, safeguardingScore: 94,
    rubric: [
      { criterion: "Clarity of explanation", score: null }, { criterion: "Checks for understanding", score: null },
      { criterion: "Inclusive, age-appropriate language", score: null }, { criterion: "Safeguarding behaviours", score: null },
      { criterion: "Session structure & timing", score: null },
    ],
    reviewer: "Kemi Lawal", decisionNote: null, probation: null, appeal: null,
  },
  {
    id: "tapp-2", applicantName: "Mr Segun Afolabi", subjects: ["math", "phy"], stage: "subject_test", submittedAt: watISO(-4, "14:00"),
    evidence: [
      { label: "Government ID: verified via provider (simulated)", provided: true },
      { label: "Degree certificate (reference recorded)", provided: true },
      { label: "Two professional references", provided: false },
      { label: "Background check consent", provided: true },
    ],
    subjectTestScore: null, safeguardingScore: null,
    rubric: [], reviewer: null, decisionNote: null, probation: null, appeal: null,
  },
  {
    id: "tapp-3", applicantName: "Ms Chinwe Okafor", subjects: ["eng"], stage: "decision", submittedAt: watISO(-16, "09:30"),
    evidence: [
      { label: "Government ID: verified via provider (simulated)", provided: true },
      { label: "Degree certificate (reference recorded)", provided: true },
      { label: "Two professional references", provided: true },
      { label: "Background check consent", provided: true },
    ],
    subjectTestScore: 91, safeguardingScore: 96,
    rubric: [
      { criterion: "Clarity of explanation", score: 4 }, { criterion: "Checks for understanding", score: 3 },
      { criterion: "Inclusive, age-appropriate language", score: 4 }, { criterion: "Safeguarding behaviours", score: 4 },
      { criterion: "Session structure & timing", score: 3 },
    ],
    reviewer: "Kemi Lawal", decisionNote: null, probation: null, appeal: null,
  },
  {
    id: "tapp-4", applicantName: "Mr Abel Uche", subjects: ["comp"], stage: "appeal", submittedAt: watISO(-30, "11:00"),
    evidence: [
      { label: "Government ID: verified via provider (simulated)", provided: true },
      { label: "Degree certificate (reference recorded)", provided: true },
      { label: "Two professional references", provided: true },
      { label: "Background check consent", provided: true },
    ],
    subjectTestScore: 83, safeguardingScore: 68,
    rubric: [], reviewer: "Kemi Lawal", decisionNote: "Safeguarding test below 80% pass mark.", probation: null,
    appeal: { reason: "Connection dropped during the safeguarding test; requesting a supervised re-sit.", status: "submitted", at: watISO(-3, "15:00") },
  },
];

export const tutorSlugToId = (slug: string) => TUTORS.find((t) => t.slug === slug)?.id;
