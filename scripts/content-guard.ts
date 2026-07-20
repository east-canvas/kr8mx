/**
 * Build-time entry point for the marketing-copy content guard.
 * Runs before `next build` (see the "prebuild" npm script) and exits non-zero
 * on any denylist hit, failing the build.
 */
import { scanRepo } from "../src/lib/compliance/content-guard";

const violations = scanRepo(process.cwd());

if (violations.length > 0) {
  console.error(
    `\n✖ Content guard: ${violations.length} prohibited claim word(s) in marketing copy:\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.file}  —  "${v.word}"  …${v.snippet}…`);
  }
  console.error(
    `\nProhibited: ${["energy", "focus", "boost", "enhance", "mood", "relief", "calm", "treat", "cure", "dose", "wellness"].join(", ")}` +
      ` (whole-word, case-insensitive). "Energy Drink" is whitelisted as a category descriptor.\n`,
  );
  process.exit(1);
}

console.log("✓ Content guard: no prohibited claim words in marketing copy.");
process.exit(0);
