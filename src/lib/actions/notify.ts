"use server";

import { randomBytes } from "node:crypto";
import { getDb } from "@/db/client";
import { notifyList } from "@/db/schema";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Capture a notify-list signup (coming-soon interest). Idempotent per email+variant. */
export async function subscribeNotify(input: {
  email: string;
  variantId?: number | null;
}): Promise<{ ok: boolean; error?: string }> {
  const email = input.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  try {
    const db = getDb();
    await db
      .insert(notifyList)
      .values({
        email,
        variantId: input.variantId ?? null,
        subscribed: true,
        unsubscribeToken: randomBytes(16).toString("hex"),
      })
      .onConflictDoNothing();
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }
}
