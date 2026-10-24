import type { Achievement, Course, LearnerProgress, Lesson, LiveClass, TestAttempt, WeeklyTest } from "@/lib/domain/types";
import { watISO } from "@/lib/time";
import { HOME_SCHOOL_ID } from "./schools";

const T = HOME_SCHOOL_ID;

const L = (id: string, title: string, kind: Lesson["kind"], minutes: number, summary: string, notes: string[]): Lesson => ({
  id, title, kind, minutes, summary, notes,
});

const PRO_DISCLAIMER =
  "Educational refresher only. It does not grant a licence, certificate or CPD credit, and it does not replace your institution's protocols, supervision or Nursing and Midwifery Council of Nigeria (NMCN) guidance.";

export const COURSES: Course[] = [
  // ── School-linked: delivered automatically to enrolled classes ──
  {
    id: "c-jss3-math", slug: "jss3-mathematics", title: "JSS 3 Mathematics", subjectId: "math", ageBands: ["teens"], level: "JSS 3 · BECE track",
    provider: { type: "school", tenantId: T, classIds: ["cls-jss3"] }, priceNGN: 0, weeks: 14, hue: 258,
    summary: "Your class's maths for First Term: simultaneous equations, factorisation, and word problems that look like BECE questions.",
    outcomes: ["Solve simultaneous equations by elimination and substitution", "Factorise quadratic expressions", "Translate word problems into equations"],
    lessons: [
      L("l-m1", "What makes two equations 'simultaneous'?", "video", 14, "Two conditions, one answer: see why the lines cross.", ["A pair of linear equations shares one solution where their graphs intersect.", "Check any answer by substituting into both equations."]),
      L("l-m2", "Elimination: add or subtract to remove a letter", "video", 18, "Line up the equations and cancel one unknown.", ["Multiply one equation so a coefficient matches.", "Add if the signs differ, subtract if they are the same."]),
      L("l-m3", "Live: elimination practice clinic", "live", 40, "Work through BECE-style questions together.", ["Bring your exercise book.", "Questions 3–8 from page 112."]),
      L("l-m4", "Substitution, step by step", "reading", 12, "Make one letter the subject, then replace it.", ["Choose the equation where a letter has coefficient 1.", "Substitute, solve, then back-substitute."]),
      L("l-m5", "Word problems: market maths", "practice", 20, "Turn Mama Nkechi's tomato and pepper sales into equations.", ["Name the unknowns first.", "Write one equation per fact in the story."]),
      L("l-m6", "Factorising quadratic expressions", "video", 16, "Find two numbers that multiply and add.", ["x² + bx + c = (x + p)(x + q) where p + q = b and pq = c."]),
    ],
  },
  {
    id: "c-jss3-bsc", slug: "jss3-basic-science", title: "JSS 3 Basic Science", subjectId: "bsc", ageBands: ["teens"], level: "JSS 3",
    provider: { type: "school", tenantId: T, classIds: ["cls-jss3"] }, priceNGN: 0, weeks: 14, hue: 160,
    summary: "Energy, simple machines and the human body, with home experiments that use things already in the kitchen.",
    outcomes: ["Explain energy transfer", "Calculate mechanical advantage", "Describe the circulatory system"],
    lessons: [
      L("l-b1", "Forms of energy around the house", "video", 12, "From the generator to the gas cooker.", ["Energy changes form; it is not used up.", "Spot three energy changes at home tonight."]),
      L("l-b2", "Levers and the wheelbarrow", "reading", 10, "Load, effort and fulcrum.", ["MA = load ÷ effort."]),
      L("l-b3", "Live lab: build a pulley", "live", 40, "Guided practical with your teacher.", ["Safety first: no standing on chairs."]),
      L("l-b4", "Your heart as a pump", "video", 14, "How blood circulates.", ["Arteries carry blood away from the heart."]),
    ],
  },
  {
    id: "c-jss3-comp", slug: "jss3-computing", title: "JSS 3 Computing: Python foundations", subjectId: "comp", ageBands: ["teens"], level: "JSS 3",
    provider: { type: "school", tenantId: T, classIds: ["cls-jss3"] }, priceNGN: 0, weeks: 14, hue: 230,
    summary: "Variables, loops and a mini project: a school-canteen price calculator.",
    outcomes: ["Write and run Python programs", "Use loops and conditions", "Build a small useful tool"],
    lessons: [
      L("l-c1", "Hello, Python", "video", 10, "Run your first program.", ["print() shows output."]),
      L("l-c2", "Variables and input", "practice", 20, "Store prices and names.", ["Variables are labelled boxes."]),
      L("l-c3", "Loops that count", "video", 15, "for and range().", ["range(5) gives 0 to 4."]),
    ],
  },
  {
    id: "c-p5-num", slug: "primary5-numeracy-quest", title: "Numeracy Quest", subjectId: "math", ageBands: ["kids"], level: "Primary 5",
    provider: { type: "school", tenantId: T, classIds: ["cls-p5"] }, priceNGN: 0, weeks: 14, hue: 38,
    summary: "Fractions, place value and money maths through market stories and puzzles.",
    outcomes: ["Compare fractions", "Round to the nearest 10 and 100", "Add and subtract naira amounts"],
    lessons: [
      L("l-n1", "Sharing chin-chin fairly: fractions", "video", 8, "Halves, quarters and thirds.", ["The bottom number tells how many equal parts."]),
      L("l-n2", "Place-value castle", "practice", 10, "Hundreds, tens and ones.", ["Each place is ten times the one to its right."]),
      L("l-n3", "Market money", "video", 9, "Adding prices and giving change.", ["Line up the naira amounts before adding."]),
      L("l-n4", "Storytime maths with Mrs Balogun", "live", 30, "A live class with your class teacher.", ["Your grown-up can sit with you."]),
    ],
  },
  {
    id: "c-p5-read", slug: "primary5-reading-garden", title: "Reading Garden", subjectId: "eng", ageBands: ["kids"], level: "Primary 5",
    provider: { type: "school", tenantId: T, classIds: ["cls-p5"] }, priceNGN: 0, weeks: 14, hue: 14,
    summary: "Stories from across Nigeria, read aloud and discussed, with new words to collect.",
    outcomes: ["Read with expression", "Find the main idea", "Use five new words a week"],
    lessons: [
      L("l-r1", "The tortoise and the drum", "video", 9, "A folktale read aloud.", ["Collect two new words."]),
      L("l-r2", "Finding the main idea", "reading", 8, "What is the story mostly about?", ["Look at the first and last sentences."]),
      L("l-r3", "Live storytime", "live", 30, "Read together with your class.", ["Bring your word book."]),
    ],
  },

  // ── Platform courses ──
  {
    id: "c-waec-phy", slug: "waec-physics-motion-energy", title: "WAEC Physics: Motion & Energy", subjectId: "phy", ageBands: ["teens"], level: "SS 2–3",
    provider: { type: "platform" }, priceNGN: 18_000, weeks: 6, hue: 205,
    summary: "Six weeks of worked past-question patterns on kinematics, work, energy and power.",
    outcomes: ["Use equations of motion", "Solve work–energy problems", "Avoid the top five WAEC mistakes"],
    lessons: [
      L("l-p1", "Equations of motion, visually", "video", 16, "v = u + at as a story.", ["Draw a velocity–time graph first."]),
      L("l-p2", "Work, energy and power", "video", 18, "From lifting buckets to generators.", ["Power = work ÷ time."]),
      L("l-p3", "Live revision: past questions 2019–2025", "live", 60, "Timed practice with explanations.", []),
    ],
  },
  {
    id: "c-jamb-eng", slug: "utme-use-of-english-sprint", title: "UTME Use of English Sprint", subjectId: "eng", ageBands: ["teens", "university"], level: "UTME prep",
    provider: { type: "platform" }, priceNGN: 12_000, weeks: 4, hue: 14,
    summary: "Comprehension speed, lexis and structure drills for the UTME, with timed mocks.",
    outcomes: ["Read passages faster", "Master concord and lexis", "Manage exam time"],
    lessons: [
      L("l-j1", "Reading for the question", "video", 12, "Scan, then read.", []),
      L("l-j2", "Concord traps", "practice", 20, "Subject–verb agreement drills.", []),
    ],
  },
  {
    id: "c-scratch", slug: "scratch-storytellers", title: "Scratch Storytellers", subjectId: "comp", ageBands: ["kids"], level: "Ages 8–11",
    provider: { type: "platform" }, priceNGN: 15_000, weeks: 6, hue: 230,
    summary: "Make animated folktales with Scratch blocks. Projects stay private to the learner and guardian.",
    outcomes: ["Sequence and loops", "Animate a character", "Share a project with family"],
    lessons: [
      L("l-s1", "Meet the cat (and the tortoise)", "video", 8, "Sprites and backdrops.", []),
      L("l-s2", "Make it move", "practice", 15, "Motion blocks.", []),
    ],
  },
  {
    id: "c-py-ds", slug: "data-structures-in-python", title: "Data Structures in Python", subjectId: "comp", ageBands: ["university"], level: "100–300L companion",
    provider: { type: "platform" }, priceNGN: 25_000, weeks: 8, hue: 222,
    summary: "A companion to your CSC course: lists, dictionaries, stacks, queues and complexity, with weekly checks.",
    outcomes: ["Pick the right structure", "Reason about Big-O", "Pass your CSC 201 practicals"],
    lessons: [
      L("l-d1", "Lists vs tuples", "video", 14, "Mutability and why it matters.", ["Tuples are immutable; lists are not."]),
      L("l-d2", "Dictionaries and hashing", "video", 18, "Constant-time lookup, explained.", ["Average O(1) lookup by key."]),
      L("l-d3", "Stacks and queues", "reading", 15, "LIFO and FIFO in practice.", []),
      L("l-d4", "Live office hours", "live", 45, "Bring your assignment questions.", []),
      L("l-d5", "Binary search", "video", 16, "Halving the problem.", ["Requires sorted input; O(log n)."]),
    ],
  },
  {
    id: "c-calc", slug: "calculus-i-companion", title: "Calculus I Companion", subjectId: "math", ageBands: ["university"], level: "MTH 101/102",
    provider: { type: "platform" }, priceNGN: 20_000, weeks: 8, hue: 268,
    summary: "Limits, derivatives and integrals explained slowly, with past-exam walkthroughs.",
    outcomes: ["Differentiate confidently", "Apply the chain rule", "Solve basic integrals"],
    lessons: [L("l-k1", "Limits without fear", "video", 15, "Approaching, not arriving.", [])],
  },
  {
    id: "c-sheets", slug: "spreadsheets-for-small-business", title: "Spreadsheets for Small Business", subjectId: "data", ageBands: ["adults"], level: "Beginner",
    provider: { type: "platform" }, priceNGN: 18_000, weeks: 4, hue: 215,
    summary: "Track stock, sales and profit for a shop or online store using free spreadsheet tools.",
    outcomes: ["Build a sales tracker", "Use SUM, IF and lookups", "Make a simple profit chart"],
    lessons: [
      L("l-x1", "Your first sheet", "video", 12, "Rows, columns, cells.", []),
      L("l-x2", "Formulas that save time", "practice", 20, "SUM and IF.", []),
    ],
  },
  {
    id: "c-yoruba", slug: "yoruba-for-beginners", title: "Yorùbá for Beginners", subjectId: "yor", ageBands: ["adults", "kids"], level: "Beginner",
    provider: { type: "platform" }, priceNGN: 10_000, weeks: 6, hue: 38,
    summary: "Greetings, tones and everyday conversation, popular with diaspora families learning together.",
    outcomes: ["Greet by time of day", "Hear the three tones", "Hold a short conversation"],
    lessons: [L("l-y1", "Ẹ káàárọ̀! Greetings", "video", 10, "Morning, afternoon, evening.", [])],
  },
  {
    id: "c-pm", slug: "product-management-foundations", title: "Product Management Foundations", subjectId: "data", ageBands: ["professionals"], level: "Career switchers",
    provider: { type: "platform" }, priceNGN: 45_000, weeks: 6, hue: 245,
    summary: "Discovery, prioritisation and shipping, with case studies from African fintech and logistics.",
    outcomes: ["Write a problem statement", "Prioritise a backlog", "Run a user interview"],
    lessons: [L("l-pm1", "What PMs actually do", "video", 14, "Outcomes over output.", [])],
  },
  {
    id: "c-med-safety", slug: "paediatric-medication-safety-refresher", title: "Paediatric Medication Safety: Refresher", subjectId: "health", ageBands: ["professionals"], level: "Nurses & midwives",
    provider: { type: "platform" }, priceNGN: 12_000, weeks: 3, hue: 172,
    summary: "A self-paced refresher on weight-based dosing arithmetic, double-checking and safe administration habits.",
    outcomes: ["Recalculate weight-based doses accurately", "Apply a structured double-check", "Recognise high-risk situations"],
    professional: { field: "Nursing", disclaimer: PRO_DISCLAIMER },
    lessons: [
      L("l-h1", "Why children are different", "video", 12, "Weight, physiology and error risk.", ["Doses are commonly calculated per kilogram of body weight.", "Always use the current, recorded weight."]),
      L("l-h2", "Dose arithmetic drills", "practice", 20, "mg/kg calculations with worked answers.", ["Dose = mg/kg × weight (kg).", "Re-check units before preparing."]),
      L("l-h3", "The rights of administration", "reading", 10, "A structured checklist.", ["Right patient, drug, dose, route, time, and documentation."]),
      L("l-h4", "Live case review", "live", 45, "Discuss anonymised scenarios with a facilitator.", ["No real patient information is shared."]),
    ],
  },
  {
    id: "c-bls", slug: "basic-life-support-awareness", title: "Basic Life Support Awareness", subjectId: "health", ageBands: ["adults", "professionals"], level: "Awareness",
    provider: { type: "platform" }, priceNGN: 8_000, weeks: 2, hue: 160,
    summary: "Understand the chain of survival. Hands-on certification must be done in person with an accredited provider.",
    outcomes: ["Recognise an emergency", "Know when to call for help", "Understand what certified training covers"],
    professional: { field: "First aid", disclaimer: "Awareness only. Not a BLS certification. Book accredited, in-person training to be certified." },
    lessons: [L("l-bl1", "The chain of survival", "video", 10, "Early recognition and help.", [])],
  },
  {
    id: "c-algebra-clinic", slug: "algebra-confidence-clinic", title: "Algebra Confidence Clinic", subjectId: "math", ageBands: ["teens"], level: "JSS 2–SS 1",
    provider: { type: "tutor", tutorId: "tut-emeka" }, priceNGN: 30_000, weeks: 4, hue: 262,
    summary: "Mr Emeka's four-week small-group clinic for learners who 'just don't get' algebra yet.",
    outcomes: ["Rebuild confidence", "Master the balance method", "Tackle BECE algebra"],
    lessons: [L("l-ac1", "The balance method", "live", 60, "Small group, guardian-approved.", [])],
  },
];

