import type { Role } from "@/lib/domain/types";

export type RoleSlug = "learner" | "guardian" | "school-admin" | "teacher" | "tutor" | "platform-admin";

export const ROLE_SLUGS: Record<RoleSlug, { role: Role; title: string; tagline: string; points: string[]; accent: string }> = {
  learner: {
    role: "learner", title: "Learner", tagline: "Kids, teens, university students, adults and professionals.",
    points: ["School lessons arrive automatically", "Live classes & recorded lessons", "Two short checks a week"], accent: "#2f8fd8",
  },
  guardian: {
    role: "guardian", title: "Parent / guardian", tagline: "See progress, approve, book and stay in every conversation.",
    points: ["Approve tutors, courses and spending", "Read every tutor message", "Weekly letter, not noise"], accent: "#c98a14",
  },
  "school-admin": {
    role: "school_admin", title: "School admin", tagline: "Run enrolment, timetables, grades, fees and report cards.",
    points: ["Verification & branches", "Assign teachers in one tap", "Invite learners & guardians"], accent: "#2a1f78",
  },
  teacher: {
    role: "teacher", title: "School teacher", tagline: "Attendance, assignments and grading without the paperwork.",
    points: ["30-second attendance", "Set & grade assignments", "Gradebook with CA and exams"], accent: "#1f8f5f",
  },
  tutor: {
    role: "tutor", title: "Independent tutor", tagline: "Get vetted, set your hourly rate and teach safely.",
    points: ["Six-stage qualification", "Time-zone-aware bookings", "Transparent hourly earnings"], accent: "#7b5cff",
  },
  "platform-admin": {
    role: "platform_admin", title: "Platform admin", tagline: "Trust & Safety, approvals, finance and the audit trail.",
    points: ["School approvals & tutor vetting", "Safety reports & moderation", "Audit log for every action"], accent: "#120d2e",
  },
};

export const isRoleSlug = (s: string): s is RoleSlug => s in ROLE_SLUGS;
