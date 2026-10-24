"use client";

import type { ContentItem, Dispute, SafetyReport } from "@/lib/domain/types";
import { commit, getState, nowISO, toast, uid } from "@/lib/demo/store";
import { schoolById } from "@/lib/selectors";
import { naira } from "@/lib/utils";
import { DemoError, actor, guard, latency } from "./core";

// ── Competitions (school admins opt in; platform admins verify) ──

export async function optInTournament(tournamentId: string, divisionId: string, teamName: string, consents: number, teamSize: number) {
  const p = guard("school.setup");
  if (consents < teamSize) throw new DemoError("Every team member needs a recorded guardian consent before opting in.");
  if (teamName.trim().length < 3) throw new DemoError("Choose a team name");
  await latency();
  commit((s) => ({
    ...s,
    tournaments: s.tournaments.map((t) => t.id !== tournamentId ? t : {
      ...t,
      registrations: [...t.registrations.filter((r) => !(r.schoolId === p.tenantId && r.divisionId === divisionId)), {
        schoolId: p.tenantId, divisionId, status: "opted_in", teamName: teamName.trim(), guardianConsents: consents, teamSize,
      }],
    }),
  }), { action: "tournament.opt_in", entity: `tournament:${tournamentId}`, summary: `Opted in team “${teamName}” (${teamSize} members, consents recorded)` });
  toast({ tone: "success", title: "Team registered", body: "Awaiting platform verification of eligibility and consents." });
}

export async function withdrawTournament(tournamentId: string, divisionId: string) {
  const p = guard("school.setup");
  await latency();
  commit((s) => ({
    ...s,
    tournaments: s.tournaments.map((t) => t.id !== tournamentId ? t : {
      ...t, registrations: t.registrations.map((r) => (r.schoolId === p.tenantId && r.divisionId === divisionId ? { ...r, status: "withdrawn" } : r)),
    }),
  }), { action: "tournament.withdraw", entity: `tournament:${tournamentId}`, summary: "Withdrew a team" });
  toast({ tone: "info", title: "Team withdrawn" });
}

export async function fileAppeal(tournamentId: string, round: number, reason: string) {
  const p = guard("school.setup");
  if (reason.trim().length < 15) throw new DemoError("Describe the issue (15+ characters).");
  await latency();
  commit((s) => ({ ...s, appeals: [{ id: uid("apl"), tournamentId, schoolId: p.tenantId, round, reason: reason.trim(), status: "submitted", at: nowISO(s) }, ...s.appeals] }), {
    action: "tournament.appeal", entity: `tournament:${tournamentId}`, summary: `Filed appeal for round ${round}`,
  });
  toast({ tone: "success", title: "Appeal filed", body: "An independent adjudicator reviews within 72 hours. Results stay provisional meanwhile." });
}

export async function verifyResults(tournamentId: string) {
  guard("admin.content");
  await latency();
  commit((s) => ({
    ...s,
    tournaments: s.tournaments.map((t) => (t.id === tournamentId ? { ...t, results: t.results.map((r) => ({ ...r, verified: true })), registrations: t.registrations.map((r) => (r.status === "opted_in" ? { ...r, status: "verified" } : r)) } : t)),
  }), { action: "tournament.verify", entity: `tournament:${tournamentId}`, summary: "Verified pending results and registrations" });
  toast({ tone: "success", title: "Results verified", body: "Provisional scores are now final on the public leaderboard." });
}

export async function decideTournamentAppeal(appealId: string, upheld: boolean) {
  guard("admin.disputes");
  await latency();
  commit((s) => ({ ...s, appeals: s.appeals.map((a) => (a.id === appealId ? { ...a, status: upheld ? "upheld" : "dismissed" } : a)) }), {
    action: "tournament.appeal_decide", entity: `appeal:${appealId}`, summary: `Competition appeal ${upheld ? "upheld (question voided, scores recalculated)" : "dismissed"}`,
  });
  toast({ tone: "success", title: upheld ? "Appeal upheld" : "Appeal dismissed" });
}

// ── Admin: schools ──