export const courseById = (id: string) => COURSES.find((c) => c.id === id);

// ── Live classes in the demo week (links are placeholders) ──

const link = (provider: LiveClass["provider"], code: string) =>
  provider === "zoom" ? `https://zoom.us/j/demo-${code}` : provider === "google_meet" ? `https://meet.google.com/demo-${code}` : `https://lumen.example/room/${code}`;

export const LIVE_CLASSES: LiveClass[] = [
  {
    id: "lc-jss3-math", tenantId: T, courseId: "c-jss3-math", classId: "cls-jss3", title: "Elimination practice clinic", host: "Cover teacher",
    startsAt: watISO(1, "11:00"), minutes: 40, provider: "google_meet", link: link("google_meet", "jss3-math"), recordingAvailable: false,
  },
  {
    id: "lc-jss3-bsc", tenantId: T, courseId: "c-jss3-bsc", classId: "cls-jss3", title: "Live lab: build a pulley", host: "Mrs Ifeoma Nnaji",
    startsAt: watISO(2, "10:20"), minutes: 40, provider: "lumen_room", link: link("lumen_room", "jss3-bsc"), recordingAvailable: false,
  },
  {
    id: "lc-p5-story", tenantId: T, courseId: "c-p5-read", classId: "cls-p5", title: "Live storytime", host: "Mrs Ronke Balogun",
    startsAt: watISO(2, "11:00"), minutes: 30, provider: "google_meet", link: link("google_meet", "p5-story"), recordingAvailable: false,
  },
  {
    id: "lc-p5-num", tenantId: T, courseId: "c-p5-num", classId: "cls-p5", title: "Storytime maths", host: "Mrs Ronke Balogun",
    startsAt: watISO(0, "11:00"), minutes: 30, provider: "google_meet", link: link("google_meet", "p5-num"), recordingAvailable: true,
  },
  {
    id: "lc-pyds", tenantId: "platform", courseId: "c-py-ds", classId: null, title: "Office hours: stacks & queues", host: "Dr Musa Abdullahi",
    startsAt: watISO(3, "18:00"), minutes: 45, provider: "zoom", link: link("zoom", "pyds-oh"), recordingAvailable: false,
  },
  {
    id: "lc-pyds-prev", tenantId: "platform", courseId: "c-py-ds", classId: null, title: "Office hours: dictionaries", host: "Dr Musa Abdullahi",
    startsAt: watISO(-4, "18:00"), minutes: 45, provider: "zoom", link: link("zoom", "pyds-oh-prev"), recordingAvailable: true,
  },
  {
    id: "lc-med", tenantId: "platform", courseId: "c-med-safety", classId: null, title: "Case review: dose double-checks", host: "Facilitator, Lumen Health Faculty",
    startsAt: watISO(5, "10:00"), minutes: 45, provider: "lumen_room", link: link("lumen_room", "med-case"), recordingAvailable: false,
  },
  {
    id: "lc-waec", tenantId: "platform", courseId: "c-waec-phy", classId: null, title: "Past questions 2019–2025", host: "Mr Seyi Bankole",
    startsAt: watISO(2, "17:00"), minutes: 60, provider: "zoom", link: link("zoom", "waec-phy"), recordingAvailable: false,
  },
];

