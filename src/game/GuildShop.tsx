import { useState } from "react";
import { Coins, ArrowUp, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame, update } from "./store";
import { fmt, Gold } from "./ui";
import { MatIcon } from "./MatIcon";
import { MATS } from "./crafting";
import { heroStats } from "./data";
import {
  GUILD_SHOP, GUILD_SKILLS, GUILD_CONTRIB_MIN,
  buyGuildShopItem, contributeGold, guildSkillCost, guildSkillRank, guildSkillBlocker, learnGuildSkill,
} from "./guild-tower";
import { STAT_LABEL } from "./crafting";

function useToast() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const el = msg && <div className={`anim-pop mb-3 text-center font-display ${msg.ok ? "text-r1" : "text-hp"}`}>{msg.t}</div>;
  return [el, (ok: boolean, t: string) => setMsg({ ok, t })] as const;
}

/** Gold → Guild Coins contribution panel. */
export function GuildContribute() {
  const { hero } = useGame();
  const [amount, setAmount] = useState(GUILD_CONTRIB_MIN);
  const [toast, say] = useToast();
  if (!hero) return null;
  const coins = hero.guildCoins ?? 0;
  const doContribute = () => update((h) => {
    const err = contributeGold(h, amount);
    say(!err, err ?? `Contributed ${fmt(amount)} gold → +${fmt(amount)} guild coins!`);
  });
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><Coins className="h-4 w-4" />Guild Coins</span>
        <span className="text-lg">{fmt(coins)}</span>
      </div>
      <p className="text-xs text-muted-foreground">Contribute gold to earn guild coins (1 gold = 1 guild coin). Spend them in the guild shop and skill tower.</p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs">Gold to contribute
          <input type="number" min={GUILD_CONTRIB_MIN} step={1000} value={amount}
            onChange={(e) => setAmount(Math.max(GUILD_CONTRIB_MIN, Number(e.target.value) || GUILD_CONTRIB_MIN))}
            className="mt-1 block w-32 rounded border border-border bg-background p-2" />
        </label>
        <Button disabled={hero.gold < amount} onClick={doContribute}>Contribute <Gold n={amount} /></Button>
      </div>
      {toast}
    </div>
  );
}

/** Guild Shop — buy materials and enchantment stones with guild coins. */
export function GuildShopPanel() {
  const { hero } = useGame();
  const [toast, say] = useToast();
  if (!hero) return null;
  const coins = hero.guildCoins ?? 0;
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><Gem className="h-4 w-4" />Guild Shop</span>
        <span>{fmt(coins)} coins</span>
      </div>
      <p className="text-xs text-muted-foreground">Buy materials and enchantment stones with your guild coins.</p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {GUILD_SHOP.map((item) => (
          <button key={item.id} className="slot flex items-center justify-between gap-2 p-2 text-left text-xs" disabled={coins < item.cost}
            title={item.desc}
            onClick={() => update((h) => { const err = buyGuildShopItem(h, item.id); say(!err, err ?? `Bought ${item.name}!`); })}>
            <span className="flex min-w-0 items-center gap-1.5">
              <MatIcon mat={item.mat} size={18} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-bold text-gold">{fmt(item.cost)} c</span>
          </button>
        ))}
      </div>
      {toast}
    </div>
  );
}

/** Guild Skill Tower — permanent stat upgrades purchased with guild coins. */
export function GuildSkillTower() {
  const { hero } = useGame();
  const [toast, say] = useToast();
  if (!hero) return null;
  const coins = hero.guildCoins ?? 0;
  const s = heroStats(hero);
  return (
    <div className="slot mb-4 p-4">
      <div className="mb-1 flex items-center justify-between gap-2 font-display text-gold">
        <span className="flex items-center gap-2"><ArrowUp className="h-4 w-4" />Guild Skill Tower</span>
        <span>{fmt(coins)} coins</span>
      </div>
      <p className="text-xs text-muted-foreground">Permanent stat upgrades that raise your Battle Rating. Current BR: {fmt(s.power)}.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {GUILD_SKILLS.map((skill) => {
          const rank = guildSkillRank(hero, skill.id);
          const blocker = guildSkillBlocker(hero, skill);
          const cost = guildSkillCost(skill, rank);
          return (
            <div key={skill.id} className="slot p-2 text-sm">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{rank}/{skill.max}</span>
              </div>
              <p className="text-xs text-muted-foreground">{skill.desc}</p>
              <p className="mt-1 text-xs">Current: +{+(skill.per * rank).toFixed(1)}{STAT_LABEL[skill.stat]}</p>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: skill.max }, (_, i) => (
                  <span key={i} className={`h-1.5 w-full rounded ${i < rank ? "bg-gold" : "bg-muted"}`} />
                ))}
              </div>
              <button className="btn-gold mt-2 w-full py-1.5 text-xs" disabled={!!blocker || coins < cost}
                onClick={() => update((h) => { const err = learnGuildSkill(h, skill.id); say(!err, err ?? `Learned ${skill.name} rank ${rank + 1}!`); })}>
                {blocker ?? `Upgrade · ${fmt(cost)} coins`}
              </button>
            </div>
          );
        })}
      </div>
      {toast}
    </div>
  );
}
