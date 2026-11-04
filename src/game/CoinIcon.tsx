import { useId } from "react";

/**
 * Painted currency marks. The gold coin follows the supplied reference: a milled
 * edge, a raised five-pointed star and warm bronze shadows. The Conquest coin is
 * the gate's cursed token: black iron, a red rune ring and a glowing purple eye.
 * They are drawn as SVG so they stay crisp from the 16px HUD row up to a panel.
 */

const clean = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

export function GoldCoin({ size = 18, className = "" }: { size?: number; className?: string }) {
  const raw = useId();
  const uid = `gold${clean(raw)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-face`} cx="36%" cy="28%" r="76%">
          <stop offset="0%" stopColor="#fff8c9" />
          <stop offset="34%" stopColor="#f3ce62" />
          <stop offset="72%" stopColor="#c1913a" />
          <stop offset="100%" stopColor="#8a6324" />
        </radialGradient>
        <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#ffe9a0" />
          <stop offset="48%" stopColor="#c9973c" />
          <stop offset="100%" stopColor="#6d4a17" />
        </linearGradient>
        <linearGradient id={`${uid}-star`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fffbd8" />
          <stop offset="60%" stopColor="#f4d476" />
          <stop offset="100%" stopColor="#c39435" />
        </linearGradient>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="22"
        fill={`url(#${uid}-edge)`}
        stroke="#553a10"
        strokeWidth="1.2"
      />
      <circle
        cx="24"
        cy="24"
        r="19.6"
        fill="none"
        stroke="#7a5a1e"
        strokeWidth="2.6"
        strokeDasharray="1.2 2.3"
        opacity="0.85"
      />
      <circle
        cx="24"
        cy="24"
        r="17"
        fill={`url(#${uid}-face)`}
        stroke="#fbeaae"
        strokeWidth="1.1"
      />
      <circle
        cx="24"
        cy="24"
        r="14.1"
        fill="none"
        stroke="#8d6425"
        strokeWidth="0.8"
        opacity="0.65"
      />
      <path
        d="M24 12.4l3.15 7.3 7.85.72-5.95 5.2 1.8 7.78L24 29.45l-6.85 3.95 1.8-7.78-5.95-5.2 7.85-.72z"
        fill={`url(#${uid}-star)`}
        stroke="#a67c33"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <ellipse
        cx="16.8"
        cy="14.6"
        rx="7.2"
        ry="3.8"
        fill="#fff8c9"
        opacity="0.28"
        transform="rotate(-30 16.8 14.6)"
      />
    </svg>
  );
}

export function ConquestCoin({ size = 18, className = "" }: { size?: number; className?: string }) {
  const raw = useId();
  const uid = `conq${clean(raw)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-body`} cx="34%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#5b5964" />
          <stop offset="42%" stopColor="#33323a" />
          <stop offset="100%" stopColor="#121216" />
        </radialGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a75cff" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#5e2b8f" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5e2b8f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#8e7a50" />
          <stop offset="50%" stopColor="#51483a" />
          <stop offset="100%" stopColor="#241f19" />
        </linearGradient>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="22"
        fill={`url(#${uid}-body)`}
        stroke="#0b0b0e"
        strokeWidth="1.2"
      />
      <circle
        cx="24"
        cy="24"
        r="19.8"
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeWidth="2.4"
        strokeDasharray="1.4 2.4"
      />
      <circle cx="24" cy="24" r="16.8" fill="#1a1a1c" stroke="#8e7a50" strokeWidth="1.2" />
      <circle
        cx="24"
        cy="24"
        r="12.8"
        fill="none"
        stroke="#e03d3d"
        strokeWidth="1.7"
        strokeDasharray="1.8 3"
        opacity="0.92"
      />
      <circle cx="24" cy="24" r="11" fill={`url(#${uid}-glow)`} />
      <path
        d="M24 15.2c5 0 8.4 3.9 9.8 8.8-1.4 4.9-4.8 8.8-9.8 8.8s-8.4-3.9-9.8-8.8c1.4-4.9 4.8-8.8 9.8-8.8z"
        fill="#2c1446"
        stroke="#9a5ce0"
        strokeWidth="1.1"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="2.3"
        ry="6.2"
        fill="#08050d"
        stroke="#d5b6ff"
        strokeWidth="0.8"
      />
      <circle cx="20.6" cy="21.2" r="1.35" fill="#f0dcff" opacity="0.9" />
      <g stroke="#c5a566" strokeWidth="1.1" strokeLinecap="round">
        <path d="M24 3.4v2.6" />
        <path d="M24 42v2.6" />
        <path d="M3.4 24h2.6" />
        <path d="M42 24h2.6" />
      </g>
    </svg>
  );
}

