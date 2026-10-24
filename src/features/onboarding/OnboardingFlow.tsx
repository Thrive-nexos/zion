"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextField } from "@/components/ui/Field";
import { DemoBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { completeOnboarding, switchPersona } from "@/lib/services/session";
import { toast } from "@/lib/demo/store";
import { PERSONAS, defaultPersonaFor } from "@/lib/seed/people";
import { AGE_BANDS, CITIES, SUBJECTS } from "@/lib/seed/catalog";
import { ROLE_HOME } from "@/lib/rbac";
import { sleep } from "@/lib/utils";
import { ROLE_SLUGS, type RoleSlug } from "./roles";

const MINOR_BANDS = ["kids", "teens"];

const schema = z
  .object({
    role: z.string(),
    name: z.string().trim().min(2, "Enter at least 2 characters").max(60),
    ageBand: z.string().optional(),
    schoolCode: z.string().trim().max(12).optional(),
    guardianName: z.string().optional(),
    guardianContact: z.string().optional(),
    guardianConsent: z.boolean().optional(),
    relationship: z.string().optional(),
    inviteCode: z.string().optional(),
    linkLater: z.boolean().optional(),
    schoolName: z.string().optional(),
    city: z.string().optional(),
    subject: z.string().optional(),
    evidence: z.array(z.string()).optional(),
    mfaCode: z.string().optional(),
    rulesAccepted: z.boolean().refine((v) => v, "Please accept to continue"),
    persona: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const need = (path: keyof typeof v, ok: boolean, message: string) => !ok && ctx.addIssue({ code: "custom", path: [path], message });
    if (v.role === "learner") {
      need("ageBand", !!v.ageBand, "Choose an age group");
      if (MINOR_BANDS.includes(v.ageBand ?? "")) {
        need("guardianName", (v.guardianName ?? "").trim().length >= 2, "A guardian's name is required for under-18s");
        need("guardianContact", (v.guardianContact ?? "").trim().length >= 5, "Enter a guardian email or phone (use a made-up one)");
        need("guardianConsent", !!v.guardianConsent, "Guardian consent is required before an under-18 account is active");
      }
    }
    if (v.role === "guardian") {
      need("relationship", !!v.relationship, "Choose your relationship");
      need("inviteCode", !!v.linkLater || /^IRK-[A-Z0-9]{4}$/i.test(v.inviteCode ?? ""), "Enter a code like IRK-7Q4M, or choose to link later");
    }
    if (v.role === "school_admin") {
      need("schoolName", (v.schoolName ?? "").trim().length >= 3, "Enter the school's name");
      need("city", !!v.city, "Choose a city");
      need("evidence", (v.evidence ?? []).length >= 2, "Confirm at least two verification references (placeholders)");
    }
    if (v.role === "teacher") {
      need("subject", !!v.subject, "Choose your main subject");
      need("inviteCode", /^STAFF-[A-Z0-9]{4}$/i.test(v.inviteCode ?? ""), "Staff codes look like STAFF-2Q9X (try STAFF-DEMO)");
    }
    if (v.role === "platform_admin") need("mfaCode", v.mfaCode === "246810", "Enter the demo code shown on screen");
  });

type Values = z.infer<typeof schema>;

const EVIDENCE = ["Approval-to-operate reference (state ministry)", "CAC registration reference", "Safeguarding policy (reviewed later)", "Designated Safeguarding Lead named"];

export function OnboardingFlow({ slug }: { slug: RoleSlug }) {
  const meta = ROLE_SLUGS[slug];
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { role: meta.role, name: "", rulesAccepted: false, evidence: [], linkLater: false, guardianConsent: false },
  });
  const { register, watch, trigger, handleSubmit, formState: { errors, isSubmitting } } = form;
  const ageBand = watch("ageBand");
  const linkLater = watch("linkLater");
  const minor = MINOR_BANDS.includes(ageBand ?? "");

  const steps = useMemo(() => {
    const s: { title: string; fields: FieldPath<Values>[] }[] = [{ title: "About you", fields: ["name"] }];
    if (meta.role === "learner") {
      s[0].fields.push("ageBand", "schoolCode");
      s.push({ title: minor ? "Guardian consent" : "Community promise", fields: minor ? ["guardianName", "guardianContact", "guardianConsent", "rulesAccepted"] : ["rulesAccepted"] });
    } else if (meta.role === "guardian") {
      s[0].fields.push("relationship");
      s.push({ title: "Link your children", fields: ["inviteCode", "linkLater", "rulesAccepted"] });
    } else if (meta.role === "school_admin") {
      s[0].fields.push("schoolName", "city");
      s.push({ title: "Verification", fields: ["evidence", "rulesAccepted"] });
    } else if (meta.role === "teacher") {
      s[0].fields.push("subject");
      s.push({ title: "Staff invitation", fields: ["inviteCode", "rulesAccepted"] });
    } else if (meta.role === "platform_admin") {
      s.push({ title: "Secure access", fields: ["mfaCode", "rulesAccepted"] });
    }
    s.push({ title: "Your demo persona", fields: [] });
    return s;
  }, [meta.role, minor]);

  const next = async () => {
    const ok = await trigger(steps[step].fields);
    if (ok) setStep((n) => Math.min(steps.length - 1, n + 1));
  };

  const LEARNER_BAND: Record<string, string> = { "p-tolu": "kids", "p-chidera": "teens", "p-ibrahim": "university", "p-aisha": "professionals" };
  const personas = PERSONAS.filter((p) => p.role === meta.role).sort((a, b) => Number(LEARNER_BAND[b.id] === ageBand) - Number(LEARNER_BAND[a.id] === ageBand));

  const onSubmit = handleSubmit(async (v) => {
    await sleep(500);
    const persona = v.persona ?? defaultPersonaFor(meta.role).id;
    completeOnboarding(meta.role, `${meta.title} onboarding as “${v.name}”${minor ? " with guardian consent (simulated)" : ""}`);
    switchPersona(persona);
    toast({ tone: "success", title: "Welcome to Lumen", body: "You're now exploring with a ready-made fictional persona so every screen has realistic data.", demo: true });
    router.push(ROLE_HOME[meta.role]);
  });

  if (slug === "tutor") {
    return (
      <div className="grid gap-6 rounded-3xl border border-line bg-paper p-6 sm:p-8">
        <h2 className="text-3xl text-ink">Tutors earn their place.</h2>
        <p className="text-muted">New tutors complete a six-stage qualification before they can teach anyone under 18: application, ID & qualification evidence (placeholders here), a subject test, a safeguarding test, an observed demo class, then probation.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/become-a-tutor" variant="primary">Start a demo application</ButtonLink>
          <Button variant="outline" onClick={() => { switchPersona("p-emeka"); router.push("/tutor"); }}>Skip to an approved tutor&apos;s studio</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 rounded-3xl border border-line bg-paper p-6 sm:p-8">
      <ol className="flex flex-wrap gap-2" aria-label="Onboarding steps">
        {steps.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined} className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${i === step ? "bg-ink text-ivory" : i < step ? "bg-leaf-wash text-leaf" : "bg-sand text-muted"}`}>
            {i < step ? <Check className="size-3.5" aria-hidden /> : <span className="tabular">{i + 1}</span>} {s.title}
          </li>
        ))}
      </ol>

      <h2 className="text-2xl text-ink" tabIndex={-1}>{steps[step].title}</h2>

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={meta.role === "learner" ? "First name (or a nickname)" : "Your name"} placeholder="A made-up name is perfect" autoComplete="off" error={errors.name?.message} {...register("name")} />
          {meta.role === "learner" && (
            <>
              <SelectField label="Age group" error={errors.ageBand?.message} defaultValue="" {...register("ageBand")}>
                <option value="" disabled>Choose…</option>
                {AGE_BANDS.map((b) => <option key={b.id} value={b.id}>{b.label} ({b.ages})</option>)}
              </SelectField>
              <TextField label="School code" optional hint="If your school uses Lumen, its code links your lessons automatically." placeholder="e.g. IRK-7Q4M" error={errors.schoolCode?.message} {...register("schoolCode")} />
            </>
          )}
          {meta.role === "guardian" && (
            <SelectField label="Relationship to the learner(s)" error={errors.relationship?.message} defaultValue="" {...register("relationship")}>
              <option value="" disabled>Choose…</option>
              {["Mother", "Father", "Legal guardian", "Grandparent", "Aunt / uncle (authorised carer)"].map((r) => <option key={r}>{r}</option>)}
            </SelectField>
          )}
          {meta.role === "school_admin" && (
            <>
              <TextField label="School name" placeholder="A fictional school name" error={errors.schoolName?.message} {...register("schoolName")} />
              <SelectField label="City" error={errors.city?.message} defaultValue="" {...register("city")}>
                <option value="" disabled>Choose…</option>
                {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
              </SelectField>
            </>
          )}
          {meta.role === "teacher" && (
            <SelectField label="Main subject" error={errors.subject?.message} defaultValue="" {...register("subject")}>
              <option value="" disabled>Choose…</option>
              {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </SelectField>
          )}
        </div>
      )}

      {step === 1 && meta.role === "learner" && (
        <div className="grid gap-4">
          {minor ? (
            <>
              <p className="flex items-start gap-2 rounded-2xl bg-iris-wash p-4 text-sm text-iris-600">
                <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
                Under-18 accounts stay inactive until a guardian approves them. Guardians can see your progress and every message from a tutor.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Guardian's name" error={errors.guardianName?.message} {...register("guardianName")} />
                <TextField label="Guardian's email or phone" placeholder="Use a made-up contact" error={errors.guardianContact?.message} {...register("guardianContact")} />
              </div>
              <CheckboxField label={<span className="flex flex-wrap items-center gap-2">My guardian has approved this account <DemoBadge label="Simulated" /></span>} description="In production the guardian receives a link and confirms their identity and consent." error={errors.guardianConsent?.message} {...register("guardianConsent")} />
            </>
          ) : (
            <p className="rounded-2xl bg-sand p-4 text-sm text-body">Adult learners manage their own account. Tutors can&apos;t see your contact details, and all messages stay on the platform.</p>
          )}
          <CheckboxField label="I'll be kind, honest in tests and keep conversations on Lumen" error={errors.rulesAccepted?.message} {...register("rulesAccepted")} />
        </div>
      )}

      {step === 1 && meta.role === "guardian" && (
        <div className="grid gap-4">
          <TextField label="School invitation code" hint="Schools send this when they enrol your child. The demo accepts any code in the format IRK-XXXX, e.g. IRK-7Q4M." placeholder="IRK-7Q4M" disabled={linkLater} error={errors.inviteCode?.message} {...register("inviteCode")} />
          <CheckboxField label="I'll link my children later" description="You can also add a child who isn't at a Lumen school." {...register("linkLater")} />
          <CheckboxField label="I understand guardians approve bookings and can read every tutor message" error={errors.rulesAccepted?.message} {...register("rulesAccepted")} />
        </div>
      )}

      {step === 1 && meta.role === "school_admin" && (
        <div className="grid gap-3">
          <p className="rounded-2xl border border-dashed border-amber/50 bg-amber-wash p-4 text-sm text-amber">
            This demo never asks for real documents. Tick what you would provide; production would collect references and files through secure, scanned uploads.
          </p>
          {EVIDENCE.map((e) => <CheckboxField key={e} label={e} value={e} {...register("evidence")} />)}
          {errors.evidence?.message && <p role="alert" className="text-xs font-medium text-ember">{errors.evidence.message}</p>}
          <CheckboxField label="Our school agrees to Lumen's safeguarding standards" error={errors.rulesAccepted?.message} {...register("rulesAccepted")} />
        </div>
      )}

      {step === 1 && meta.role === "teacher" && (
        <div className="grid gap-4">
          <TextField label="Staff invitation code" hint="Sent by your school admin. Use STAFF-DEMO for this demo." placeholder="STAFF-XXXX" error={errors.inviteCode?.message} {...register("inviteCode")} />
          <CheckboxField label="I've completed (or will complete) my school's safeguarding training" error={errors.rulesAccepted?.message} {...register("rulesAccepted")} />
        </div>
      )}

      {step === 1 && meta.role === "platform_admin" && (
        <div className="grid gap-4">
          <p className="rounded-2xl bg-ink p-4 text-sm text-iris-soft">
            Platform staff use a second factor on every sign-in. <span className="font-semibold text-white">Demo code: 246810</span> <DemoBadge className="ml-1" />
          </p>
          <TextField label="Authenticator code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} error={errors.mfaCode?.message} {...register("mfaCode")} />
          <CheckboxField label="I'll access children's records only when needed, and know every access is logged" error={errors.rulesAccepted?.message} {...register("rulesAccepted")} />
        </div>
      )}

      {step === steps.length - 1 && (
        <fieldset className="grid gap-3">
          <legend className="mb-2 text-sm text-muted">So every screen has realistic history, continue as a ready-made fictional persona.</legend>
          {personas.map((p, i) => (
            <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line p-3 has-[:checked]:border-iris has-[:checked]:bg-iris-wash/60">
              <input type="radio" value={p.id} defaultChecked={i === 0} className="accent-iris" {...register("persona")} />
              <Avatar name={p.name} size={40} />
              <span>
                <span className="block font-semibold text-ink">{p.name}</span>
                <span className="text-xs text-muted">{p.title} · {p.blurb}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-5">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((n) => n - 1)} icon={<ArrowLeft className="size-4" />}>Back</Button>
        ) : (
          <Link href="/start" className="text-sm font-semibold text-muted hover:text-ink">← All roles</Link>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={next}>Continue <ArrowRight className="size-4" /></Button>
        ) : (
          <Button type="submit" variant="gold" loading={isSubmitting}>Enter the {meta.title.toLowerCase()} portal</Button>
        )}
      </div>
    </form>
  );
}
