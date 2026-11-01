import type { HeroClass } from "../data";
import { CLOTH, INK, METAL, type Metal, type Tier } from "./palette";

/**
 * Armour, robes and jerkins — four clearly different materials per class, one per
 * gear band. Every look is a texture, not a colour swap: riveted iron, cracked
 * ember plate, moonsteel filigree and engraved ancestral gold.
 */
export function Chest({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  if (cls === "warrior") return <WarriorChest tier={tier} />;
  if (cls === "mage") return <MageChest tier={tier} />;
  return <ArcherChest tier={tier} />;
}

const plate = "M152 122 L188 148 Q198 180 190 214 L114 214 Q106 180 116 148 Z";

/** Rows of overlapping scales, the ember and moon signature. */
function Scales({
  y0,
  rows,
  w,
  h,
  fill,
  dark,
  light,
}: {
  y0: number;
  rows: number;
  w: number;
  h: number;
  fill: string;
  dark: string;
  light: string;
}) {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 7; c++) {
      const cx = 122 + c * w + (r % 2 ? w / 2 : 0);
      const cy = y0 + r * h;
      out.push(
        <path
          key={`${r}-${c}`}
          d={`M${cx - w / 2} ${cy} Q${cx} ${cy + h * 1.15} ${cx + w / 2} ${cy} Z`}
          fill={(r + c) % 2 ? fill : dark}
          stroke={INK}
          strokeWidth="0.9"
          opacity="0.95"
        />,
      );
    }
  }
  out.push(
    <path
      key="lit"
      d={`M120 ${y0 + 4} Q152 ${y0 + 12} 184 ${y0 + 4}`}
      stroke={light}
      strokeWidth="1.6"
      fill="none"
      opacity="0.5"
    />,
  );
  return <g>{out}</g>;
}

function Rivets({ pts, color }: { pts: [number, number][]; color: string }) {
  return (
    <g>
      {pts.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="2.6" fill={color} stroke={INK} strokeWidth="0.9" />
          <circle cx={x - 0.5} cy={y - 0.7} r="0.9" fill="#ffffff" opacity="0.75" />
        </g>
      ))}
    </g>
  );
}

function Pauldrons({ tier, style }: { tier: Tier; style: "round" | "spike" | "ornate" }) {
  const m = METAL[tier];
  const left =
    style === "spike"
      ? "M122 142 Q100 128 88 132 L80 124 L90 158 Q104 170 120 172 Z"
      : style === "ornate"
        ? "M124 140 Q100 126 86 140 Q84 154 94 168 Q110 174 124 172 Z"
        : "M122 140 Q100 132 90 152 Q96 172 116 172 Q120 158 124 146 Z";
  const right =
    style === "spike"
      ? "M180 140 Q202 126 214 130 L222 122 L212 156 Q198 168 182 170 Z"
      : style === "ornate"
        ? "M180 140 Q204 126 218 140 Q220 154 210 168 Q194 174 180 172 Z"
        : "M180 140 Q202 132 212 152 Q206 172 186 172 Q182 158 178 146 Z";
  return (
    <g>
      <path d={left} fill={m.base} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d={right} fill={m.dark} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path
        d="M92 152 Q104 140 118 148"
        stroke={m.light}
        strokeWidth="2"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M210 152 Q198 140 184 148"
        stroke={m.trim}
        strokeWidth="2"
        fill="none"
        opacity="0.85"
      />
      {style !== "round" && (
        <>
          <path
            d="M100 160 Q110 168 120 164"
            stroke={m.glow}
            strokeWidth="1.8"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M204 160 Q194 168 184 164"
            stroke={m.glow}
            strokeWidth="1.8"
            fill="none"
            opacity="0.8"
          />
        </>
      )}
    </g>
  );
}