export function GoldChestIcon({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const raw = useId();
  const uid = `chest${clean(raw)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a56e2c" />
          <stop offset="55%" stopColor="#74481a" />
          <stop offset="100%" stopColor="#4a2c0f" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6c4218" />
          <stop offset="100%" stopColor="#3a220c" />
        </linearGradient>
        <linearGradient id={`${uid}-trim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe9a0" />
          <stop offset="50%" stopColor="#d3a13f" />
          <stop offset="100%" stopColor="#8a5f1c" />
        </linearGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#ffd97a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffd97a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="26" r="22" fill={`url(#${uid}-halo)`} />
      <rect
        x="8"
        y="20"
        width="32"
        height="21"
        rx="3"
        fill={`url(#${uid}-body)`}
        stroke="#2a1808"
      />
      <path
        d="M8 14.5c0-3 2.4-5.5 5.5-5.5h21c3.1 0 5.5 2.5 5.5 5.5V21H8z"
        fill={`url(#${uid}-lid)`}
        stroke="#2a1808"
      />
      <rect x="8" y="20" width="32" height="2.6" fill={`url(#${uid}-trim)`} />
      <rect x="13.5" y="21" width="3.2" height="20" fill={`url(#${uid}-trim)`} opacity="0.9" />
      <rect x="31.3" y="21" width="3.2" height="20" fill={`url(#${uid}-trim)`} opacity="0.9" />
      <rect
        x="20.4"
        y="15"
        width="7.2"
        height="14"
        rx="1.4"
        fill={`url(#${uid}-trim)`}
        stroke="#7a5316"
        strokeWidth="0.8"
      />
      <path
        d="M24 18.2l1.55 3.3 3.55.35-2.7 2.4.86 3.55L24 26.1l-3.26 1.7.86-3.55-2.7-2.4 3.55-.35z"
        fill="#5a3d10"
      />
      <rect
        x="21.8"
        y="29"
        width="4.4"
        height="3.6"
        rx="0.8"
        fill="#e5bd5b"
        stroke="#7a5316"
        strokeWidth="0.7"
      />
    </svg>
  );
}

export function GemChestIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  const raw = useId();
  const uid = `gchest${clean(raw)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d3548" />
          <stop offset="100%" stopColor="#211b2a" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2234" />
          <stop offset="100%" stopColor="#141019" />
        </linearGradient>
        <linearGradient id={`${uid}-trim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c5a566" />
          <stop offset="55%" stopColor="#8e7a50" />
          <stop offset="100%" stopColor="#4c3f28" />
        </linearGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a75cff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5e2b8f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="25" r="21" fill={`url(#${uid}-halo)`} />
      <rect
        x="8"
        y="20"
        width="32"
        height="21"
        rx="3"
        fill={`url(#${uid}-body)`}
        stroke="#090710"
      />
      <path
        d="M8 14.5c0-3 2.4-5.5 5.5-5.5h21c3.1 0 5.5 2.5 5.5 5.5V21H8z"
        fill={`url(#${uid}-lid)`}
        stroke="#090710"
      />
      <rect x="8" y="20" width="32" height="2.6" fill={`url(#${uid}-trim)`} />
      <rect x="13.5" y="21" width="3.2" height="20" fill={`url(#${uid}-trim)`} opacity="0.85" />
      <rect x="31.3" y="21" width="3.2" height="20" fill={`url(#${uid}-trim)`} opacity="0.85" />
      <rect
        x="20.6"
        y="14.6"
        width="6.8"
        height="14"
        rx="1.4"
        fill="#1b1524"
        stroke="#8e7a50"
        strokeWidth="0.9"
      />
      <path
        d="M24 16.3l2.9 3.4-1 4.1h-3.8l-1-4.1z"
        fill="#a75cff"
        stroke="#e2c8ff"
        strokeWidth="0.7"
      />
      <circle cx="24" cy="26.2" r="1.1" fill="#f0dcff" opacity="0.9" />
    </svg>
  );
}
