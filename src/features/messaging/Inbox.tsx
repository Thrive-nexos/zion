"use client";

import { useMemo, useState } from "react";
import { Ban, Eye, Flag, Lock, Send, ShieldAlert, ShieldQuestion } from "lucide-react";
import { useDemo, usePersona } from "@/lib/demo/store";
import { blockUser, reportConcern, sendMessage } from "@/lib/services/guardian";
import { run } from "@/lib/services/core";
import { moderate } from "@/lib/moderation";
import { fmtDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shell/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";

export function Inbox({ variant }: { variant: "guardian" | "tutor" }) {
  const s = useDemo();
  const persona = usePersona();
  const threads = s.threads.filter((t) => t.participantIds.includes(persona.subjectId));
  const [active, setActive] = useState(threads[0]?.id ?? null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const thread = threads.find((t) => t.id === active);
  const messages = s.messages.filter((m) => m.threadId === active).sort((a, b) => a.at.localeCompare(b.at));
  const preview = useMemo(() => (text.trim().length > 3 ? moderate(text) : null), [text]);
  const tutorId = thread?.participantIds.find((p) => p.startsWith("tut-"));
  const blocked = !!tutorId && s.blocks.some((b) => b.blockerId === persona.subjectId && b.blockedId === tutorId);

  const send = async () => {
    if (!active) return;
    setBusy(true);
    const r = await run(() => sendMessage(active, text));
    setBusy(false);
    if (r) setText("");
  };

  return (
    <>
      <PageHeader
        eyebrow="Messages"
        title={variant === "guardian" ? "Every conversation, in the open" : "Messages with families"}
        description={variant === "guardian"
          ? "Tutors can only message your children inside threads that include you. Contact details and off-platform requests are filtered before delivery."
          : "Guardians see every message in these threads. Sharing phone numbers, emails or other apps is held for review."}
      />
      {threads.length === 0 ? (
        <EmptyState title="No conversations yet" />
      ) : (
        <div className="grid min-h-[34rem] overflow-hidden rounded-3xl border border-line bg-paper lg:grid-cols-[18rem_1fr]">
          <ul className="border-b border-hair lg:border-b-0 lg:border-r" aria-label="Conversations">
            {threads.map((t) => {
              const last = s.messages.filter((m) => m.threadId === t.id).at(-1);
              return (
                <li key={t.id}>
                  <button onClick={() => setActive(t.id)} aria-current={t.id === active ? "true" : undefined} className={cn("flex w-full flex-col gap-0.5 border-b border-hair px-4 py-3 text-left", t.id === active ? "bg-iris-wash/60" : "hover:bg-sand")}>
                    <span className="flex items-center gap-2 font-semibold text-ink">{t.status === "locked" && <Lock className="size-3.5 text-ember" aria-label="locked" />}<span className="truncate">{t.subject}</span></span>
                    {last && (
                      <span className="truncate text-xs text-muted">
                        {last.authorName.replace(/^(Mr|Mrs|Ms|Dr|Mme)\s+/, "").split(" ")[0]}: {last.moderation.verdict === "clean" ? last.body : "Message withheld by moderation"}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {thread && (
            <section className="flex min-w-0 flex-col" aria-label={thread.subject}>
              <header className="flex flex-wrap items-center gap-2 border-b border-hair px-5 py-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-sans text-base font-bold text-ink">{thread.subject}</h2>
                  <p className="flex items-center gap-1.5 text-xs text-muted"><Eye className="size-3.5" aria-hidden /> Logged · visible to the guardian · retained for safeguarding review</p>
                </div>
                <Button size="sm" variant="ghost" icon={<Flag className="size-4" />} onClick={() => run(() => reportConcern({ category: "message", subject: `Reported thread: ${thread.subject}`, detail: "Reported from the message thread by a participant.", targetLabel: `Thread ${thread.id}` }))}>Report</Button>
                {variant === "guardian" && tutorId && (
                  <Button size="sm" variant="ghost" disabled={blocked} icon={<Ban className="size-4" />} onClick={() => run(() => blockUser(tutorId, s.tutors.find((t) => t.id === tutorId)?.name ?? "Tutor"))}>{blocked ? "Blocked" : "Block tutor"}</Button>
                )}
              </header>
              <ol className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {messages.map((m) => {
                  const mine = m.authorId === persona.subjectId;
                  const system = m.authorId === "system";
                  if (system) return <li key={m.id} className="mx-auto max-w-md rounded-2xl bg-amber-wash px-4 py-2.5 text-center text-xs text-amber">{m.body}</li>;
                  const hidden = m.moderation.verdict !== "clean";
                  return (
                    <li key={m.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                      <Avatar name={m.authorName} size={32} />
                      <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", mine ? "bg-iris text-white" : "bg-sand text-ink", hidden && "border border-dashed border-amber bg-amber-wash text-ink")}>
                        <p className={cn("text-xs font-semibold", mine && !hidden ? "text-white/80" : "text-muted")}>{m.authorName} · {fmtDateTime(m.at)}</p>
                        <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                        {hidden && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-amber">
                            {m.moderation.verdict === "blocked" ? <ShieldAlert className="size-3.5" aria-hidden /> : <ShieldQuestion className="size-3.5" aria-hidden />}
                            {m.moderation.verdict === "blocked" ? "Blocked, not delivered" : "Held for review, not delivered to the learner"} · {m.moderation.reasons.join("; ")}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              <form className="border-t border-hair p-4" onSubmit={(e) => { e.preventDefault(); send(); }}>
                {thread.status === "locked" ? (
                  <p className="flex items-center gap-2 rounded-xl bg-ember-wash p-3 text-sm text-ember"><Lock className="size-4" aria-hidden /> Locked pending a safeguarding review.</p>
                ) : blocked ? (
                  <p className="rounded-xl bg-sand p-3 text-sm text-muted">You blocked this tutor. Unblock from Safety & blocks to message again.</p>
                ) : (
                  <>
                    <label htmlFor="composer" className="sr-only">Write a message</label>
                    <div className="flex items-end gap-2">
                      <textarea id="composer" value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Write a message…" className="min-h-12 flex-1 resize-none rounded-2xl border border-line bg-ivory px-4 py-3 text-sm focus:border-iris focus:outline-none focus:ring-4 focus:ring-iris/15" />
                      <Button type="submit" loading={busy} disabled={text.trim().length < 2} icon={<Send className="size-4" />} aria-label="Send message">Send</Button>
                    </div>
                    {preview && preview.verdict !== "clean" && (
                      <p role="status" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber">
                        <ShieldQuestion className="size-3.5" aria-hidden /> This message will be {preview.verdict === "blocked" ? "blocked" : "held for review"}: {preview.reasons.join("; ")}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted">Try sharing a phone number to see moderation in action. <Badge tone="neutral">Logged</Badge></p>
                  </>
                )}
              </form>
            </section>
          )}
        </div>
      )}
    </>
  );
}
