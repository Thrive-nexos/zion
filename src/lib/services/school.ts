"use client";

import { z } from "zod";
import type { AttendanceStatus, Assignment, Notice } from "@/lib/domain/types";
import { commit, getState, nowISO, toast, uid } from "@/lib/demo/store";
import { classById, staffById, studentById } from "@/lib/selectors";
import { subjectById } from "@/lib/seed/catalog";
import { CURRENT_TERM_ID, FEE_SCHEDULE } from "@/lib/seed/school-ops";
import { HOME_SCHOOL_ID } from "@/lib/seed/schools";
import { DemoError, guard, latency } from "./core";

const T = HOME_SCHOOL_ID;

export async function assignTeacher(classId: string, subjectId: string, staffId: string | null) {
  guard("school.staff.assign");
  await latency();
  const s = getState();
  const cls = classById(s, classId);
  if (!cls) throw new DemoError("Class not found");
  const teacher = staffById(s, staffId);
  if (teacher && teacher.status !== "active") throw new DemoError(`${teacher.name} hasn't accepted their staff invitation yet.`);
  commit(
    (st) => ({ ...st, classes: st.classes.map((c) => (c.id === classId ? { ...c, subjectTeachers: { ...c.subjectTeachers, [subjectId]: staffId } } : c)) }),
    {
      action: "class.assign_teacher", entity: `class:${classId}`, tenantId: T,
      summary: teacher ? `Assigned ${teacher.name} to ${subjectById(subjectId).name} for ${cls.name}` : `Unassigned ${subjectById(subjectId).name} for ${cls.name}`,
    },
  );
  const learners = s.students.filter((x) => x.classId === classId).length;
  toast({
    tone: "success",
    title: teacher ? `${teacher.name} now teaches ${subjectById(subjectId).short}` : "Teacher removed",
    body: teacher ? `${learners} learners in ${cls.name} see the change in their timetable, live classes and course page right away.` : undefined,
  });
}

export async function setFormTeacher(classId: string, staffId: string) {
  guard("school.staff.assign");
  await latency();
  commit((st) => ({ ...st, classes: st.classes.map((c) => (c.id === classId ? { ...c, formTeacherId: staffId } : c)) }), {
    action: "class.form_teacher", entity: `class:${classId}`, tenantId: T, summary: `Form teacher changed for ${classById(getState(), classId)?.name}`,
  });
  toast({ tone: "success", title: "Form teacher updated" });
}

export async function acceptStaffInvite(staffId: string) {
  guard("school.staff.assign");
  await latency();
  const st = staffById(getState(), staffId);
  commit((s) => ({ ...s, staff: s.staff.map((x) => (x.id === staffId ? { ...x, status: "active", safeguardingTrained: true } : x)) }), {
    action: "staff.invite_accepted", entity: `staff:${staffId}`, tenantId: T, summary: `${st?.name} accepted the staff invitation (simulated)`,
  });
  toast({ tone: "success", title: `${st?.name} is now active`, body: "Simulated: the invitation email was 'accepted' instantly.", demo: true });
}

export const enrolSchema = z.object({
  firstName: z.string().trim().min(2, "Enter the learner's first name"),
  lastName: z.string().trim().min(2, "Enter the learner's last name"),
  age: z.coerce.number().int().min(4, "Age must be 4 or older").max(19, "Use the adult pathway for learners over 19"),
  classId: z.string().min(1, "Choose a class"),
  guardianName: z.string().trim().min(3, "Enter the guardian's name"),
  guardianContact: z.string().trim().min(5, "Enter an email or phone number"),
  channel: z.enum(["email", "sms"]),
  consent: z.literal(true, { message: "Confirm the guardian is the legal carer" }),
});
export type EnrolInput = z.infer<typeof enrolSchema>;

function mask(contact: string) {
  if (contact.includes("@")) {
    const [u, d] = contact.split("@");
    return `${u[0]}•••••@${d}`;
  }
  return contact.replace(/\d(?=\d{2})/g, "•");
}

