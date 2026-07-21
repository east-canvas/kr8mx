import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/* =============================================================================
   Build-time content guard.

   Scans rendered MARKETING copy for a claim denylist and fails the build on any
   hit outside code comments. Structure/health claims are prohibited on a
   kratom-derived dietary product; this guard is a backstop against a stray word
   slipping into shipped copy.

   Scope: JSX text nodes + text-bearing attributes (alt/title/aria-label/
   placeholder) in marketing .tsx files. Explicitly EXCLUDED are the legal route
   group and the compliance components (age gate, footer) — those legitimately
   carry regulated words inside required disclaimers (e.g. the FDA statement
   "...not intended to diagnose, treat, cure..."), which are disclaimers, not
   marketing claims.
   ============================================================================= */

export const DENYLIST = [
  "energy",
  "focus",
  "boost",
  "enhance",
  "mood",
  "relief",
  "calm",
  "treat",
  "cure",
  "dose",
  "wellness",
] as const;

/**
 * Whitelisted literal phrases removed before scanning.
 * "Energy Drink" is CATEGORY-DESCRIPTOR-ONLY — it names the legal product
 * category on packaging/labeling and is not a performance claim.
 */
export const WHITELIST_PHRASES = ["energy drink"] as const;

/** Paths (relative, posix) excluded from the marketing scan — see note above. */
const EXCLUDE_PATTERNS: RegExp[] = [
  /\/legal\//,
  /\/compliance\//,
  /\/admin\//, // internal admin console, not public marketing
  /components\/site\/Footer\.tsx$/,
];

// Marketing surfaces. Email templates (src/lib/email, .ts) are included per
// prompt 9 so their rendered copy is scanned too.
const MARKETING_ROOTS: { dir: string; exts: string[] }[] = [
  { dir: "src/app", exts: [".tsx"] },
  { dir: "src/components", exts: [".tsx"] },
  { dir: "src/lib/email", exts: [".ts", ".tsx"] },
];

export type Violation = {
  file: string;
  word: string;
  snippet: string;
};

/** Strip // line comments and /* *\/ block comments (incl. JSX {/* *\/}). */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

/** Remove className / style attributes so Tailwind tokens (focus-visible, …)
 *  are never scanned as copy. */
function stripStyleAttrs(src: string): string {
  return src
    .replace(/className\s*=\s*"[^"]*"/g, " ")
    .replace(/className\s*=\s*\{[^}]*\}/g, " ")
    .replace(/style\s*=\s*\{\{[^}]*\}\}/g, " ");
}

/** Extract visible text: JSX text nodes + text-bearing attribute values. */
export function extractVisibleText(rawSrc: string): string {
  const src = stripStyleAttrs(stripComments(rawSrc));
  const parts: string[] = [];

  // JSX text nodes between tags; drop nested {expressions}
  const textNodeRe = />([^<]+)</g;
  let m: RegExpExecArray | null;
  while ((m = textNodeRe.exec(src)) !== null) {
    parts.push(m[1].replace(/\{[^}]*\}/g, " "));
  }

  // text-bearing attributes
  const attrRe = /(?:alt|title|aria-label|placeholder)\s*=\s*"([^"]*)"/g;
  while ((m = attrRe.exec(src)) !== null) {
    parts.push(m[1]);
  }

  return parts.join("\n");
}

/** Scan a block of visible text; returns denylist violations (after whitelist). */
export function scanText(text: string): Violation[] {
  let scrubbed = text;
  for (const phrase of WHITELIST_PHRASES) {
    scrubbed = scrubbed.replace(new RegExp(phrase, "gi"), " ");
  }

  const violations: Violation[] = [];
  for (const word of DENYLIST) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    let hit: RegExpExecArray | null;
    while ((hit = re.exec(scrubbed)) !== null) {
      const start = Math.max(0, hit.index - 30);
      const end = Math.min(scrubbed.length, hit.index + word.length + 30);
      violations.push({
        file: "<text>",
        word,
        snippet: scrubbed.slice(start, end).replace(/\s+/g, " ").trim(),
      });
    }
  }
  return violations;
}

function walk(dir: string, acc: string[], exts: string[]): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc, exts);
    else if (exts.some((e) => entry.endsWith(e))) acc.push(full);
  }
  return acc;
}

function isExcluded(relPath: string): boolean {
  const posix = relPath.split("\\").join("/");
  return EXCLUDE_PATTERNS.some((re) => re.test(posix));
}

/** Scan all marketing .tsx files under the repo root. */
export function scanRepo(rootDir: string = process.cwd()): Violation[] {
  const files: string[] = [];
  for (const root of MARKETING_ROOTS) {
    const abs = join(rootDir, root.dir);
    try {
      walk(abs, files, root.exts);
    } catch {
      // root may not exist yet — skip
    }
  }

  const violations: Violation[] = [];
  for (const file of files) {
    const rel = relative(rootDir, file);
    if (isExcluded(rel)) continue;
    const text = extractVisibleText(readFileSync(file, "utf8"));
    for (const v of scanText(text)) {
      violations.push({ ...v, file: rel });
    }
  }
  return violations;
}
