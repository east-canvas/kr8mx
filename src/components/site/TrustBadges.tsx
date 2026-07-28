const PURPLE = "#6C2FB0";

/* Trust markers. Descriptive / compliance facts only, no effect claims. */
const BADGES = [
  {
    title: "Lab-Tested",
    sub: "Every lot",
    d: "M9 3v6l-5 8a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8V3M7.5 3h9M8 14h8",
  },
  {
    title: "0 PPM 7-OH",
    sub: "Verified",
    d: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM9 12l2 2 4-4",
  },
  {
    title: "Made in the USA",
    sub: "U.S.-grown kratom",
    d: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18",
  },
  {
    title: "Solvent-Free",
    sub: "No DCM, ever",
    d: "M12 3s6 7 6 11a6 6 0 11-12 0c0-4 6-11 6-11zM9.5 14.5a2.5 2.5 0 002.5 2.5",
  },
  {
    title: "21+ Only",
    sub: "Adult use",
    d: "M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.7l5.4-.8z",
  },
] as const;

export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 ${className}`}
    >
      {BADGES.map((b) => (
        <li
          key={b.title}
          className="flex flex-col items-center gap-2 rounded-xl border border-hairline bg-surface p-4 text-center transition-transform duration-base ease-out-brand hover:-translate-y-0.5"
        >
          <svg
            width={26}
            height={26}
            viewBox="0 0 24 24"
            fill="none"
            stroke={PURPLE}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d={b.d} />
          </svg>
          <span className="text-sm text-primary">{b.title}</span>
          <span className="text-2xs text-muted">{b.sub}</span>
        </li>
      ))}
    </ul>
  );
}
