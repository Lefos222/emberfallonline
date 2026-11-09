import { useEffect, useState } from "react";
import { Check, Clock, Flag, RefreshCw, ScrollText, Shield, Swords, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CLASSES, type HeroClass, type Stats } from "./data";
import { adoptServerSave, flushSave, useGame, withServerHero } from "./store";
import { returnedSave } from "./services-contract";
import { waitLabel } from "./farm";
import { fmt } from "./ui";
import {
  WAR_ATTACKS,
  WAR_SIZES,
  cancelGuildWar,
  claimGuildWarReward,
  declareGuildWar,
  guildWarError,
  loadGuildWar,
  reportGuildWarAttack,
  respondGuildWar,
  warBracket,
  warSpoils,
  type GuildWarChallenge,
  type GuildWarHistory,
  type GuildWarState,
  type WarEnemy,
  type WarSize,
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
interface OpenGuild {
  id: string;
  name: string;
  level: number;
}

/** A short, friendly line of spoils for the ledger and the reward table. */
const spoilsLine = (size: number, result: "win" | "loss" | "draw", level: number) => {
  const s = warSpoils(size, result, level);
  const mats = Object.entries(s.mats);
  return `+${fmt(s.gold)} gold${mats.length ? ` · ${mats.map(([k, v]) => `${v} ${k}`).join(", ")}` : ""}`;
};

/**
 * Guild Wars. A leader or officer challenges another guild in a bracket from 5v5 to 100v100; the
 * challenged guild accepts or declines. Once accepted both rosters are frozen, every hero gets two
 * attacks for the whole war, and a won attack scores a point. Most points when the 24 hours are up
 * wins — and both sides are still paid, the winner more.
 */
export function GuildWars({
  heroId,
  guildId,
  role,
  start,
}: {
  heroId: string | null;
  guildId: string;
  role?: string;
  start: StartBattle;
}) {
  const { hero } = useGame();
  const [state, setState] = useState<GuildWarState | null>(null);
  const [enemyStats, setEnemyStats] = useState<Record<string, EnemyRow>>({});
  const [guilds, setGuilds] = useState<OpenGuild[]>([]);
  const [size, setSize] = useState<WarSize>(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [, setTick] = useState(0);

  // A live countdown while a war runs.
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const canManage = role === "leader" || role === "officer";

  const load = async () => {
    if (!heroId) return;
    setBusy(true);
    setError(null);
    try {
      const next = await loadGuildWar(heroId);
      setState(next);
      const ids = next.war?.enemies.map((e) => e.id) ?? [];
      if (ids.length) {
        const { data } = await supabase
          .from("heroes")
          .select("id,name,hero_class,gender,level,stats")
          .in("id", ids);
        setEnemyStats(
          Object.fromEntries(((data ?? []) as unknown as EnemyRow[]).map((h) => [h.id, h])),
        );
      } else {
        setEnemyStats({});
      }
      if (!next.war && canManage) {
        const { data } = await supabase
          .from("guilds")
          .select("id,name,level")
          .neq("id", guildId)
          .order("level", { ascending: false })
          .limit(30);
        setGuilds((data ?? []) as OpenGuild[]);
      }
    } catch (e) {
      setError(guildWarError(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
  }, [heroId, guildId]);

  const declare = async (target: OpenGuild) => {
    if (!heroId) return;
    setBusy(true);
    setMsg(null);
    try {
      await declareGuildWar(heroId, target.id, size);
      setMsg({
        ok: true,
        t: `Challenge sent to ${target.name} — a ${warBracket(size)} war starts as soon as they accept it.`,
      });
      await load();
    } catch (e) {
      setMsg({ ok: false, t: guildWarError(e) });
    } finally {
      setBusy(false);
    }
  };

  const answer = async (c: GuildWarChallenge, accept: boolean) => {
    if (!heroId) return;
    setBusy(true);
    setMsg(null);
    try {
      await respondGuildWar(heroId, c.id, accept);
      setMsg({
        ok: true,
        t: accept
          ? `War accepted — ${warBracket(c.size)} against ${c.guild?.name ?? "them"} is live for 24 hours.`
          : `Challenge from ${c.guild?.name ?? "that guild"} declined.`,
      });
      await load();
    } catch (e) {
      setMsg({ ok: false, t: guildWarError(e) });
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (c: GuildWarChallenge) => {
    if (!heroId) return;
    setBusy(true);
    setMsg(null);
    try {
      await cancelGuildWar(heroId, c.id);
      setMsg({ ok: true, t: "Challenge withdrawn." });
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
        name: enemy.name,
        img: CLASSES[cls].img,
        gender: asGender(row.gender ?? enemy.gender),
        hp: st.hp,
        atk: st.atk,
        def: st.def,
        crit: st.crit,
        dodge: st.dodge ?? 5,
        critDmg: st.critDmg ?? 200,
        pen: st.pen ?? 0,
        acc: st.acc ?? 0,
        level: row.level + (st.paragon ?? 0),
        cls,
        mirror: true,
      },
      onResult: async (won) => {
        const lines = [
          won ? "Victory — a war point for your guild!" : "Defeat — no point this time.",
        ];
        try {
          await flushSave();
          const r = await reportGuildWarAttack(heroId, war.id, enemy.id, won);
          lines.push(`War score ${r.my_score} : ${r.their_score}`);
          lines.push(
            r.attacks_left > 0
              ? `${r.attacks_left} of your ${WAR_ATTACKS} attacks left in this war`
              : `Both of your ${WAR_ATTACKS} attacks are spent`,
          );
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
    })
      .catch((e) => setMsg({ ok: false, t: guildWarError(e) }))
      .finally(() => setBusy(false));
  };

  const war = state?.war ?? null;
  const challenges = state?.challenges ?? [];
  const incoming = challenges.filter((c) => !c.outgoing);
  const outgoing = challenges.filter((c) => c.outgoing);
  const history = state?.history ?? [];
  const remaining = war ? new Date(war.ends_at).getTime() - Date.now() : 0;
  const myScore = war?.my_score ?? 0;
  const theirScore = war?.their_score ?? 0;
  const myAttacksLeft = war?.attacks_left ?? WAR_ATTACKS;
  const level = hero?.level ?? 1;

  return (
    <div className="mt-5 space-y-4">
      {/* Header + the three-step explainer, so a new member knows what to do. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="flex items-center gap-2 font-display text-xl text-gold">
            <Flag className="h-5 w-5" />
            Guild Wars
          </h4>
          <p className="text-xs text-muted-foreground">
            Declare war in a 5v5 – 100v100 bracket · the other guild accepts or declines · every
            hero gets {WAR_ATTACKS} attacks and a won attack scores a point · most points in 24
            hours wins.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh guild war"
          disabled={busy}
          onClick={() => void load()}
        >
          <RefreshCw />
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-hp/60 bg-hp/10 px-3 py-2 text-sm text-hp"
        >
          {error}
        </p>
      )}
      {msg && (
        <p role="status" className={`anim-pop text-sm ${msg.ok ? "text-r1" : "text-hp"}`}>
          {msg.t}
        </p>
      )}

      {/* Challenges: the most actionable thing on the screen comes first. */}
      {(incoming.length > 0 || outgoing.length > 0) && (
        <div className="slot p-4">
          <div className="mb-2 flex items-center gap-2 font-display text-sm text-gold">
            <ScrollText className="h-4 w-4" />
            Challenges
          </div>
          <div className="space-y-1.5">
            {incoming.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-gold/50 bg-gold/5 px-2 py-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate">
                    <b className="text-gold">{c.guild?.name ?? "A guild"}</b> challenges you to a{" "}
                    <b>{warBracket(c.size)}</b> war
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Expires in {waitLabel(new Date(c.expires_at).getTime() - Date.now())} · leader
                    or officer answers
                  </span>
                </span>
                {canManage ? (
                  <span className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      className="btn-gold"
                      disabled={busy}
                      onClick={() => void answer(c, true)}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void answer(c, false)}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Decline
                    </Button>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Waiting for a leader or officer
                  </span>
                )}
              </div>
            ))}
            {outgoing.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 px-2 py-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate">
                    Waiting on <b className="text-gold">{c.guild?.name ?? "a guild"}</b> to answer
                    your <b>{warBracket(c.size)}</b> challenge
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    Expires in {waitLabel(new Date(c.expires_at).getTime() - Date.now())}
                  </span>
                </span>
                {canManage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => void withdraw(c)}
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {war && (
        <div className="slot p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-display text-lg">
              <Shield className="h-4 w-4 text-gold" />
              <span className="text-gold">{war.opponent?.name ?? "Enemy guild"}</span>
              <span className="rounded border border-gold/50 px-1.5 py-0.5 text-[11px] text-gold">
                {warBracket(war.size)}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              War ends in <b className="text-foreground">{waitLabel(remaining)}</b>
            </span>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Your guild
              </div>
              <div className="font-display text-4xl text-gold">{myScore}</div>
            </div>
            <span className="font-display text-lg text-muted-foreground">:</span>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">They</div>
              <div className="font-display text-4xl text-blood">{theirScore}</div>
            </div>
          </div>
          <div
            className="bar-track mt-2 h-2.5"
            role="progressbar"
            aria-label="War score"
            aria-valuemin={0}
            aria-valuemax={Math.max(1, myScore + theirScore)}
            aria-valuenow={myScore}
          >
            <div
              className="farm-bar h-full"
              style={{
                width: `${Math.round((myScore / Math.max(1, myScore + theirScore)) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 px-2.5 py-2 text-sm">
            <span>
              Your attacks this war:{" "}
              <b className="text-gold">
                {myAttacksLeft} of {WAR_ATTACKS} left
              </b>
            </span>
            <span className="text-[11px] text-muted-foreground">
              A won attack scores 1 point · both teams are paid when the war ends
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between gap-2 font-display text-sm">
              <span>
                Enemy roster · {war.enemies?.length ?? 0}/{war.size}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Attack any of them — each win is a point
              </span>
            </div>
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {(war.enemies ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  The enemy guild has no fighters on this war's roster.
                </p>
              )}
              {(war.enemies ?? []).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-display">{e.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      Lv {e.level} · {fmt(e.power)} power
                      {e.attacks > 0 ? ` · you hit them ${e.attacks}×` : ""}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    disabled={myAttacksLeft < 1 || busy || !hero}
                    title={
                      myAttacksLeft < 1 ? "Both of your attacks are spent" : `Attack ${e.name}`
                    }
                    onClick={() => void fight(e)}
                  >
                    <Swords className="mr-1 h-3.5 w-3.5" />
                    {myAttacksLeft < 1 ? "Spent" : "Attack"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* What each side takes home from a bracket this size. */}
          <div className="mt-3 grid gap-1.5 text-[11px] sm:grid-cols-3">
            {(["win", "draw", "loss"] as const).map((r) => (
              <div
                key={r}
                className={`rounded border px-2 py-1.5 ${r === "win" ? "border-gold/50" : "border-border/60"}`}
              >
                <b className={r === "win" ? "text-gold" : r === "loss" ? "text-hp" : "text-r4"}>
                  {r === "win" ? "Victory" : r === "draw" ? "Draw" : "Defeat"}
                </b>
                <span className="block text-muted-foreground">
                  {spoilsLine(war.size, r, level)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!war && !outgoing.length && (
        <div className="slot p-4 text-sm">
          <div className="font-display text-gold">Declare a new war</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a bracket, then the guild you want to fight. Their leader or officer can accept or
            decline; an accepted war runs for 24 hours and pays both sides.
          </p>
          {canManage ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 text-xs font-bold text-muted-foreground">Bracket</div>
                <div className="flex flex-wrap gap-1">
                  {WAR_SIZES.map((n) => (
                    <button
                      key={n}
                      className={`px-2 py-1 text-xs ${size === n ? "btn-gold" : "btn-ghost"}`}
                      onClick={() => setSize(n)}
                      aria-pressed={size === n}
                    >
                      {warBracket(n)}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Each side fields its {size} strongest members · every hero gets {WAR_ATTACKS}{" "}
                  attacks
                </p>
              </div>
              <div>
                <div className="mb-1 text-xs font-bold text-muted-foreground">Challenge</div>
                {guilds.length === 0 && (
                  <p className="text-xs text-muted-foreground">No other guilds to challenge yet.</p>
                )}
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {guilds.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-display">{g.name}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          Guild level {g.level}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Challenge ${g.name} to a ${warBracket(size)} war? It runs 24 hours once they accept.`,
                            )
                          )
                            void declare(g);
                        }}
                      >
                        <Flag className="mr-1 h-3.5 w-3.5" />
                        Challenge
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Only the leader or an officer can declare a war.
            </p>
          )}
        </div>
      )}

      <div className="slot p-4">
        <div className="mb-2 flex items-center gap-2 font-display text-sm text-gold">
          <Trophy className="h-4 w-4" />
          War ledger
        </div>
        {history.length === 0 && (
          <p className="text-xs text-muted-foreground">No finished wars yet.</p>
        )}
        <div className="space-y-1.5">
          {history.map((h) => (
            <div
              key={h.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 px-2 py-1.5 text-sm"
            >
              <span className="min-w-0">
                <span className="block truncate">
                  vs <b className="text-gold">{h.opponent ?? "a guild"}</b> · {warBracket(h.size)} ·{" "}
                  <span
                    className={
                      h.result === "win" ? "text-r1" : h.result === "loss" ? "text-hp" : "text-r4"
                    }
                  >
                    {h.result === "win" ? "VICTORY" : h.result === "loss" ? "DEFEAT" : "DRAW"}
                  </span>
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {h.my_score} : {h.their_score} · {new Date(h.ends_at).toLocaleString()}
                </span>
              </span>
              {h.claimed ? (
                <span className="text-xs text-muted-foreground">Spoils claimed</span>
              ) : (
                <Button
                  size="sm"
                  className="btn-gold"
                  disabled={busy}
                  title={spoilsLine(h.size, h.result, level)}
                  onClick={() => claim(h)}
                >
                  <Trophy className="mr-1 h-3.5 w-3.5" />
                  Claim spoils
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
