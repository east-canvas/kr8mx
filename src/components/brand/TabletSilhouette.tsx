import { cn } from "@/lib/cn";

type TabletSilhouetteProps = {
  /** Flavor accent hex used for the abstract gradient wash. */
  accent?: string;
  /** Rendered height in px; width scales to the blister-card ratio. */
  height?: number;
  className?: string;
  /** Unique id suffix so multiple gradients on one page don't collide. */
  idKey?: string;
};

const RATIO = 0.72; // upright blister card

/**
 * Stylized blister-card silhouette built from SVG — no product photography. A
 * soft flavor-accent gradient washes the card; a grid of tablet wells and the
 * slashed-X echo the packaging without depicting a real product.
 */
export function TabletSilhouette({
  accent = "#c6ff00",
  height = 320,
  className,
  idKey = "tab",
}: TabletSilhouetteProps) {
  const width = Math.round(height * RATIO);
  const gid = `tab-grad-${idKey}`;
  const sid = `tab-sheen-${idKey}`;
  // 2 columns x 3 rows of tablet wells
  const cols = [40, 90];
  const rows = [96, 168, 240];
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 130 320"
      fill="none"
      role="presentation"
      aria-hidden="true"
      className={cn("block", className)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
          <stop offset="45%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0b0b0d" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={sid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* card body */}
      <rect x="12" y="16" width="106" height="288" rx="16" fill="#141416" />
      <rect x="12" y="16" width="106" height="288" rx="16" fill={`url(#${gid})`} />
      <rect x="12" y="16" width="106" height="288" rx="16" fill={`url(#${sid})`} />

      {/* header bar with vertical KR8MX accent */}
      <rect x="12" y="16" width="106" height="46" rx="16" fill="#00000026" />
      <rect x="30" y="30" width="70" height="6" rx="3" fill={accent} opacity="0.85" />
      <rect x="30" y="44" width="44" height="5" rx="2.5" fill="#ffffff" opacity="0.28" />

      {/* tablet wells */}
      {rows.map((cy) =>
        cols.map((cx) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="15" fill="#00000033" />
            <circle
              cx={cx}
              cy={cy}
              r="12"
              fill={accent}
              opacity="0.22"
              stroke={accent}
              strokeOpacity="0.5"
            />
          </g>
        )),
      )}

      {/* faint slashed-X accent */}
      <path
        d="M40 288 L88 262"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M44 264 L84 290"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.22"
      />

      {/* thin outline */}
      <rect
        x="12.5"
        y="16.5"
        width="105"
        height="287"
        rx="15.5"
        stroke="#ffffff"
        strokeOpacity="0.1"
      />
    </svg>
  );
}
