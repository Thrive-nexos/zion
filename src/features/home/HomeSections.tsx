import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BatteryCharging, BookOpenCheck, CalendarClock, Check, ClipboardCheck, Coins, Eye, FlaskConical, GraduationCap, Languages,
  Lock, MessageSquareLock, ScrollText, ShieldCheck, Signal, Trophy, UserCheck, Users, Video, X,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, DemoBadge, SampleLabel } from "@/components/ui/Badge";
import { Eyebrow, SectionTitle } from "@/components/ui/Misc";
import { Photo } from "@/components/ui/Photo";
import { Avatar } from "@/components/ui/Avatar";
import { ClipReveal, RevealGroup } from "@/components/motion/Reveal";
import { KidsIllustration, TeensIllustration } from "@/components/illustrations";
import { NigeriaMap } from "@/components/NigeriaMap";
import { AGE_BANDS, subjectById } from "@/lib/seed/catalog";
import { SCHOOLS } from "@/lib/seed/schools";
import { TUTORS } from "@/lib/seed/tutors";
import { cn, naira } from "@/lib/utils";
import { CourseDiscovery } from "./CourseDiscovery";
import { HomeLeaderboard } from "./HomeLeaderboard";
import { ModerationPlayground } from "./ModerationPlayground";

// ───────────────────────── Ticker ─────────────────────────

const TICKER = ["Primary 4 fractions", "BECE algebra", "WAEC physics", "Yorùbá tones", "UTME English", "Python for teens", "Hausa reading", "Igbo proverbs", "Spreadsheets for traders", "Nursing dose maths", "Calculus I", "Scratch stories"];

/** A slow ink-and-yellow subject ticker — a printed-matter detail between hero and content. */
export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-b-2 border-ink bg-ink py-3 text-gold" aria-hidden>
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-mono text-sm font-semibold uppercase tracking-wider">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-8">{t}<span className="text-white">/</span></span>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── Universe → classroom ─────────────────────────

