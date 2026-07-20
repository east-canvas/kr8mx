import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  AGE_GATE_COOKIE,
  AGE_GATE_VALUE,
  AGE_GATE_MAX_AGE_DAYS,
  AGE_GATE_MAX_AGE_SECONDS,
  isAgeConfirmedValue,
  readAgeCookie,
  writeAgeCookie,
} from "@/lib/compliance/age-gate";

describe("age gate cookie contract", () => {
  it("persists for 30 days", () => {
    expect(AGE_GATE_MAX_AGE_DAYS).toBe(30);
    expect(AGE_GATE_MAX_AGE_SECONDS).toBe(30 * 24 * 60 * 60);
  });

  it("only treats the exact confirmation value as valid", () => {
    expect(isAgeConfirmedValue(AGE_GATE_VALUE)).toBe(true);
    expect(isAgeConfirmedValue("0")).toBe(false);
    expect(isAgeConfirmedValue("")).toBe(false);
    expect(isAgeConfirmedValue(undefined)).toBe(false);
    expect(isAgeConfirmedValue(null)).toBe(false);
  });
});

describe("age gate cookie read/write (client)", () => {
  // jsdom-free simulation of document.cookie. Mirrors real browser behavior:
  // reading `document.cookie` returns only name=value pairs (attributes such as
  // max-age / path are write-only), so we also capture raw writes to assert on
  // the attributes that were set.
  let store = "";
  let writes: string[] = [];
  beforeEach(() => {
    store = "";
    writes = [];
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        get cookie() {
          return store;
        },
        set cookie(v: string) {
          writes.push(v);
          const [pair] = v.split("; ");
          const [name] = pair.split("=");
          const others = store
            .split("; ")
            .filter((c) => c && !c.startsWith(`${name}=`));
          store = [...others, pair].filter(Boolean).join("; ");
        },
      },
    });
  });
  afterEach(() => {
    // @ts-expect-error cleanup test global
    delete globalThis.document;
  });

  it("reads false before confirmation", () => {
    expect(readAgeCookie()).toBe(false);
  });

  it("writes then reads a valid confirmation", () => {
    writeAgeCookie();
    // readable pair (attributes are write-only, per browser semantics)
    expect(store).toContain(`${AGE_GATE_COOKIE}=${AGE_GATE_VALUE}`);
    // the raw write carries the 30-day max-age + path + SameSite
    expect(writes[0]).toContain(`max-age=${AGE_GATE_MAX_AGE_SECONDS}`);
    expect(writes[0]).toContain("path=/");
    expect(writes[0]).toContain("SameSite=Lax");
    expect(readAgeCookie()).toBe(true);
  });
});
