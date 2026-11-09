import { useEffect, useState } from "react";
import { Flag, RefreshCw, Shield, Swords, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CLASSES, type HeroClass, type Stats } from "./data";
import { adoptServerSave, flushSave, useGame, withServerHero } from "./store";
import { returnedSave } from "./services-contract";
import { waitLabel } from "./farm";
import { fmt } from "./ui";
import {
  declareGuildWar, guildWarError, loadGuildWar, reportGuildWarAttack, claimGuildWarReward,
  type GuildWarHistory, type GuildWarState, type WarEnemy,
} from "./guild-wars";
import type { StartBattle } from "./panels";

const asClass = (c: string): HeroClass => (c === "mage" || c === "archer" ? c : "warrior");
const asGender = (g: string): "male" | "female" => (g === "female" ? "female" : "male");

interface EnemyRow {
  id: string;
  name: string;
  hero_class: string;
  gender: string;
  level: number;
  stats: Stats & { paragon?: number };
}
interface OpenGuild { id: string; name: string; level: number }

/** Attacks every hero may make against one enemy hero during a war. */
const ATTACKS_PER_ENEMY = 2;

/**
 * Guild Wars: declare war on another guild, then fight its members. Each member may attack each
 * enemy hero twice; a won fight is a point for the guild, and the higher score when the 24 hours
 * run out takes the bigger reward — the losing side is still paid.
 */