export function ClassroomTransition() {
  return (
    <section className="relative bg-white pb-24" aria-labelledby="classroom-title">
      <ClipReveal className="relative h-[78svh] min-h-[26rem] overflow-hidden border-b-2 border-ink">
        <Photo id="lasu-instructor" className="absolute inset-0" sizes="100vw" />
      </ClipReveal>
      <div className="container-page relative z-[1] -mt-24 sm:-mt-32">
        <div className="max-w-3xl border-2 border-ink bg-white p-5 shadow-lift sm:p-7">
          <Eyebrow>Then, the classroom</Eyebrow>
          <h2 id="classroom-title" className="mt-3 text-balance text-4xl uppercase leading-[0.92] sm:text-6xl">
            Lumen doesn&apos;t replace the room. <em>It connects it.</em>
          </h2>
        </div>
      </div>
      <RevealGroup className="container-page mt-14 grid gap-0 sm:grid-cols-3">
        {[
          { icon: GraduationCap, title: "Teachers stay in charge", body: "Schools run timetables, attendance, grades and report cards in one place, and every enrolled learner gets the right lessons automatically.", bg: "bg-gold" },
          { icon: Users, title: "Parents see what matters", body: "Two short checks a week, attendance, upcoming classes and spending, plus approvals for anything new.", bg: "bg-white" },
          { icon: UserCheck, title: "Tutors fill the gaps safely", body: "A vetted marketplace with hourly naira rates, guardian approval for minors and every message logged.", bg: "bg-azure" },
        ].map((f, i) => (
          <div key={f.title} data-reveal className={cn("border-2 border-ink p-6 sm:p-8", f.bg, i > 0 && "-mt-0.5 sm:-ml-0.5 sm:mt-0")}>
            <span className="grid size-11 place-items-center border-2 border-ink bg-white"><f.icon className="size-5" aria-hidden /></span>
            <h3 className="mt-5 text-xl uppercase leading-tight">{f.title}</h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/80">{f.body}</p>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}

// ───────────────────────── Mission ─────────────────────────

export function Mission() {
  const principles = [
    { icon: Signal, title: "Light on data", body: "Text-first lessons, downloadable notes and small video files. Offline sync is on the roadmap.", c: "bg-azure" },
    { icon: BatteryCharging, title: "Built for real days", body: "Generator hours and Lagos traffic happen. Sessions reschedule in two taps.", c: "bg-gold" },
    { icon: ScrollText, title: "Local curricula", body: "NERDC schemes, BECE, WAEC, NECO and UTME prep next to Cambridge and IB schools.", c: "bg-pink" },
    { icon: Languages, title: "Many languages", body: "English with Yorùbá, Igbo, Hausa and Pidgin, with the diacritics spelled properly.", c: "bg-tangerine" },
    { icon: Coins, title: "Priced in naira", body: "Hourly rates, fees and courses in ₦, with every fee shown up front. Payments are simulated here.", c: "bg-iris" },
  ];
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="mission-title">
      <RevealGroup className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div data-reveal className="relative">
          <Photo id="lagos-island" className="aspect-[4/5] border-2 border-ink shadow-lift" sizes="(min-width:1024px) 40vw, 100vw" />
          <div className="absolute -bottom-6 -right-2 max-w-[15rem] border-2 border-ink bg-gold p-4 shadow-hard sm:-right-8">
            <p className="text-2xl font-black uppercase leading-none [font-stretch:115%]">Nigeria-first.</p>
            <p className="mt-2 text-sm font-medium">Designed around Nigerian schools, families and exams, and open to the diaspora.</p>
          </div>
        </div>
        <div className="grid gap-8">
          <div data-reveal>
            <SectionTitle
              eyebrow="Why Lumen"
              title={<>Good learning should be <em>normal</em>, not lucky.</>}
              body="Lumen puts schools, independent tutors, parents and learners of every age in one accountable system, whether that's a Primary 4 reader in Ibadan or a nurse refreshing her dosing maths in Kaduna."
            />
          </div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {principles.map((p) => (
              <li key={p.title} data-reveal className="flex gap-3">
                <span className={cn("grid size-10 shrink-0 place-items-center border-2 border-ink text-ink", p.c, p.c === "bg-iris" && "text-white")}><p.icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block font-extrabold text-ink">{p.title}</span>
                  <span className="text-sm text-muted">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </RevealGroup>
    </section>
  );
}

// ───────────────────────── Pathways ─────────────────────────

const BAND_STYLE: Record<string, { bg: string; text: string }> = {
  kids: { bg: "bg-gold", text: "text-ink" },
  teens: { bg: "bg-azure", text: "text-ink" },
  university: { bg: "bg-iris", text: "text-white" },
  adults: { bg: "bg-pink", text: "text-ink" },
  professionals: { bg: "bg-tangerine", text: "text-ink" },
};

export function Pathways() {
  const visuals = {
    kids: <KidsIllustration />,
    teens: <TeensIllustration />,
    university: <Photo id="university-lab" className="size-full" credit="none" sizes="(min-width:1024px) 20vw, 100vw" />,
    adults: <Photo id="lasu-learners" className="size-full" credit="none" sizes="(min-width:1024px) 20vw, 100vw" />,
    professionals: <Photo id="midwifery-workshop" className="size-full" credit="none" sizes="(min-width:1024px) 20vw, 100vw" />,
  };
  return (
    <section id="pathways" className="border-y-2 border-ink bg-sand py-24 sm:py-32" aria-labelledby="pathways-title">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Age pathways" title={<span id="pathways-title">One home. <em>Five ways in.</em></span>} body="Each pathway changes what learners see, how they're protected and who else is involved." />
          <ButtonLink href="/courses" variant="outline" size="sm" icon={<ArrowUpRight className="size-4" />}>All courses</ButtonLink>
        </div>
        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {AGE_BANDS.map((b, i) => {
            const st = BAND_STYLE[b.id];
            return (
              <Link
                key={b.id}
                href={`/courses?age=${b.id}`}
                data-reveal
                className={cn("group flex flex-col overflow-hidden border-2 border-ink shadow-hard transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-lift", st.bg, st.text)}
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink bg-white">{visuals[b.id]}</div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-wider opacity-80">0{i + 1} / Ages {b.ages}</p>
                  <h3 className="mt-1 text-[1.65rem] uppercase leading-none [overflow-wrap:anywhere] xl:text-[1.85rem]">{b.label}</h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed">{b.promise}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-extrabold">Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
                </div>
              </Link>
            );
          })}
        </RevealGroup>
        <p className="mt-5 font-mono text-[0.72rem] text-muted">Kids and teens pathways use original illustrations. We don&apos;t publish photographs of children without documented guardian consent.</p>
      </div>
    </section>
  );
}

export function Discovery() {
  return (
    <section className="bg-white py-24 sm:py-28" aria-labelledby="discover-title">
      <div className="container-page grid gap-10">
        <SectionTitle eyebrow="Course discovery" title={<span id="discover-title">Learn something <em>real</em> this week.</span>} body="School-linked courses arrive automatically for enrolled learners. Everyone else can browse Lumen courses and tutor-led clinics." />
        <CourseDiscovery />
      </div>
    </section>
  );
}

// ───────────────────────── School SaaS ─────────────────────────

export function SchoolSaas() {
  const features = [
    { icon: BadgeCheck, label: "Verification & branches" },
    { icon: CalendarClock, label: "Terms, classes & timetables" },
    { icon: ClipboardCheck, label: "Attendance in 30 seconds" },
    { icon: BookOpenCheck, label: "Assignments, grades & report cards" },
    { icon: Coins, label: "Fees & reminders" },
    { icon: Users, label: "Invite learners & guardians" },
  ];
  return (
    <section className="grid-paper-dark relative overflow-hidden border-y-2 border-ink bg-iris py-24 text-white sm:py-32" aria-labelledby="saas-title">
      <RevealGroup className="container-page relative grid items-center gap-16 lg:grid-cols-2">
        <div className="grid gap-8">
          <div data-reveal>
            <SectionTitle tone="light" eyebrow="For schools" title={<span id="saas-title">Run the whole school, <em>not ten spreadsheets.</em></span>} body="Multi-branch, term-aware school management. Assign a teacher once and every learner in that class sees it straight away." />
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.label} data-reveal className="flex items-center gap-3 border-2 border-ink bg-white px-4 py-3 text-sm font-bold text-ink">
                <f.icon className="size-5 text-iris" aria-hidden /> {f.label}
              </li>
            ))}
          </ul>
          <div data-reveal className="flex flex-wrap gap-3">
            <ButtonLink href="/school" variant="gold">Open the school portal</ButtonLink>
            <ButtonLink href="/for-schools" variant="light">How it works for schools</ButtonLink>
          </div>
        </div>
        <div data-reveal className="relative">
          <Photo id="nsukka-teaching" className="aspect-[4/3] border-2 border-ink" sizes="(min-width:1024px) 45vw, 100vw" />
          {/* layered product glimpse */}
          <div className="absolute -bottom-10 -left-4 w-[17rem] border-2 border-ink bg-white p-4 text-ink shadow-lift sm:-left-10">
            <p className="eyebrow">JSS 3 Gold · Tue register</p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 17 }, (_, i) => (
                <span key={i} className={`h-6 flex-1 border border-ink ${i === 5 ? "bg-ember" : i === 11 ? "bg-gold" : "bg-azure"}`} />
              ))}
            </div>
            <p className="mt-2 text-xs font-medium text-muted">15 present · 1 late · 1 absent → guardian SMS (simulated)</p>
          </div>
          <div className="absolute -right-2 -top-8 w-56 border-2 border-ink bg-gold p-4 text-ink shadow-lift sm:-right-8">
            <p className="eyebrow">Fees collected</p>
            <p className="mt-1 text-4xl font-black [font-stretch:115%]">78%</p>
            <div className="mt-2 h-3 border-2 border-ink bg-white"><div className="h-full w-[78%] bg-ink" /></div>
            <SampleLabel className="mt-2 text-ink/70">Sample school</SampleLabel>
          </div>
        </div>
      </RevealGroup>
    </section>
  );
}

