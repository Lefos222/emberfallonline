import { describe, expect, it } from 'vitest';
import { TREES, learnBlocker, talentSkills, type TalentState } from '@/game/talents';
import { SKILLS } from '@/game/data';
import { buildKit } from '@/game/combat';
import { effectFor, moveFor } from '@/game/skillAnim';

describe('endless specialization branches', () => {
  for (const cls of ['warrior', 'mage', 'archer'] as const) {
    for (const spec of TREES[cls]) {
      const branch = spec.talents.find(t => t.tier === 5);
      if (!branch?.ability) throw new Error('Missing endless ability');
      const ability = branch.ability;
      const talents = Object.fromEntries(spec.talents.filter(t => t.tier < 5).map(t => [t.id, t.max]));
      const h: TalentState = { cls, level: 90, paragon: 10, spec: spec.id, talents, road: { cleared: 200, best: 200 } };
      it(`${spec.name} ability is learnable without milestone, spec or tier gates`, () => {
        expect(learnBlocker({ ...h, road: { cleared: 90, best: 0 } }, branch.id)).toBeNull();
        expect(learnBlocker(h, branch.id)).toBeNull();
        expect(learnBlocker({ ...h, spec: undefined }, branch.id)).toBeNull();
        expect(talentSkills(SKILLS[cls], h).some(s => s.id === ability.id)).toBe(false);
        const learned = { ...h, talents: { ...talents, [branch.id]: 1 } };
        const kit = buildKit(cls, talentSkills(SKILLS[cls], learned));
        expect(kit.filter(s => s.id === ability.id)).toHaveLength(1);
        expect(kit.find(s => s.id === ability.id)?.cd).toBe(ability.cd);
        expect(effectFor(ability.id)).not.toBeNull();
        expect(moveFor({ cls }, ability.id)).toBeDefined();
      });
    }
  }
  it('keeps area attacks, armor penetration and evasion in the real combat kit', () => {
    const skills = Object.values(TREES).flat().flatMap(s => s.talents.flatMap(t => t.ability ? [t.ability] : []));
    const kit = buildKit(undefined, skills);
    for (const id of ['cyclone', 'solar', 'winter', 'tempest']) expect(kit.find(s => s.id === id)?.target).toBe('all');
    expect(kit.find(s => s.id === 'horizon')?.penBonus).toBe(40);
    expect(kit.find(s => s.id === 'eclipse')?.selfApplies).toEqual({ kind: 'evade', turns: 2, value: 30 });
  });
});