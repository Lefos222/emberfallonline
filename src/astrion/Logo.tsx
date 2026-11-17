export function AstrionLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="astr-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--astr-glow)" />
          <stop offset="1" stopColor="var(--astr-primary)" />
        </linearGradient>
      </defs>
      <path d="M32 4 L58 58 H44 L32 32 L20 58 H6 Z" fill="url(#astr-g)" />
      <path d="M32 14 L35 24 L45 27 L35 30 L32 40 L29 30 L19 27 L29 24 Z" fill="var(--astr-star)" />
    </svg>
  );
}