// ───────────────────────── Tutors ─────────────────────────

export function TutorsShowcase() {
  const featured = TUTORS.filter((t) => t.featured);
  const steps = ["Application", "ID & qualification evidence", "Subject test", "Safeguarding test", "Observed demo class", "Probation"];
  const stepColors = ["bg-white", "bg-gold", "bg-azure", "bg-pink", "bg-tangerine", "bg-iris text-white"];
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="tutors-title">
      <div className="container-page grid gap-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle eyebrow="Tutor marketplace" title={<span id="tutors-title">Tutors you&apos;d trust <em>in your living room.</em></span>} body="Every tutor passes six stages before teaching a child, then starts on probation." />
          <ButtonLink href="/tutors" variant="primary">Find a tutor</ButtonLink>
        </div>
        <ol className="no-scrollbar -mx-4 flex overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-6 sm:px-0" aria-label="Tutor vetting stages">
          {steps.map((s, i) => (
            <li key={s} className={cn("min-w-[10rem] border-2 border-ink p-3", stepColors[i], i > 0 && "-ml-0.5")}>
              <span className="font-mono text-[0.7rem] font-semibold uppercase">Stage {i + 1}</span>
              <p className="mt-1 text-sm font-extrabold leading-snug">{s}</p>
            </li>
          ))}
        </ol>
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => (
            <Link key={t.id} href={`/tutors/${t.slug}`} data-reveal className="group grid gap-3 border-2 border-ink bg-white p-5 shadow-hard transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center gap-3">
                <Avatar name={t.name} hue={t.hue} size={52} />
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-ink">{t.name}</p>
                  <p className="text-xs text-muted">{t.city} · {t.subjects.map((s) => subjectById(s).short).join(", ")}</p>
                </div>
              </div>
              <p className="text-sm text-body">{t.headline}</p>
              <div className="flex items-center justify-between border-t-2 border-ink pt-3">
                <span className="text-2xl font-black text-ink [font-stretch:110%]">{naira(t.ratePerHourNGN)}<span className="text-xs font-semibold text-muted">/hr</span></span>
                <Badge tone="leaf" icon={<ShieldCheck className="size-3" aria-hidden />}>Vetted</Badge>
              </div>
              <SampleLabel>★ {t.rating.toFixed(1)} from {t.reviewCount} sample reviews</SampleLabel>
            </Link>
          ))}
        </RevealGroup>
        <p className="text-sm font-medium text-muted">
          Want to teach? <Link href="/become-a-tutor" className="font-extrabold text-ink underline decoration-pink decoration-2 underline-offset-4">See the qualification workflow →</Link>
        </p>
      </div>
    </section>
  );
}

