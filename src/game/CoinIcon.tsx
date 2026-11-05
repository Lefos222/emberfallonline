import { useId } from "react";
import goldChestArt from "@/assets/chest-gold.webp";
import gemChestArt from "@/assets/chest-gem.webp";

/**
 * Painted currency marks. The gold coin follows the supplied reference: a milled
 * edge, a raised five-pointed star and warm bronze shadows. The Conquest coin is
 * the gate's cursed token: black iron, a red rune ring and a glowing purple eye.
 * They are drawn as SVG so they stay crisp from the 16px HUD row up to a panel.
 * The chests use the painted coffer art instead of a vector stand-in.
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

/** A chest mark taken straight from the painted coffer art, cropped to its square frame. */
function ChestArt({ art, size, className }: { art: string; size: number; className?: string }) {
  return (
    <img
      src={art}
      alt=""
      aria-hidden
      draggable={false}
      width={size}
      height={size}
      className={`inline-block shrink-0 rounded-[3px] object-cover align-middle ${className}`}
      style={{ width: size, height: size, objectFit: "cover" }}
    />
  );
}

export function GoldChestIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <ChestArt art={goldChestArt} size={size} className={className} />;
}

export function GemChestIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <ChestArt art={gemChestArt} size={size} className={className} />;
}
