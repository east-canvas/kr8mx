import { cn } from "@/lib/cn";

type CanSilhouetteProps = {
  /** Flavor accent hex used for the abstract gradient wash. */
  accent?: string;
  /** Rendered height in px; width scales to the slim-can ratio. */
  height?: number;
  className?: string;
  /** Unique id suffix so multiple gradients on one page don't collide. */
  idKey?: string;
};

const RATIO = 0.4; // slim 355ml can

/**
 * Stylized slim-can silhouette built from SVG — no product photography. A soft
 * flavor-accent gradient washes the body; a faint slashed-X and the vertical
 * KR8MX bar echo the packaging without depicting a real can.
 */
export function CanSilhouette({
  accent = "#c6ff00",
  height = 320,
  className,
  idKey = "can",
}: CanSilhouetteProps) {
  const width = Math.round(height * RATIO);
  const gid = `can-grad-${idKey}`;
  const sid = `can-sheen-${idKey}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 128 320"
      fill="none"
      role="presentation"
      aria-hidden="true"
      className={cn("block", className)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="45%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0b0b0d" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={sid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* can body */}
      <rect x="10" y="20" width="108" height="284" rx="20" fill="#141416" />
      <rect x="10" y="20" width="108" height="284" rx="20" fill={`url(#${gid})`} />
      <rect
        x="10"
        y="20"
        width="108"
        height="284"
        rx="20"
        fill={`url(#${sid})`}
      />
      {/* lid + neck */}
      <rect x="26" y="8" width="76" height="14" rx="5" fill="#232326" />
      <rect x="10" y="20" width="108" height="10" fill="#0000001a" />

      {/* vertical KR8MX bar */}
      <rect x="60" y="60" width="8" height="150" rx="4" fill={accent} opacity="0.85" />
      {/* faint slashed-X accent */}
      <path
        d="M40 250 L88 210"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M44 214 L84 246"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.25"
      />

      {/* thin outline */}
      <rect
        x="10.5"
        y="20.5"
        width="107"
        height="283"
        rx="19.5"
        stroke="#ffffff"
        strokeOpacity="0.1"
      />
    </svg>
  );
}
