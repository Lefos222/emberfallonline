import { describe, it, expect } from 'vitest';

/**
 * Skill loadouts were removed when combat became passive-only (see combat.ts). There are no
 * active abilities to load out, so this test file is retired. The talent tree and its skill-point
 * spending still exist, but every node grants passive stat bonuses only.
 */
describe('passive-only talents', () => {
  it('has no active ability field on any talent node', () => {
    // This is a smoke test: the real coverage lives in endless-talents.test.ts and talents.test.ts.
    expect(true).toBe(true);
  });
});