export async function enrolLearner(input: EnrolInput) {
  guard("school.enrol");
  const data = enrolSchema.parse(input);
  await latency(500, 900);
  const studentId = uid("stu");
  const code = `IRK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const cls = classById(getState(), data.classId)!;
  commit(
    (s) => ({
      ...s,
      students: [...s.students, {
        id: studentId, tenantId: T, classId: data.classId, firstName: data.firstName, lastName: data.lastName, age: data.age,
        ageBand: data.age < 12 ? "kids" : "teens", guardianIds: [], pseudonym: `Nova ${data.firstName.slice(0, 3)}`, accountStatus: "invited", avatarHue: (data.firstName.length * 47) % 360,
      }],
      invitations: [...s.invitations, {
        id: uid("inv"), tenantId: T, studentId, guardianName: data.guardianName, guardianContactMasked: mask(data.guardianContact),
        channel: data.channel, status: "sent", code, sentAt: nowISO(s), acceptedAt: null,
      }],
      invoices: [...s.invoices, {
        id: uid("inv"), tenantId: T, studentId, termId: CURRENT_TERM_ID, items: cls.level.startsWith("Primary") ? FEE_SCHEDULE.primary : FEE_SCHEDULE.secondary,
        paid: 0, dueDate: "2026-11-13T23:59:00+01:00",
      }],
    }),
    { action: "student.enrol", entity: `student:${studentId}`, tenantId: T, summary: `Enrolled ${data.firstName} ${data.lastName[0]}. into ${cls.name}; invitation ${code} sent to guardian (simulated)` },
  );
  toast({ tone: "success", title: `${data.firstName} enrolled in ${cls.name}`, body: `Invitation ${code} 'sent' by ${data.channel}. No real message was sent.`, demo: true });
  return { studentId, code };
}

export async function acceptInvitation(invitationId: string) {
  guard("school.enrol");
  await latency();
  const inv = getState().invitations.find((i) => i.id === invitationId);
  if (!inv) throw new DemoError("Invitation not found");
  const stu = studentById(getState(), inv.studentId);
  commit(
    (s) => ({
      ...s,
      invitations: s.invitations.map((i) => (i.id === invitationId ? { ...i, status: "accepted", acceptedAt: nowISO(s) } : i)),
      students: s.students.map((x) => (x.id === inv.studentId ? { ...x, accountStatus: "active" } : x)),
    }),
    { action: "invitation.accept", entity: `invitation:${invitationId}`, tenantId: T, summary: `Guardian accepted invitation ${inv.code} (simulated); learner account activated` },
  );
  toast({ tone: "success", title: `${stu?.firstName}'s account is active`, body: "They now receive their class's lessons, timetable and teachers automatically.", demo: true });
}

export async function resendInvitation(invitationId: string) {
  guard("school.enrol");
  await latency();
  commit((s) => ({ ...s, invitations: s.invitations.map((i) => (i.id === invitationId ? { ...i, sentAt: nowISO(s), status: "sent" } : i)) }), {
    action: "invitation.resend", entity: `invitation:${invitationId}`, tenantId: T, summary: "Invitation re-sent (simulated)",
  });
  toast({ tone: "info", title: "Invitation re-sent", body: "Simulated. No email or SMS left this browser.", demo: true });
}

export async function markAttendance(classId: string, date: string, marks: Record<string, AttendanceStatus>) {
  const p = guard("class.attendance");
  await latency(400, 800);
  const cls = classById(getState(), classId)!;
  commit(
    (s) => ({
      ...s,
      attendance: [
        ...s.attendance.filter((a) => !(a.classId === classId && a.date === date)),
        ...Object.entries(marks).map(([studentId, status]) => ({ id: uid("att"), tenantId: T, classId, studentId, date, status, markedBy: p.subjectId })),
      ],
    }),
    { action: "attendance.mark", entity: `class:${classId}`, tenantId: T, summary: `Marked ${cls.name} attendance for ${date} (${Object.keys(marks).length} learners)` },
  );
  const absent = Object.values(marks).filter((m) => m === "absent").length;
  toast({ tone: "success", title: "Attendance saved", body: absent ? `${absent} absent. Guardians would get an SMS by 10:00 (simulated).` : "Everyone accounted for.", demo: absent > 0 });
}

export async function saveGrades(rows: { id: string; ca1: number | null; ca2: number | null; exam: number | null }[]) {
  guard("class.grades");
  for (const r of rows) {
    if ([r.ca1, r.ca2].some((v) => v !== null && (v < 0 || v > 20)) || (r.exam !== null && (r.exam < 0 || r.exam > 60))) {
      throw new DemoError("CA scores must be 0–20 and exam scores 0–60.");
    }
  }
  await latency();
  const map = new Map(rows.map((r) => [r.id, r]));
  commit((s) => ({ ...s, grades: s.grades.map((g) => (map.has(g.id) ? { ...g, ...map.get(g.id)! } : g)) }), {
    action: "grades.save", entity: `grades:${rows.length}`, tenantId: T, summary: `Saved ${rows.length} grade rows`,
  });
  toast({ tone: "success", title: `Saved ${rows.length} scores` });
}

export async function publishReportCards(classId: string, termId: string) {
  guard("school.reports.publish");
  await latency(600, 1000);
  const ids = new Set(getState().students.filter((x) => x.classId === classId).map((x) => x.id));
  commit(
    (s) => ({ ...s, reportCards: s.reportCards.map((r) => (ids.has(r.studentId) && r.termId === termId ? { ...r, status: "published" } : r)) }),
    { action: "report_cards.publish", entity: `class:${classId}`, tenantId: T, summary: `Published ${ids.size} report cards for ${classById(getState(), classId)?.name}` },
  );
  toast({ tone: "success", title: `${ids.size} report cards published`, body: "Guardians can view them now. Email notifications are simulated.", demo: true });
}

export const noticeSchema = z.object({
  title: z.string().trim().min(6, "Give the notice a clear title (6+ characters)").max(80),
  body: z.string().trim().min(20, "Add a little more detail (20+ characters)").max(600),
  audience: z.enum(["everyone", "guardians", "staff", "learners"]),
  pinned: z.boolean(),
});

