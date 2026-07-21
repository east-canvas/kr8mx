import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { notifyList } from "@/db/schema";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/**
 * One-click unsubscribe (CAN-SPAM). Flips the subscribed flag for the token's
 * notify-list entry; future announcement sends skip unsubscribed entries.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let done = false;
  if (token) {
    try {
      const db = getDb();
      const res = await db
        .update(notifyList)
        .set({ subscribed: false })
        .where(eq(notifyList.unsubscribeToken, token))
        .returning({ id: notifyList.id });
      done = res.length > 0;
    } catch {
      done = false;
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <SectionHeading
        kicker="Email Preferences"
        title={done ? "You're unsubscribed" : "Unsubscribe"}
        align="center"
        as="h1"
      />
      <p className="mt-5 text-sm text-secondary">
        {done
          ? "You won't receive further announcement emails. Order-related emails are still sent when you place an order."
          : "This unsubscribe link is invalid or has expired."}
      </p>
    </div>
  );
}