// ───────────────────────── Parents ─────────────────────────

export function ParentConfidence() {
  return (
    <section className="border-t-2 border-ink bg-pink-wash py-24 sm:py-32" aria-labelledby="parents-title">
      <RevealGroup className="container-page grid gap-12 lg:grid-cols-2">
        <div className="grid content-start gap-8">
          <div data-reveal>
            <SectionTitle eyebrow="For parents & guardians" title={<span id="parents-title">You see <em>every message</em> your child&apos;s tutor sends.</span>} body="Parents approve tutors and spending, read every message, and get one weekly letter instead of a wall of notifications." />
          </div>
          <ul className="grid gap-3">
            {[
              { icon: Lock, t: "Guardian consent for every under-18 account and booking request" },
              { icon: MessageSquareLock, t: "No private chats. Tutors message minors only in threads parents can read" },
              { icon: Eye, t: "No public profiles for children. Leaderboards use pseudonyms" },
              { icon: ShieldCheck, t: "Report and block in one tap, with a safeguarding lead on every escalation" },
              { icon: X, t: "No advertising to under-18s, ever" },
            ].map((x) => (
              <li key={x.t} data-reveal className="flex items-start gap-3 text-[0.95rem] font-medium text-body">
                <span className="grid size-7 shrink-0 place-items-center border-2 border-ink bg-white"><x.icon className="size-4" aria-hidden /></span> {x.t}
              </li>
            ))}
          </ul>
          <div data-reveal className="flex flex-wrap gap-3">
            <ButtonLink href="/guardian" variant="primary">Open the guardian portal</ButtonLink>
            <ButtonLink href="/safeguarding" variant="outline">Read our safeguarding model</ButtonLink>
          </div>
        </div>
        <div className="grid gap-5">
          <article data-reveal className="border-2 border-ink bg-white p-6 shadow-lift">
            <p className="eyebrow text-pink-600">Weekly letter · Week 7</p>
            <h3 className="mt-2 text-2xl text-ink">Dear Mrs Okafor,</h3>
            <p className="mt-2 text-sm leading-relaxed text-body">
              Chidera attended every class this week and scored <strong>4/5</strong> on Tuesday&apos;s maths check, up from 2/5 three weeks ago.
              Mr Emeka says word problems are next. Tolu read aloud beautifully in class. One request is waiting for you: WAEC Physics (₦18,000).
            </p>
            <div className="mt-4 flex flex-wrap gap-2"><Badge tone="leaf">Attendance 100%</Badge><Badge tone="iris">2 checks done</Badge><Badge tone="amber">1 approval waiting</Badge></div>
          </article>
          <div data-reveal><ModerationPlayground /></div>
        </div>
      </RevealGroup>
    </section>
  );
}

