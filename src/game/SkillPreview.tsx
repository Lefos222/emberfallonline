import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterModel } from './CharacterModel';
import { CombatEffect, WeaponArc } from './BattleArt';
import { buildKit } from './combat';
import { effectFor, moveFor } from './skillAnim';
import type { HeroClass } from './data';
import type { Talent } from './talents';

/** A presentation-only preview: never starts a battle or awards progression. */
export function SkillPreview({ talent, cls, gender, locked }: { talent: Talent; cls: HeroClass; gender: 'male' | 'female'; locked: string | null }) {
  const [replay, setReplay] = useState(0);
  if (!talent.ability) return null;
  const ability = talent.ability;
  const skill = buildKit(cls, [ability]).find(s => s.id === ability.id);
  if (!skill) return null;
  const move = moveFor({ cls }, ability.id);
  const effect = effectFor(ability.id) ?? 'arcane';
  const range = skill.target === 'all' ? 'All enemies' : skill.target === 'self' ? 'Self' : skill.target === 'multi' ? `Up to ${skill.maxTargets} enemies` : 'One enemy';
  return <section className="mt-4 border-t border-border pt-4" aria-label="Ability preview">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-display text-lg text-gold">{ability.name}</h3>
      <Button variant="outline" size="sm" onClick={() => setReplay(n => n + 1)}><Play className="h-4 w-4" />Replay animation</Button>
    </div>
    <div className="mt-3 grid items-center gap-4 sm:grid-cols-[240px_1fr]">
      <div className="relative flex h-56 items-end justify-center overflow-hidden bg-muted/30" key={replay}>
        <div className={`relative h-48 w-32 anim-${move}`}><CharacterModel cls={cls} gender={gender} className="h-full" /><WeaponArc move={move} /></div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-28"><CombatEffect kind={effect} /></div>
      </div>
      <div className="space-y-2 text-sm">
        <p>{skill.desc}</p>
        <p className="text-gold">{range} · {skill.hits ?? 1} hit{(skill.hits ?? 1) > 1 ? 's' : ''} · {skill.cost} resource · {skill.cd} turn cooldown</p>
        <p>{Math.round(skill.mult * 100)}% damage per hit{skill.stun ? ' · Stun' : ''}{skill.heal ? ` · Heals ${Math.round(skill.heal * 100)}%` : ''}</p>
        <p className={locked ? 'text-muted-foreground' : 'text-gold'}>{locked ?? 'Ready to learn'}</p>
      </div>
    </div>
  </section>;
}