export async function decideSchool(applicationId: string, approve: boolean, note: string) {
  guard("admin.schools");
  await latency();
  const app = getState().schoolApplications.find((a) => a.id === applicationId);
  if (!app) throw new DemoError("Application not found");
  const school = schoolById(getState(), app.schoolId);
  commit((s) => ({
    ...s,
    schoolApplications: s.schoolApplications.map((a) => (a.id === applicationId ? { ...a, status: approve ? "approved" : "rejected", note: note || a.note } : a)),
    schools: s.schools.map((x) => (x.id === app.schoolId ? { ...x, verification: approve ? "verified" : "rejected", onPlatform: approve || x.onPlatform } : x)),
  }), { action: approve ? "school.approve" : "school.reject", entity: `school:${app.schoolId}`, summary: `${approve ? "Approved" : "Rejected"} ${school?.name}` });
  toast({ tone: approve ? "success" : "info", title: approve ? `${school?.name} verified` : `${school?.name} rejected`, body: "The directory badge updates immediately." });
}

export async function toggleSchoolChecklist(applicationId: string, index: number) {
  guard("admin.schools");
  await latency(120, 250);
  commit((s) => ({
    ...s,
    schoolApplications: s.schoolApplications.map((a) => (a.id === applicationId ? { ...a, checklist: a.checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c)) } : a)),
  }), { action: "school.checklist", entity: `school_application:${applicationId}`, summary: "Updated verification checklist" });
}

// ── Admin: safety ──

export async function updateReport(reportId: string, status: SafetyReport["status"], note?: string) {
  const p = guard("admin.safety");
  await latency(250, 450);
  commit((s) => ({
    ...s,
    reports: s.reports.map((r) => (r.id === reportId ? { ...r, status, assignee: r.assignee ?? p.name, notes: note ? [...r.notes, note] : r.notes } : r)),
  }), { action: `report.${status}`, entity: `report:${reportId}`, summary: `Report marked ${status}${note ? `: ${note}` : ""}` });
}

export async function moderateMessage(messageId: string, release: boolean) {
  guard("admin.moderation");
  await latency();
  commit((s) => ({
    ...s,
    messages: s.messages.map((m) => (m.id === messageId ? { ...m, moderation: release ? { verdict: "clean", reasons: [] } : { ...m.moderation, verdict: "blocked" } } : m)),
  }), { action: release ? "message.release" : "message.reject", entity: `message:${messageId}`, summary: release ? "Released held message after review" : "Rejected held message; sender warned" });
  toast({ tone: "success", title: release ? "Message released" : "Message rejected", body: release ? undefined : "Sender received a policy warning (simulated)." });
}

export async function unlockThread(threadId: string) {
  guard("admin.moderation");
  await latency();
  commit((s) => ({ ...s, threads: s.threads.map((t) => (t.id === threadId ? { ...t, status: "open" } : t)) }), {
    action: "thread.unlock", entity: `thread:${threadId}`, summary: "Thread unlocked after safeguarding review",
  });
}

// ── Admin: content, disputes ──

export async function setContentStatus(id: string, status: ContentItem["status"]) {
  guard("admin.content");
  await latency(200, 400);
  commit((s) => ({ ...s, content: s.content.map((c) => (c.id === id ? { ...c, status, updatedAt: nowISO(s) } : c)) }), {
    action: `content.${status}`, entity: `content:${id}`, summary: `Content set to ${status}`,
  });
}

export async function resolveDispute(id: string, outcome: Dispute["status"]) {
  guard("admin.disputes");
  await latency();
  const d = getState().disputes.find((x) => x.id === id);
  commit((s) => ({
    ...s,
    disputes: s.disputes.map((x) => (x.id === id ? { ...x, status: outcome, timeline: [...x.timeline, { at: nowISO(s), text: `Resolved: ${outcome.replace("_", " ")} by ${actor().name}` }] } : x)),
  }), { action: "dispute.resolve", entity: `dispute:${id}`, summary: `Dispute ${d?.bookingRef} → ${outcome}${outcome === "refunded" && d ? ` (${naira(d.amountNGN)} mock refund)` : ""}` });
  toast({ tone: "success", title: "Dispute resolved", body: outcome.includes("refund") ? "Mock refund recorded in the finance ledger." : undefined, demo: outcome.includes("refund") });
}
