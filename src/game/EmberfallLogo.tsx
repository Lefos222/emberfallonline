/**
 * The game's wordmark: weathered stone lettering with a greatsword run through it, the
 * loading screen's centrepiece. Pure SVG, so it needs no art asset and scales cleanly.
 */
export function EmberfallLogo({ width = 480 }: { width?: number }) {
  return (
    <svg
      viewBox="0 0 640 200"
      width={width}
      role="img"
      aria-label="EmberFall Online"
      className="ef-logo"
    >
      <defs>
        <linearGradient id="ef-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.42" stopColor="#e8e2d8" />
          <stop offset="0.52" stopColor="#9d958b" />
          <stop offset="0.62" stopColor="#d6cec2" />
          <stop offset="1" stopColor="#a8a096" />
        </linearGradient>
        <linearGradient id="ef-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f9fc" />
          <stop offset="0.35" stopColor="#a3acb6" />
          <stop offset="0.55" stopColor="#4c535b" />
          <stop offset="1" stopColor="#cdd6de" />
        </linearGradient>
        <linearGradient id="ef-hilt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e9399" />
          <stop offset="0.5" stopColor="#3a3e43" />
          <stop offset="1" stopColor="#6c7177" />
        </linearGradient>
        <radialGradient id="ef-glow">
          <stop offset="0" stopColor="#eafcff" stopOpacity="1" />
          <stop offset="0.35" stopColor="#63b4ff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#2b5cff" stopOpacity="0" />
        </radialGradient>
        <filter id="ef-soft">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* The greatsword, drawn behind the lettering. */}
      <g aria-hidden="true">
        <circle cx="66" cy="92" r="40" fill="url(#ef-glow)" filter="url(#ef-soft)" />
        <circle cx="66" cy="92" r="9" fill="#eafcff" />
        <path d="M74 88 L104 92 L74 96 Z" fill="url(#ef-hilt)" />
        <rect
          x="102"
          y="84"
          width="22"
          height="16"
          rx="3"
          fill="url(#ef-hilt)"
          stroke="#20242a"
          strokeWidth="1.5"
        />
        <path
          d="M122 64 L136 64 L132 90 L136 116 L122 116 L126 90 Z"
          fill="url(#ef-hilt)"
          stroke="#20242a"
          strokeWidth="1.5"
        />
        <path
          d="M132 84 L566 88 L578 90 L566 92 L132 96 Z"
          fill="url(#ef-steel)"
          stroke="#20242a"
          strokeWidth="1.5"
        />
        <path d="M140 87 L560 89.5 L560 90.5 L140 93 Z" fill="#ffffff" opacity="0.55" />
      </g>

      <text
        x="320"
        y="120"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontSize="72"
        letterSpacing="5"
        fill="url(#ef-stone)"
        stroke="#241f1b"
        strokeWidth="3.5"
        paintOrder="stroke"
      >
        EMBERFALL
      </text>
      <text
        x="320"
        y="166"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontSize="24"
        letterSpacing="13"
        fill="#ded4c6"
        stroke="#241f1b"
        strokeWidth="2"
        paintOrder="stroke"
      >
        ONLINE
      </text>
    </svg>
  );
}
