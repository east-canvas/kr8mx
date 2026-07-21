"use client";

import { useState } from "react";
import { subscribeNotify } from "@/lib/actions/notify";

/** Email capture for coming-soon / access. Writes to notify_list. */
export function NotifyForm({
  variantId = null,
  cta = "Notify me",
}: {
  variantId?: number | null;
  cta?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await subscribeNotify({ email, variantId });
    if (res.ok) {
      setState("done");
      setMsg("You're on the list.");
      setEmail("");
    } else {
      setState("error");
      setMsg(res.error ?? "Try again.");
    }
  }

  if (state === "done") {
    return <p className="text-sm text-primary">{msg}</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" aria-label="Notify me">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email address"
        className="flex-1 rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-primary outline-none focus-visible:border-accent"
      />
      <button
        type="submit"
        disabled={state === "busy"}
        className="rounded-sm border border-primary px-6 py-3 text-xs font-medium uppercase tracking-wide text-primary transition-colors duration-base ease-out-brand hover:bg-primary hover:text-bg disabled:opacity-50"
      >
        {state === "busy" ? "…" : cta}
      </button>
      {state === "error" ? (
        <p className="text-2xs text-strawberry sm:hidden">{msg}</p>
      ) : null}
    </form>
  );
}
