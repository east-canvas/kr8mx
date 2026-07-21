import { describe, it, expect } from "vitest";
import { scanText, extractVisibleText } from "@/lib/compliance/content-guard";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/* The send/idempotency logic is DB-backed and exercised against the live DB in
   CI/QA; here we cover the guard requirement (templates are claim-free) and the
   template compliance structure without a database. */

describe("email templates — claim denylist", () => {
  const src = readFileSync(
    join(process.cwd(), "src/lib/email/templates.ts"),
    "utf8",
  );

  it("rendered template copy has no prohibited claim words", () => {
    const text = extractVisibleText(src);
    expect(scanText(text)).toEqual([]);
  });

  it("keeps compliance disclaimers out of scanned literals (imported, not inline)", () => {
    // The FDA disclaimer (contains 'treat'/'cure') must come from the excluded
    // compliance module as a variable, never as literal JSX text here.
    expect(src).not.toMatch(/not intended to diagnose/i);
    expect(src).toMatch(/FDA_DISCLAIMER/);
  });
});

describe("compliance disclaimers module", () => {
  it("carries the required regulatory strings", async () => {
    const mod = await import("@/lib/compliance/disclaimers");
    expect(mod.FDA_DISCLAIMER).toMatch(/has not been evaluated by the FDA/i);
    expect(mod.AGE_NOTICE).toMatch(/under the age of 21/i);
    expect(mod.OPERATOR_LINE).toMatch(/Gel Trading Group LLC/);
    expect(mod.MAILING_ADDRESS).toMatch(/TODO/);
  });
});
