"use client";

import { useState } from "react";
import { submitLead } from "@/lib/actions/lead";

const TYPES = [
  { value: "wholesale", label: "Wholesale" },
  { value: "retail", label: "Retail" },
  { value: "general", label: "General" },
] as const;

const fieldCls =
  "w-full rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-primary outline-none transition-colors focus-visible:border-accent";
const labelCls = "mb-1.5 block text-2xs uppercase tracking-wide text-muted";

export function ContactForm() {
  const [type, setType] = useState<string>("wholesale");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await submitLead({ type, name, email, company, phone, message });
    if (res.ok) {
      setState("done");
    } else {
      setState("error");
      setMsg(res.error ?? "Something went wrong. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div
        role="status"
        className="animate-rise flex items-start gap-4 rounded-xl border border-hairline bg-surface p-6"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast"
          aria-hidden
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div>
          <p className="text-base text-primary">Thanks, we have your details.</p>
          <p className="mt-1 text-sm text-secondary">
            Our team will reach out to {email}. For wholesale, expect pricing and
            availability shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" aria-label="Contact">
      <div>
        <span className={labelCls}>I am reaching out about</span>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                aria-pressed={active}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors duration-base ease-out-brand ${
                  active
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-hairline text-secondary hover:text-primary"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className={labelCls}>
            Name
          </label>
          <input
            id="lead-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={fieldCls}
          />
        </div>
        <div>
          <label htmlFor="lead-email" className={labelCls}>
            Email
          </label>
          <input
            id="lead-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={fieldCls}
          />
        </div>
        <div>
          <label htmlFor="lead-company" className={labelCls}>
            Company <span className="text-muted">(optional)</span>
          </label>
          <input
            id="lead-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Store or business"
            className={fieldCls}
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className={labelCls}>
            Phone <span className="text-muted">(optional)</span>
          </label>
          <input
            id="lead-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(000) 000-0000"
            className={fieldCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="lead-message" className={labelCls}>
          Message <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="lead-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your store, volume, or question."
          className={`${fieldCls} resize-y`}
        />
      </div>

      {state === "error" ? (
        <p className="text-sm text-strawberry" role="alert">
          {msg}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={state === "busy"}
          className="rounded-lg bg-accent px-7 py-3.5 text-sm font-semibold text-accent-contrast transition-opacity duration-base ease-out-brand hover:opacity-90 disabled:opacity-50"
        >
          {state === "busy" ? "Sending…" : "Send inquiry"}
        </button>
        <span className="text-2xs text-muted">21+ only. We reply by email.</span>
      </div>
    </form>
  );
}
