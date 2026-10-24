import type { Guardian, Persona, Staff, Student } from "@/lib/domain/types";
import { hashString, prng } from "@/lib/utils";
import { HOME_SCHOOL_ID } from "./schools";

const T = HOME_SCHOOL_ID;

// ───────────── Demo personas (all fictional) ─────────────

export const PERSONAS: Persona[] = [
  {
    id: "p-chidera", role: "learner", name: "Chidera Okafor", shortName: "Chidera", title: "JSS 3 learner, 14",
    tenantId: T, subjectId: "stu-chidera", city: "Lagos",
    blurb: "School-linked teen. Gets Iroko Gate lessons automatically, plus a guardian-approved maths tutor.",
  },
  {
    id: "p-tolu", role: "learner", name: "Tolu Okafor", shortName: "Tolu", title: "Primary 5 learner, 9",
    tenantId: T, subjectId: "stu-tolu", city: "Lagos",
    blurb: "Young learner. A simplified, playful view with no messaging and no purchases.",
  },
  {
    id: "p-ibrahim", role: "learner", name: "Ibrahim Musa", shortName: "Ibrahim", title: "200L Computer Science, 20",
    tenantId: "platform", subjectId: "stu-ibrahim", city: "Abuja",
    blurb: "Independent university learner using course companions and weekly checks.",
  },
  {
    id: "p-aisha", role: "learner", name: "Aisha Bello", shortName: "Aisha", title: "Registered nurse, 31",
    tenantId: "platform", subjectId: "stu-aisha", city: "Kaduna",
    blurb: "Professional learner on an educational refresher. Not a licence or CPD credit.",
  },
  {
    id: "p-adaeze", role: "guardian", name: "Mrs Adaeze Okafor", shortName: "Adaeze", title: "Parent of Chidera & Tolu",
    tenantId: "platform", subjectId: "gdn-adaeze", city: "Lagos",
    blurb: "Sees progress, approves tutors and spending, reads every tutor message.",
  },
  {
    id: "p-coker", role: "school_admin", name: "Mr Babatunde Coker", shortName: "Mr Coker", title: "School administrator, Iroko Gate",
    tenantId: T, subjectId: "stf-coker", city: "Lagos",
    blurb: "Runs enrolment, timetables, teacher assignments, fees and report cards.",
  },
  {
    id: "p-halima", role: "teacher", name: "Ms Halima Sani", shortName: "Ms Sani", title: "Mathematics teacher, Iroko Gate",
    tenantId: T, subjectId: "stf-halima", city: "Lagos",
    blurb: "Takes attendance, sets assignments and grades her classes.",
  },
  {
    id: "p-emeka", role: "tutor", name: "Mr Emeka Nwosu", shortName: "Emeka", title: "Independent maths tutor",
    tenantId: "platform", subjectId: "tut-emeka", city: "Enugu",
    blurb: "Vetted tutor. Manages availability, sessions and an hourly earnings ledger.",
  },
  {
    id: "p-kemi", role: "platform_admin", name: "Kemi Lawal", shortName: "Kemi", title: "Trust & Safety lead",
    tenantId: "platform", subjectId: "adm-kemi", city: "Lagos",
    blurb: "Approves schools, vets tutors, triages safety reports and audits the platform.",
  },
];

export const personaById = (id: string) => PERSONAS.find((p) => p.id === id);
export const defaultPersonaFor = (role: Persona["role"]) => PERSONAS.find((p) => p.role === role)!;

// ───────────── Guardians ─────────────

export const GUARDIANS: Guardian[] = [
  { id: "gdn-adaeze", name: "Mrs Adaeze Okafor", relationship: "Mother", childIds: ["stu-chidera", "stu-tolu"], city: "Lagos", phoneMasked: "+234 80• ••• 4412" },
];

// ───────────── Staff at Iroko Gate ─────────────

const staff = (id: string, name: string, title: string, subjects: string[], status: Staff["status"] = "active", joined = "2019-09-09"): Staff => ({
  id, tenantId: T, name, title, subjects, status, safeguardingTrained: status === "active", joined: `${joined}T08:00:00+01:00`,
});

export const STAFF: Staff[] = [
  staff("stf-coker", "Mr Babatunde Coker", "School Administrator", []),
  staff("stf-halima", "Ms Halima Sani", "Mathematics", ["math"], "active", "2021-01-11"),
  staff("stf-seun", "Mr Oluwaseun Adebayo", "English Language", ["eng"], "active", "2016-09-12"),
  staff("stf-ifeoma", "Mrs Ifeoma Nnaji", "Basic Science & Biology", ["bsc", "bio"], "active", "2014-09-08"),
  staff("stf-tunde", "Mr Tunde Bakare", "Physics", ["phy"], "active", "2018-01-08"),
  staff("stf-grace", "Ms Grace Effiong", "Chemistry", ["chem"], "active", "2020-09-14"),
  staff("stf-yakubu", "Mr Yakubu Danjuma", "Computing", ["comp", "data"], "active", "2022-09-12"),
  staff("stf-bisi", "Mrs Bisi Ogunleye", "Yorùbá", ["yor"], "active", "2012-09-10"),
  staff("stf-chiamaka", "Mme Chiamaka Obi", "French", ["fre"], "active", "2019-09-09"),
  staff("stf-kelechi", "Mr Kelechi Umeh", "Civic & Social Studies", ["civ", "econ"], "active", "2017-09-11"),
  staff("stf-ronke", "Mrs Ronke Balogun", "Primary 5 class teacher", ["math", "eng", "bsc"], "active", "2013-09-09"),
  staff("stf-ese", "Ms Ese Okoro", "Primary 4 class teacher", ["math", "eng", "bsc"], "active", "2021-09-13"),
  staff("stf-femi", "Mr Femi Alade", "Creative Arts & Music", ["art"], "active", "2015-09-14"),
  staff("stf-ikenna", "Mr Ikenna Obi", "Mathematics (new hire)", ["math", "phy"], "invited", "2026-10-19"),
];