// ── Weekly tests: two checks per week (Tuesday and Friday) ──

export const WEEKLY_TESTS: WeeklyTest[] = [
  {
    id: "wt-math-w7-1", subjectId: "math", courseId: "c-jss3-math", ageBand: "teens", week: 7, slot: 1, title: "Tuesday check: simultaneous equations",
    opensAt: watISO(1, "08:00"), minutes: 12,
    questions: [
      { id: "q1", prompt: "Solve: x + y = 10 and x − y = 4", options: ["x = 7, y = 3", "x = 6, y = 4", "x = 3, y = 7", "x = 8, y = 2"], answer: 0, explanation: "Add the equations: 2x = 14, so x = 7. Then y = 10 − 7 = 3." },
      { id: "q2", prompt: "If 2x + y = 11 and x = 4, what is y?", options: ["7", "3", "4", "19"], answer: 1, explanation: "2(4) + y = 11 → 8 + y = 11 → y = 3." },
      { id: "q3", prompt: "Factorise x² + 5x + 6", options: ["(x + 1)(x + 6)", "(x + 2)(x + 3)", "(x − 2)(x − 3)", "(x + 5)(x + 1)"], answer: 1, explanation: "2 × 3 = 6 and 2 + 3 = 5." },
      { id: "q4", prompt: "Solve 3a − 2 = 13", options: ["a = 3", "a = 11/3", "a = 5", "a = 15"], answer: 2, explanation: "3a = 15, so a = 5." },
      { id: "q5", prompt: "Which values satisfy both 2x + 3y = 12 and x = y?", options: ["x = y = 2.4", "x = y = 3", "x = y = 2", "x = y = 4"], answer: 0, explanation: "Substitute y = x: 5x = 12, so x = y = 2.4." },
    ],
  },
  {
    id: "wt-math-w7-2", subjectId: "math", courseId: "c-jss3-math", ageBand: "teens", week: 7, slot: 2, title: "Friday check: word problems",
    opensAt: watISO(4, "16:00"), minutes: 12,
    questions: [
      { id: "q1", prompt: "Two numbers add to 20 and differ by 6. What is the larger?", options: ["13", "14", "12", "16"], answer: 0, explanation: "x + y = 20, x − y = 6 → 2x = 26 → x = 13." },
      { id: "q2", prompt: "3 pens and 2 books cost ₦1,300; 1 pen and 2 books cost ₦900. Price of a pen?", options: ["₦150", "₦200", "₦250", "₦300"], answer: 1, explanation: "Subtract: 2 pens = ₦400, so a pen costs ₦200." },
      { id: "q3", prompt: "Factorise x² − 9", options: ["(x − 3)²", "(x + 9)(x − 1)", "(x − 3)(x + 3)", "x(x − 9)"], answer: 2, explanation: "Difference of two squares." },
    ],
  },
  {
    id: "wt-num-w7-1", subjectId: "math", courseId: "c-p5-num", ageBand: "kids", week: 7, slot: 1, title: "Tuesday treasure hunt",
    opensAt: watISO(1, "08:00"), minutes: 10,
    questions: [
      { id: "q1", prompt: "Which is bigger?", options: ["3/4", "2/3"], answer: 0, explanation: "3/4 is 9/12 and 2/3 is 8/12, so 3/4 is bigger." },
      { id: "q2", prompt: "Round 456 to the nearest hundred.", options: ["400", "450", "500", "460"], answer: 2, explanation: "456 is closer to 500 than to 400." },
      { id: "q3", prompt: "1/2 + 1/4 = ?", options: ["2/6", "3/4", "1/8", "2/4"], answer: 1, explanation: "1/2 is the same as 2/4. 2/4 + 1/4 = 3/4." },
      { id: "q4", prompt: "In 7,382, what is the value of the 3?", options: ["3", "30", "300", "3,000"], answer: 2, explanation: "The 3 is in the hundreds place." },
      { id: "q5", prompt: "Mama buys 3 loaves at ₦850 each. How much altogether?", options: ["₦2,550", "₦2,450", "₦1,700", "₦2,850"], answer: 0, explanation: "850 + 850 + 850 = 2,550." },
    ],
  },
  {
    id: "wt-num-w7-2", subjectId: "math", courseId: "c-p5-num", ageBand: "kids", week: 7, slot: 2, title: "Friday puzzle trail",
    opensAt: watISO(4, "12:00"), minutes: 10,
    questions: [
      { id: "q1", prompt: "What is 1/3 of 12?", options: ["3", "4", "6", "9"], answer: 1, explanation: "12 shared into 3 equal groups is 4 each." },
    ],
  },
  {
    id: "wt-py-w7-1", subjectId: "comp", courseId: "c-py-ds", ageBand: "university", week: 7, slot: 1, title: "Check 1: core structures",
    opensAt: watISO(1, "08:00"), minutes: 10,
    questions: [
      { id: "q1", prompt: "What does len([3, 1, 4]) return?", options: ["3", "4", "8", "An error"], answer: 0, explanation: "The list has three items." },
      { id: "q2", prompt: "Which built-in structure gives average O(1) lookup by key?", options: ["list", "tuple", "dict", "str"], answer: 2, explanation: "Dictionaries are hash tables." },
      { id: "q3", prompt: "What does print(7 // 2) output?", options: ["3.5", "3", "4", "1"], answer: 1, explanation: "// is floor division." },
      { id: "q4", prompt: "Binary search on a sorted list of n items runs in…", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: 2, explanation: "Each step halves the remaining range." },
      { id: "q5", prompt: "A stack removes items in which order?", options: ["First in, first out", "Last in, first out", "Random", "Sorted"], answer: 1, explanation: "Stacks are LIFO." },
    ],
  },
  {
    id: "wt-py-w7-2", subjectId: "comp", courseId: "c-py-ds", ageBand: "university", week: 7, slot: 2, title: "Check 2: complexity",
    opensAt: watISO(4, "08:00"), minutes: 10,
    questions: [{ id: "q1", prompt: "Appending to the end of a Python list is, on average…", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], answer: 0, explanation: "Amortised constant time." }],
  },
  {
    id: "wt-med-w7-1", subjectId: "health", courseId: "c-med-safety", ageBand: "professionals", week: 7, slot: 1, title: "Check 1: dosing arithmetic",
    opensAt: watISO(1, "08:00"), minutes: 12,
    questions: [
      { id: "q1", prompt: "Paediatric doses are most commonly calculated using…", options: ["Age only", "Body weight (mg/kg)", "Height only", "The adult dose halved"], answer: 1, explanation: "Weight-based dosing (mg/kg) is the common basis; always follow the prescription and local protocol." },
      { id: "q2", prompt: "A prescription is 15 mg/kg for a child weighing 12 kg. What dose does that calculate to?", options: ["120 mg", "150 mg", "180 mg", "27 mg"], answer: 2, explanation: "15 × 12 = 180 mg. The arithmetic is only one part of the safety check." },
      { id: "q3", prompt: "A calculated dose looks unusually high. What is the safest next step?", options: ["Give half and observe", "Pause and verify with the prescriber or pharmacist", "Give it as written", "Ask the parent"], answer: 1, explanation: "Stop and verify before administering." },
      { id: "q4", prompt: "Why use an oral syringe rather than a household spoon for liquid medicines?", options: ["It is cheaper", "Household spoons vary in volume", "It tastes better", "It is faster"], answer: 1, explanation: "Spoons are not standardised measures." },
      { id: "q5", prompt: "Which is one of the classic 'rights' of medication administration?", options: ["Right colour", "Right patient", "Right brand", "Right price"], answer: 1, explanation: "Right patient, drug, dose, route, time and documentation." },
    ],
  },
  {
    id: "wt-med-w7-2", subjectId: "health", courseId: "c-med-safety", ageBand: "professionals", week: 7, slot: 2, title: "Check 2: scenarios",
    opensAt: watISO(4, "08:00"), minutes: 12,
    questions: [{ id: "q1", prompt: "Which weight should a dose be based on?", options: ["Last year's weight", "The current recorded weight", "An estimate from age", "The parent's guess"], answer: 1, explanation: "Use a current, recorded weight." }],
  },
];

