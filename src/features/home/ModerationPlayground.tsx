"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { moderate, MODERATION_EXAMPLES } from "@/lib/moderation";
import { cn } from "@/lib/utils";

/** Try the moderation rules live — nothing is sent anywhere. */
export function ModerationPlayground() {
  const [text, setText] = useState(MODERATION_EXAMPLES[1].body);
  const result = useMemo(() => moderate(text), [text]);
  const Icon = result.verdict === "clean" ? ShieldCheck : result.verdict === "held" ? ShieldQuestion : ShieldAlert;
  return (
    <div className="rounded-3xl border border-line bg-paper p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-iris-600">Try the message filter</p>
      <p className="mt-1 text-sm text-muted">Type as if you were a tutor messaging a learner. Every check runs in your browser.</p>
      <label htmlFor="mod-input" className="sr-only">Message to test</label>
      <textarea
        id="mod-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="mt-3 w-full resize-none rounded-2xl border border-line bg-ivory p-3 text-sm focus:border-iris focus:outline-none focus:ring-4 focus:ring-iris/15"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {MODERATION_EXAMPLES.map((ex) => (
          <button key={ex.body} onClick={() => setText(ex.body)} className="rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-body hover:bg-iris-wash">
            {ex.note}
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        className={cn(
          "mt-4 flex items-start gap-3 rounded-2xl p-3.5 text-sm",
          result.verdict === "clean" && "bg-leaf-wash text-leaf",
          result.verdict === "held" && "bg-amber-wash text-amber",
          result.verdict === "blocked" && "bg-ember-wash text-ember",
        )}
      >
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-bold">
            {result.verdict === "clean" ? "Delivered, and logged where the guardian can read it" : result.verdict === "held" ? "Held for review, not delivered" : "Blocked, thread locked, safeguarding lead alerted"}
          </p>
          {result.reasons.length > 0 && <p className="mt-0.5 opacity-90">{result.reasons.join(" · ")}</p>}
        </div>
      </div>
    </div>
  );
}