function WarriorChest({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const c = CLOTH.warrior[tier];
  if (tier === 0) {
    return (
      <g>
        <path d={plate} fill={m.base} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M152 124 L152 212 L114 212 Q106 180 116 148 Z" fill={m.light} opacity="0.34" />
        {/* riveted bands */}
        <path
          d="M114 164 Q152 174 190 164 L190 178 Q152 188 114 178 Z"
          fill={m.dark}
          stroke={INK}
          strokeWidth="1.8"
        />
        <Rivets
          pts={[
            [120, 170],
            [134, 173],
            [148, 175],
            [162, 173],
            [176, 170],
            [122, 190],
            [150, 195],
            [178, 190],
            [124, 144],
            [180, 144],
          ]}
          color={m.trim}
        />
        <path
          d="M124 132 Q152 122 180 132 L176 146 Q152 136 128 146 Z"
          fill={m.light}
          stroke={INK}
          strokeWidth="1.8"
          opacity="0.9"
        />
        <path d="M120 146 L184 200" stroke={m.trim} strokeWidth="7" opacity="0.5" />
        <path d="M114 202 H190 V214 H114 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
        <path d="M114 206 H190" stroke={m.trim} strokeWidth="1.6" opacity="0.9" />
        <Pauldrons tier={tier} style="round" />
      </g>
    );
  }
  if (tier === 1) {
    return (
      <g>
        <path d={plate} fill={m.base} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <Scales y0={150} rows={4} w={22} h={16} fill={m.base} dark={m.dark} light={m.light} />
        {/* ember seams through the plate cracks */}
        <path
          d="M126 136 L140 168 L128 186 M176 138 L164 170 L178 194 M152 140 L152 206"
          stroke={m.glow}
          strokeWidth="2.2"
          fill="none"
          opacity="0.95"
        />
        <path
          d="M126 136 L140 168 L128 186 M176 138 L164 170 L178 194"
          stroke={m.edge}
          strokeWidth="0.8"
          fill="none"
          opacity="0.7"
        />
        <circle cx="152" cy="140" r="9" fill={m.glow} opacity="0.28" />
        <path
          d="M148 132 L156 132 L158 148 L152 154 L146 148 Z"
          fill={m.trim}
          stroke={INK}
          strokeWidth="1.6"
        />
        <circle cx="152" cy="142" r="3.2" fill={m.glow} />
        <path d="M114 198 H190 V214 H114 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
        <path d="M118 202 H186" stroke={m.trim} strokeWidth="1.6" strokeDasharray="5 4" />
        <Pauldrons tier={tier} style="spike" />
      </g>
    );
  }
  if (tier === 2) {
    return (
      <g>
        <path d={plate} fill={m.dark} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path
          d="M152 124 L182 148 L178 200 L152 212 L126 200 L122 148 Z"
          fill={m.base}
          stroke={INK}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* moonsteel filigree */}
        <path d="M152 130 L152 206" stroke={m.light} strokeWidth="3" opacity="0.95" />
        <path
          d="M136 150 Q152 142 168 150 Q166 176 152 190 Q138 176 136 150 Z"
          fill="none"
          stroke={m.trim}
          strokeWidth="2.2"
        />
        <path
          d="M130 156 Q124 176 132 192 M174 156 Q180 176 172 192"
          stroke={m.trim}
          strokeWidth="1.8"
          fill="none"
          opacity="0.9"
        />
        <circle cx="152" cy="166" r="11" fill="none" stroke={m.light} strokeWidth="1.6" />
        <path
          d="M152 158 L156 166 L152 176 L148 166 Z"
          fill={m.glow}
          stroke={INK}
          strokeWidth="1.4"
        />
        <circle cx="152" cy="166" r="20" fill={m.glow} opacity="0.2" />
        <path d="M114 198 H190 V214 H114 Z" fill={m.base} stroke={INK} strokeWidth="2" />
        <path d="M118 203 H186" stroke={m.light} strokeWidth="1.6" opacity="0.9" />
        <Pauldrons tier={tier} style="spike" />
      </g>
    );
  }
  return (
    <g>
      <path d={plate} fill={m.base} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M152 124 L152 212 L114 212 Q106 180 116 148 Z" fill={m.light} opacity="0.3" />
      {/* engraved ancestral plate */}
      <path
        d="M118 140 Q152 126 186 140 Q182 152 152 150 Q122 152 118 140 Z"
        fill={m.light}
        stroke={INK}
        strokeWidth="2"
      />
      <path
        d="M124 158 Q152 148 180 158 Q176 178 152 186 Q128 178 124 158 Z"
        fill={m.trim}
        stroke={INK}
        strokeWidth="1.8"
        opacity="0.9"
      />
      <path
        d="M136 164 Q152 158 168 164 Q164 176 152 180 Q140 176 136 164 Z"
        fill="none"
        stroke={m.light}
        strokeWidth="1.6"
      />
      <path
        d="M152 152 L152 186 M136 168 L168 174 M168 168 L136 174"
        stroke={m.light}
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d="M142 190 L152 182 L162 190 L152 202 Z"
        fill={m.glow}
        stroke={INK}
        strokeWidth="1.6"
      />
      <circle cx="152" cy="192" r="18" fill={m.glow} opacity="0.22" />
      <path d="M114 200 H190 V212 H114 Z" fill={m.dark} stroke={INK} strokeWidth="2" />
      <Rivets
        pts={[
          [120, 206],
          [152, 206],
          [184, 206],
          [122, 136],
          [182, 136],
        ]}
        color={m.trim}
      />
      <Pauldrons tier={tier} style="ornate" />
    </g>
  );
}

