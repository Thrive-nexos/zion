"use client";

import type { Message, SafetyReport } from "@/lib/domain/types";
import { commit, getState, nowISO, toast, uid } from "@/lib/demo/store";
import { moderate } from "@/lib/moderation";
import { courseById } from "@/lib/seed/learning";
import { DemoError, actor, guard, latency } from "./core";

export async function decideApproval(approvalId: string, approve: boolean) {
  const p = guard("child.approve");
  const a = getState().approvals.find((x) => x.id === approvalId);
  if (!a) throw new DemoError("Request not found");
  if (a.guardianId !== p.subjectId) throw new DemoError("Only the linked guardian can decide this request.");
  if (a.status !== "pending") throw new DemoError("This request was already decided.");
  await latency();
  commit((s) => {
    let next = { ...s, approvals: s.approvals.map((x) => (x.id === approvalId ? { ...x, status: approve ? "approved" as const : "declined" as const, decidedAt: nowISO(s) } : x)) };
    if (a.kind === "course" && approve) {
      next = { ...next, enrollments: [...next.enrollments, { studentId: a.studentId, courseId: a.refId, at: nowISO(s), via: "guardian_approved" }] };
      const c = courseById(a.refId);
      if (c?.priceNGN) {
        next = { ...next, expenses: [{ id: uid("exp"), guardianId: a.guardianId, studentId: a.studentId, category: "Courses", label: c.title, amount: c.priceNGN, at: nowISO(s), status: "simulated" }, ...next.expenses] };
      }
    }
    if (a.kind === "booking") {
      next = { ...next, bookings: next.bookings.map((b) => (b.id === a.refId ? { ...b, status: approve ? "awaiting_payment" : "declined" } : b)) };
    }
    return next;
  }, { action: approve ? "approval.approve" : "approval.decline", entity: `approval:${approvalId}`, summary: `${approve ? "Approved" : "Declined"}: ${a.title}` });
  toast({
    tone: approve ? "success" : "info",
    title: approve ? "Approved" : "Declined",
    body: a.kind === "booking" && approve ? "Next: pay for the session (simulated checkout)." : a.kind === "course" && approve ? "The course now appears in your child's library." : undefined,
  });
}

export async function sendMessage(threadId: string, body: string) {
  const p = guard("messages.send");
  const text = body.trim();
  if (text.length < 2) throw new DemoError("Write a message first");
  if (text.length > 1000) throw new DemoError("Keep messages under 1,000 characters");
  const thread = getState().threads.find((t) => t.id === threadId);
  if (!thread) throw new DemoError("Thread not found");
  if (thread.status === "locked") throw new DemoError("This thread is locked while a safety review is open.");
  if (!thread.participantIds.includes(p.subjectId)) throw new DemoError("You're not part of this conversation.");
  await latency(250, 500);
  const verdict = moderate(text);
  const msg: Message = {
    id: uid("msg"), threadId, authorId: p.subjectId, authorName: p.name, authorRole: p.role, body: text, at: nowISO(), moderation: verdict,
  };
  commit((s) => {
    let next = { ...s, messages: [...s.messages, msg] };
    if (verdict.verdict === "blocked") {
      const report: SafetyReport = {
        id: uid("rep"), category: "safeguarding", severity: "critical", reporterRole: "platform_admin", subject: `Auto-blocked message: ${verdict.reasons[0]}`,
        detail: `Message in “${thread.subject}” was blocked before delivery. Thread locked pending review.`, targetLabel: `${p.role} · ${p.name}`,
        status: "new", createdAt: nowISO(s), assignee: null, slaHours: 1, notes: [],
      };
      next = { ...next, reports: [report, ...next.reports], threads: next.threads.map((t) => (t.id === threadId ? { ...t, status: "locked" } : t)) };
    }
    if (verdict.verdict === "held") {
      next = {
        ...next,
        reports: [{
          id: uid("rep"), category: "message", severity: "medium", reporterRole: "platform_admin", subject: `Held message: ${verdict.reasons[0]}`,
          detail: `Held in “${thread.subject}”. Awaiting moderator review.`, targetLabel: `${p.role} · ${p.name}`, status: "new", createdAt: nowISO(s), assignee: null, slaHours: 24, notes: [],
        }, ...next.reports],
      };
    }
    return next;
  }, { action: `message.${verdict.verdict === "clean" ? "send" : verdict.verdict}`, entity: `thread:${threadId}`, summary: verdict.verdict === "clean" ? "Message delivered (logged)" : `Message ${verdict.verdict}: ${verdict.reasons.join("; ")}` });
  if (verdict.verdict === "held") toast({ tone: "warning", title: "Message held for review", body: verdict.reasons.join(". ") + ". Keep contact inside Lumen threads." });
  if (verdict.verdict === "blocked") toast({ tone: "danger", title: "Message blocked", body: "A safeguarding lead has been alerted and the thread is locked pending review." });
  return msg;
}

export async function reportConcern(input: { category: SafetyReport["category"]; subject: string; detail: string; targetLabel: string }) {
  const p = guard("safety.report");
  if (input.detail.trim().length < 10) throw new DemoError("Please describe what happened (10+ characters).");
  await latency();
  const severity: SafetyReport["severity"] = input.category === "safeguarding" ? "high" : "medium";
  commit((s) => ({
    ...s,
    reports: [{
      id: uid("rep"), category: input.category, severity, reporterRole: p.role, subject: input.subject, detail: input.detail.trim(), targetLabel: input.targetLabel,
      status: "new", createdAt: nowISO(s), assignee: null, slaHours: severity === "high" ? 4 : 24, notes: [],
    }, ...s.reports],
  }), { action: "report.create", entity: `report:${input.category}`, summary: `New ${severity} report: ${input.subject}` });
  toast({ tone: "success", title: "Report received", body: severity === "high" ? "A safeguarding lead reviews high-priority reports within 4 hours." : "Our Trust & Safety team will review it within 24 hours." });
  return true;
}

export async function blockUser(blockedId: string, label: string) {
  const p = actor();
  await latency();
  commit((s) => ({ ...s, blocks: [...s.blocks, { id: uid("blk"), blockerId: p.subjectId, blockedId, at: nowISO(s) }] }), {
    action: "user.block", entity: `user:${blockedId}`, summary: `${p.name} blocked ${label}`,
  });
  toast({ tone: "info", title: `${label} blocked`, body: "They can't message or book with your family. Existing bookings are paused for review." });
}

export async function unblockUser(blockedId: string) {
  const p = actor();
  await latency(200, 300);
  commit((s) => ({ ...s, blocks: s.blocks.filter((b) => !(b.blockerId === p.subjectId && b.blockedId === blockedId)) }), {
    action: "user.unblock", entity: `user:${blockedId}`, summary: `${p.name} removed a block`,
  });
}