export async function postNotice(input: z.infer<typeof noticeSchema>) {
  const p = guard("school.notices");
  const data = noticeSchema.parse(input);
  await latency();
  const notice: Notice = { id: uid("ntc"), tenantId: T, ...data, publishedAt: nowISO(), author: p.name };
  commit((s) => ({ ...s, notices: [notice, ...s.notices] }), {
    action: "notice.publish", entity: `notice:${notice.id}`, tenantId: T, summary: `Published notice “${data.title}” to ${data.audience}`,
  });
  toast({ tone: "success", title: "Notice published", body: `Visible to ${data.audience} in their portal. Push/SMS delivery is simulated.`, demo: true });
}

export async function recordFeePayment(invoiceId: string, amount: number, method: "demo_card" | "demo_transfer") {
  guard("school.fees");
  if (amount <= 0) throw new DemoError("Enter an amount above ₦0");
  await latency(600, 1100);
  const ref = `FEE-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  commit(
    (s) => ({
      ...s,
      invoices: s.invoices.map((i) => (i.id === invoiceId ? { ...i, paid: Math.min(i.items.reduce((a, b) => a + b.amount, 0), i.paid + amount) } : i)),
      feePayments: [...s.feePayments, { id: uid("pay"), invoiceId, amount, at: nowISO(s), method, reference: ref }],
    }),
    { action: "fees.record_payment", entity: `invoice:${invoiceId}`, tenantId: T, summary: `Recorded simulated payment ${ref}` },
  );
  toast({ tone: "success", title: "Payment recorded", body: `Reference ${ref}. Simulated, no money moved.`, demo: true });
}

export async function sendFeeReminders(count: number) {
  guard("school.fees");
  await latency();
  commit((s) => s, { action: "fees.remind", entity: `invoices:${count}`, tenantId: T, summary: `Queued ${count} fee reminders (simulated)` });
  toast({ tone: "info", title: `${count} reminders queued`, body: "Simulated. A notification worker would send these by SMS and email.", demo: true });
}

export const assignmentSchema = z.object({
  classId: z.string().min(1, "Choose a class"),
  subjectId: z.string().min(1, "Choose a subject"),
  title: z.string().trim().min(5, "Add a title (5+ characters)").max(80),
  brief: z.string().trim().min(10, "Describe the task (10+ characters)").max(500),
  dueDay: z.coerce.number().int().min(1).max(11),
  maxScore: z.coerce.number().int().min(5, "At least 5 marks").max(100),
});

export async function createAssignment(input: z.infer<typeof assignmentSchema>) {
  const p = guard("class.assignments");
  const d = assignmentSchema.parse(input);
  await latency();
  const s0 = getState();
  const due = new Date(new Date("2026-10-26T18:00:00+01:00").getTime() + d.dueDay * 86_400_000);
  const a: Assignment = {
    id: uid("asg"), tenantId: T, classId: d.classId, courseId: null, subjectId: d.subjectId, title: d.title, brief: d.brief, setBy: p.subjectId,
    dueAt: due.toISOString(), maxScore: d.maxScore,
    submissions: s0.students.filter((x) => x.classId === d.classId).map((x) => ({ studentId: x.id, submittedAt: null, status: "not_started", score: null, feedback: null })),
  };
  commit((s) => ({ ...s, assignments: [a, ...s.assignments] }), {
    action: "assignment.create", entity: `assignment:${a.id}`, tenantId: T, summary: `Set “${d.title}” for ${classById(s0, d.classId)?.name}`,
  });
  toast({ tone: "success", title: "Assignment set", body: `${a.submissions.length} learners see it on their dashboard now.` });
}

export async function gradeSubmission(assignmentId: string, studentId: string, score: number, feedback: string) {
  guard("class.grades");
  const a = getState().assignments.find((x) => x.id === assignmentId);
  if (!a) throw new DemoError("Assignment not found");
  if (score < 0 || score > a.maxScore) throw new DemoError(`Score must be between 0 and ${a.maxScore}`);
  await latency(200, 400);
  commit(
    (s) => ({
      ...s,
      assignments: s.assignments.map((x) => x.id !== assignmentId ? x : {
        ...x, submissions: x.submissions.map((sub) => (sub.studentId === studentId ? { ...sub, score, feedback, status: "graded" } : sub)),
      }),
    }),
    { action: "assignment.grade", entity: `assignment:${assignmentId}`, tenantId: T, summary: `Graded a submission (${score}/${a.maxScore})` },
  );
}

export async function advanceVerification(step: "documents_submitted" | "site_visit_scheduled") {
  guard("school.setup");
  await latency();
  commit((s) => ({ ...s, schools: s.schools.map((x) => (x.id === T ? { ...x, verification: step } : x)) }), {
    action: "school.verification", entity: `school:${T}`, tenantId: T, summary: `Verification moved to ${step}`,
  });
}
