import {
  Activity, BadgeCheck, BarChart3, BookOpen, Building2, CalendarDays, ClipboardCheck, ClipboardList, Coins, FileText, Flag, Gauge, GraduationCap,
  Home, Inbox, LayoutGrid, Megaphone, MessageSquare, NotebookPen, ScrollText, Search, ShieldAlert, ShieldCheck, Trophy, UserCog, UserPlus,
  Users, Video, Wallet, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/domain/types";

export type PortalId = "learn" | "guardian" | "school" | "teacher" | "tutor" | "admin";

export interface NavItem { href: string; label: string; icon: LucideIcon; mobile?: boolean }
export interface NavGroup { label?: string; items: NavItem[] }

export const PORTALS: Record<PortalId, { role: Role; name: string; groups: NavGroup[] }> = {
  learn: {
    role: "learner",
    name: "Learn",
    groups: [{
      items: [
        { href: "/learn", label: "Home", icon: Home, mobile: true },
        { href: "/learn/courses", label: "My courses", icon: BookOpen, mobile: true },
        { href: "/learn/live", label: "Live classes", icon: Video, mobile: true },
        { href: "/learn/tests", label: "Weekly checks", icon: ClipboardCheck, mobile: true },
        { href: "/learn/assignments", label: "Assignments", icon: NotebookPen },
        { href: "/learn/progress", label: "Progress", icon: Trophy, mobile: true },
        { href: "/learn/discover", label: "Discover", icon: Search },
      ],
    }],
  },
  guardian: {
    role: "guardian",
    name: "Family",
    groups: [{
      items: [
        { href: "/guardian", label: "Overview", icon: Home, mobile: true },
        { href: "/guardian/approvals", label: "Approvals", icon: BadgeCheck, mobile: true },
        { href: "/guardian/schedule", label: "Schedule", icon: CalendarDays, mobile: true },
        { href: "/guardian/messages", label: "Messages", icon: MessageSquare, mobile: true },
        { href: "/guardian/expenses", label: "Spending", icon: Wallet },
        { href: "/guardian/safety", label: "Safety & blocks", icon: ShieldCheck },
        { href: "/tutors", label: "Find a tutor", icon: Search },
      ],
    }],
  },
  school: {
    role: "school_admin",
    name: "School",
    groups: [
      { items: [{ href: "/school", label: "Overview", icon: Gauge, mobile: true }] },
      { label: "Setup", items: [
        { href: "/school/verification", label: "Verification", icon: BadgeCheck },
        { href: "/school/setup", label: "Branches & terms", icon: Building2 },
        { href: "/school/classes", label: "Classes", icon: LayoutGrid },
      ] },
      { label: "People", items: [
        { href: "/school/enrolment", label: "Enrolment & invites", icon: UserPlus, mobile: true },
        { href: "/school/teachers", label: "Teachers", icon: UserCog, mobile: true },
      ] },
      { label: "Teaching", items: [
        { href: "/school/timetable", label: "Timetable", icon: CalendarDays },
        { href: "/school/attendance", label: "Attendance", icon: ClipboardCheck, mobile: true },
        { href: "/school/grades", label: "Grades", icon: ClipboardList },
        { href: "/school/report-cards", label: "Report cards", icon: ScrollText },
      ] },
      { label: "Community", items: [
        { href: "/school/notices", label: "Notices", icon: Megaphone },
        { href: "/school/competitions", label: "Competitions", icon: Trophy },
      ] },
      { label: "Money & insight", items: [
        { href: "/school/fees", label: "Fees", icon: Coins },
        { href: "/school/analytics", label: "Analytics", icon: BarChart3 },
      ] },
    ],
  },
  teacher: {
    role: "teacher",
    name: "Classroom",
    groups: [{
      items: [
        { href: "/teacher", label: "Today", icon: Home, mobile: true },
        { href: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck, mobile: true },
        { href: "/teacher/assignments", label: "Assignments", icon: NotebookPen, mobile: true },
        { href: "/teacher/grades", label: "Gradebook", icon: ClipboardList, mobile: true },
      ],
    }],
  },
  tutor: {
    role: "tutor",
    name: "Tutor studio",
    groups: [{
      items: [
        { href: "/tutor", label: "Today", icon: Home, mobile: true },
        { href: "/tutor/schedule", label: "Availability", icon: CalendarDays, mobile: true },
        { href: "/tutor/sessions", label: "Sessions", icon: Video, mobile: true },
        { href: "/tutor/earnings", label: "Earnings", icon: Wallet, mobile: true },
        { href: "/tutor/messages", label: "Messages", icon: MessageSquare },
        { href: "/tutor/profile", label: "Profile & vetting", icon: GraduationCap },
      ],
    }],
  },
  admin: {
    role: "platform_admin",
    name: "Platform console",
    groups: [
      { items: [{ href: "/admin", label: "Overview", icon: Activity, mobile: true }] },
      { label: "Trust", items: [
        { href: "/admin/schools", label: "School approvals", icon: Building2 },
        { href: "/admin/tutors", label: "Tutor vetting", icon: GraduationCap, mobile: true },
        { href: "/admin/safety", label: "Safety reports", icon: ShieldAlert, mobile: true },
        { href: "/admin/moderation", label: "Moderation queue", icon: Inbox },
        { href: "/admin/disputes", label: "Disputes", icon: Flag },
      ] },
      { label: "Platform", items: [
        { href: "/admin/content", label: "Content", icon: FileText },
        { href: "/admin/competitions", label: "Competitions", icon: Trophy },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/finance", label: "Finance (mock)", icon: Coins },
        { href: "/admin/audit", label: "Audit log", icon: Users, mobile: true },
      ] },
    ],
  },
};