export function GuildWars({ heroId, guildId, role, start }: {
  heroId: string | null;
  guildId: string;
  role?: string;
  start: StartBattle;
}) {
  const { hero } = useGame();
  const [state, setState] = useState<GuildWarState | null>(null);
  const [enemyStats, setEnemyStats] = useState<Record<string, EnemyRow>>({});
  const [guilds, setGuilds] = useState<OpenGuild[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [, setTick] = useState(0);

  // A live countdown while a war runs.
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const canDeclare = role === "leader" || role === "officer";

  const load = async () => {
    if (!heroId) return;
    setBusy(true);
    setError(null);
    try {
      const next = await loadGuildWar(heroId);
      setState(next);
      const ids = next.war?.enemies.map((e) => e.id) ?? [];
      if (ids.length) {
        const { data } = await supabase.from("heroes").select("id,name,hero_class,gender,level,stats").in("id", ids);
        setEnemyStats(Object.fromEntries(((data ?? []) as unknown as EnemyRow[]).map((h) => [h.id, h])));
      } else {
        setEnemyStats({});
      }
      if (!next.war && canDeclare) {
        const { data } = await supabase.from("guilds").select("id,name,level").neq("id", guildId).order("level", { ascending: false }).limit(30);
        setGuilds((data ?? []) as OpenGuild[]);
      }
    } catch (e) {
      setError(guildWarError(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void load(); }, [heroId, guildId]);

  const declare = async (target: OpenGuild) => {
    if (!heroId) return;
    setBusy(true);
    setMsg(null);
    try {
      await declareGuildWar(heroId, target.id);
      setMsg({ ok: true, t: `War declared on ${target.name} — 24 hours to out-score them.` });
      await load();
    } catch (e) {
      setMsg({ ok: false, t: guildWarError(e) });
    } finally {
      setBusy(false);
    }
  };

  const fight = async (enemy: WarEnemy) => {
    const war = state?.war;
    if (!heroId || !war) return;
    const row = enemyStats[enemy.id];
    if (!row) {
      setMsg({ ok: false, t: "That hero's battle data is still loading — try again in a moment." });
      return;
    }
    const cls = asClass(row.hero_class ?? enemy.hero_class);
    const st = row.stats;
    start({
      title: `Guild War · ${enemy.name}`,
      auto: true,
      right: {
        name: enemy.name, img: CLASSES[cls].img, gender: asGender(row.gender ?? enemy.gender),
        hp: st.hp, atk: st.atk, def: st.def, crit: st.crit, dodge: st.dodge ?? 5,
        critDmg: st.critDmg ?? 200, pen: st.pen ?? 0, acc: st.acc ?? 0,
        level: row.level + (st.paragon ?? 0), cls, mirror: true,
      },
      onResult: async (won) => {
        const lines = [won ? "Victory — a war point for your guild!" : "Defeat — no point this time."];
        try {
          await flushSave();
          const r = await reportGuildWarAttack(heroId, war.id, enemy.id, won);
          lines.push(`War score ${r.my_score} : ${r.their_score}`);
          lines.push(r.attacks_left > 0
            ? `${r.attacks_left} attack left on ${enemy.name}`
            : `No attacks left on ${enemy.name}`);
        } catch (e) {
          lines.push(guildWarError(e));
        }
        void load();
        return { lines };
      },
    });
  };

  const claim = (war: GuildWarHistory) => {
    if (!heroId) return;
    setBusy(true);
    setMsg(null);
    void withServerHero(async (id) => {
      const out = await claimGuildWarReward(id, war.id);
      adoptServerSave(id, returnedSave(out.save));
      const mats = Object.entries(out.mats ?? {});
      setMsg({
        ok: true,
        t: `Spoils claimed: +${fmt(out.gold)} gold${mats.length ? ` and ${mats.map(([k, v]) => `${v} ${k}`).join(", ")}` : ""}`,
      });
      await load();
    }).catch((e) => setMsg({ ok: false, t: guildWarError(e) })).finally(() => setBusy(false));
  };

  const war = state?.war ?? null;
  const history = state?.history ?? [];
  const remaining = war ? new Date(war.ends_at).getTime() - Date.now() : 0;
  const myScore = war?.my_score ?? 0;
  const theirScore = war?.their_score ?? 0;

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-display text-xl text-gold">Guild Wars</h4>
        <Button variant="outline" size="icon" aria-label="Refresh guild war" disabled={busy} onClick={() => void load()}><RefreshCw /></Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-hp/60 bg-hp/10 px-3 py-2 text-sm text-hp">{error}</p>
      )}
      {msg && <p role="status" className={`anim-pop text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</p>}

      {!war && (
        <div className="slot p-4 text-sm">
          <div className="font-display text-gold">No war is running</div>
          <p className="mt-1 text-xs text-muted-foreground">
            A guild war runs for 24 hours. Every member can attack each enemy hero twice; a won
            fight is a point, and the guild with more points when the war ends takes the larger
            reward. The losing guild is still paid.
          </p>
          {canDeclare ? (
            <div className="mt-3">
              <div className="font-display text-sm">Declare war on</div>
              {guilds.length === 0 && <p className="text-xs text-muted-foreground">No other guilds to challenge yet.</p>}
              <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {guilds.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5">
                    <span className="min-w-0">
                      <span className="block truncate font-display">{g.name}</span>
                      <span className="block text-[10px] text-muted-foreground">Guild level {g.level}</span>
                    </span>
                    <Button size="sm" variant="outline" disabled={busy}
                      onClick={() => { if (window.confirm(`Declare war on ${g.name}? It runs for 24 hours.`)) void declare(g); }}>
                      <Flag className="mr-1 h-3.5 w-3.5" />Declare
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Only the leader or an officer can declare a war.</p>
          )}
        </div>
      )}

      {war && (
        <div className="slot p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-display text-lg">
              <Shield className="h-4 w-4 text-gold" />
              <span className="text-gold">{war.opponent?.name ?? "Enemy guild"}</span>
            </div>
            <span className="text-xs text-muted-foreground">War ends in <b className="text-foreground">{waitLabel(remaining)}</b></span>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Your guild</div>
              <div className="font-display text-4xl text-gold">{myScore}</div>
            </div>
            <span className="font-display text-lg text-muted-foreground">:</span>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">They</div>
              <div className="font-display text-4xl text-blood">{theirScore}</div>
            </div>
          </div>
          <div className="bar-track mt-2 h-2.5" role="progressbar" aria-label="War score" aria-valuemin={0}
            aria-valuemax={Math.max(1, myScore + theirScore)} aria-valuenow={myScore}>
            <div className="farm-bar h-full" style={{ width: `${Math.round((myScore / Math.max(1, myScore + theirScore)) * 100)}%` }} />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between gap-2 font-display text-sm">
              <span>Enemy roster</span>
              <span className="text-xs font-normal text-muted-foreground">Each hero can be attacked {ATTACKS_PER_ENEMY} times by you</span>
            </div>
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {(war.enemies ?? []).length === 0 && <p className="text-xs text-muted-foreground">The enemy guild has no members to fight.</p>}
              {(war.enemies ?? []).map((e) => {
                const left = Math.max(0, ATTACKS_PER_ENEMY - e.attacks);
                return (
                  <div key={e.id} className="flex items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-display">{e.name}</span>
                      <span className="block text-[11px] text-muted-foreground">Lv {e.level} · {fmt(e.power)} power · {left} attack{left === 1 ? "" : "s"} left</span>
                    </span>
                    <Button size="sm" disabled={left < 1 || busy || !hero}
                      title={left < 1 ? "You have used both attacks on this hero" : `Attack ${e.name}`}
                      onClick={() => void fight(e)}>
                      <Swords className="mr-1 h-3.5 w-3.5" />{left < 1 ? "Spent" : "Attack"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="slot p-4">
        <div className="mb-2 flex items-center gap-2 font-display text-sm text-gold"><Trophy className="h-4 w-4" />War ledger</div>
        {history.length === 0 && <p className="text-xs text-muted-foreground">No finished wars yet.</p>}
        <div className="space-y-1.5">
          {history.map((h) => (
            <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5 text-sm">
              <span className="min-w-0">
                <span className="block truncate">
                  vs <b className="text-gold">{h.opponent ?? "a guild"}</b> ·{" "}
                  <span className={h.result === "win" ? "text-r1" : h.result === "loss" ? "text-hp" : "text-r4"}>
                    {h.result === "win" ? "VICTORY" : h.result === "loss" ? "DEFEAT" : "DRAW"}
                  </span>
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {h.my_score} : {h.their_score} · {new Date(h.ends_at).toLocaleString()}
                </span>
              </span>
              {h.claimed
                ? <span className="text-xs text-muted-foreground">Spoils claimed</span>
                : <Button size="sm" className="btn-gold" disabled={busy} onClick={() => claim(h)}>
                    <Trophy className="mr-1 h-3.5 w-3.5" />Claim spoils
                  </Button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