// ───────────────────────── Competitions ─────────────────────────

export function Competitions() {
  return (
    <section className="grid-paper-dark relative overflow-hidden border-y-2 border-ink bg-ink py-24 text-white sm:py-32" aria-labelledby="comp-title">
      <RevealGroup className="container-page relative grid items-center gap-12 lg:grid-cols-2">
        <div className="grid gap-6" data-reveal>
          <SectionTitle tone="light" eyebrow="Quiz tournaments" title={<span id="comp-title">School versus school. <em>Fair and verified.</em></span>} body="Opt-in leagues by age division, with published scoring, invigilation, anti-cheating checks and an appeal path." />
          <ul className="grid gap-2 text-sm font-medium text-white/85">
            {["Divisions: Junior 9–11 · Intermediate 12–14 · Senior 15–17", "Accuracy points + capped speed bonus − penalties", "Results stay provisional until verified", "Learners appear only by school and pseudonym"].map((x) => (
              <li key={x} className="flex gap-2"><Trophy className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />{x}</li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/competitions" variant="gold">See tournaments</ButtonLink>
            <div className="relative h-16 w-24 overflow-hidden border-2 border-white/40"><Photo id="graduates" className="absolute inset-0" credit="none" sizes="96px" /></div>
          </div>
          <p className="font-mono text-[0.7rem] text-white/50">Photo: Thepresido · CC BY-SA 4.0 (<Link href="/credits" className="underline">credits</Link>)</p>
        </div>
        <div data-reveal><HomeLeaderboard /></div>
      </RevealGroup>
    </section>
  );
}

// ───────────────────────── Directory ─────────────────────────

export function DirectoryTeaser() {
  return (
    <section className="bg-white py-24 sm:py-32" aria-labelledby="dir-title">
      <RevealGroup className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div data-reveal className="border-2 border-ink bg-gold-wash p-4 shadow-lift sm:p-8">
          <NigeriaMap schools={SCHOOLS} />
          <div className="mt-2 flex flex-wrap gap-4 font-mono text-[0.72rem] font-semibold uppercase">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-ink bg-iris" /> Verified on Lumen</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-ink bg-pink" /> Verification in progress</span>
          </div>
        </div>
        <div className="grid gap-6" data-reveal>
          <SectionTitle eyebrow="School discovery" title={<span id="dir-title">Find a school <em>with your eyes open.</em></span>} body="Search by city, curriculum, fees and facilities. Every score shows its formula and its sources, and says plainly what it can't tell you." />
          <p className="border-2 border-dashed border-ink bg-white p-4 text-sm font-medium">
            All {SCHOOLS.length} schools in this demo are fictional, and their rankings are sample data. They are not authoritative and not an endorsement.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/schools" variant="primary">Explore the directory</ButtonLink>
            <ButtonLink href="/schools/methodology" variant="outline">How scores work</ButtonLink>
          </div>
        </div>
      </RevealGroup>
    </section>
  );
}

// ───────────────────────── Transparency & CTAs ─────────────────────────

export function Transparency() {
  const working = [
    "Every role flow and screen, with role-based access",
    "Booking with time zones, conflict checks & guardian approval",
    "Weekly checks, attendance, grades, report cards",
    "Message moderation, report & block, audit log",
    "Data persists in your browser; reset any time",
  ];
  const simulated = [
    { icon: Coins, t: "Payments & payouts (no Paystack/Flutterwave connected)" },
    { icon: Video, t: "Zoom / Google Meet links are placeholders" },
    { icon: BadgeCheck, t: "Identity, qualification & background checks" },
    { icon: FlaskConical, t: "Emails, SMS and push notifications" },
  ];
  return (
    <section className="border-t-2 border-ink bg-sand py-24 sm:py-32" aria-labelledby="transparency-title">
      <div className="container-page grid gap-12">
        <SectionTitle eyebrow="Straight answers" title={<span id="transparency-title">What&apos;s real in this demo, <em>and what isn&apos;t.</em></span>} />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="border-2 border-ink bg-white p-6 shadow-hard">
            <p className="flex items-center gap-2 text-lg font-black uppercase"><span className="grid size-7 place-items-center border-2 border-ink bg-azure"><Check className="size-4" aria-hidden /></span> Working in the demo</p>
            <ul className="mt-4 grid gap-2.5 text-sm font-medium text-body">{working.map((w) => <li key={w} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden />{w}</li>)}</ul>
          </div>
          <div className="border-2 border-dashed border-ink bg-gold-wash p-6">
            <p className="flex flex-wrap items-center gap-2 text-lg font-black uppercase">Simulated: needs real integrations <DemoBadge /></p>
            <ul className="mt-4 grid gap-2.5 text-sm font-medium text-body">{simulated.map((w) => <li key={w.t} className="flex gap-2"><w.icon className="mt-0.5 size-4 shrink-0" aria-hidden />{w.t}</li>)}</ul>
          </div>
        </div>
        <div><Link href="/demo-notes" className="font-extrabold text-ink underline decoration-pink decoration-2 underline-offset-4">Read the full demo notes & production roadmap →</Link></div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const doors = [
    { href: "/start/guardian", label: "I'm a parent", sub: "Track, approve, book", c: "bg-white" },
    { href: "/start/learner", label: "I'm a learner", sub: "Kids to professionals", c: "bg-gold" },
    { href: "/start/school-admin", label: "I run a school", sub: "Classes, fees, reports", c: "bg-azure" },
    { href: "/start/tutor", label: "I'm a tutor", sub: "Get vetted, get booked", c: "bg-tangerine" },
  ];
  return (
    <section className="relative overflow-hidden border-t-2 border-ink bg-pink py-24 text-ink sm:py-32" aria-labelledby="cta-title">
      <div className="container-page relative grid gap-12">
        <h2 id="cta-title" className="max-w-5xl text-balance text-5xl uppercase leading-[0.9] [--marker:#FFC800] sm:text-7xl">Pick a door. <em>Everything behind it works.</em></h2>
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doors.map((d) => (
            <Link key={d.href} href={d.href} className={cn("group border-2 border-ink p-5 shadow-hard transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-lift", d.c)}>
              <p className="text-2xl font-black uppercase leading-none [font-stretch:115%]">{d.label}</p>
              <p className="mt-2 text-sm font-medium">{d.sub}</p>
              <ArrowRight className="mt-6 size-6 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </div>
        <p className="font-medium">Or <Link href="/walkthrough" className="font-extrabold underline decoration-2 underline-offset-4">watch the 3-minute guided demo</Link>.</p>
      </div>
    </section>
  );
}
