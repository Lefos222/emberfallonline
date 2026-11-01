import type { HeroClass } from "../data";
import { CLOTH, HAIR, INK, METAL, SKIN, type Tier } from "./palette";
import { bow, path, POSE, type Pt } from "./rig";

/**
 * The hero's body: cloak, legs, torso, arms and a face with real features.
 * Everything is drawn in a 300×400 frame with the feet on y≈362, so every
 * class/gender shares one silhouette language while their gear changes on top.
 */

const HEAD = { x: 152, y: 84 };

/** A tapered limb: ink outline, fill, then a highlight along the light side. */
function Limb({
  a,
  b,
  w,
  bend = 0,
  fill,
  shade,
  light,
}: {
  a: Pt;
  b: Pt;
  w: number;
  bend?: number;
  fill: string;
  shade: string;
  light?: string;
}) {
  const c = bow(a, b, bend);
  const d = path(a, c, b);
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={w + 3.4} fill="none" strokeLinecap="round" />
      <path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path
        d={path(a, bow(a, b, bend * 1.1), b)}
        stroke={shade}
        strokeWidth={w * 0.42}
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
        transform="translate(1.5 1.5)"
      />
      {light && (
        <path
          d={d}
          stroke={light}
          strokeWidth={w * 0.16}
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
          transform="translate(-2.4 0)"
        />
      )}
    </>
  );
}