function MageChest({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const c = CLOTH.mage[tier];
  const robe = "M116 140 Q152 126 188 140 Q196 178 190 214 L114 214 Q106 178 116 140 Z";
  return (
    <g>
      <path d={robe} fill={c.light} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path
        d="M152 138 Q128 150 126 214 L178 214 Q176 150 152 138 Z"
        fill={c.cloth}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M152 142 L152 212" stroke={c.dark} strokeWidth="2" opacity="0.6" />
      {/* mantle / collar */}
      <path
        d="M120 132 Q152 118 184 132 Q180 150 152 154 Q124 150 120 132 Z"
        fill={tier === 0 ? c.cloth : m.base}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M152 154 L128 130 L139 120 L152 138 L165 120 L176 130 Z"
        fill={tier >= 2 ? m.light : c.dark}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {tier === 0 && (
        <>
          {/* cord belt + stitched hem */}
          <path
            d="M116 198 Q152 208 188 198"
            stroke={m.trim}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M116 198 Q152 208 188 198"
            stroke={m.dark}
            strokeWidth="1.4"
            fill="none"
            strokeDasharray="4 5"
          />
          <path
            d="M126 150 Q152 162 178 150"
            stroke={c.dark}
            strokeWidth="1.4"
            fill="none"
            strokeDasharray="3 4"
            opacity="0.8"
          />
          <circle cx="152" cy="204" r="3.4" fill={m.trim} stroke={INK} strokeWidth="1.2" />
        </>
      )}
      {tier === 1 && (
        <>
          {/* glowing rune stitching */}
          <path
            d="M136 160 L136 200 M168 160 L168 200 M136 172 L168 188 M168 172 L136 188"
            stroke={m.glow}
            strokeWidth="1.8"
            fill="none"
            opacity="0.9"
          />
          <circle cx="152" cy="158" r="6" fill={m.glow} stroke={INK} strokeWidth="1.4" />
          <circle cx="152" cy="158" r="13" fill={m.glow} opacity="0.25" />
          <path
            d="M126 204 Q152 212 178 204"
            stroke={m.trim}
            strokeWidth="2.6"
            fill="none"
            strokeDasharray="6 4"
            opacity="0.9"
          />
          <path
            d="M122 150 Q152 160 182 150"
            stroke={m.trim}
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
        </>
      )}
      {tier === 2 && (
        <>
          {/* moonveil filigree + crescent clasp */}
          <path d="M124 138 Q152 128 180 138" stroke={m.trim} strokeWidth="2.2" fill="none" />
          <path
            d="M134 162 Q152 154 170 162 Q166 190 152 202 Q138 190 134 162 Z"
            fill="none"
            stroke={m.light}
            strokeWidth="1.8"
          />
          <path d="M152 166 a8 8 0 1 0 0.1 0 Z" fill={m.glow} opacity="0.85" />
          <circle cx="152" cy="174" r="14" fill={m.glow} opacity="0.2" />
          <path
            d="M124 200 Q152 210 180 200"
            stroke={m.light}
            strokeWidth="2.2"
            fill="none"
            opacity="0.85"
          />
        </>
      )}
      {tier === 3 && (
        <>
          {/* archon: gold trim, jade gem, shoulder fins */}
          <path d="M118 138 Q152 126 186 138" stroke={m.light} strokeWidth="2.6" fill="none" />
          <path
            d="M152 158 L166 174 L152 192 L138 174 Z"
            fill={m.trim}
            stroke={INK}
            strokeWidth="1.8"
          />
          <circle cx="152" cy="174" r="4.6" fill={m.glow} />
          <circle cx="152" cy="174" r="19" fill={m.glow} opacity="0.24" />
          <path
            d="M126 164 Q152 156 178 164 M126 196 Q152 204 178 196"
            stroke={m.light}
            strokeWidth="1.8"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M120 132 Q108 120 111 104 Q124 114 133 128 Z"
            fill={m.base}
            stroke={INK}
            strokeWidth="1.8"
          />
          <path
            d="M184 132 Q196 120 193 104 Q180 114 171 128 Z"
            fill={m.base}
            stroke={INK}
            strokeWidth="1.8"
          />
        </>
      )}
    </g>
  );
}

function ArcherChest({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const c = CLOTH.archer[tier];
  const hide = tier === 0 ? "#7a5334" : tier === 1 ? "#4b2b20" : tier === 2 ? "#37475f" : "#2f5c42";
  const hideDark =
    tier === 0 ? "#4e331f" : tier === 1 ? "#2c1811" : tier === 2 ? "#212c3d" : "#1a3a29";
  const hideLight =
    tier === 0 ? "#9c7048" : tier === 1 ? "#6d3f2c" : tier === 2 ? "#4e6079" : "#437a5a";
  return (
    <g>
      <path
        d="M152 120 L188 140 Q198 176 188 214 L116 214 Q104 176 112 140 Z"
        fill={hide}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M152 124 L152 210 L116 210 Q104 176 112 140 Z" fill={hideLight} opacity="0.45" />
      {/* leather cross strap */}
      <path d="M118 138 L186 204" stroke={hideDark} strokeWidth="12" strokeLinecap="round" />
      <path
        d="M118 138 L186 204"
        stroke={m.trim}
        strokeWidth="2"
        strokeDasharray="5 6"
        opacity="0.9"
      />
      <path
        d="M124 132 Q152 118 180 132 L176 144 Q152 132 128 144 Z"
        fill={c.cloth}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M152 144 Q134 156 132 210 L170 210 Q168 156 152 144 Z"
        fill={c.dark}
        stroke={INK}
        strokeWidth="1.8"
      />
      <path d="M152 146 L152 208" stroke={c.cloth} strokeWidth="2" opacity="0.6" />

      {tier === 0 && (
        <>
          {/* laced leather panels + buckles */}
          <path
            d="M120 152 L136 200 M184 152 L168 200"
            stroke={hideDark}
            strokeWidth="2"
            fill="none"
          />
          <path d="M120 152 L136 200" stroke={m.trim} strokeWidth="1.4" strokeDasharray="3 4" />
          <path d="M184 152 L168 200" stroke={m.trim} strokeWidth="1.4" strokeDasharray="3 4" />
          <Rivets
            pts={[
              [122, 158],
              [180, 158],
              [124, 186],
              [178, 186],
            ]}
            color={m.light}
          />
          <path
            d="M132 170 Q150 178 168 170"
            stroke={m.trim}
            strokeWidth="1.6"
            fill="none"
            strokeDasharray="3 4"
          />
        </>
      )}
      {tier === 1 && (
        <>
          {/* scorched hide, ember gem, fur collar */}
          <path
            d="M118 160 Q152 150 186 160 L184 176 Q152 166 120 176 Z"
            fill={hideDark}
            opacity="0.7"
          />
          <rect
            x="138"
            y="152"
            width="26"
            height="10"
            rx="2"
            fill={m.trim}
            stroke={INK}
            strokeWidth="1.4"
          />
          <path d="M142 157 H160" stroke={m.dark} strokeWidth="2" />
          <circle cx="152" cy="186" r="6" fill={m.glow} stroke={INK} strokeWidth="1.4" />
          <circle cx="152" cy="186" r="13" fill={m.glow} opacity="0.24" />
          <path
            d="M118 134 Q124 124 132 132 Q140 122 148 132 Q156 122 164 132 Q172 122 180 132 L180 140 L118 140 Z"
            fill={m.dark}
            stroke={INK}
            strokeWidth="1.6"
          />
        </>
      )}
      {tier === 2 && (
        <>
          {/* moonhide scale panels + studs */}
          <Scales y0={158} rows={3} w={24} h={17} fill={m.base} dark={m.dark} light={m.light} />
          <path
            d="M152 148 L160 162 L152 176 L144 162 Z"
            fill={m.base}
            stroke={INK}
            strokeWidth="1.6"
          />
          <circle cx="152" cy="162" r="14" fill={m.glow} opacity="0.18" />
          <path
            d="M178 132 Q192 142 190 160 Q182 168 174 160 Q178 146 172 136 Z"
            fill={m.base}
            stroke={INK}
            strokeWidth="1.8"
          />
        </>
      )}
      {tier === 3 && (
        <>
          {/* ancestral engraved leaves */}
          <path d="M120 136 Q152 124 184 136" stroke={m.light} strokeWidth="2.4" fill="none" />
          <path
            d="M152 150 Q172 162 178 184 Q152 198 126 184 Q132 162 152 150 Z"
            fill="none"
            stroke={m.trim}
            strokeWidth="2.2"
          />
          <path
            d="M152 156 Q160 168 152 182 Q144 168 152 156 Z"
            fill={m.glow}
            stroke={INK}
            strokeWidth="1.6"
          />
          <path
            d="M136 162 Q140 176 134 186 M168 162 Q164 176 170 186"
            stroke={m.light}
            strokeWidth="1.6"
            fill="none"
            opacity="0.9"
          />
          <circle cx="152" cy="168" r="15" fill={m.glow} opacity="0.2" />
          <path
            d="M120 140 Q110 126 112 112 Q124 124 130 136 Z"
            fill={m.base}
            stroke={INK}
            strokeWidth="1.8"
          />
          <path
            d="M184 140 Q194 126 192 112 Q180 124 174 136 Z"
            fill={m.base}
            stroke={INK}
            strokeWidth="1.8"
          />
        </>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------

const GRIP = "#3a271c";
const WOOD = "#7a5334";
const WOOD_DARK = "#4a3120";

/** The weapon, drawn in local space with the grip at the origin and the head pointing up (-y). */
export function Weapon({ cls, tier }: { cls: HeroClass; tier: Tier }) {
  if (cls === "warrior") return <WarriorWeapon tier={tier} />;
  if (cls === "mage") return <MageWeapon tier={tier} />;
  return <ArcherWeapon tier={tier} />;
}

function WarriorWeapon({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  const grip = (len: number, w: number, color = GRIP) => (
    <path d={`M0 ${-len / 2} V${len / 2}`} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
  if (tier === 0) {
    return (
      <g>
        {grip(22, 7)}
        <circle cx="0" cy="11" r="5" fill={m.trim} stroke={INK} strokeWidth="1.6" />
        <path d="M-16 -16 H16" stroke={m.trim} strokeWidth="5.5" strokeLinecap="round" />
        <path
          d="M-5.5 -18 L-5 -112 L0 -132 L5 -112 L5.5 -18 Z"
          fill={m.base}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M0 -122 V-26" stroke={m.light} strokeWidth="2.2" opacity="0.9" />
        <path d="M0 -112 V-28" stroke={m.dark} strokeWidth="1.2" opacity="0.6" />
        <circle cx="0" cy="-16" r="2" fill={m.edge} />
      </g>
    );
  }
  if (tier === 1) {
    return (
      <g>
        {grip(24, 7.5)}
        <path
          d="M-20 -18 Q0 -28 20 -18"
          stroke={m.trim}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-7 -20 C-11 -58 -9 -98 -3 -120 C0 -132 5 -128 6 -114 C8 -78 6 -44 7 -20 Z"
          fill={m.base}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M-7 -22 C-11 -58 -9 -98 -3 -120" stroke={m.glow} strokeWidth="2.6" fill="none" />
        <path
          d="M0 -40 L-2 -70 L1 -90 L-1 -112"
          stroke={m.glow}
          strokeWidth="1.2"
          fill="none"
          opacity="0.8"
        />
        <path d="M3 -34 L2 -60 M3 -74 L2 -102" stroke={m.dark} strokeWidth="1.4" opacity="0.7" />
        <circle cx="0" cy="13" r="5.4" fill={m.glow} stroke={INK} strokeWidth="1.6" />
        <circle cx="0" cy="13" r="11" fill={m.glow} opacity="0.28" />
      </g>
    );
  }
  if (tier === 2) {
    return (
      <g>
        {grip(22, 6.5)}
        <path
          d="M-18 -18 Q0 -11 18 -18 Q9 -23 0 -20 Q-9 -23 -18 -18 Z"
          fill={m.base}
          stroke={INK}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M-4.5 -22 L-3.5 -124 L0 -140 L3.5 -124 L4.5 -22 Z"
          fill={m.light}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M0 -128 V-28" stroke={m.trim} strokeWidth="2" />
        <path
          d="M-2.4 -50 L-2.4 -100 M2.4 -50 L2.4 -100"
          stroke={m.glow}
          strokeWidth="1.2"
          opacity="0.85"
        />
        <circle cx="0" cy="13" r="4.8" fill={m.glow} stroke={INK} strokeWidth="1.4" />
        <circle cx="0" cy="13" r="11" fill={m.glow} opacity="0.3" />
      </g>
    );
  }
  return (
    <g>
      {grip(28, 8)}
      <path
        d="M-27 -18 Q-13 -27 0 -21 Q13 -27 27 -18 Q18 -7 0 -12 Q-18 -7 -27 -18 Z"
        fill={m.base}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M-27 -18 L-36 -31 M27 -18 L36 -31"
        stroke={m.light}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M-8 -22 L-6 -124 L0 -142 L6 -124 L8 -22 Z"
        fill={m.light}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M0 -128 V-26" stroke={m.trim} strokeWidth="2.4" />
      <path d="M-6 -62 H6 M-6 -94 H6" stroke={m.base} strokeWidth="2.4" />
      <path
        d="M-3 -70 Q0 -76 3 -70 M-3 -102 Q0 -108 3 -102"
        stroke={m.glow}
        strokeWidth="1.6"
        fill="none"
      />
      <path d="M0 -122 L0 -26" stroke={m.glow} strokeWidth="1.2" opacity="0.7" />
      <circle cx="0" cy="14" r="6" fill={m.trim} stroke={INK} strokeWidth="1.6" />
      <circle cx="0" cy="14" r="2.6" fill={m.glow} />
      <circle cx="0" cy="-72" r="26" fill={m.glow} opacity="0.14" />
    </g>
  );
}

function MageWeapon({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  if (tier === 0) {
    return (
      <g>
        <path
          d="M0 12 C-2 -12 2 -34 0 -56"
          stroke={WOOD}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-3 -20 Q2 -24 3 -18 M-2 -38 Q2 -42 3 -36"
          stroke={WOOD_DARK}
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M-7 -54 Q0 -66 7 -54 Q0 -46 -7 -54 Z"
          fill="#5f9a52"
          stroke={INK}
          strokeWidth="1.4"
        />
        <circle cx="0" cy="-64" r="6.6" fill={m.glow} stroke={INK} strokeWidth="1.8" />
        <circle cx="0" cy="-64" r="13" fill={m.glow} opacity="0.22" />
      </g>
    );
  }
  if (tier === 1) {
    return (
      <g>
        <path d="M0 14 V-112" stroke="#53392a" strokeWidth="7" strokeLinecap="round" />
        <path
          d="M-2 -20 L1 -48 L-1 -70 L1 -96"
          stroke={m.glow}
          strokeWidth="1.6"
          fill="none"
          opacity="0.85"
        />
        <path d="M-3 -30 H3 M-3 -54 H3 M-3 -78 H3" stroke="#2c1c14" strokeWidth="3" />
        <path d="M-9 -104 Q0 -95 9 -104" stroke={m.trim} strokeWidth="3.6" fill="none" />
        <circle cx="0" cy="-122" r="11" fill={m.base} stroke={INK} strokeWidth="2" />
        <circle cx="0" cy="-122" r="6.6" fill={m.glow} />
        <circle cx="0" cy="-122" r="21" fill={m.glow} opacity="0.3" />
      </g>
    );
  }
  if (tier === 2) {
    return (
      <g>
        <path d="M0 14 V-110" stroke={m.dark} strokeWidth="5.6" strokeLinecap="round" />
        <path d="M0 14 V-110" stroke={m.light} strokeWidth="2" opacity="0.75" />
        <path
          d="M-12 -118 Q-3 -134 4 -118"
          stroke={m.base}
          strokeWidth="3.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M12 -118 Q3 -134 -4 -118"
          stroke={m.base}
          strokeWidth="3.6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="0" cy="-124" r="8" fill={m.glow} stroke={INK} strokeWidth="1.8" />
        <circle cx="0" cy="-124" r="17" fill={m.glow} opacity="0.26" />
        <circle cx="0" cy="-6" r="4" fill={m.trim} stroke={INK} strokeWidth="1.2" />
        <path
          d="M-4 -40 L0 -46 L4 -40 L0 -34 Z"
          fill={m.light}
          stroke={INK}
          strokeWidth="1"
          opacity="0.9"
        />
      </g>
    );
  }
  return (
    <g>
      <path d="M0 16 V-104" stroke={m.base} strokeWidth="6" strokeLinecap="round" />
      <path d="M0 16 V-104" stroke={m.light} strokeWidth="2" opacity="0.85" />
      <path d="M-7 -8 H7 M-7 -42 H7 M-7 -76 H7" stroke={m.trim} strokeWidth="3.4" />
      <path
        d="M-17 -108 Q-9 -136 0 -114 Q9 -136 17 -108 Q9 -94 0 -104 Q-9 -94 -17 -108 Z"
        fill={m.base}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M-21 -120 Q-34 -134 -26 -146 Q-13 -139 -10 -124 Z"
        fill={m.base}
        stroke={INK}
        strokeWidth="1.8"
      />
      <path
        d="M21 -120 Q34 -134 26 -146 Q13 -139 10 -124 Z"
        fill={m.base}
        stroke={INK}
        strokeWidth="1.8"
      />
      <path d="M0 -130 L7 -116 L0 -104 L-7 -116 Z" fill={m.glow} stroke={INK} strokeWidth="1.6" />
      <circle cx="0" cy="-116" r="25" fill={m.glow} opacity="0.2" />
    </g>
  );
}

function ArcherWeapon({ tier }: { tier: Tier }) {
  const m = METAL[tier];
  if (tier === 0) {
    return (
      <g>
        <path
          d="M0 0 C-14 -22 -18 -50 10 -76"
          stroke={WOOD}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0 0 C-14 22 -18 50 10 76"
          stroke={WOOD}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M10 -76 L10 76" stroke="#e8e0cf" strokeWidth="1.4" opacity="0.85" />
        <path d="M-5 -9 Q0 -5 5 0 Q0 5 -5 9 Z" fill={WOOD_DARK} stroke={INK} strokeWidth="1.4" />
        <path
          d="M-8 -24 Q-4 -20 -2 -16 M-8 24 Q-4 20 -2 16"
          stroke={WOOD_DARK}
          strokeWidth="2"
          fill="none"
        />
      </g>
    );
  }
  if (tier === 1) {
    return (
      <g>
        <path
          d="M0 0 C-16 -20 -22 -50 6 -78 Q-6 -66 -4 -56"
          stroke={WOOD}
          strokeWidth="5.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0 0 C-16 20 -22 50 6 78 Q-6 66 -4 56"
          stroke={WOOD}
          strokeWidth="5.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0 0 C-16 -20 -22 -50 6 -78"
          stroke={m.glow}
          strokeWidth="1.6"
          fill="none"
          opacity="0.8"
        />
        <path
          d="M0 0 C-16 20 -22 50 6 78"
          stroke={m.glow}
          strokeWidth="1.6"
          fill="none"
          opacity="0.8"
        />
        <path d="M6 -78 L6 78" stroke="#f0e6d2" strokeWidth="1.5" opacity="0.9" />
        <path
          d="M2 -74 Q10 -70 8 -62 M2 74 Q10 70 8 62"
          fill="none"
          stroke={m.trim}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M-6 -11 Q0 -6 6 0 Q0 6 -6 11 Z" fill="#4a2b20" stroke={INK} strokeWidth="1.4" />
        <circle cx="0" cy="0" r="2.6" fill={m.glow} />
        <circle cx="0" cy="0" r="9" fill={m.glow} opacity="0.22" />
      </g>
    );
  }
  if (tier === 2) {
    return (
      <g>
        <path
          d="M0 0 C-18 -22 -26 -52 4 -80 Q-8 -68 -6 -56"
          stroke={m.base}
          strokeWidth="5.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0 0 C-18 22 -26 52 4 80 Q-8 68 -6 56"
          stroke={m.base}
          strokeWidth="5.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0 0 C-18 -22 -26 -52 4 -80"
          stroke={m.light}
          strokeWidth="2"
          fill="none"
          opacity="0.85"
        />
        <path d="M4 -80 L4 80" stroke={m.glow} strokeWidth="1.8" opacity="0.95" />
        <path d="M-9 -13 Q0 -6 9 0 Q0 6 -9 13 Z" fill={m.dark} stroke={INK} strokeWidth="1.4" />
        <path d="M-2 -60 L2 -52 M-2 60 L2 52" stroke={m.trim} strokeWidth="2" />
        <circle cx="4" cy="-80" r="9" fill={m.glow} opacity="0.22" />
        <circle cx="4" cy="80" r="9" fill={m.glow} opacity="0.22" />
      </g>
    );
  }
  return (
    <g>
      <path
        d="M0 0 C-20 -24 -30 -58 2 -92 Q-12 -78 -10 -62"
        stroke={m.base}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M0 0 C-20 24 -30 58 2 92 Q-12 78 -10 62"
        stroke={m.base}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M0 0 C-20 -24 -30 -58 2 -92"
        stroke={m.light}
        strokeWidth="2.4"
        fill="none"
        opacity="0.85"
      />
      <path d="M2 -92 L2 92" stroke={m.glow} strokeWidth="2" />
      <path
        d="M-4 -66 Q4 -60 3 -50 M-4 66 Q4 60 3 50"
        fill="none"
        stroke={m.trim}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M-12 -15 Q0 -7 12 0 Q0 7 -12 15 Z" fill={m.dark} stroke={INK} strokeWidth="1.6" />
      <path
        d="M-6 -8 L-2 0 L-6 8 M2 -8 L6 0 L2 8"
        stroke={m.light}
        strokeWidth="1.4"
        fill="none"
        opacity="0.9"
      />
      <circle cx="0" cy="0" r="3.4" fill={m.glow} />
      <circle cx="0" cy="0" r="22" fill={m.glow} opacity="0.16" />
    </g>
  );
}

export type { Metal };
