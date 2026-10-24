"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Clock, PartyPopper, X } from "lucide-react";
import { WEEKLY_TESTS } from "@/lib/seed/learning";
import { subjectById } from "@/lib/seed/catalog";
import { coursesFor, testIsOpen } from "@/lib/selectors";
import { submitTest } from "@/lib/services/learning";
import { run } from "@/lib/services/core";
import { fmtDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { useLearner } from "./hooks";

export function TestRunner({ testId }: { testId: string }) {
  const { s, student, isKid } = useLearner();
  const t = WEEKLY_TESTS.find((x) => x.id === testId);
  const attempt = s.attempts.find((a) => a.testId === testId && a.studentId === student.id);
  const [answers, setAnswers] = useState<number[]>(() => (t ? t.questions.map(() => -1) : []));
  const [busy, setBusy] = useState(false);
  const [i, setI] = useState(0);

  if (!t) return <EmptyState title="Check not found" action={<ButtonLink href="/learn/tests" size="sm">All checks</ButtonLink>} />;
  const allowed = t.courseId && coursesFor(s, student).some((c) => c.course.id === t.courseId);
  if (!allowed) return <EmptyState title="This check isn't part of your courses" action={<ButtonLink href="/learn/tests" size="sm">Your checks</ButtonLink>} />;
  if (!testIsOpen(t)) return <EmptyState icon={<Clock className="size-5" />} title={`Opens ${fmtDateTime(t.opensAt)} WAT`} body="Checks open on schedule so the whole class takes them in the same window." action={<ButtonLink href="/learn/tests" size="sm">Back</ButtonLink>} />;

  const shown = attempt ? attempt.answers : answers;
  const reviewing = !!attempt;
  const unanswered = answers.filter((a) => a < 0).length;

  const submit = async () => {
    setBusy(true);
    await run(() => submitTest(t.id, answers));
    setBusy(false);
  };

  const pct = attempt ? Math.round((attempt.score / attempt.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl" data-tour="quiz">
      <Link href="/learn/tests" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden /> All checks</Link>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-azure-600">{subjectById(t.subjectId).name} · Week {t.week} · {t.slot === 1 ? "Tuesday" : "Friday"} check</p>
        <h1 className="mt-1 text-4xl text-ink">{t.title}</h1>
        {!reviewing && <p className="mt-1 text-muted">{t.questions.length} questions · about {t.minutes} minutes · no penalty for wrong answers</p>}
      </header>

      {reviewing && (
        <div role="status" className={cn("mb-6 flex items-center gap-4 rounded-3xl p-5", pct >= 80 ? "bg-leaf-wash" : pct >= 50 ? "bg-gold-wash" : "bg-ember-wash")}>
          <PartyPopper className="size-8 shrink-0 text-gold-600" aria-hidden />
          <div>
            <p className="font-display text-3xl font-semibold text-ink">{attempt.score} / {attempt.total}</p>
            <p className="text-sm text-body">{pct === 100 ? "Perfect, achievement unlocked!" : pct >= 60 ? "Great work. Read the explanations for anything you missed." : "Good effort. The explanations below show each step."} Your guardian and teacher can see this result.</p>
          </div>
        </div>
      )}

      {isKid && !reviewing ? (
        // One question at a time, big targets, for young learners.
        <section aria-live="polite" className="rounded-3xl bg-paper p-6 shadow-soft">
          <p className="text-sm font-bold text-muted">Question {i + 1} of {t.questions.length}</p>
          <h2 className="mt-2 font-display text-3xl text-ink">{t.questions[i].prompt}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t.questions[i].prompt}>
            {t.questions[i].options.map((o, k) => (
              <button
                key={k}
                role="radio"
                aria-checked={answers[i] === k}
                onClick={() => setAnswers((a) => a.map((x, j) => (j === i ? k : x)))}
                className={cn("min-h-16 rounded-2xl border-2 px-4 py-3 text-xl font-semibold transition-colors", answers[i] === k ? "border-iris bg-iris-wash text-iris-600" : "border-line bg-ivory text-ink hover:border-iris")}
              >
                {o}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}>Back</Button>
            {i < t.questions.length - 1 ? (
              <Button onClick={() => setI((n) => n + 1)} disabled={answers[i] < 0}>Next</Button>
            ) : (
              <Button variant="gold" loading={busy} disabled={unanswered > 0} onClick={submit}>Finish!</Button>
            )}
          </div>
        </section>
      ) : (
        <ol className="grid gap-4">
          {t.questions.map((q, qi) => {
            const chosen = shown[qi];
            return (
              <li key={q.id} className="rounded-3xl border border-line bg-paper p-5">
                <fieldset>
                  <legend className="font-semibold text-ink"><span className="mr-2 text-muted tabular">{qi + 1}.</span>{q.prompt}</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o, k) => {
                      const correct = reviewing && k === q.answer;
                      const wrong = reviewing && k === chosen && k !== q.answer;
                      return (
                        <label key={k} className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm",
                          reviewing ? "cursor-default" : "cursor-pointer hover:border-iris",
                          correct ? "border-leaf bg-leaf-wash" : wrong ? "border-ember bg-ember-wash" : chosen === k ? "border-iris bg-iris-wash" : "border-line bg-ivory",
                        )}>
                          <input type="radio" name={q.id} className="accent-iris" checked={chosen === k} disabled={reviewing} onChange={() => setAnswers((a) => a.map((x, j) => (j === qi ? k : x)))} />
                          <span className="flex-1 text-ink">{o}</span>
                          {correct && <Check className="size-4 text-leaf" aria-label="correct answer" />}
                          {wrong && <X className="size-4 text-ember" aria-label="your answer, incorrect" />}
                        </label>
                      );
                    })}
                  </div>
                  {reviewing && <p className="mt-3 rounded-xl bg-sand px-3 py-2 text-sm text-body"><strong>Why:</strong> {q.explanation}</p>}
                </fieldset>
              </li>
            );
          })}
        </ol>
      )}

      {!reviewing && !isKid && (
        <div className="sticky bottom-20 mt-6 flex items-center justify-between gap-3 rounded-md border-2 border-ink bg-white p-4 shadow-lift lg:bottom-4">
          <p className="text-sm text-muted">{unanswered ? `${unanswered} question${unanswered === 1 ? "" : "s"} left` : "All answered"}</p>
          <Button variant="gold" loading={busy} disabled={unanswered > 0} onClick={submit}>Submit check</Button>
        </div>
      )}
    </div>
  );
}
