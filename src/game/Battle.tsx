import { useEffect, useRef, useState } from "react";
import { Axe, Crosshair, Flame, FlaskConical, Snowflake, Sparkles, Sword, Target, Wind, FastForward } from "lucide-react";
import castle from "@/assets/castle.jpg.asset.json";
import { Sprite } from "./Sprite";
import type { SpriteRect } from "./world";
import { calcDamage, SKILLS, type HeroClass, type Skill } from "./data";

export interface Fighter {
  name: string; img: string; hp: number; atk: number; def: number; crit: number; dodge: number;
  level: number; cls?: HeroClass; skills?: Skill[]; critDmg?: number; pen?: number; acc?: number; sprite?: SpriteRect; mirror?: boolean; boss?: boolean;
}

const ICONS: Record<string, typeof Sword> = { sword: Sword, axe: Axe, flame: Flame, sparkles: Sparkles, snowflake: Snowflake, target: Target, wind: Wind, crosshair: Crosshair };

interface Float { id: number; side: "L" | "R"; text: string; kind: "dmg" | "crit" | "miss" | "heal" }

export function Battle({ left, right, auto = false, onEnd, title }: {
  left: Fighter; right: Fighter; auto?: boolean; onEnd: (won: boolean) => void; title?: string;
}) {
  const [lhp, setLhp] = useState(left.hp);
  const [rhp, setRhp] = useState(right.hp);
  const [busy, setBusy] = useState(false);
  const [cds, setCds] = useState<Record<string, number>>({});
  const [potions, setPotions] = useState(2);
  const [anim, setAnim] = useState<{ L?: string; R?: string; proj?: "fwd" | "back"; projColor?: string }>({});
  const [floats, setFloats] = useState<Float[]>([]);
  const [fast, setFast] = useState(auto);
  const done = useRef(false);
  const fid = useRef(0);
  const stunned = useRef(false);
  const rCds = useRef<Record<string, number>>({});
  const hpRef = useRef({ l: left.hp, r: right.hp });

  const skills = left.skills ?? (left.cls ? SKILLS[left.cls] : SKILLS.warrior);
  const speed = fast ? 0.55 : 1;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms * speed));

  const float = (side: "L" | "R", text: string, kind: Float["kind"]) => {
    const id = ++fid.current;
    setFloats((f) => [...f, { id, side, text, kind }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1100);
  };

  const ranged = (c?: HeroClass) => c === "mage" || c === "archer";
  const projColor = (c?: HeroClass) => (c === "mage" ? "var(--r3)" : c === "archer" ? "var(--r1)" : "var(--blood)");

  async function strike(from: "L" | "R", skill: Skill) {
    const a = from === "L" ? left : right;
    const d = from === "L" ? right : left;
    const target = from === "L" ? "R" : "L";
    if (ranged(a.cls)) {
      setAnim({ proj: from === "L" ? "fwd" : "back", projColor: projColor(a.cls) });
    } else {
      setAnim({ [from]: (from === "L" ? "anim-lunge-r" : "anim-lunge-l") + "#" + ++fid.current });
    }
    await wait(300);
    const hits = skill.hits ?? 1;
    let total = 0;
    for (let i = 0; i < hits; i++) {
      const r = calcDamage(a.atk, d.def, skill.mult, a.crit, d.dodge, skill.crit, a.critDmg ?? 200, a.pen ?? 0, a.acc ?? 0);
      if (r.miss) float(target, "MISS", "miss");
      else { total += r.dmg; float(target, (r.crit ? "✦" : "") + r.dmg.toLocaleString(), r.crit ? "crit" : "dmg"); }
      setAnim({ [target]: "anim-hit#" + ++fid.current });
      if (hits > 1) await wait(160);
    }
    if (from === "L") { hpRef.current.r = Math.max(0, hpRef.current.r - total); setRhp(hpRef.current.r); }
    else { hpRef.current.l = Math.max(0, hpRef.current.l - total); setLhp(hpRef.current.l); }
    if (skill.heal) {
      const heal = Math.round(a.hp * skill.heal);
      if (from === "L") { hpRef.current.l = Math.min(left.hp, hpRef.current.l + heal); setLhp(hpRef.current.l); }
      else { hpRef.current.r = Math.min(right.hp, hpRef.current.r + heal); setRhp(hpRef.current.r); }
      float(from, `+${heal}`, "heal");
    }
    if (skill.stun && total > 0) {
      if (from === "L") stunned.current = true;
    }
    await wait(400);
    setAnim({});
  }

  function finish(won: boolean) {
    if (done.current) return;
    done.current = true;
    setTimeout(() => onEnd(won), 500);
  }

  async function enemyTurn() {
    if (stunned.current) {
      stunned.current = false;
      float("R", "FROZEN", "miss");
      await wait(500);
      return;
    }
    let sk: Skill = { id: "hit", name: "Hit", mult: 1, cd: 0, icon: "sword" };
    if (right.cls) {
      const rs = right.skills ?? SKILLS[right.cls];
      const ready = [...rs].reverse().find((s) => s.cd > 0 && !(rCds.current[s.id] > 0));
      if (ready && Math.random() < 0.7) { sk = { ...ready, stun: false }; rCds.current[ready.id] = ready.cd; }
      Object.keys(rCds.current).forEach((k) => (rCds.current[k] = Math.max(0, rCds.current[k] - 1)));
    } else if (right.boss && Math.random() < 0.25) {
      sk = { id: "breath", name: "Fire Breath", mult: 1.8, cd: 0, icon: "flame" };
    }
    await strike("R", sk);
  }

  async function use(skill: Skill) {
    if (busy || done.current || (cds[skill.id] ?? 0) > 0) return;
    setBusy(true);
    await strike("L", skill);
    setCds((c) => {
      const n: Record<string, number> = {};
      for (const s of skills) n[s.id] = Math.max(0, (c[s.id] ?? 0) - 1);
      if (skill.cd) n[skill.id] = skill.cd;
      return n;
    });
    if (hpRef.current.r <= 0) return finish(true);
    await wait(250);
    await enemyTurn();
    if (hpRef.current.l <= 0) return finish(false);
    setBusy(false);
  }

  async function drink() {
    if (busy || potions <= 0 || done.current) return;
    setBusy(true);
    setPotions((p) => p - 1);
    const heal = Math.round(left.hp * 0.35);
    hpRef.current.l = Math.min(left.hp, hpRef.current.l + heal);
    setLhp(hpRef.current.l);
    float("L", `+${heal}`, "heal");
    await wait(400);
    await enemyTurn();
    if (hpRef.current.l <= 0) return finish(false);
    setBusy(false);
  }

  // auto-battle
  const cdsRef = useRef(cds);
  cdsRef.current = cds;
  useEffect(() => {
    if (!auto || busy || done.current) return;
    const t = setTimeout(() => {
      const ready = [...skills].reverse().find((s) => !(cdsRef.current[s.id] > 0)) ?? skills[0];
      void use(ready);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, busy]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background anim-pop">
      <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-[2px]" style={{ backgroundImage: `url(${castle.url})` }} />
      <div className="absolute inset-0 vignette" />
      {title && <div className="relative z-10 pt-4 text-center font-display text-2xl panel-title">{title}</div>}

      <div className="relative z-10 grid grid-cols-2 gap-10 px-6 pt-4 md:px-16">
        <HpBar f={left} hp={lhp} />
        <HpBar f={right} hp={rhp} right />
      </div>

      <div className="relative z-10 flex-1">
        <FighterSprite f={left} hp={lhp} side="L" anim={anim.L} />
        <FighterSprite f={right} hp={rhp} side="R" anim={anim.R} />
        {anim.proj && (
          <div
            className={`absolute top-[45%] h-6 w-6 rounded-full ${anim.proj === "fwd" ? "anim-proj" : "anim-proj-back"}`}
            style={{ background: anim.projColor, boxShadow: `0 0 30px 10px ${anim.projColor}` }}
          />
        )}
        {floats.map((f) => (
          <div
            key={f.id}
            className={`pointer-events-none absolute top-[30%] anim-float font-display font-black drop-shadow-[0_2px_2px_black] ${
              f.kind === "crit" ? "text-5xl text-gold" : f.kind === "heal" ? "text-3xl text-r1" : f.kind === "miss" ? "text-2xl text-muted-foreground" : "text-4xl text-foreground"
            }`}
            style={{ left: f.side === "L" ? "25%" : "75%" }}
          >
            {f.text}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3 pb-6">
        {skills.map((s) => {
          const Icon = ICONS[s.icon] ?? Sword;
          const cd = cds[s.id] ?? 0;
          return (
            <button
              key={s.id}
              onClick={() => use(s)}
              disabled={busy || cd > 0 || auto}
              title={`${s.name} — ${Math.round(s.mult * (s.hits ?? 1) * 100)}%`}
              className="slot relative flex h-20 w-20 flex-col items-center justify-center gap-1 transition hover:scale-105 disabled:opacity-60 rarity-4"
            >
              <Icon className="h-8 w-8 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{s.name}</span>
              {cd > 0 && <span className="absolute inset-0 flex items-center justify-center rounded-md bg-background/75 font-display text-3xl text-foreground">{cd}</span>}
            </button>
          );
        })}
        <button onClick={drink} disabled={busy || potions <= 0 || auto} className="slot relative flex h-20 w-20 flex-col items-center justify-center gap-1 rarity-5 transition hover:scale-105 disabled:opacity-50">
          <FlaskConical className="h-8 w-8 text-hp" />
          <span className="text-[10px] font-bold uppercase">Potion ×{potions}</span>
        </button>
        <button onClick={() => setFast((f) => !f)} className={`slot flex h-12 w-12 items-center justify-center ${fast ? "rarity-2" : ""}`} title="Speed">
          <FastForward className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function HpBar({ f, hp, right }: { f: Fighter; hp: number; right?: boolean }) {
  return (
    <div className={right ? "text-right" : ""}>
      <div className="mb-1 font-display text-lg">
        {f.boss && <span className="mr-2 text-blood">☠ BOSS</span>}
        {f.name} <span className="text-sm text-muted-foreground">Lv {f.level}</span>
      </div>
      <div className="bar-track h-5">
        <div className={`bar-hp h-full ${right ? "ml-auto" : ""}`} style={{ width: `${(hp / f.hp) * 100}%` }} />
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{Math.round(hp).toLocaleString()} / {f.hp.toLocaleString()}</div>
    </div>
  );
}

function FighterSprite({ f, hp, side, anim }: { f: Fighter; hp: number; side: "L" | "R"; anim?: string }) {
  const dead = hp <= 0;
  return (
    <div
      className={`absolute bottom-0 flex h-[85%] w-[38%] items-end justify-center transition-all duration-700 ${dead ? "opacity-0 translate-y-8 grayscale" : ""}`}
      style={{ [side === "L" ? "left" : "right"]: "6%" }}
    >
      <div key={anim ?? "idle"} className={`h-full w-full ${anim?.split("#")[0] ?? ""}`}>
        {f.sprite ? (
          <div className={`flex h-full w-full items-end justify-center anim-idle ${f.boss ? "scale-110" : ""}`}>
            <Sprite rect={f.sprite} className="max-h-full w-[85%] rounded-xl shadow-[0_20px_40px_black]" />
          </div>
        ) : <img
          src={f.img}
          alt={f.name}
          className={`h-full w-full object-contain object-bottom drop-shadow-[0_20px_30px_black] anim-idle ${f.boss ? "scale-110" : ""}`}
          style={f.mirror ? { transform: "scaleX(-1)" } : undefined}
        />}
      </div>
    </div>
  );
}