/** Flowing cloak behind the hero — the cloth colour follows the worn chest piece. */
export function Cape({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  const c = CLOTH[cls][tier];
  const m = METAL[tier];
  return (
    <g>
      <path
        d="M152 124 Q108 126 94 168 Q81 220 72 312 Q96 298 118 310 Q126 250 134 210 L172 210 Q181 250 192 302 Q212 290 232 308 Q219 214 208 170 Q196 128 152 124 Z"
        fill={c.dark}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M152 132 Q114 138 104 178 Q96 226 88 296 Q108 288 120 296 Q126 242 134 208 L152 208 Z"
        fill={c.cloth}
        opacity="0.9"
      />
      <path
        d="M152 132 Q190 138 200 178 Q208 226 216 294 Q196 286 184 296 Q178 242 170 208 L152 208 Z"
        fill={c.light}
        opacity="0.45"
      />
      <path
        d="M96 300 Q112 292 124 300 M180 296 Q196 288 210 296"
        stroke={m.trim}
        strokeWidth="2.2"
        fill="none"
        opacity="0.85"
      />
      {tier >= 2 && (
        <path
          d="M92 226 Q150 246 214 222"
          stroke={m.trim}
          strokeWidth="1.8"
          fill="none"
          opacity="0.55"
        />
      )}
    </g>
  );
}

function Boot({
  at,
  len,
  m,
  back,
}: {
  at: Pt;
  len: number;
  m: (typeof METAL)[Tier];
  back?: boolean;
}) {
  const { x, y } = at;
  return (
    <g>
      <path
        d={`M${x - 13} ${y - 8} L${x + 5} ${y - 10} Q${x + len} ${y - 6} ${x + len + 3} ${y + 7} Q${x + len - 2} ${y + 15} ${x - 13} ${y + 13} Z`}
        fill={back ? m.dark : m.base}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d={`M${x - 12} ${y + 5} Q${x + 4} ${y + 8} ${x + len + 1} ${y + 6}`}
        stroke={m.trim}
        strokeWidth="2.2"
        fill="none"
        opacity="0.9"
      />
      <path
        d={`M${x - 6} ${y - 5} L${x + 2} ${y + 8}`}
        stroke={m.dark}
        strokeWidth="1.6"
        opacity="0.7"
      />
    </g>
  );
}

/** Legs and boots, or a robe that hides them (mage). */
export function LowerBody({
  cls,
  gender,
  tier,
}: {
  cls: HeroClass;
  gender: "male" | "female";
  tier: Tier;
}) {
  const c = CLOTH[cls][tier];
  const m = METAL[tier];
  const p = POSE[cls];
  if (cls === "mage") {
    return (
      <g>
        <path
          d="M150 200 Q186 204 196 220 Q212 286 214 340 Q186 358 150 358 Q114 358 86 340 Q88 286 104 220 Q114 204 150 200 Z"
          fill={c.cloth}
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M150 206 Q124 214 118 250 L108 330 Q130 340 150 340 Z"
          fill={c.light}
          opacity="0.4"
        />
        <path
          d="M150 206 Q176 214 182 250 L192 330 Q170 340 150 340 Z"
          fill={c.dark}
          opacity="0.45"
        />
        <path d="M150 208 L150 350" stroke={c.dark} strokeWidth="2.6" opacity="0.75" />
        <path
          d="M128 214 Q116 282 112 336 M172 214 Q184 282 188 336"
          stroke={c.dark}
          strokeWidth="2"
          opacity="0.45"
          fill="none"
        />
        <path
          d="M88 330 Q150 350 212 328 L214 340 Q186 358 150 358 Q114 358 86 340 Z"
          fill={m.trim}
          opacity={tier >= 2 ? 0.9 : 0.5}
        />
        <path
          d="M96 340 Q150 358 206 338"
          stroke={m.glow}
          strokeWidth="1.6"
          fill="none"
          opacity={tier >= 1 ? 0.7 : 0.3}
        />
        <Boot at={p.ankleB} len={18} m={m} back />
        <Boot at={p.ankleF} len={20} m={m} />
      </g>
    );
  }
  return (
    <g>
      <Limb a={p.hipB} b={p.kneeB} w={26} bend={4} fill={c.dark} shade={c.cloth} />
      <Limb a={p.kneeB} b={p.ankleB} w={21} bend={3} fill={c.dark} shade={c.cloth} />
      <Limb a={p.hipF} b={p.kneeF} w={27} bend={-5} fill={c.cloth} shade={c.dark} light={c.light} />
      <Limb
        a={p.kneeF}
        b={p.ankleF}
        w={22}
        bend={-4}
        fill={c.cloth}
        shade={c.dark}
        light={c.light}
      />
      {/* knee guards */}
      <ellipse
        cx={p.kneeF.x}
        cy={p.kneeF.y}
        rx="11"
        ry="9"
        fill={m.base}
        stroke={INK}
        strokeWidth="2"
        transform={`rotate(-8 ${p.kneeF.x} ${p.kneeF.y})`}
      />
      <ellipse
        cx={p.kneeB.x}
        cy={p.kneeB.y}
        rx="10"
        ry="8"
        fill={m.dark}
        stroke={INK}
        strokeWidth="2"
        transform={`rotate(6 ${p.kneeB.x} ${p.kneeB.y})`}
      />
      <Boot at={p.ankleB} len={18} m={m} back />
      <Boot at={p.ankleF} len={22} m={m} />
      {gender === "female" && (
        <path
          d={`M${p.hipF.x} ${p.hipF.y + 6} L${p.kneeF.x + 4} ${p.kneeF.y - 6}`}
          stroke={m.trim}
          strokeWidth="1.6"
          opacity="0.3"
        />
      )}
    </g>
  );
}

/** Bare torso the chest piece sits over: skin at the collar, cloth underneath. */
export function Torso({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  const c = CLOTH[cls][tier];
  return (
    <g>
      <path d="M138 104 L138 132 Q152 142 166 132 L166 104 Q152 112 138 104 Z" fill={SKIN.base} />
      <path
        d="M138 108 Q152 122 166 108"
        stroke={SKIN.shade}
        strokeWidth="2.2"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M152 122 L188 148 Q198 180 190 214 L114 214 Q106 180 116 148 Z"
        fill={c.cloth}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M152 124 L152 212" stroke={c.dark} strokeWidth="2" opacity="0.5" />
      <path
        d="M118 150 Q126 172 122 212"
        stroke={c.dark}
        strokeWidth="2"
        opacity="0.35"
        fill="none"
      />
    </g>
  );
}

/** One arm, from shoulder to hand, ending in a fist or an open casting palm. */
export function Arm({
  cls,
  tier,
  which,
}: {
  cls: HeroClass;
  tier: Tier;
  which: "weapon" | "free";
}) {
  const c = CLOTH[cls][tier];
  const m = METAL[tier];
  const p = POSE[cls];
  const shoulder = which === "weapon" ? p.weaponShoulder : p.freeShoulder;
  const elbow = which === "weapon" ? p.weaponElbow : p.freeElbow;
  const hand = which === "weapon" ? p.weaponHand : p.freeHand;
  const dir = Math.atan2(hand.y - elbow.y, hand.x - elbow.x) * (180 / Math.PI);
  const open = which === "free" && cls === "mage";
  return (
    <g>
      <Limb
        a={shoulder}
        b={elbow}
        w={19}
        bend={which === "weapon" ? -5 : 5}
        fill={c.cloth}
        shade={c.dark}
        light={c.light}
      />
      <Limb
        a={elbow}
        b={hand}
        w={15.5}
        bend={which === "weapon" ? 3 : -4}
        fill={m.base}
        shade={m.dark}
        light={m.light}
      />
      {/* bracer cuff */}
      <ellipse
        cx={elbow.x}
        cy={elbow.y}
        rx="9"
        ry="8"
        fill={m.trim}
        stroke={INK}
        strokeWidth="1.8"
        transform={`rotate(${dir} ${elbow.x} ${elbow.y})`}
      />
      <g transform={`rotate(${dir} ${hand.x} ${hand.y})`}>
        <ellipse
          cx={hand.x}
          cy={hand.y}
          rx={open ? 7.4 : 7.8}
          ry="8.4"
          fill={SKIN.base}
          stroke={INK}
          strokeWidth="1.8"
        />
        <path
          d={`M${hand.x - 4} ${hand.y - 1} Q${hand.x} ${hand.y + 2.5} ${hand.x + 4} ${hand.y - 1}`}
          stroke={SKIN.shade}
          strokeWidth="1.4"
          fill="none"
        />
        {open && (
          <path
            d={`M${hand.x - 2} ${hand.y - 7} L${hand.x - 3} ${hand.y - 12} M${hand.x + 1.5} ${hand.y - 7.5} L${hand.x + 2} ${hand.y - 13}`}
            stroke={SKIN.base}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )}
      </g>
    </g>
  );
}

/** Head: hair mass behind, face with eyes/brows/nose/mouth, then hair in front. */
export function Head({ cls, gender }: { cls: HeroClass; gender: "male" | "female" }) {
  const h = HAIR[cls][gender];
  const female = gender === "female";
  const { x: cx, y: cy } = HEAD;
  const eyeL = cx - 13;
  const eyeR = cx + 14;
  const eyeY = cy + 3;
  const rx = female ? 10.2 : 9.4;
  return (
    <g>
      <HairBack cls={cls} gender={gender} />

      {/* ears */}
      <ellipse
        cx={cx - 36}
        cy={cy + 4}
        rx="5.4"
        ry="8.4"
        fill={SKIN.base}
        stroke={INK}
        strokeWidth="1.6"
      />
      <ellipse
        cx={cx + 36}
        cy={cy + 4}
        rx="5.4"
        ry="8.4"
        fill={SKIN.base}
        stroke={INK}
        strokeWidth="1.6"
      />
      {female && (
        <circle
          cx={cx + 36}
          cy={cy + 10}
          r="2.1"
          fill={METAL[2].trim}
          stroke={INK}
          strokeWidth="0.8"
        />
      )}

      {/* face */}
      <path
        d="M152 46 C177 46 189 62 189 85 C189 102 183 114 169 122 C161 127 155 130 152 131 C149 130 143 127 135 122 C121 114 115 102 115 85 C115 62 127 46 152 46 Z"
        fill={SKIN.base}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* lit side + jaw shading */}
      <path
        d="M152 46 C177 46 189 62 189 85 C189 96 186 105 180 112 C180 88 172 66 152 60 Z"
        fill={SKIN.light}
        opacity="0.55"
      />
      <path
        d="M117 96 Q126 118 152 129 Q178 118 187 96 Q181 116 152 125 Q123 116 117 96 Z"
        fill={SKIN.shade}
        opacity="0.35"
      />
      <path d="M117 86 Q113 66 126 54 Q118 72 121 90 Z" fill={SKIN.shade} opacity="0.3" />

      {/* cheeks */}
      <ellipse
        cx={cx - 21}
        cy={eyeY + 16}
        rx="8.5"
        ry="4.4"
        fill={SKIN.blush}
        opacity={female ? 0.3 : 0.16}
      />
      <ellipse
        cx={cx + 21}
        cy={eyeY + 16}
        rx="8.5"
        ry="4.4"
        fill={SKIN.blush}
        opacity={female ? 0.3 : 0.16}
      />

      {/* eyes: lid shadow, sclera, iris, pupil, catchlights */}
      <path
        d={`M${eyeL - rx} ${eyeY + 1} Q${eyeL} ${eyeY - 10.5} ${eyeL + rx} ${eyeY} Q${eyeL} ${eyeY + 9} ${eyeL - rx} ${eyeY + 1} Z`}
        fill="#fdfaf5"
        stroke={INK}
        strokeWidth="1.3"
      />
      <path
        d={`M${eyeR - rx - 1} ${eyeY} Q${eyeR} ${eyeY - 10.5} ${eyeR + rx} ${eyeY + 1} Q${eyeR} ${eyeY + 9} ${eyeR - rx - 1} ${eyeY} Z`}
        fill="#fdfaf5"
        stroke={INK}
        strokeWidth="1.3"
      />
      {[eyeL, eyeR].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={eyeY + 0.6} rx="5.7" ry="6.5" fill={h.eye} />
          <ellipse cx={x} cy={eyeY - 1.4} rx="5.7" ry="4" fill="#150d16" opacity="0.45" />
          <ellipse cx={x} cy={eyeY + 3} rx="4.2" ry="3.4" fill="#ffffff" opacity="0.25" />
          <circle cx={x} cy={eyeY + 0.6} r="2.5" fill="#170f14" />
          <circle cx={x - 1.8} cy={eyeY - 2.2} r="1.9" fill="#ffffff" opacity="0.95" />
          <circle cx={x + 2} cy={eyeY + 3.2} r="0.9" fill="#ffffff" opacity="0.7" />
        </g>
      ))}
      {/* lids + lashes */}
      <path
        d={`M${eyeL - rx} ${eyeY + 1} Q${eyeL} ${eyeY - 10.5} ${eyeL + rx} ${eyeY}`}
        stroke={INK}
        strokeWidth={female ? 2.8 : 2.4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${eyeR - rx - 1} ${eyeY} Q${eyeR} ${eyeY - 10.5} ${eyeR + rx} ${eyeY + 1}`}
        stroke={INK}
        strokeWidth={female ? 2.8 : 2.4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${eyeL - rx} ${eyeY + 1} L${eyeL - rx - 4} ${eyeY - 3} M${eyeR + rx} ${eyeY + 1} L${eyeR + rx + 4} ${eyeY - 3}`}
        stroke={INK}
        strokeWidth={female ? 2.2 : 1.8}
        strokeLinecap="round"
      />
      <path
        d={`M${eyeL - rx + 3} ${eyeY + 5} Q${eyeL} ${eyeY + 9.5} ${eyeL + rx - 3} ${eyeY + 4} M${eyeR - rx + 2} ${eyeY + 5} Q${eyeR} ${eyeY + 9.5} ${eyeR + rx - 3} ${eyeY + 4}`}
        stroke={SKIN.light}
        strokeWidth="1.1"
        fill="none"
        opacity="0.7"
      />

      {/* brows */}
      <path
        d={`M${eyeL - 11} ${eyeY - 12} Q${eyeL - 1} ${eyeY - 18} ${eyeL + 10} ${eyeY - 12.5}`}
        stroke={h.dark}
        strokeWidth={female ? 2.6 : 3.2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${eyeR - 9} ${eyeY - 12.5} Q${eyeR + 2} ${eyeY - 18} ${eyeR + 12} ${eyeY - 11}`}
        stroke={h.dark}
        strokeWidth={female ? 2.6 : 3.2}
        fill="none"
        strokeLinecap="round"
      />

      {/* nose */}
      <path
        d={`M${cx + 2} ${eyeY + 4} Q${cx - 1.5} ${eyeY + 12} ${cx + 4} ${eyeY + 14}`}
        stroke={SKIN.line}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${cx + 3.6} ${eyeY + 14} q2.6 0.4 3 -1.4`}
        stroke={SKIN.deep}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d={`M${cx + 1} ${eyeY + 7} q-1.6 4 0.4 6`}
        stroke={SKIN.light}
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
      />

      {/* mouth */}
      {female ? (
        <g>
          <path
            d={`M${cx - 9} ${eyeY + 22} Q${cx} ${eyeY + 18} ${cx + 9} ${eyeY + 22} Q${cx} ${eyeY + 25.5} ${cx - 9} ${eyeY + 22} Z`}
            fill={SKIN.lip}
          />
          <path
            d={`M${cx - 8.5} ${eyeY + 22.5} Q${cx} ${eyeY + 30} ${cx + 8.5} ${eyeY + 22.5} Q${cx} ${eyeY + 25.5} ${cx - 8.5} ${eyeY + 22.5} Z`}
            fill="#d9786c"
          />
          <path
            d={`M${cx - 4} ${eyeY + 26} Q${cx} ${eyeY + 27.6} ${cx + 4} ${eyeY + 26}`}
            stroke="#f6c4b6"
            strokeWidth="1.2"
            fill="none"
            opacity="0.9"
          />
        </g>
      ) : (
        <g>
          <path
            d={`M${cx - 8} ${eyeY + 22} Q${cx} ${eyeY + 19.5} ${cx + 8} ${eyeY + 22} Q${cx} ${eyeY + 25} ${cx - 8} ${eyeY + 22} Z`}
            fill={SKIN.lipDark}
            opacity="0.85"
          />
          <path
            d={`M${cx - 7.5} ${eyeY + 22.5} Q${cx} ${eyeY + 27} ${cx + 7.5} ${eyeY + 22.5} Q${cx} ${eyeY + 25} ${cx - 7.5} ${eyeY + 22.5} Z`}
            fill={SKIN.lip}
          />
        </g>
      )}

      <HairFront cls={cls} gender={gender} />
    </g>
  );
}

