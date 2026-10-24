# LUMEN LEARN: architecture

This document covers how the demo is built today and the architecture it is shaped for. Nothing
listed under **Planned** exists in the demo.

---

## 1. The demo today

```
Browser
├── Next.js App Router (React 19, TypeScript, Tailwind CSS 3)
│   ├── (site)            public pages, marketplace, booking, directory, competitions, walkthrough
│   ├── (portals)         learn · guardian · school · teacher · tutor   ← one PortalShell per role
│   └── (platform-admin)  admin                                         ← separate route group
├── src/lib/services/*    "API layer": validates (Zod), checks RBAC, simulates latency, mutates state, writes audit
├── src/lib/demo/store    in-browser "database" (useSyncExternalStore + localStorage, reset any time)
├── src/lib/seed/*        deterministic fictional seed data (seeded PRNG, fixed demo clock)
└── src/lib/selectors     read models (what an API GET would return)
```

* **Deterministic.** Seed data comes from a seeded PRNG, and the demo clock is fixed at
  **Tue 27 Oct 2026, 10:00 WAT**. Server and client render the same thing, and every demo run starts
  from the same state.
* **Service boundary.** UI components never mutate state directly. They call
  `src/lib/services/*` functions, which do what an API handler would: validate input, call
  `guard(permission)`, enforce relationship rules (e.g. a guardian only acts on their own children),
  apply the change and append an audit event. Replacing the store with HTTP calls is a mechanical change.
* **Hydration-safe persistence.** The store renders the seed on the server and during hydration,
  then loads saved state from `localStorage`. Portals show a skeleton until that load finishes.

## 2. Target production architecture (planned)

```
          ┌───────────────┐     ┌─────────────────────────┐
 Users ──►│ Next.js (edge │────►│ API (Route Handlers /   │──► PostgreSQL (primary + read replica)
          │ + server)     │     │ tRPC/REST), Zod schemas │     row-level security per tenant
          └───────────────┘     └──────────┬──────────────┘
                                           │ outbox events
                       ┌───────────────────┼────────────────────┬──────────────────┐
                       ▼                   ▼                    ▼                  ▼
              Notification worker   Scheduling worker    Payments service    Media pipeline
              (email/SMS/WhatsApp   (reminders, slot     (NGN provider:      (upload → scan →
               Business, push)      holds, no-shows)     Paystack/Flutter-   transcode → captions
                                                         wave; webhooks;     → low-bandwidth
                                                         payouts; ledger)    renditions)
                       └───────── Queue (e.g. SQS / Redis streams) ─────────┘
 Video: Zoom / Google Meet APIs (meeting creation + attendance webhooks) or a WebRTC provider for “Lumen Room”.
 Files: private object storage, signed URLs, antivirus scan, retention policies.
 Identity checks: KYC provider (e.g. for NIN/BVN-backed checks) with consent; background checks via accredited partner.
```

### 2.1 Tenancy and data model

* Every school is a **tenant**. Records owned by a school (`classes`, `enrolments`, `attendance`,
  `grades`, `report_cards`, `invoices`, `notices`, `timetable_slots`) carry `tenant_id`.
* Platform-wide records (`tutors`, `bookings`, `tournaments`, `courses` from Lumen) use the platform
  tenant. Join tables link them to people.
* PostgreSQL **row-level security** enforces tenant scoping, so a query without the right tenant
  context returns nothing:

```sql
alter table attendance enable row level security;
create policy tenant_isolation on attendance
  using (tenant_id = current_setting('app.tenant_id')::uuid);
```

Core tables (abridged):

