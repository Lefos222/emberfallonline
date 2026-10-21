import { describe, expect, it } from 'vitest';
import { canClaimGuildEvent, eligibleGuildResource, guildStateSchema, type GuildEvent } from '../game/guild-events';
const event: GuildEvent = { id: 'siege', name: 'Walls', story: '', professions: ['mining','logging'], target: 20, scroll: 'def', progress: 20, personal: 1, claimed: false };
describe('Guild event eligibility', () => {
  it('requires completion and a personal contribution', () => {
    expect(canClaimGuildEvent(event)).toBe(true);
    expect(canClaimGuildEvent({ ...event, progress: 19 })).toBe(false);
    expect(canClaimGuildEvent({ ...event, personal: 0 })).toBe(false);
  });
  it('prevents a second claim', () => expect(canClaimGuildEvent({ ...event, claimed: true })).toBe(false));
  it('accepts only matching real resource keys', () => {
    expect(eligibleGuildResource(event, 'mining:0:0')).toBe(true);
    expect(eligibleGuildResource(event, 'logging:4:3')).toBe(true);
    for (const key of ['fishing:0:0','mining:5:0','mining:0:4','mining:0','mining:0:0:1']) expect(eligibleGuildResource(event, key)).toBe(false);
  });
  it('rejects incomplete server replies', () => expect(guildStateSchema.safeParse({ events: [event] }).success).toBe(false));
});