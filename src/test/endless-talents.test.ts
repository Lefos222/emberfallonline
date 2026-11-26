import { describe, expect, it } from 'vitest';
import { TREES, learnBlocker, type TalentState } from '@/game/talents';

describe('endless specialization branches', () => {
  for (const cls of ['warrior', 'mage', 'archer'] as const) {
    for (const spec of TREES[cls]) {
      const branch = spec.talents.find(t => t.tier === 5);
      if (!branch) throw new Error('Missing tier-5 talent');
      // Every talent is passive now — no ability field, just fx.
      if (!branch.fx) throw new Error('Tier-5 talent must have passive fx');
      const talents = Object.fromEntries(spec.talents.filter(t => t.tier < 5).map(t => [t.id, t.max]));
      const h: TalentState = { cls, level: 90, paragon: 10, spec: spec.id, talents };
      it(`${spec.name} tier-5 is learnable without milestone, spec or tier gates`, () => {
        expect(learnBlocker(h, branch.id)).toBeNull();
        expect(learnBlocker({ ...h, spec: undefined }, branch.id)).toBeNull();
        // Learning it grants passive stat bonuses.
        expect(branch.fx.atkPct ?? branch.fx.defPct ?? branch.fx.hpPct ?? branch.fx.critDmg).toBeTruthy();
      });
    }
  }
  it('every talent node has passive fx (no active abilities remain)', () => {
    for (const specs of Object.values(TREES)) {
      for (const spec of specs) {
        for (const t of spec.talents) {
          expect(t.fx, `${t.id} should have fx`).toBeDefined();
          expect((t as { ability?: unknown }).ability).toBeUndefined();
        }
      }
    }
  });
});
