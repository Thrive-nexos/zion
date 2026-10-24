// Unit tests for pure domain logic. Run with: npm test  (Node 22.18+ strips TypeScript types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { priceFor, PRICING_RULES } from "../src/lib/pricing.ts";
import { moderate } from "../src/lib/moderation.ts";
import { fmtTime, overlaps, tzOffsetMinutes, watISO, zonedToWAT, DEMO_NOW } from "../src/lib/time.ts";
import { naira, prng, waecGrade } from "../src/lib/utils.ts";

test("hourly price breakdown: 60 min at ₦12,500", () => {
  const p = priceFor(12_500, 60, false);
  assert.equal(p.subtotal, 12_500);
  assert.equal(p.platformFee, 625); // 5%
  assert.equal(p.vat, 47); // 7.5% of 625, rounded
  assert.equal(p.total, 12_500 + 625 + 47);
  assert.equal(p.commission, 1_875); // 15%
  assert.equal(p.tutorShare, 10_625);
});

test("trial lessons charge the flat trial rate and respect the minimum service fee", () => {
  const p = priceFor(12_500, PRICING_RULES.trialMinutes, true, 5_000);
  assert.equal(p.subtotal, 6_250);
  assert.equal(p.trialDiscount, 1_250);
  assert.equal(p.platformFee, 250);
  assert.equal(p.tutorShare, 5_000 - 750);
  const tiny = priceFor(3_000, 30, true, 1_000);
  assert.equal(tiny.platformFee, PRICING_RULES.minServiceFee);
});

test("moderation: clean, held and blocked messages", () => {
  assert.equal(moderate("Great work today! Try questions 6–10.").verdict, "clean");
  assert.equal(moderate("Call me on 0803 555 0199").verdict, "held");
  assert.equal(moderate("Message me on +234 803 555 0199").verdict, "held");
  assert.equal(moderate("let's continue on WhatsApp").verdict, "held");
  assert.equal(moderate("email me at tutor@example.com").verdict, "held");
  assert.equal(moderate("don't tell your mum about this").verdict, "blocked");
  assert.equal(moderate("send me a photo").verdict, "blocked");
  assert.equal(moderate("Where do you live?").verdict, "blocked");
});

test("time zones: London is one hour behind Lagos in the demo week, Toronto five", () => {
  assert.equal(tzOffsetMinutes("Africa/Lagos", DEMO_NOW), 60);
  assert.equal(tzOffsetMinutes("Europe/London", DEMO_NOW), 0); // BST ended 25 Oct 2026
  assert.equal(tzOffsetMinutes("America/Toronto", DEMO_NOW), -240); // EDT until 1 Nov 2026
  const londonFive = zonedToWAT(1, "17:00", "Europe/London");
  assert.equal(fmtTime(londonFive), "18:00");
  assert.equal(fmtTime(londonFive, "Europe/London"), "17:00");
  const torontoSeven = zonedToWAT(1, "07:00", "America/Toronto");
  assert.equal(fmtTime(torontoSeven), "12:00");
});

test("overlap detection used for booking conflicts", () => {
  const a = watISO(1, "17:00");
  assert.equal(overlaps(a, 60, watISO(1, "17:30"), 30), true);
  assert.equal(overlaps(a, 60, watISO(1, "18:00"), 60), false);
  assert.equal(overlaps(watISO(2, "13:00"), 60, watISO(2, "08:00"), 370), true); // school day 08:00–14:10
});

test("WAEC grade boundaries", () => {
  assert.equal(waecGrade(75), "A1");
  assert.equal(waecGrade(64), "C4");
  assert.equal(waecGrade(50), "C6");
  assert.equal(waecGrade(39), "F9");
});

test("deterministic seed PRNG and naira formatting", () => {
  const a = prng(42), b = prng(42);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  assert.equal(naira(12500), "₦12,500");
});