/** Earlier weeks' results, so summaries and trends have history. */
export const TEST_ATTEMPTS: TestAttempt[] = [
  ...([[5, 1, 2, 5], [5, 2, 3, 5], [6, 1, 3, 5], [6, 2, 4, 5]] as const).map(([w, s, score, total]) => ({
    id: `ta-chi-${w}-${s}`, testId: `wt-math-w${w}-${s}`, studentId: "stu-chidera", score, total, answers: [], completedAt: watISO(-7 * (7 - w) + (s === 1 ? 1 : 4), "17:30"),
  })),
  ...([[5, 1, 4, 5], [5, 2, 4, 5], [6, 1, 5, 5], [6, 2, 4, 5]] as const).map(([w, s, score, total]) => ({
    id: `ta-tolu-${w}-${s}`, testId: `wt-num-w${w}-${s}`, studentId: "stu-tolu", score, total, answers: [], completedAt: watISO(-7 * (7 - w) + (s === 1 ? 1 : 4), "16:30"),
  })),
  ...([[6, 1, 4, 5], [6, 2, 5, 5]] as const).map(([w, s, score, total]) => ({
    id: `ta-ibr-${w}-${s}`, testId: `wt-py-w${w}-${s}`, studentId: "stu-ibrahim", score, total, answers: [], completedAt: watISO(-7 + (s === 1 ? 1 : 4), "20:00"),
  })),
  ...([[6, 1, 4, 5], [6, 2, 5, 5]] as const).map(([w, s, score, total]) => ({
    id: `ta-ais-${w}-${s}`, testId: `wt-med-w${w}-${s}`, studentId: "stu-aisha", score, total, answers: [], completedAt: watISO(-7 + (s === 1 ? 1 : 4), "21:00"),
  })),
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "ach-first-live", title: "First live class", description: "Joined a live class on time.", icon: "spark" },
  { id: "ach-streak-5", title: "Five-day streak", description: "Learned something five days in a row.", icon: "streak" },
  { id: "ach-perfect", title: "Perfect check", description: "Scored full marks on a weekly check.", icon: "star" },
  { id: "ach-science", title: "Lab explorer", description: "Completed a science practical.", icon: "atom" },
  { id: "ach-reader", title: "Bookworm", description: "Finished ten reading lessons.", icon: "book" },
  { id: "ach-quiz", title: "Quiz team", description: "Represented your school in a tournament.", icon: "trophy" },
  { id: "ach-explorer", title: "Pathfinder", description: "Tried a course outside your class.", icon: "compass" },
];