```sql
create table tenants (id uuid primary key, kind text check (kind in ('school','platform')), name text, verified_at timestamptz);
create table users (id uuid primary key, email citext unique, phone text, mfa_enabled bool, created_at timestamptz);
create table memberships (user_id uuid references users, tenant_id uuid references tenants,
  role text check (role in ('learner','guardian','school_admin','teacher','tutor','platform_admin')),
  primary key (user_id, tenant_id, role));
create table learners (id uuid primary key, user_id uuid references users, date_of_birth date, pseudonym text);
create table guardianships (guardian_user_id uuid references users, learner_id uuid references learners,
  consent_at timestamptz not null, consent_method text, primary key (guardian_user_id, learner_id));
create table classes (id uuid primary key, tenant_id uuid not null, branch_id uuid, term_id uuid, name text);
create table class_subject_teachers (class_id uuid, subject_id text, staff_user_id uuid, primary key (class_id, subject_id));
create table enrolments (learner_id uuid, class_id uuid, tenant_id uuid not null, status text, primary key (learner_id, class_id));
create table bookings (id uuid primary key, tutor_id uuid, learner_id uuid, guardian_user_id uuid,
  starts_at timestamptz, minutes int, status text, price jsonb, reference text unique);
create table ledger_entries (id uuid primary key, tutor_id uuid, booking_id uuid, kind text, amount_kobo bigint, status text, at timestamptz);
create table messages (id uuid primary key, thread_id uuid, author_user_id uuid, body text, moderation jsonb, at timestamptz);
create table audit_events (id bigserial primary key, at timestamptz default now(), actor_user_id uuid, actor_role text,
  action text, entity text, tenant_id uuid, summary text, ip inet);   -- append-only (revoke update/delete)
```

Money is stored in **kobo** (integers), never as floats.

### 2.2 Access control

* **RBAC matrix** (`src/lib/rbac.ts`) is the source of truth for role permissions. It is evaluated
  server-side on every request.
* **Relationship checks** sit on top of roles: a guardian acts only on linked learners, a teacher
  only on their own classes, a tutor only on their own bookings.
* **Audited access:** any staff or admin read of a child's record writes an audit event.
* Staff and admins require MFA. Child accounts are created by, and recoverable through, guardians.

### 2.3 Safeguarding pipeline

1. Message submitted → synchronous rule-based moderation (`src/lib/moderation.ts`) → `clean` / `held` / `blocked`.
2. `held` → moderation queue. `blocked` → thread locked and a critical safety report raised automatically.
3. A classifier and human review sit behind the rules (planned). Reports carry SLAs (critical 1h,
   high 4h, medium 24h, low 72h) and escalate to the Designated Safeguarding Lead.
4. No direct messaging between tutors and minors outside guardian-visible threads. No public child
   profiles. No ads to under-18s.

### 2.4 Scheduling

* Availability is stored in the tutor's IANA time zone and expanded to UTC instants. Learners see
  times converted to their own zone (`src/lib/slots.ts`, `src/lib/time.ts`).
* Conflict checks cover tutor bookings, learner bookings, school timetable hours and the class's
  live sessions (`findConflicts`).
* Production adds slot holds with expiry (to stop double-booking during checkout), DB-level
  exclusion constraints (`tstzrange` + GiST), reminders and no-show handling.

### 2.5 Payments and payouts (planned)

* The checkout creates a payment intent with an NGN payment provider, and the booking is confirmed
  only by a verified webhook. The browser never sets a price: totals are recomputed server-side
  (`priceFor`).
* Funds are held until the session is completed, then released to the tutor ledger minus 15%
  commission. Payouts go by bank transfer with reconciliation.
* VAT (7.5%) applies to the platform's service fee only. Accounting exports come from the ledger.

### 2.6 Video (planned)

* Zoom or Google Meet meetings are created via API when a booking is confirmed. Attendance comes
  from provider webhooks, falling back to Lumen Room (WebRTC) where needed.
* Recordings of sessions with minors are off by default and require explicit guardian and school
  policy.

## 3. Folder structure

```
src/
  app/(site)/…              public routes
  app/(portals)/{learn,guardian,school,teacher,tutor}/…
  app/(platform-admin)/admin/…
  components/               ui primitives, shell, illustrations, map, motion helpers
  features/<area>/          one folder per product area (home, learner, guardian, school, teacher,
                            tutors, booking, tutor-portal, tutor-vetting, competitions, directory,
                            platform-admin, messaging, onboarding, walkthrough, courses)
  lib/domain/types.ts       typed domain model (mirrors the planned schema)
  lib/seed/                 deterministic fictional data
  lib/services/             mutation layer (future API)
  lib/selectors.ts          read models
  lib/rbac.ts, moderation.ts, pricing.ts, time.ts, slots.ts
```
