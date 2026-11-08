import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, RefreshCw, Swords, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CLASSES, type HeroClass, type Stats } from "./data";
import { CharacterModel } from "./CharacterModel";
import { update, useGame } from "./store";
import { GameTabs, Panel, fmt } from "./ui";
import { goldGain } from "./gold";
import { ARENA_PER_WINDOW, arenaFightsLeft, arenaResetAt, waitLabel } from "./arena-limits";
import type { StartBattle } from "./panels";

interface Opp {
  id: string; user_id: string; name: string; hero_class: string; gender: string;
  level: number; power: number; arena_rating: number; stats: Stats & { paragon?: number };
}
interface Match {
  id: string; attacker_id: string; attacker_name: string; defender_name: string;
  attacker_won: boolean; rating_change: number; created_at: string;
}

const COLS = "id,user_id,name,hero_class,gender,level,power,arena_rating,stats";
const asClass = (c: string): HeroClass => (c === "mage" || c === "archer" ? c : "warrior");
const asGender = (g: string): "male" | "female" => (g === "female" ? "female" : "male");

/**
 * The Blood Arena. Every public hero is listed and every one of them can be challenged — there is
 * no rating bracket any more, so the pit is open to the whole realm — and the same panel carries
 * the full ladder.
 */
export function Arena({ onClose, start }: { onClose: () => void; start: StartBattle }) {
  const { hero, userId, heroId } = useGame();
  const [ladder, setLadder] = useState<Opp[]>([]);
  const [me, setMe] = useState<Opp | null>(null);
  const [history, setHistory] = useState<Match[]>([]);
  const [tab, setTab] = useState<"duels" | "ranks">("duels");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const [all, mine, hist] = await Promise.all([
      supabase.from("heroes").select(COLS).order("arena_rating", { ascending: false }).limit(200),
      supabase.from("heroes").select(COLS).eq("id", heroId ?? "").maybeSingle(),
      supabase.from("arena_matches").select("*").order("created_at", { ascending: false }).limit(8),
    ]);
    setLadder((all.data as unknown as Opp[]) ?? []);
    setMe((mine.data as unknown as Opp) ?? null);
    setHistory((hist.data as Match[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId]);

  if (!hero) return null;
  if (!userId) {
    return (
      <Panel title="Blood Arena" subtitle="Challenge any hero on the ladder" art="goblet" onClose={onClose}>
        <div className="py-10 text-center">
          <Lock className="mx-auto mb-3 h-12 w-12 text-gold" />
          <p className="mb-4 text-muted-foreground">Sign in to fight real players</p>
          <Link to="/auth" className="btn-gold inline-block px-6 py-2">Sign in</Link>
        </div>
      </Panel>
    );
  }

  const fight = (o: Opp) => {
    const cls = asClass(o.hero_class);
    start({
      title: "Blood Arena",
      auto: true,
      arena: true,
      right: { name: o.name, img: CLASSES[cls].img, gender: asGender(o.gender), hp: o.stats.hp, atk: o.stats.atk, def: o.stats.def, crit: o.stats.crit, dodge: o.stats.dodge ?? 5, critDmg: o.stats.critDmg ?? 200, pen: o.stats.pen ?? 0, acc: o.stats.acc ?? 0, level: o.level + (o.stats.paragon ?? 0), cls, mirror: true },
      onResult: async (won, xpMultiplier = 1) => {
        const { data, error } = await supabase.rpc("record_arena_result", { _attacker: heroId ?? "", _defender: o.id, _won: won });
        const lines = [won ? "Victory in the arena!" : "Defeated…"];
        if (!error && typeof data === "number") lines.push(`Rating ${data >= 0 ? "+" : ""}${data}`);
        const gold = won ? goldGain(15 + hero.level * 4) : 0;
        update((h) => { h.gold += gold; });
        if (gold) lines.push(`+${fmt(gold)} gold`);
        void load();
        return { lines };
      },
    });
  };

  const opponents = ladder.filter((o) => o.user_id !== userId);
  const myRank = heroId ? ladder.findIndex((o) => o.id === heroId) + 1 : 0;
  const duelsLeft = arenaFightsLeft(hero);
  const refillIn = waitLabel(arenaResetAt(hero) - Date.now());

  return (
    <Panel title="Blood Arena" subtitle="Ladder, duels and ratings" art="goblet" onClose={onClose} wide>
      <div className="mb-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-display text-lg">
        <span className="flex items-center gap-2"><Trophy className="h-6 w-6 text-r4" /> Rating <span className="text-3xl text-gold">{me?.arena_rating ?? 1000}</span></span>
        {myRank > 0 && <span className="text-sm text-muted-foreground">Rank #{myRank} of {ladder.length}</span>}
        <span className={`text-sm ${duelsLeft > 0 ? "text-muted-foreground" : "text-hp"}`}>
          {duelsLeft > 0
            ? `${duelsLeft}/${ARENA_PER_WINDOW} duels left${duelsLeft < ARENA_PER_WINDOW ? ` · refills in ${refillIn}` : ""}`
            : `No duels left — ${ARENA_PER_WINDOW} every 12h, back in ${refillIn}`}
        </span>
        <button className="btn-blood px-3 py-1 text-sm" onClick={load} aria-label="Refresh arena"><RefreshCw className="inline h-4 w-4" /></button>
      </div>

      <GameTabs label="Arena" value={tab} onChange={setTab} tabs={[
        { id: "duels", name: `Duels (${opponents.length})` },
        { id: "ranks", name: "Leaderboard" },
      ]} />

      {tab === "duels" && (
        <div className="grid max-h-[60vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading && <div className="col-span-full py-10 text-center text-muted-foreground">Seeking challengers…</div>}
          {!loading && opponents.length === 0 && <div className="col-span-full py-10 text-center text-muted-foreground">No other heroes yet — invite friends!</div>}
          {opponents.map((o) => {
            const cls = asClass(o.hero_class);
            return (
              <div key={o.id} className="slot flex flex-col items-center p-2 text-center">
                <CharacterModel cls={cls} gender={asGender(o.gender)} className="h-28" />
                <div className="w-full truncate font-display">{o.name}</div>
                <div className="text-xs text-muted-foreground">Lv {o.level} · {CLASSES[cls].name}</div>
                <div className="text-sm"><Trophy className="inline h-3 w-3 text-r4" /> {fmt(o.power)} · <span className="text-gold">{o.arena_rating}</span></div>
                <button className="btn-gold mt-2 w-full py-1" onClick={() => fight(o)} disabled={duelsLeft < 1} title={duelsLeft > 0 ? "Challenge" : `No duels left — the pit reopens in ${refillIn}`}><Swords className="mr-1 inline h-4 w-4" />Challenge</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "ranks" && (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="max-h-[58vh] overflow-y-auto">
            <div className="mb-1 font-display text-gold">Realm ladder · every hero in the arena</div>
            {ladder.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">{loading ? "Loading the ladder…" : "No heroes ranked yet"}</div>}
            {ladder.map((o, i) => {
              const cls = asClass(o.hero_class);
              const mine = o.id === heroId;
              return (
                <div key={o.id} className={`flex items-center justify-between border-b border-border/40 py-1 text-sm ${mine ? "text-gold" : ""}`}>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-7 shrink-0 text-right font-display">{i + 1}.</span>
                    <span className="truncate">{o.name}{mine ? " (you)" : ""}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">Lv {o.level} · {CLASSES[cls].name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{o.arena_rating}</span>
                </div>
              );
            })}
          </div>
          <div>
            <div className="mb-1 font-display text-gold">Recent fights</div>
            {history.length === 0 && <div className="text-sm text-muted-foreground">None yet</div>}
            {history.map((m) => {
              const mine = m.attacker_id === heroId;
              const won = mine ? m.attacker_won : !m.attacker_won;
              return (
                <div key={m.id} className="flex justify-between text-sm">
                  <span>{mine ? `vs ${m.defender_name}` : `${m.attacker_name} attacked`}</span>
                  <span className={won ? "text-r1" : "text-hp"}>{won ? "WIN" : "LOSS"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Panel>
  );
}
