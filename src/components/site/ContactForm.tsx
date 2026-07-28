"use client";

import { useState } from "react";
import { submitLead } from "@/lib/actions/lead";

const TYPES = [
  { value: "wholesale", label: "Wholesale" },
  { value: "retail", label: "Retail" },
  { value: "general", label: "General" },
] as const;

const BUSINESS_TYPES = [
  "Distributor",
  "Retail store",
  "Smoke / Vape shop",
  "Online store",
  "Other",
] as const;

const VOLUMES = [
  "Just exploring",
  "Under 100 / mo",
  "100 to 500 / mo",
  "500 to 2,000 / mo",
  "2,000+ / mo",
] as const;

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const fieldCls =
  "w-full rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-primary outline-none transition-colors focus-visible:border-accent";
const labelCls = "mb-2 block text-2xs uppercase tracking-wide text-muted";

function Choice({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(active ? "" : o)}
            aria-pressed={active}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors duration-base ease-out-brand ${
              active
                ? "border-accent bg-accent text-accent-contrast"
                : "border-hairline text-secondary hover:text-primary"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function ContactForm() {
  const [type, setType] = useState("wholesale");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [volume, setVolume] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const showSegments = type === "wholesale" || type === "retail";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await submitLead({
      type,
      name,
      email,
      company,
      phone,
      businessType: showSegments ? businessType : "",
      volume: showSegments ? volume : "",
      location,
      message,
    });
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
          <p className="text-base text-primary">Thank you, we have your details.</p>
          <p className="mt-1 text-sm text-secondary">
            Someone from our team will reach out within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-7" aria-label="Contact">
      <div>
        <span className={labelCls}>I am reaching out about</span>
        <Choice
          options={TYPES.map((t) => t.label)}
          value={TYPES.find((t) => t.value === type)?.label ?? ""}
          onChange={(label) =>
            setType(TYPES.find((t) => t.label === label)?.value ?? "general")
          }
        />
      </div>

      {showSegments ? (
        <>
          <div>
            <span className={labelCls}>My business</span>
            <Choice
              options={BUSINESS_TYPES}
              value={businessType}
              onChange={setBusinessType}
            />
          </div>
          <div>
            <span className={labelCls}>Estimated volume</span>
            <Choice options={VOLUMES} value={volume} onChange={setVolume} />
          </div>
        </>
      ) : null}

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
        <label htmlFor="lead-location" className={labelCls}>
          Location <span className="text-muted">(optional)</span>
        </label>
        <select
          id="lead-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`${fieldCls} appearance-none`}
        >
          <option value="">Select a state</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="lead-message" className={labelCls}>
          Anything else <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="lead-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add any details here."
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
