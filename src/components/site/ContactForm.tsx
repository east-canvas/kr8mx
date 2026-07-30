"use client";

import { useState } from "react";
import { submitLead } from "@/lib/actions/lead";

const PURPLE = "#6C2FB0";

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
  "Under 100 / mo",
  "100 to 500 / mo",
  "500 to 2,000 / mo",
  "2,000+ / mo",
] as const;

const MAX_BUSINESS = 3;

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
  "w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-primary outline-none transition-colors focus-visible:border-[#6C2FB0]";
const labelCls = "mb-2 block text-2xs uppercase tracking-wide text-muted";

function Choice({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  className: string;
}) {
  return (
    <div className={className}>
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(active ? "" : o)}
            aria-pressed={active}
            style={
              active
                ? { background: PURPLE, borderColor: PURPLE, color: "#fff" }
                : undefined
            }
            className={`w-full rounded-lg border px-3 py-2.5 text-center text-sm transition-all duration-base ease-out-brand ${
              active
                ? "shadow-[0_6px_16px_rgba(108,47,176,0.28)]"
                : "border-hairline text-secondary hover:border-[#6C2FB0]/50 hover:text-primary"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({
  options,
  values,
  onToggle,
  max,
  className,
}: {
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
  max: number;
  className: string;
}) {
  return (
    <div className={className}>
      {options.map((o) => {
        const active = values.includes(o);
        const locked = !active && values.length >= max;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            aria-pressed={active}
            disabled={locked}
            style={
              active
                ? { background: PURPLE, borderColor: PURPLE, color: "#fff" }
                : undefined
            }
            className={`w-full rounded-lg border px-3 py-2.5 text-center text-sm transition-all duration-base ease-out-brand ${
              active
                ? "shadow-[0_6px_16px_rgba(108,47,176,0.28)]"
                : locked
                  ? "cursor-not-allowed border-hairline text-muted opacity-50"
                  : "border-hairline text-secondary hover:border-[#6C2FB0]/50 hover:text-primary"
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
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [volume, setVolume] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [subscribe, setSubscribe] = useState(false);
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
      businessType: showSegments ? businessTypes.join(", ") : "",
      volume: showSegments ? volume : "",
      location,
      message,
      subscribe,
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: PURPLE }}
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
          className="grid grid-cols-3 gap-2.5"
        />
      </div>

      {showSegments ? (
        <>
          <div>
            <span className={labelCls}>
              My business <span className="text-muted">(select up to 3)</span>
            </span>
            <MultiChoice
              options={BUSINESS_TYPES}
              values={businessTypes}
              max={MAX_BUSINESS}
              onToggle={(o) =>
                setBusinessTypes((prev) =>
                  prev.includes(o)
                    ? prev.filter((x) => x !== o)
                    : prev.length >= MAX_BUSINESS
                      ? prev
                      : [...prev, o],
                )
              }
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
            />
          </div>
          <div>
            <span className={labelCls}>Estimated volume</span>
            <Choice
              options={VOLUMES}
              value={volume}
              onChange={setVolume}
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
            />
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
        <div className="sm:col-span-2">
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

      {/* marketing opt-in */}
      <label className="flex cursor-pointer select-none items-start gap-3">
        <input
          type="checkbox"
          checked={subscribe}
          onChange={(e) => setSubscribe(e.target.checked)}
          className="sr-only"
        />
        <span
          aria-hidden
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-white transition-colors"
          style={
            subscribe
              ? { background: PURPLE, borderColor: PURPLE }
              : { borderColor: "var(--color-hairline)" }
          }
        >
          {subscribe ? (
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </span>
        <span className="text-sm text-secondary">
          Send me KR8MX news and product alerts. You can unsubscribe anytime.
        </span>
      </label>

      {state === "error" ? (
        <p className="text-sm text-strawberry" role="alert">
          {msg}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={state === "busy"}
          style={{ background: PURPLE }}
          className="rounded-lg px-7 py-3.5 text-sm font-semibold text-white transition-opacity duration-base ease-out-brand hover:opacity-90 disabled:opacity-50"
        >
          {state === "busy" ? "Sending…" : "Send inquiry"}
        </button>
        <span className="text-2xs text-muted">21+ only. We reply by email.</span>
      </div>
    </form>
  );
}