// ───────────── Students ─────────────

const FIRST = [
  "Adaora", "Bolu", "Chinedu", "Damilola", "Efe", "Fatima", "Gbenga", "Hadiza", "Ifeanyi", "Jumoke", "Kehinde", "Lami",
  "Mfon", "Nneka", "Obinna", "Precious", "Rukayat", "Somto", "Temi", "Uche", "Victor", "Wuraola", "Yusuf", "Zainab",
  "Amaka", "Babajide", "Chioma", "Dayo", "Ebube", "Feyi", "Habib", "Ireti", "Jide", "Kosi", "Lolade", "Musa",
  "Nengi", "Ofure", "Pelumi", "Ruth", "Sade", "Tamuno", "Ugo", "Bisola", "Ekene", "Halimat", "Inioluwa", "Tobenna",
];
const LAST = [
  "Adeyemi", "Okonkwo", "Ibrahim", "Etim", "Ogundipe", "Nwachukwu", "Abubakar", "Ekanem", "Olawale", "Eze", "Bello",
  "Briggs", "Akinola", "Obi", "Danladi", "Oyelaran", "Uzor", "Idowu", "Lawal", "Okeke", "Tamuno-West", "Ajayi", "Garba", "Effiom",
];
const NICK = ["Comet", "Baobab", "Falcon", "Kola", "Nova", "Delta", "Orbit", "Harmattan", "Lagoon", "Ember", "Prism", "Quill", "Atlas", "Cedar"];

export const CLASS_ROSTER: { classId: string; level: string; size: number; age: number; band: Student["ageBand"] }[] = [
  { classId: "cls-p4", level: "Primary 4", size: 14, age: 8, band: "kids" },
  { classId: "cls-p5", level: "Primary 5", size: 15, age: 9, band: "kids" },
  { classId: "cls-jss1", level: "JSS 1", size: 16, age: 11, band: "teens" },
  { classId: "cls-jss3", level: "JSS 3", size: 17, age: 14, band: "teens" },
  { classId: "cls-ss1", level: "SS 1", size: 15, age: 15, band: "teens" },
];

function buildStudents(): Student[] {
  const rand = prng(20261027);
  const list: Student[] = [
    {
      id: "stu-chidera", tenantId: T, classId: "cls-jss3", firstName: "Chidera", lastName: "Okafor", age: 14, ageBand: "teens",
      guardianIds: ["gdn-adaeze"], pseudonym: "Orbit Chi", accountStatus: "active", avatarHue: 262,
    },
    {
      id: "stu-tolu", tenantId: T, classId: "cls-p5", firstName: "Tolu", lastName: "Okafor", age: 9, ageBand: "kids",
      guardianIds: ["gdn-adaeze"], pseudonym: "Comet Tolu", accountStatus: "active", avatarHue: 32,
    },
  ];
  let n = 0;
  for (const c of CLASS_ROSTER) {
    const existing = list.filter((s) => s.classId === c.classId).length;
    for (let i = existing; i < c.size; i++) {
      const first = FIRST[Math.floor(rand() * FIRST.length)];
      const last = LAST[Math.floor(rand() * LAST.length)];
      const id = `stu-${c.classId.slice(4)}-${String(i + 1).padStart(2, "0")}`;
      // The newest JSS 3 learner is still waiting for a guardian to accept the school's invitation.
      const status: Student["accountStatus"] = c.classId === "cls-jss3" && i === c.size - 1 ? "invited" : "active";
      list.push({
        id, tenantId: T, classId: c.classId, firstName: first, lastName: last, age: c.age + (rand() > 0.7 ? 1 : 0), ageBand: c.band,
        guardianIds: [`gdn-x-${id}`], pseudonym: `${NICK[n % NICK.length]} ${first.slice(0, 3)}`, accountStatus: status,
        avatarHue: Math.floor(rand() * 360),
      });
      n++;
    }
  }
  list.push(
    {
      id: "stu-ibrahim", tenantId: null, classId: null, firstName: "Ibrahim", lastName: "Musa", age: 20, ageBand: "university",
      guardianIds: [], pseudonym: "Atlas Ibr", accountStatus: "active", avatarHue: 210,
    },
    {
      id: "stu-aisha", tenantId: null, classId: null, firstName: "Aisha", lastName: "Bello", age: 31, ageBand: "professionals",
      guardianIds: [], pseudonym: "Cedar Ais", accountStatus: "active", avatarHue: 172,
    },
  );
  return list;
}

export const STUDENTS = buildStudents();

export const isMinor = (s: Pick<Student, "age">) => s.age < 18;

export function studentDisplayName(s: Student, viewer: "self" | "staff" | "guardian" | "public") {
  if (viewer === "public") return s.pseudonym;
  return `${s.firstName} ${viewer === "staff" ? s.lastName : s.lastName[0] + "."}`;
}

export const studentSeed = (id: string) => prng(hashString(id));
