import type { HeroClass } from '../data';
import { CLOTH, INK, METAL, type Tier } from './palette';

/** Armour, robes and jerkins — four looks per class, one per gear band. */
export function Chest({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  if (cls === 'warrior') return <WarriorChest tier={tier} />;
  if (cls === 'mage') return <MageChest tier={tier} />;
  return <ArcherChest tier={tier} />;
}

const plate = 'M150 120 L196 138 Q203 172 189 212 L111 212 Q97 172 104 138 Z';

function Pauldrons({ tier, spike = false }: { tier: Tier; spike?: boolean }) {
  const m = METAL[tier];
  const left = spike
    ? 'M120 140 Q102 130 90 134 L82 128 L92 156 Q104 166 118 168 Z'
    : 'M120 140 Q100 132 90 152 Q96 170 114 170 Q118 156 123 146 Z';
  const right = spike
    ? 'M180 140 Q198 130 210 134 L218 128 L208 156 Q196 166 182 168 Z'
    : 'M180 140 Q200 132 210 152 Q204 170 186 170 Q182 156 177 146 Z';
  return <g>
    <path d={left} fill={m.base} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d={right} fill={m.dark} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M94 150 Q104 140 116 146" stroke={m.light} strokeWidth="2" fill="none" opacity="0.8" />
    <path d="M206 150 Q196 140 184 146" stroke={m.trim} strokeWidth="2" fill="none" opacity="0.8" />
  </g>;
}

function WarriorChest({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const c = CLOTH.warrior[tier];
  if (tier === 0) {
    return <g>
      <path d={plate} fill={m.base} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M150 122 L150 210 L111 210 Q97 172 104 138 Z" fill={m.light} opacity="0.32" />
      <path d="M150 126 V208 M110 178 H190" stroke={m.dark} strokeWidth="2.2" />
      <path d="M110 198 H190 V212 H110 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
      <path d="M110 202 H190" stroke={m.trim} strokeWidth="1.8" opacity="0.9" />
      {[[122, 150], [178, 150], [122, 172], [178, 172]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill={m.light} stroke={INK} strokeWidth="0.8" />)}
      <path d="M138 132 Q150 128 162 132 L160 146 Q150 150 140 146 Z" fill={c.cloth} stroke={INK} strokeWidth="1.8" />
      <Pauldrons tier={tier} />
    </g>;
  }
  if (tier === 1) {
    return <g>
      <path d={plate} fill={m.dark} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${107 + i * 2} ${142 + i * 17} Q150 ${132 + i * 17} ${193 - i * 2} ${142 + i * 17} L${193 - i * 2} ${155 + i * 17} Q150 ${145 + i * 17} ${107 + i * 2} ${155 + i * 17} Z`}
        fill={i % 2 ? m.base : m.light} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" opacity={i % 2 ? 0.95 : 0.8} />)}
      {[0, 1, 2, 3].map((i) => <path key={`t${i}`} d={`M${108 + i * 2} ${155 + i * 17} Q150 ${145 + i * 17} ${192 - i * 2} ${155 + i * 17}`} stroke={m.trim} strokeWidth="1.8" fill="none" />)}
      <circle cx="150" cy="150" r="9" fill={m.glow} opacity="0.35" />
      <circle cx="150" cy="150" r="4.6" fill={m.glow} stroke={INK} strokeWidth="1.4" />
      <path d="M110 198 H190 V212 H110 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
      <Pauldrons tier={tier} spike />
    </g>;
  }
  if (tier === 2) {
    return <g>
      <path d={plate} fill={m.dark} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M150 124 L180 148 L175 198 L150 210 L125 198 L120 148 Z" fill={m.base} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M150 130 L150 206" stroke={m.light} strokeWidth="3" opacity="0.9" />
      <path d="M112 146 L124 152 L120 196 L112 190 Z M188 146 L176 152 L180 196 L188 190 Z" fill={m.light} stroke={INK} strokeWidth="1.8" />
      <circle cx="150" cy="168" r="14" fill="none" stroke={m.trim} strokeWidth="2.2" />
      <path d="M150 156 V180 M142 162 L158 174 M158 162 L142 174" stroke={m.glow} strokeWidth="1.8" />
      <circle cx="150" cy="168" r="18" fill={m.glow} opacity="0.18" />
      <path d="M110 198 H190 V212 H110 Z" fill={m.base} stroke={INK} strokeWidth="2" />
      <Pauldrons tier={tier} spike />
    </g>;
  }
  return <g>
    <path d={plate} fill={m.base} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M150 122 L150 210 L111 210 Q97 172 104 138 Z" fill={m.light} opacity="0.3" />
    <path d="M104 138 Q150 118 196 138 Q192 152 150 148 Q108 152 104 138 Z" fill={m.light} stroke={INK} strokeWidth="2" />
    <path d="M120 152 Q150 144 180 152 L176 176 Q150 168 124 176 Z" fill={m.trim} stroke={INK} strokeWidth="1.8" opacity="0.9" />
    <path d="M136 186 L150 176 L164 186 L150 200 Z" fill={m.glow} stroke={INK} strokeWidth="1.8" />
    <circle cx="150" cy="188" r="16" fill={m.glow} opacity="0.22" />
    <path d="M110 198 H190 V212 H110 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
    <path d="M110 202 H190" stroke={m.light} strokeWidth="1.8" />
    <Pauldrons tier={tier} spike />
  </g>;
}

function MageChest({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const c = CLOTH.mage[tier];
  const mantle = 'M120 132 Q150 120 180 132 Q178 148 150 152 Q122 148 120 132 Z';
  const collar = 'M150 152 L128 130 L138 121 L150 138 L162 121 L172 130 Z';
  return <g>
    <path d="M108 138 Q150 126 192 138 Q196 176 184 212 L116 212 Q104 176 108 138 Z" fill={c.light} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M150 140 Q128 150 126 212 L174 212 Q172 150 150 140 Z" fill={c.cloth} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d={mantle} fill={tier === 0 ? c.cloth : m.base} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" opacity={tier === 0 ? 1 : 0.95} />
    <path d={collar} fill={tier >= 2 ? m.light : c.dark} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    {tier === 0 && <>
      <path d="M112 200 Q150 210 188 200" stroke={m.trim} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M112 200 Q150 210 188 200" stroke={m.dark} strokeWidth="1.4" fill="none" strokeDasharray="4 5" />
    </>}
    {tier === 1 && <>
      <path d="M150 156 V206 M136 168 L150 178 L164 168" stroke={m.trim} strokeWidth="2" fill="none" />
      <circle cx="150" cy="156" r="5" fill={m.glow} stroke={INK} strokeWidth="1.4" />
      <circle cx="150" cy="156" r="10" fill={m.glow} opacity="0.25" />
      <path d="M124 196 Q150 204 176 196" stroke={m.trim} strokeWidth="3" fill="none" opacity="0.8" />
    </>}
    {tier === 2 && <>
      <path d="M124 136 Q150 128 176 136" stroke={m.trim} strokeWidth="2.4" fill="none" />
      <path d="M150 158 V198 M140 168 L150 160 L160 168" stroke={m.trim} strokeWidth="2" fill="none" />
      <circle cx="150" cy="152" r="7" fill="none" stroke={m.glow} strokeWidth="2" />
      <circle cx="150" cy="152" r="13" fill={m.glow} opacity="0.2" />
    </>}
    {tier === 3 && <>
      <path d="M118 134 Q150 124 182 134" stroke={m.light} strokeWidth="2.6" fill="none" />
      <path d="M150 158 L162 172 L150 190 L138 172 Z" fill={m.trim} stroke={INK} strokeWidth="1.8" />
      <circle cx="150" cy="172" r="4" fill={m.glow} />
      <circle cx="150" cy="172" r="18" fill={m.glow} opacity="0.22" />
      <path d="M126 200 Q150 208 174 200" stroke={m.light} strokeWidth="2.4" fill="none" />
      <path d="M120 132 Q110 122 112 108 Q124 116 132 126 Z" fill={m.base} stroke={INK} strokeWidth="1.8" />
      <path d="M180 132 Q190 122 188 108 Q176 116 168 126 Z" fill={m.base} stroke={INK} strokeWidth="1.8" />
    </>}
  </g>;
}

function ArcherChest({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const c = CLOTH.archer[tier];
  const hide = tier === 0 ? '#6d4a2f' : tier === 1 ? '#4b2b20' : tier === 2 ? '#37475f' : '#2f5c42';
  const hideDark = tier === 0 ? '#4a3120' : tier === 1 ? '#301a13' : tier === 2 ? '#222d3f' : '#1c3a2b';
  return <g>
    <path d="M150 120 L192 138 Q198 172 186 212 L114 212 Q102 172 108 138 Z" fill={hide} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M150 124 L150 210 L114 210 Q102 172 108 138 Z" fill={m.light} opacity="0.12" />
    <path d="M116 136 L184 202" stroke={hideDark} strokeWidth="11" strokeLinecap="round" />
    <path d="M116 136 L184 202" stroke={m.trim} strokeWidth="2" strokeDasharray="5 6" opacity="0.9" />
    <path d="M120 132 Q150 118 180 132 L176 144 Q150 132 124 144 Z" fill={c.cloth} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M150 144 Q132 156 130 210 L170 210 Q168 156 150 144 Z" fill={c.dark} stroke={INK} strokeWidth="1.8" />
    {tier === 0 && <>
      {[[122, 158], [178, 158], [122, 184], [178, 184]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill={m.light} stroke={INK} strokeWidth="0.8" />)}
      <path d="M130 168 Q150 176 170 168" stroke={m.trim} strokeWidth="1.6" fill="none" strokeDasharray="3 4" />
    </>}
    {tier === 1 && <>
      <rect x="138" y="152" width="24" height="9" rx="2" fill={m.trim} stroke={INK} strokeWidth="1.4" />
      <path d="M142 156 H158" stroke={m.dark} strokeWidth="2" />
      <path d="M118 130 Q104 142 106 160 Q114 166 122 160 Q118 146 124 136 Z" fill={m.dark} stroke={INK} strokeWidth="1.8" />
      <circle cx="150" cy="182" r="5" fill={m.glow} opacity="0.8" />
      <circle cx="150" cy="182" r="10" fill={m.glow} opacity="0.2" />
    </>}
    {tier === 2 && <>
      {[[124, 156], [176, 156], [124, 182], [176, 182], [150, 196]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill={m.base} stroke={INK} strokeWidth="0.9" />)}
      <path d="M150 148 L158 162 L150 176 L142 162 Z" fill={m.base} stroke={INK} strokeWidth="1.6" />
      <circle cx="150" cy="162" r="14" fill={m.glow} opacity="0.18" />
      <path d="M182 130 Q196 140 194 158 Q186 166 178 158 Q182 144 176 134 Z" fill={m.base} stroke={INK} strokeWidth="1.8" />
    </>}
    {tier === 3 && <>
      <path d="M120 134 Q150 122 180 134" stroke={m.light} strokeWidth="2.4" fill="none" />
      <path d="M150 150 Q170 162 176 184 Q150 198 124 184 Q130 162 150 150 Z" fill="none" stroke={m.trim} strokeWidth="2.2" />
      <path d="M150 158 L156 170 L150 182 L144 170 Z" fill={m.glow} stroke={INK} strokeWidth="1.6" />
      <circle cx="150" cy="170" r="15" fill={m.glow} opacity="0.2" />
      <path d="M120 138 Q110 126 112 112 Q124 124 130 134 Z" fill={m.base} stroke={INK} strokeWidth="1.8" />
      <path d="M180 138 Q190 126 188 112 Q176 124 170 134 Z" fill={m.base} stroke={INK} strokeWidth="1.8" />
    </>}
  </g>;
}

/** The weapon, drawn in local space with the grip at the origin and the head pointing up (-y). */
export function Weapon({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  if (cls === 'warrior') return <WarriorWeapon tier={tier} />;
  if (cls === 'mage') return <MageWeapon tier={tier} />;
  return <ArcherWeapon tier={tier} />;
}

const GRIP = '#3a271c';

function WarriorWeapon({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  if (tier === 0) {
    return <g>
      <path d="M0 -14 V6" stroke={GRIP} strokeWidth="7" strokeLinecap="round" />
      <circle cx="0" cy="10" r="5" fill={m.trim} stroke={INK} strokeWidth="1.6" />
      <path d="M-15 -16 H15" stroke={m.trim} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M-5.5 -18 L-5 -112 L0 -130 L5 -112 L5.5 -18 Z" fill={m.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 -116 V-26" stroke={m.light} strokeWidth="2" opacity="0.85" />
    </g>;
  }
  if (tier === 1) {
    return <g>
      <path d="M0 -14 V8" stroke={GRIP} strokeWidth="7" strokeLinecap="round" />
      <path d="M-19 -18 Q0 -27 19 -18" stroke={m.trim} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M-7 -20 C-11 -58 -9 -96 -3 -118 C0 -130 5 -126 6 -112 C8 -76 6 -42 7 -20 Z" fill={m.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M-7 -22 C-11 -58 -9 -96 -3 -118" stroke={m.glow} strokeWidth="2.4" fill="none" />
      <path d="M0 -34 L0 -104" stroke={m.dark} strokeWidth="2" opacity="0.8" />
      <circle cx="0" cy="12" r="5" fill={m.glow} stroke={INK} strokeWidth="1.6" />
    </g>;
  }
  if (tier === 2) {
    return <g>
      <path d="M0 -14 V8" stroke={GRIP} strokeWidth="6.5" strokeLinecap="round" />
      <path d="M-17 -18 Q0 -12 17 -18 Q8 -22 0 -20 Q-8 -22 -17 -18 Z" fill={m.base} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M-4.5 -22 L-3.5 -122 L0 -138 L3.5 -122 L4.5 -22 Z" fill={m.light} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 -126 V-28" stroke={m.trim} strokeWidth="2" />
      <circle cx="0" cy="12" r="4.6" fill={m.glow} stroke={INK} strokeWidth="1.4" />
      <circle cx="0" cy="12" r="10" fill={m.glow} opacity="0.3" />
    </g>;
  }
  return <g>
    <path d="M0 -16 V10" stroke={GRIP} strokeWidth="8" strokeLinecap="round" />
    <path d="M-26 -18 Q-12 -26 0 -20 Q12 -26 26 -18 Q18 -8 0 -12 Q-18 -8 -26 -18 Z" fill={m.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M-26 -18 L-34 -30 M26 -18 L34 -30" stroke={m.light} strokeWidth="3" strokeLinecap="round" />
    <path d="M-8 -22 L-6 -120 L0 -140 L6 -120 L8 -22 Z" fill={m.light} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M0 -124 V-26" stroke={m.trim} strokeWidth="2.4" />
    <path d="M-6 -60 H6 M-6 -92 H6" stroke={m.base} strokeWidth="2.4" />
    <path d="M0 -120 L0 -26" stroke={m.glow} strokeWidth="1.2" opacity="0.7" />
    <circle cx="0" cy="14" r="6" fill={m.trim} stroke={INK} strokeWidth="1.6" />
    <circle cx="0" cy="14" r="2.6" fill={m.glow} />
    <circle cx="0" cy="-70" r="26" fill={m.glow} opacity="0.14" />
  </g>;
}

function MageWeapon({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  if (tier === 0) {
    return <g>
      <path d="M0 10 C-2 -14 2 -36 0 -56" stroke="#7a5334" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M-3 -20 Q2 -24 3 -18" stroke="#513521" strokeWidth="1.8" fill="none" />
      <circle cx="0" cy="-64" r="6.5" fill={m.glow} stroke={INK} strokeWidth="1.8" />
      <circle cx="0" cy="-64" r="12" fill={m.glow} opacity="0.22" />
    </g>;
  }
  if (tier === 1) {
    return <g>
      <path d="M0 12 V-112" stroke="#53392a" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M-3 -30 H3 M-3 -52 H3 M-3 -74 H3" stroke="#2c1c14" strokeWidth="3" />
      <path d="M-8 -104 Q0 -96 8 -104" stroke={m.trim} strokeWidth="3.5" fill="none" />
      <circle cx="0" cy="-122" r="11" fill={m.base} stroke={INK} strokeWidth="2" />
      <circle cx="0" cy="-122" r="6.5" fill={m.glow} />
      <circle cx="0" cy="-122" r="20" fill={m.glow} opacity="0.28" />
    </g>;
  }
  if (tier === 2) {
    return <g>
      <path d="M0 12 V-110" stroke={m.dark} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M0 12 V-110" stroke={m.light} strokeWidth="2" opacity="0.7" />
      <path d="M-11 -116 Q-2 -132 4 -116" stroke={m.base} strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d="M11 -116 Q2 -132 -4 -116" stroke={m.base} strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <circle cx="0" cy="-124" r="8" fill={m.glow} stroke={INK} strokeWidth="1.8" />
      <circle cx="0" cy="-124" r="16" fill={m.glow} opacity="0.26" />
      <circle cx="0" cy="-6" r="4" fill={m.trim} stroke={INK} strokeWidth="1.2" />
    </g>;
  }
  return <g>
    <path d="M0 14 V-104" stroke={m.base} strokeWidth="6" strokeLinecap="round" />
    <path d="M0 14 V-104" stroke={m.light} strokeWidth="2" opacity="0.8" />
    <path d="M-7 -6 H7 M-7 -40 H7 M-7 -74 H7" stroke={m.trim} strokeWidth="3.4" />
    <path d="M-16 -108 Q-8 -134 0 -114 Q8 -134 16 -108 Q8 -96 0 -104 Q-8 -96 -16 -108 Z" fill={m.base} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M-20 -118 Q-32 -132 -24 -142 Q-12 -136 -10 -122 Z" fill={m.base} stroke={INK} strokeWidth="1.8" />
    <path d="M20 -118 Q32 -132 24 -142 Q12 -136 10 -122 Z" fill={m.base} stroke={INK} strokeWidth="1.8" />
    <path d="M0 -128 L7 -116 L0 -104 L-7 -116 Z" fill={m.glow} stroke={INK} strokeWidth="1.6" />
    <circle cx="0" cy="-116" r="24" fill={m.glow} opacity="0.2" />
  </g>;
}

function ArcherWeapon({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const wood = '#7a5334';
  if (tier === 0) {
    return <g>
      <path d="M0 0 C-14 -22 -18 -50 10 -76" stroke={wood} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M0 0 C-14 22 -18 50 10 76" stroke={wood} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M10 -76 L10 76" stroke="#e8e0cf" strokeWidth="1.4" opacity="0.85" />
      <path d="M-5 -8 Q0 -5 5 0 Q0 5 -5 8 Z" fill="#4a3120" stroke={INK} strokeWidth="1.4" />
    </g>;
  }
  if (tier === 1) {
    return <g>
      <path d="M0 0 C-16 -20 -22 -50 6 -78 Q-6 -66 -4 -56" stroke={wood} strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M0 0 C-16 20 -22 50 6 78 Q-6 66 -4 56" stroke={wood} strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M6 -78 L6 78" stroke="#f0e6d2" strokeWidth="1.5" opacity="0.9" />
      <path d="M2 -74 Q10 -70 8 -62 M2 74 Q10 70 8 62" fill="none" stroke={m.trim} strokeWidth="3" strokeLinecap="round" />
      <path d="M-6 -10 Q0 -6 6 0 Q0 6 -6 10 Z" fill="#4a2b20" stroke={INK} strokeWidth="1.4" />
      <circle cx="0" cy="0" r="2.4" fill={m.glow} />
    </g>;
  }
  if (tier === 2) {
    return <g>
      <path d="M0 0 C-18 -22 -26 -52 4 -80 Q-8 -68 -6 -56" stroke={m.base} strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M0 0 C-18 22 -26 52 4 80 Q-8 68 -6 56" stroke={m.base} strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M0 0 C-18 -22 -26 -52 4 -80" stroke={m.light} strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M4 -80 L4 80" stroke={m.glow} strokeWidth="1.8" opacity="0.95" />
      <path d="M-9 -12 Q0 -6 9 0 Q0 6 -9 12 Z" fill={m.dark} stroke={INK} strokeWidth="1.4" />
      <path d="M4 0 L34 0" stroke="#8a6a3f" strokeWidth="2.4" />
      <path d="M34 0 L28 -4 M34 0 L28 4" stroke="#d9cfa8" strokeWidth="2" />
      <circle cx="4" cy="-80" r="9" fill={m.glow} opacity="0.2" />
    </g>;
  }
  return <g>
    <path d="M0 0 C-20 -24 -30 -58 2 -92 Q-12 -78 -10 -62" stroke={m.base} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M0 0 C-20 24 -30 58 2 92 Q-12 78 -10 62" stroke={m.base} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M0 0 C-20 -24 -30 -58 2 -92" stroke={m.light} strokeWidth="2.2" fill="none" opacity="0.85" />
    <path d="M2 -92 L2 92" stroke={m.glow} strokeWidth="2" />
    <path d="M-3 -66 Q4 -60 3 -50 M-3 66 Q4 60 3 50" fill="none" stroke={m.trim} strokeWidth="2.6" strokeLinecap="round" />
    <path d="M-12 -14 Q0 -7 12 0 Q0 7 -12 14 Z" fill={m.dark} stroke={INK} strokeWidth="1.6" />
    <path d="M0 -6 L0 6" stroke={m.glow} strokeWidth="2" />
    <circle cx="0" cy="0" r="3.4" fill={m.glow} />
    <circle cx="0" cy="0" r="22" fill={m.glow} opacity="0.16" />
  </g>;
}