export const EARNED_ACHIEVEMENTS: Record<string, string[]> = {
  "stu-chidera": ["ach-streak-5", "ach-science", "ach-quiz"],
  "stu-tolu": ["ach-first-live", "ach-perfect", "ach-reader"],
  "stu-ibrahim": ["ach-perfect", "ach-explorer"],
  "stu-aisha": ["ach-streak-5"],
};

export const PROGRESS: LearnerProgress[] = [
  { studentId: "stu-chidera", courseId: "c-jss3-math", completedLessonIds: ["l-m1", "l-m2"], lastOpenedAt: watISO(0, "19:10") },
  { studentId: "stu-chidera", courseId: "c-jss3-bsc", completedLessonIds: ["l-b1", "l-b2"], lastOpenedAt: watISO(-1, "18:00") },
  { studentId: "stu-chidera", courseId: "c-jss3-comp", completedLessonIds: ["l-c1"], lastOpenedAt: watISO(-3, "17:00") },
  { studentId: "stu-tolu", courseId: "c-p5-num", completedLessonIds: ["l-n1", "l-n2"], lastOpenedAt: watISO(0, "17:00") },
  { studentId: "stu-tolu", courseId: "c-p5-read", completedLessonIds: ["l-r1"], lastOpenedAt: watISO(-1, "18:30") },
  { studentId: "stu-ibrahim", courseId: "c-py-ds", completedLessonIds: ["l-d1", "l-d2", "l-d3"], lastOpenedAt: watISO(0, "21:00") },
  { studentId: "stu-ibrahim", courseId: "c-calc", completedLessonIds: [], lastOpenedAt: null },
  { studentId: "stu-aisha", courseId: "c-med-safety", completedLessonIds: ["l-h1"], lastOpenedAt: watISO(-2, "22:00") },
];
