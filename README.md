# LUMEN LEARN: a Nigeria-first learning ecosystem (interactive demo)

LUMEN LEARN is a working prototype. It joins **school management**, **e-learning**, a **vetted tutor
marketplace**, **guardian oversight**, **school-versus-school quiz tournaments** and **school
discovery** into one product. Every role flow is clickable end to end, and every screen runs on
fictional seed data.

> **Demo only.** All people, schools, ratings and rankings are fictional. No payments, video calls,
> identity checks or messages leave your browser. Anything simulated carries a visible
> **Demo** badge in the interface. "Lumen Learn" is a working brand name and is easy to rename.

---

## Run it

Requirements: Node.js 20.9+ (tested on Node 24.13, npm 11).

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. On this machine the preview runs on port 3210 through `.claude/launch.json`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server (`next dev --webpack`) |
| `npm run build` then `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript + React Compiler rules) |
| `npm test` | Unit tests for pricing, moderation, time zones, grading and the seed PRNG (`node --test`) |
| `npm run check:links` | Static route check of every internal path in `src/`, plus an HTTP crawl of the running server (`BASE_URL=…`) |
| `node scripts/fetch-photos.mjs` | Re-downloads and re-grades the licensed photos, then rewrites the credits file |

**Windows Application Control note.** On the development machine, native binaries such as Next's
SWC and Tailwind v4's Oxide are blocked by policy. Next falls back to WASM automatically, and the
project uses **Tailwind CSS 3.4** (pure JavaScript) so it builds anywhere. The first compile in dev
is slow (often 30–60 s per route on first visit). After that it's fast.

No environment variables are needed. `.env.example` documents the *planned* production configuration.

## Start here

* **`/walkthrough`**: a **3-minute guided demo** in four chapters. It switches personas for you and
  can perform each key action ("Book Thursday 17:00 for me", "Assign Ms Halima Sani", …) through the
  same services the UI uses:
  1. A parent finds a vetted tutor and books (with time-zone and conflict checks, simulated checkout).
  2. A learner joins a live class (attendance) and completes Tuesday's weekly check; the guardian sees the result.
  3. A school fills a staffing gap; the timetable and the learner's live-class host update instantly.
  4. A tutor runs today's session and sees itemised hourly earnings, with a mock payout.
* **`/start`**: choose a role and walk through its fictional onboarding (React Hook Form + Zod,
  including guardian consent for minors).
* **Persona switcher** (avatar button in every header): jump between the 9 fictional personas.
  **Reset demo data** lives in the same dialog.

## What's in it

| Area | Routes | Highlights |
|---|---|---|
| Cinematic homepage | `/` | Scroll-driven R3F scene on danfo yellow: flat toon objects with ink keylines (books open, Yorùbá/Igbo/Hausa letters gather, molecules bond, a constellation globe forms), then a clip-path reveal into a real classroom. Sections for mission, age pathways, course discovery, school SaaS, tutors, parents (live moderation playground), competitions, directory, and transparency CTAs |
| Onboarding | `/start`, `/start/[role]` | Six roles. Under-18 learners need guardian consent. Schools tick verification references (placeholders). Staff enter an invite code. Admins enter an MFA code |
| Learner | `/learn/*` | Age-adaptive dashboard (a playful kids view, a professional disclaimer view), school-linked courses delivered automatically, lesson player with notes, live classes with placeholder Zoom/Meet links, **two weekly checks** per subject, assignments, progress and achievements, discovery (minors request, guardians approve) |
| Guardian | `/guardian/*` | Weekly "letter" per child, child detail (courses, checks, attendance, grades, report card), approvals, family schedule, spending, **moderated and logged messaging**, report & block |
| School admin | `/school/*` | Verification timeline, branches & terms, classes & rosters, enrolment with **guardian invitations**, a staffing board (assign teachers), timetable, attendance, gradebook (CA1/CA2/exam → WAEC grades), report cards, notices, fees with mock payments, analytics, competition opt-in & appeals |
| Teacher | `/teacher/*` | Today's lessons, register, assignments with grading, gradebook scoped to their classes |
| Tutor marketplace | `/tutors`, `/tutors/[slug]` | Filters (subject, age, rate, time, language, diaspora), rates in ₦/hour, intro-video placeholder, portfolio, vetting record, sample-labelled reviews, availability shown in a selectable time zone |
| Booking | `/book/[slug]`, `/bookings/[id]` | Learner → slot (converted from the tutor's time zone, with **conflicts** for tutor bookings, learner bookings, school hours and live classes) → guardian approval for minors → price breakdown (5% service fee, 7.5% VAT on the fee, 15% commission) → simulated checkout → confirmation → join/attendance → feedback → payout status |
| Tutor studio | `/tutor/*` | Today's sessions, availability editor (in the tutor's own zone), session history, **hourly earnings ledger** and mock payout, messages, profile & vetting |
| Tutor qualification | `/become-a-tutor`, `/admin/tutors` | Application → evidence placeholders → subject test → safeguarding & pedagogy test → demo-class rubric (reviewer) → decision → probation, with an appeal path to a second reviewer |
| Competitions | `/competitions`, `/competitions/[slug]`, `/school/competitions`, `/admin/competitions` | Divisions by age, scoring rules, provisional vs verified results, anti-cheating measures, opt-in with guardian consents, appeals |
| School directory | `/schools`, `/schools/[slug]`, `/schools/methodology` | City search, filters, a stylised map + list, profiles with a transparent weighted score, limitations and disclaimers |
| Platform admin (separate route group) | `/admin/*` | Mission control, school approvals, tutor vetting, safety queue with SLAs, moderation queue, disputes, content review, competitions, analytics, mock finance (CSV export), audit log |
| Trust pages | `/safeguarding`, `/demo-notes`, `/credits`, `/for-schools`, `/courses` | — |

## Functional vs simulated

**Works end to end in the demo:** role-based access (UI + service guards), all forms and
validation, enrolment → invitation → activation, automatic delivery of class courses, teacher
assignment propagation, attendance, grades, report-card publishing, weekly checks with scoring and
explanations, guardian approvals, booking with time zones and conflicts, the session lifecycle and
tutor ledger, moderation (hold/block) with automatic safety reports, report/block, vetting with
rubric/decision/appeal, competition opt-in/verification/appeals, the directory with scoring, the
audit log, and persistence in `localStorage` with reset.

**Simulated (labelled Demo in the UI):** payments, refunds and payouts (mock ledger only); Zoom,
Google Meet and Lumen Room links (placeholders; joining records attendance locally);
identity/qualification/background checks; email/SMS/push notifications; authentication (persona
switching replaces sign-in); file uploads; recorded lessons and intro videos (procedural
placeholders); all data.

## Safeguarding (built in, not bolted on)

* Guardian consent is required to activate under-18 accounts, and guardians approve bookings, paid
  courses, competitions and new contacts.
* There are no public child profiles. Leaderboards show schools, and learners appear only by
  pseudonym. No ads to under-18s.
* Tutors can message minors only in guardian-visible threads. Messages pass rule-based moderation:
  contact details and other apps are **held**; secrecy, meeting and image requests are **blocked**,
  the thread is locked and a critical report is raised.
* Report & block are one tap away. Reports carry severity SLAs and escalate to a Designated Safeguarding Lead.
* No real identity documents are collected. Photos of identifiable children are not used.

## Design

The visual system is **"Danfo & Chalk"**: Lagos danfo-bus yellow and ink black, with Ankara-print brights (electric blue, Naija green, hot pink, tangerine) on white. It uses Archivo (expanded, heavy) for headlines, IBM Plex Mono for labels, 2px ink keylines, hard offset shadows, small radii, and marker-stroke emphasis. It was chosen deliberately to avoid the visual "AI tells" (purple gradients, glassmorphism, glow, soft rounded card grids, sparkle icons, generic copy). Each portal has its own bright identity. See **[docs/DESIGN.md](docs/DESIGN.md)** for the palette, rationale and sources.

**Deep links for presentations:** add `?persona=<id>` to any URL to open it as that demo persona, for example `/school?persona=p-coker` or `/tutor/earnings?persona=p-emeka`. Persona IDs: `p-chidera`, `p-tolu`, `p-ibrahim`, `p-aisha`, `p-adaeze`, `p-coker`, `p-halima`, `p-emeka`, `p-kemi`.

## Tech

Next.js 16 App Router · React 19 · TypeScript (strict) · Tailwind CSS 3.4 (design tokens in `tailwind.config.ts`) · GSAP + ScrollTrigger
· Three.js / React Three Fiber / Drei · Zod + React Hook Form · Lucide icons. The typed domain
model (`src/lib/domain/types.ts`) mirrors the planned PostgreSQL schema. A mock service layer
(`src/lib/services`) validates, enforces RBAC, mutates the store and writes the audit log, and
deterministic seed data (`src/lib/seed`) uses a seeded PRNG and a fixed demo clock (**Tue 27 Oct
2026, 10:00 WAT**).

Details are in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: the current structure, tenant-scoped
PostgreSQL with row-level security, audited RBAC, file storage, notification workers, scheduling,
payments and video.

### Performance & accessibility

* The 3D scene is lazy-loaded (`next/dynamic`, no SSR), pauses when off-screen (`frameloop="never"`),
  caps DPR, and uses a lite profile (fewer particles, no antialias) on small or low-core devices.
* An **SVG poster** (same flat-and-keyline style) renders first and remains the experience under reduced motion, data-saver, low
  memory or no WebGL. A Motion toggle (Auto / Full / Reduced) lives in the footer.
* The scroll scenes write to refs (no React re-render per scroll frame). GSAP reveals start from
  visible content, so nothing is hidden if JavaScript or animation doesn't run.
* Images are licensed WebP renditions served through `next/image` (AVIF/WebP, sized).
* Skip link, landmarks, labelled form controls with inline errors, native `<dialog>` modals, roving
  tab focus, `aria-live` toasts, visible focus rings, colour + text for every status, text
  alternatives for charts, and 44 px+ touch targets on mobile bottom navigation.

## Known limitations

* Data lives in one browser's `localStorage`, so bookings made in one browser don't exist in
  another. Use **Reset demo data** to start over.
* The demo clock is fixed. Times are rendered in WAT, plus the tutor's zone where relevant.
* The map is a stylised, simplified outline with city-level positions, not survey-accurate.
* Rule-based moderation can produce false positives and negatives. Production adds a classifier and human review.
* The heaviest pages (home, 3D) are slow to compile the first time in dev on machines that force WASM SWC.
* Automated accessibility auditing (axe) and real-device testing are not yet done. Checks were
  manual: keyboard, reduced motion, narrow viewport, and the in-app browser at phone width.
* Report-card "Print" uses the browser's print dialog. A designed PDF is planned.

## Production roadmap

| Phase | Scope |
|---|---|
| **1 · Foundation** | PostgreSQL (tenant-scoped rows + RLS), auth with guardian-linked child accounts and staff MFA, audited RBAC on the server, API layer replacing the in-browser store, observability |
| **2 · Schools** | Verification operations, bulk import (CSV/SIS), timetables, SMS absence alerts via a notification worker, gradebook, report-card PDFs, fee invoicing |
| **3 · Learning** | Media pipeline (scan, transcode, captions, low-bandwidth renditions), Zoom/Google Meet integration with attendance webhooks, an item bank and analytics for weekly checks, offline-friendly notes |
| **4 · Marketplace** | Identity and background-check providers, an NGN payment provider with webhooks, escrowed payouts, disputes, a scheduling engine with slot holds and calendar sync |
| **5 · Trust & scale** | Moderation classifier + human review tooling, safeguarding case management, a data warehouse, accessibility audit, NDPA (Nigeria Data Protection Act) compliance review, load testing |

## Project layout

```
src/app/(site)            public pages, marketplace, booking, directory, competitions, walkthrough
src/app/(portals)/…       learn · guardian · school · teacher · tutor
src/app/(platform-admin)  admin console (separate folder)
src/features/<area>/      feature modules
src/components/           UI primitives, shells, illustrations, map, motion helpers
src/lib/                  domain types, seed data, services, selectors, RBAC, moderation, pricing, time
scripts/                  fetch-photos.mjs, check-links.mjs
tests/                    unit tests
docs/ARCHITECTURE.md      architecture & data model
ASSET_SOURCES.md          asset manifest with licences
```

## Credits

Photographs come from Wikimedia Commons contributors under CC0 / CC BY 2.0 / CC BY-SA 2.0 / 4.0.
See **[ASSET_SOURCES.md](ASSET_SOURCES.md)** and `/credits`. The 3D scene, illustrations, avatars,
map and logo are original to this project.
#   z i o n  
 