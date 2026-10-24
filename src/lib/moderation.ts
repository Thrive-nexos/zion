import type { ModerationVerdict } from "@/lib/domain/types";

/**
 * Rule-based message moderation, run before a message is delivered.
 *
 * "held"    → not delivered; shown to the sender and the guardian with a reason, logged for review.
 * "blocked" → not delivered; a safeguarding report is opened automatically.
 *
 * Production would add a trained classifier and human review queue; these
 * rules stay as a fast, explainable first layer.
 */
const HOLD_RULES: { label: string; test: RegExp }[] = [
  { label: "Off-platform contact detail detected (phone number)", test: /(\+?234[\s-]?|0)[789][01]\d[\s-]?\d{3}[\s-]?\d{4}/ },
  { label: "Off-platform contact detail detected (email address)", test: /[\w.+-]+@[\w-]+\.[\w.-]+/ },
  { label: "Link to an external site", test: /https?:\/\/(?!lumen\.example)[^\s]+/i },
  { label: "Request to move to another app", test: /\b(whats\s?app|telegram|snap(chat)?|instagram|tiktok|signal|dm me|text me)\b/i },
  { label: "Payment outside the platform", test: /\b(pay me directly|send (the )?money to|my account number|transfer to my)\b/i },
];

const BLOCK_RULES: { label: string; test: RegExp }[] = [
  { label: "Request for secrecy", test: /\b(don'?t tell (your )?(mum|mom|dad|parents?|guardian)|keep (this|it) (a )?secret|our little secret)\b/i },
  { label: "Request to meet in person", test: /\b(meet (me|up)|come to my (house|place)|where do you live|your (home )?address)\b/i },
  { label: "Request for images", test: /\b(send (me )?(a )?(photo|pic|picture|selfie))\b/i },
];

export function moderate(body: string): { verdict: ModerationVerdict; reasons: string[] } {
  const blocked = BLOCK_RULES.filter((r) => r.test.test(body)).map((r) => r.label);
  if (blocked.length) return { verdict: "blocked", reasons: blocked };
  const held = HOLD_RULES.filter((r) => r.test.test(body)).map((r) => r.label);
  if (held.length) return { verdict: "held", reasons: held };
  return { verdict: "clean", reasons: [] };
}

export const MODERATION_EXAMPLES = [
  { body: "Great work today! Try questions 6–10 before Thursday.", note: "Delivered" },
  { body: "Call me on 0803 555 0199 if you're stuck.", note: "Held: phone number" },
  { body: "Let's continue on WhatsApp, it's easier.", note: "Held: another app" },
  { body: "Don't tell your mum, but…", note: "Blocked + safeguarding report" },
];