function HairBack({ cls, gender }: { cls: HeroClass; gender: "male" | "female" }) {
  const h = HAIR[cls][gender];
  const female = gender === "female";
  const long = female && cls !== "archer";
  return (
    <g>
      {long ? (
        <path
          d={
            cls === "mage"
              ? "M152 36 C107 36 97 70 103 106 C107 132 99 154 91 172 Q112 168 124 150 C116 124 114 100 120 82 C126 58 136 48 152 48 C168 48 178 58 184 82 C190 100 188 124 180 150 Q192 168 213 172 C205 154 197 132 201 106 C207 70 197 36 152 36 Z"
              : "M152 38 C112 38 101 70 105 104 C108 132 100 158 94 184 Q112 178 122 164 C116 132 112 104 118 84 C124 60 136 50 152 50 C168 50 180 60 186 84 C192 104 188 132 182 164 Q192 178 210 184 C204 158 196 132 199 104 C203 70 192 38 152 38 Z"
          }
          fill={h.dark}
          stroke={INK}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={
            cls === "archer" && female
              ? "M152 40 C120 40 108 60 110 88 C111 100 114 108 118 114 C112 92 118 72 132 63 C140 58 146 56 152 56 C158 56 164 58 172 63 C186 72 192 92 186 114 C190 108 193 100 194 88 C196 60 184 40 152 40 Z"
              : cls === "mage"
                ? "M152 40 C122 40 110 58 111 86 C111 102 114 112 119 120 C114 96 120 76 132 66 C140 60 146 57 152 57 C158 57 164 60 172 66 C184 76 190 96 185 120 C190 112 193 102 193 86 C194 58 182 40 152 40 Z"
                : "M152 42 C124 42 112 58 112 82 C112 98 114 108 118 116 C114 92 120 74 132 64 C140 58 146 56 152 56 C158 56 164 58 172 64 C184 74 190 92 186 116 C190 108 192 98 192 82 C192 58 180 42 152 42 Z"
          }
          fill={h.dark}
          stroke={INK}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      )}

      {cls === "archer" && female && (
        <g>
          <path
            d="M182 52 C208 56 219 82 214 112 C211 134 200 148 186 157 C197 133 199 106 191 88 C187 74 183 63 182 52 Z"
            fill={h.hair}
            stroke={INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M190 74 C200 88 201 110 194 130"
            stroke={h.light}
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          <circle cx="184" cy="52" r="4" fill={METAL[0].trim} stroke={INK} strokeWidth="1.4" />
        </g>
      )}
    </g>
  );
}

function HairFront({ cls, gender }: { cls: HeroClass; gender: "male" | "female" }) {
  const h = HAIR[cls][gender];
  const female = gender === "female";
  const common = (
    <path
      d="M152 42 C126 42 112 58 112 88 C112 94 113 98 116 102 C118 78 128 62 140 56 C146 53 149 52 152 52 C155 52 158 53 164 56 C176 62 186 78 188 102 C191 98 192 94 192 88 C192 58 178 42 152 42 Z"
      fill={h.hair}
      stroke={INK}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );

  if (female && (cls === "warrior" || cls === "mage")) {
    return (
      <g>
        {common}
        <path
          d="M152 44 Q128 46 118 66 Q132 56 152 54 Q172 56 186 66 Q176 46 152 44 Z"
          fill={h.light}
          opacity="0.6"
        />
        <path
          d="M152 54 Q140 62 134 80 M152 54 Q164 62 170 80"
          stroke={h.dark}
          strokeWidth="1.6"
          fill="none"
          opacity="0.7"
        />
        {/* face-framing locks */}
        <path
          d={
            cls === "mage"
              ? "M120 66 C108 88 110 112 118 132 C124 140 132 140 134 132 C126 112 124 88 130 70 Z"
              : "M120 66 C110 90 112 116 120 138 C126 146 134 144 136 136 C128 114 126 88 132 70 Z"
          }
          fill={h.hair}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M184 66 C194 90 192 116 184 138 C178 146 170 144 168 136 C176 114 178 88 172 70 Z"
          fill={h.hair}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M124 76 C118 96 118 116 124 132 M180 76 C186 96 186 116 180 132"
          stroke={h.light}
          strokeWidth="1.8"
          fill="none"
          opacity="0.55"
        />
        {cls === "mage" && (
          <path
            d="M122 62 Q152 50 182 62"
            stroke={METAL[3].trim}
            strokeWidth="2.2"
            fill="none"
            opacity="0.75"
          />
        )}
        {cls === "mage" && (
          <circle cx="152" cy="57" r="2.6" fill={METAL[2].glow} stroke={INK} strokeWidth="0.9" />
        )}
      </g>
    );
  }

  if (cls === "archer" && female) {
    return (
      <g>
        <path
          d="M152 42 C126 42 114 58 114 84 C114 94 116 100 119 104 C122 80 132 64 146 58 C154 55 160 56 166 60 C176 66 183 78 185 96 C188 88 189 80 188 72 C184 52 172 42 152 42 Z"
          fill={h.hair}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M150 44 Q132 50 124 66 Q138 54 152 52 Q166 52 180 64 Q172 46 150 44 Z"
          fill={h.light}
          opacity="0.65"
        />
        <path
          d="M120 68 C112 90 114 112 122 130 C128 138 135 136 136 128 C129 110 127 88 132 70 Z"
          fill={h.hair}
          stroke={INK}
          strokeWidth="2"
        />
        <path
          d="M150 52 Q162 58 168 72"
          stroke={h.dark}
          strokeWidth="1.6"
          fill="none"
          opacity="0.6"
        />
      </g>
    );
  }

  // male hair
  return (
    <g>
      <path
        d={
          cls === "mage"
            ? "M152 42 C126 42 112 58 112 88 C112 96 113 100 116 104 C118 80 128 64 142 58 C136 68 134 76 136 82 C142 64 148 58 152 58 C158 58 170 66 176 80 C181 90 180 98 178 104 C184 96 189 90 189 78 C188 55 178 42 152 42 Z"
            : "M152 42 C126 42 114 56 114 80 C114 92 117 100 121 106 C118 84 126 66 140 58 C132 68 130 78 132 84 C138 66 146 58 152 58 C160 58 172 66 177 80 C181 90 180 100 178 106 C185 98 190 88 189 78 C188 55 178 42 152 42 Z"
        }
        fill={h.hair}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M124 66 Q138 52 154 50 Q142 60 136 72 Q130 80 124 66 Z"
        fill={h.light}
        opacity="0.6"
      />
      <path d="M176 60 Q184 72 185 92 Q190 84 187 70 Z" fill={h.dark} opacity="0.7" />
      {cls === "mage" && (
        <>
          <path
            d="M118 74 C112 92 114 112 120 124 C125 130 131 128 132 121 C126 106 124 88 128 76 Z"
            fill={h.hair}
            stroke={INK}
            strokeWidth="2"
          />
          <path
            d="M186 74 C192 92 190 112 184 124 C179 130 173 128 172 121 C178 106 180 88 176 76 Z"
            fill={h.hair}
            stroke={INK}
            strokeWidth="2"
          />
        </>
      )}
      {cls === "archer" && (
        <>
          <path
            d="M116 72 Q152 60 188 72 L188 79 Q152 68 116 79 Z"
            fill={CLOTH.archer[0].dark}
            stroke={INK}
            strokeWidth="1.6"
          />
          <path
            d="M180 74 L188 88 L180 92 Z"
            fill={CLOTH.archer[0].dark}
            stroke={INK}
            strokeWidth="1.4"
          />
        </>
      )}
    </g>
  );
}
