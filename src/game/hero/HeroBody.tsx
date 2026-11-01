import type { HeroClass } from '../data';
import { CLOTH, HAIR, INK, METAL, SKIN, type Tier } from './palette';

/**
 * The hero's body: cloak, legs, torso, arms and a face with real features.
 * Everything is drawn in a 300×400 frame with the feet on y≈366, so every
 * class/gender shares one silhouette language while their gear changes on top.
 */

/** Flowing cloak behind the hero — the cloth colour follows the worn chest piece. */
export function Cape({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  const c = CLOTH[cls][tier];
  const m = METAL[tier];
  return (
    <g>
      <path d="M150 126 Q100 130 88 176 Q78 232 66 306 Q94 296 112 306 Q120 250 128 214 L172 214 Q180 250 188 302 Q206 292 232 306 Q218 232 210 178 Q198 132 150 126 Z"
        fill={c.dark} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M150 132 Q112 138 102 180 Q96 226 90 288 Q110 282 120 288 Q124 236 132 206 L150 206 Z"
        fill={c.cloth} opacity="0.85" />
      <path d="M150 132 Q188 138 198 180 Q204 226 210 288 Q190 282 180 288 Q176 236 168 206 L150 206 Z"
        fill={c.light} opacity="0.5" />
      {tier >= 2 && <path d="M96 292 Q112 286 124 292 M176 292 Q190 286 206 292" stroke={m.trim} strokeWidth="2" fill="none" opacity="0.9" />}
    </g>
  );
}

/** Legs and boots, or a robe that hides them (mage). */
export function LowerBody({ cls, gender, tier }: { cls: HeroClass; gender: 'male' | 'female'; tier: Tier }) {
  const c = CLOTH[cls][tier];
  const m = METAL[tier];
  if (cls === 'mage') {
    return (
      <g>
        <path d="M116 208 Q150 216 184 208 L198 336 Q150 356 102 336 Z" fill={c.cloth} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M150 214 L150 348" stroke={c.dark} strokeWidth="2.6" opacity="0.8" />
        <path d="M132 214 L118 340 M168 214 L182 340" stroke={c.dark} strokeWidth="2" opacity="0.55" />
        <path d="M104 316 Q150 334 196 316 L198 336 Q150 356 102 336 Z" fill={m.trim} opacity={tier >= 2 ? 0.85 : 0.4} />
        <path d="M124 350 Q136 344 144 350 L146 364 Q132 368 122 362 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
        <path d="M158 350 Q170 344 178 350 L178 364 Q164 368 156 362 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
      </g>
    );
  }
  return (
    <g>
      <path d="M134 224 L126 298 L120 342" stroke={c.dark} strokeWidth="23" strokeLinecap="round" fill="none" />
      <path d="M168 224 L184 294 L178 338" stroke={c.dark} strokeWidth="25" strokeLinecap="round" fill="none" />
      <path d="M128 240 L124 300" stroke={c.cloth} strokeWidth="7" opacity="0.5" />
      <path d="M170 240 L182 296" stroke={c.cloth} strokeWidth="7" opacity="0.5" />
      <path d="M106 338 Q124 332 136 340 L138 358 Q120 364 104 358 Z" fill={m.dark} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M164 336 Q186 332 200 344 L202 360 Q180 366 162 358 Z" fill={m.base} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M106 344 Q122 340 137 346 M164 342 Q184 338 201 348" stroke={m.trim} strokeWidth="2" fill="none" opacity="0.8" />
      {gender === 'female' && <path d="M170 232 L186 292" stroke={m.trim} strokeWidth="1.6" opacity="0.35" />}
    </g>
  );
}

/** Bare torso the chest piece sits over: skin at the collar, cloth underneath. */
export function Torso({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  const c = CLOTH[cls][tier];
  return (
    <g>
      <path d="M150 118 L198 136 Q206 172 190 216 L110 216 Q94 172 102 136 Z" fill={c.cloth} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M150 120 L150 214" stroke={c.dark} strokeWidth="2" opacity="0.55" />
      <path d="M138 108 L138 126 Q150 134 162 126 L162 108 Z" fill={SKIN.base} />
      <path d="M138 112 Q150 124 162 112" stroke={SKIN.shade} strokeWidth="2" fill="none" />
    </g>
  );
}

/** One arm. `weapon` is the raised arm holding the weapon, `free` hangs ready. */
export function Arm({ cls, tier, which }: { cls: HeroClass; tier: Tier; which: 'weapon' | 'free' }) {
  const c = CLOTH[cls][tier];
  const m = METAL[tier];
  const skin = SKIN.base;
  if (which === 'weapon') {
    return (
      <g>
        <path d="M116 150 L94 180" stroke={c.cloth} strokeWidth="19" strokeLinecap="round" fill="none" />
        <path d="M94 180 L70 140" stroke={c.light} strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M92 174 L76 148" stroke={m.base} strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M92 174 L76 148" stroke={m.dark} strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.35" strokeDasharray="3 7" />
        <circle cx="69" cy="136" r="8.6" fill={skin} stroke={INK} strokeWidth="1.8" />
        <path d="M62 133 Q69 129 76 134" stroke={SKIN.shade} strokeWidth="1.4" fill="none" />
      </g>
    );
  }
  return (
    <g>
      <path d="M186 150 L208 184" stroke={c.cloth} strokeWidth="19" strokeLinecap="round" fill="none" />
      <path d="M208 184 L202 214" stroke={c.light} strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M206 190 L203 210" stroke={m.base} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="201" cy="219" r="8.4" fill={skin} stroke={INK} strokeWidth="1.8" />
      <path d="M194 216 Q201 212 208 217" stroke={SKIN.shade} strokeWidth="1.4" fill="none" />
    </g>
  );
}

/** Head: hair mass behind, face with eyes/brows/nose/mouth, then hair in front. */
export function Head({ cls, gender }: { cls: HeroClass; gender: 'male' | 'female' }) {
  const h = HAIR[cls];
  const female = gender === 'female';
  const lash = female ? 2.4 : 2;
  return (
    <g>
      {/* hair behind the head */}
      {female
        ? <path d="M150 44 Q112 44 108 84 Q104 120 112 148 Q124 152 132 140 Q120 108 124 84 Q132 58 150 56 Q168 58 176 84 Q180 108 168 140 Q176 152 188 148 Q196 120 192 84 Q188 44 150 44 Z" fill={h.dark} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        : <path d="M150 46 Q116 46 112 82 Q112 96 118 104 Q116 80 130 66 Q142 58 150 58 Q158 58 170 66 Q184 80 182 104 Q188 96 188 82 Q184 46 150 46 Z" fill={h.dark} stroke={INK} strokeWidth="2" strokeLinejoin="round" />}

      {/* ears */}
      <ellipse cx="120" cy="90" rx="5" ry="8" fill={SKIN.base} stroke={INK} strokeWidth="1.6" />
      <ellipse cx="180" cy="90" rx="5" ry="8" fill={SKIN.base} stroke={INK} strokeWidth="1.6" />
      {female && <circle cx="180" cy="96" r="2" fill={METAL[2].trim} stroke={INK} strokeWidth="0.8" />}

      {/* face */}
      <path d="M150 50 C171 50 183 66 183 88 C183 106 168 120 150 120 C132 120 117 106 117 88 C117 66 129 50 150 50 Z"
        fill={SKIN.base} stroke={INK} strokeWidth="2.4" />
      <path d="M150 50 C171 50 183 66 183 88 C183 96 180 102 175 108 C176 86 168 66 150 62 Z" fill={SKIN.light} opacity="0.6" />
      <path d="M122 96 Q132 116 150 120 Q168 116 178 96 Q170 114 150 118 Q130 114 122 96 Z" fill={SKIN.shade} opacity="0.4" />
      <ellipse cx="132" cy="101" rx="7" ry="4" fill="#e2745f" opacity={female ? 0.22 : 0.12} />
      <ellipse cx="168" cy="101" rx="7" ry="4" fill="#e2745f" opacity={female ? 0.22 : 0.12} />

      {/* eyes */}
      <g>
        <ellipse cx="138" cy="88" rx={female ? 7.4 : 6.8} ry="5.2" fill="#fdfbf7" stroke={INK} strokeWidth="1.2" />
        <ellipse cx="162" cy="88" rx={female ? 7.4 : 6.8} ry="5.2" fill="#fdfbf7" stroke={INK} strokeWidth="1.2" />
        <circle cx="138" cy="88.6" r="3.3" fill={h.eye} />
        <circle cx="162" cy="88.6" r="3.3" fill={h.eye} />
        <circle cx="138" cy="88.6" r="1.5" fill="#170f14" />
        <circle cx="162" cy="88.6" r="1.5" fill="#170f14" />
        <circle cx="139.4" cy="86.8" r="1.1" fill="#ffffff" opacity="0.95" />
        <circle cx="163.4" cy="86.8" r="1.1" fill="#ffffff" opacity="0.95" />
        <path d="M131 83.6 Q138 80.4 145 83.8" stroke={INK} strokeWidth={lash} fill="none" strokeLinecap="round" />
        <path d="M155 83.8 Q162 80.4 169 83.6" stroke={INK} strokeWidth={lash} fill="none" strokeLinecap="round" />
        {female && <path d="M145 82.4 L147.6 80.8 M131 82.4 L128.6 80.6 M155 82.4 L152.4 80.8 M169 82.4 L171.4 80.6" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />}
      </g>

      {/* brows, nose, mouth */}
      <path d={female ? 'M130 76 Q138 71.5 146 75.5' : 'M129 75.5 Q138 71 147 76'} stroke={h.dark} strokeWidth={female ? 2.2 : 2.8} fill="none" strokeLinecap="round" />
      <path d={female ? 'M154 75.5 Q162 71.5 170 76' : 'M153 76 Q162 71 171 75.5'} stroke={h.dark} strokeWidth={female ? 2.2 : 2.8} fill="none" strokeLinecap="round" />
      <path d="M150.5 88 Q147.5 95 151.5 96" stroke={SKIN.line} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {female
        ? <g><path d="M143 104 Q150 100.5 157 104 Q150 110 143 104 Z" fill="#c4695f" stroke={INK} strokeWidth="1.2" /><path d="M145 105.5 Q150 107.5 155 105.5" stroke="#8f453d" strokeWidth="1" fill="none" /></g>
        : <path d="M143.5 104.5 Q150 108.5 156.5 104.5" stroke="#a2564c" strokeWidth="1.9" fill="none" strokeLinecap="round" />}

      {/* hair in front */}
      <HairFront cls={cls} gender={gender} />
    </g>
  );
}

function HairFront({ cls, gender }: { cls: HeroClass; gender: 'male' | 'female' }) {
  const h = HAIR[cls];
  const female = gender === 'female';
  if (cls === 'warrior') {
    return <g>
      <path d="M150 48 Q124 48 118 74 Q116 86 120 92 Q122 70 136 62 Q146 57 152 57 Q158 57 166 63 Q180 72 181 92 Q186 84 183 72 Q178 48 150 48 Z" fill={h.hair} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M126 66 Q136 54 154 52 Q144 60 138 70 Q132 76 126 66 Z" fill={h.light} opacity="0.55" />
      {female && <path d="M124 68 Q110 86 114 118 Q118 132 126 138 Q120 110 128 82 Z" fill={h.hair} stroke={INK} strokeWidth="1.8" />}
    </g>;
  }
  if (cls === 'mage') {
    return <g>
      <path d="M150 46 Q122 46 116 76 Q114 92 118 100 Q118 72 134 64 Q146 58 152 58 Q160 58 168 64 Q182 72 182 100 Q186 90 184 74 Q178 46 150 46 Z" fill={h.hair} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M150 50 Q134 50 126 66 Q140 56 150 56 Q160 56 174 66 Q166 50 150 50 Z" fill={h.light} opacity="0.7" />
      <path d="M150 54 Q146 74 138 86 M150 54 Q154 74 162 86" stroke={h.dark} strokeWidth="1.6" fill="none" opacity="0.8" />
      {female
        ? <path d="M118 70 Q104 96 110 130 Q114 146 122 150 Q114 118 122 84 Z" fill={h.hair} stroke={INK} strokeWidth="1.8" />
        : <path d="M119 74 Q110 94 114 116 Q116 126 122 130 Q116 104 122 82 Z" fill={h.hair} stroke={INK} strokeWidth="1.8" />}
      <path d="M124 66 Q150 58 176 66" stroke={METAL[2].trim} strokeWidth="2.6" fill="none" opacity="0.9" />
      <circle cx="150" cy="62" r="3" fill={METAL[2].glow} stroke={INK} strokeWidth="1" />
    </g>;
  }
  return <g>
    <path d="M150 46 Q122 46 116 76 Q114 90 120 98 Q120 70 134 62 Q146 56 152 56 Q160 56 170 64 Q182 74 182 98 Q188 88 184 72 Q178 46 150 46 Z" fill={h.hair} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    <path d="M124 66 Q132 54 148 50 Q140 60 136 72 Q130 82 124 66 Z" fill={h.light} opacity="0.6" />
    <path d="M172 62 Q180 72 181 92 Q186 82 182 70 Z" fill={h.dark} opacity="0.7" />
    <path d="M118 74 Q150 64 182 74 L182 80 Q150 70 118 80 Z" fill={CLOTH.archer[0].dark} stroke={INK} strokeWidth="1.6" />
    {female && <path d="M174 58 Q196 66 200 96 Q198 110 190 116 Q196 88 178 72 Z" fill={h.hair} stroke={INK} strokeWidth="1.8" />}
  </g>;
}
