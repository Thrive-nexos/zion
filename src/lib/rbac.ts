import type { Role } from "@/lib/domain/types";

/**
 * Role-based access control.
 *
 * The demo enforces this matrix in the UI and in every service call. In
 * production the same matrix is evaluated server-side, combined with
 * tenant scoping (PostgreSQL row-level security on `tenant_id`) and
 * relationship checks (a guardian may only see their own children).
 */
export type Permission =
  | "school.setup" | "school.enrol" | "school.staff.assign" | "school.fees" | "school.reports.publish" | "school.notices" | "school.analytics"
  | "class.attendance" | "class.assignments" | "class.grades"
  | "learning.consume" | "tests.take" | "live.join"
  | "child.view" | "child.approve" | "child.messages" | "bookings.create" | "expenses.view"
  | "tutor.profile" | "tutor.sessions" | "tutor.earnings" | "tutor.apply"
  | "messages.send" | "safety.report"
  | "admin.schools" | "admin.tutors" | "admin.safety" | "admin.moderation" | "admin.content" | "admin.finance" | "admin.audit" | "admin.disputes";

export const ROLE_LABEL: Record<Role, string> = {
  learner: "Learner",
  guardian: "Parent / guardian",
  school_admin: "School admin",
  teacher: "Teacher",
  tutor: "Independent tutor",
  platform_admin: "Platform admin",
};

export const ROLE_HOME: Record<Role, string> = {
  learner: "/learn",
  guardian: "/guardian",
  school_admin: "/school",
  teacher: "/teacher",
  tutor: "/tutor",
  platform_admin: "/admin",
};

const MATRIX: Record<Role, Permission[]> = {
  learner: ["learning.consume", "tests.take", "live.join", "messages.send", "safety.report"],
  guardian: ["child.view", "child.approve", "child.messages", "bookings.create", "expenses.view", "messages.send", "safety.report"],
  school_admin: [
    "school.setup", "school.enrol", "school.staff.assign", "school.fees", "school.reports.publish", "school.notices", "school.analytics",
    "class.attendance", "class.grades", "messages.send", "safety.report",
  ],
  teacher: ["class.attendance", "class.assignments", "class.grades", "school.notices", "messages.send", "safety.report"],
  tutor: ["tutor.profile", "tutor.sessions", "tutor.earnings", "tutor.apply", "messages.send", "safety.report"],
  platform_admin: [
    "admin.schools", "admin.tutors", "admin.safety", "admin.moderation", "admin.content", "admin.finance", "admin.audit", "admin.disputes", "safety.report",
  ],
};

export function can(role: Role, permission: Permission) {
  return MATRIX[role].includes(permission);
}

export function permissionsFor(role: Role) {
  return MATRIX[role];
}

export class AccessDenied extends Error {
  constructor(role: Role, permission: Permission) {
    super(`${ROLE_LABEL[role]} cannot perform “${permission}”.`);
  }
}

export function assertCan(role: Role, permission: Permission) {
  if (!can(role, permission)) throw new AccessDenied(role, permission);
}

/** Data-visibility rules shown on the safeguarding page and enforced by services. */
export const VISIBILITY_RULES = [
  "Children never have public profiles. Leaderboards show a school-issued pseudonym only.",
  "A guardian sees only the children linked to them, and every message those children send or receive.",
  "Tutors can message a minor only inside a thread that includes the child's guardian.",
  "School staff see only learners in their own school (tenant) and, for teachers, their own classes.",
  "Platform admins see safety and finance data but access to a child's record is logged in the audit trail.",
  "No advertising is shown to learners under 18, and no child data is used for marketing.",
] as const;
