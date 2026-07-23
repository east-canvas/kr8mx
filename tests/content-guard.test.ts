import { describe, it, expect } from "vitest";
import {
  scanText,
  scanTypography,
  extractVisibleText,
  scanRepo,
  DENYLIST,
  WHITELIST_PHRASES,
} from "@/lib/compliance/content-guard";

describe("content guard — denylist", () => {
  it("flags each prohibited word as a whole word", () => {
    for (const word of DENYLIST) {
      const hits = scanText(`Our product delivers real ${word} for you.`);
      expect(hits.map((h) => h.word)).toContain(word);
    }
  });

  it("is case-insensitive", () => {
    expect(scanText("BOOST your day")).toHaveLength(1);
    expect(scanText("Boost")).toHaveLength(1);
  });

  it("matches whole words only (no substrings)", () => {
    // "energize"/"energetic" contain "energ" but not the whole word "energy"
    expect(scanText("energize your energetic self")).toHaveLength(0);
    // "curen" / "treatment"? "treatment" contains "treat" but not whole-word
    expect(scanText("curated treatments").filter((h) => h.word === "treat")).toHaveLength(
      0,
    );
  });

  it("passes clean marketing copy", () => {
    expect(scanText("Built for what's next. Performance. Elevated.")).toHaveLength(
      0,
    );
  });
});

describe("content guard — Energy Drink whitelist carve-out", () => {
  it("allows the literal category phrase 'Energy Drink'", () => {
    expect(WHITELIST_PHRASES).toContain("energy drink");
    expect(scanText("KR8MX Energy Drink — 12 FL OZ")).toHaveLength(0);
    expect(scanText("energy drink")).toHaveLength(0);
    expect(scanText("ENERGY DRINK")).toHaveLength(0);
  });

  it("still flags the bare word 'energy' outside the phrase", () => {
    const hits = scanText("boundless energy in every can");
    expect(hits.map((h) => h.word)).toContain("energy");
  });

  it("flags 'energy' when not immediately followed by 'drink'", () => {
    // whitelist only removes the exact adjacent phrase
    const hits = scanText("energy and focus");
    expect(hits.map((h) => h.word).sort()).toEqual(["energy", "focus"]);
  });
});

describe("content guard — visible-text extraction", () => {
  it("ignores className / code and reads JSX text + alt/aria-label", () => {
    const src = `
      export function X() {
        // boost is fine in a comment
        return (
          <div className="focus-visible:outline">
            <img alt="KR8MX" />
            <span aria-label="21+ Verification">Built for what's next.</span>
            <p>Performance. Elevated.</p>
          </div>
        );
      }
    `;
    const text = extractVisibleText(src);
    // className "focus-visible" and the comment "boost" must NOT surface
    expect(scanText(text)).toHaveLength(0);
    expect(text).toContain("Built for what's next.");
  });

  it("surfaces a denylist word placed in real JSX copy", () => {
    const src = `export const C = () => <p>Feel the energy today.</p>;`;
    const hits = scanText(extractVisibleText(src));
    expect(hits.map((h) => h.word)).toContain("energy");
  });
});

describe("content guard — em dash typography rule", () => {
  it("flags an em dash in visible copy", () => {
    expect(scanTypography("Sharp — controlled")).toHaveLength(1);
    expect(scanTypography("a — b — c")).toHaveLength(2);
  });

  it("passes copy with organic punctuation", () => {
    expect(scanTypography("Sharp, controlled. Elevated.")).toEqual([]);
    expect(scanTypography("6, 12, or 24 pack")).toEqual([]);
  });
});

describe("content guard — repository scan", () => {
  it("the current marketing copy is clean", () => {
    const violations = scanRepo(process.cwd());
    if (violations.length > 0) {
      // Surface details if this ever fails.
      console.error(violations);
    }
    expect(violations).toEqual([]);
  });
});
