import { beforeEach, describe, expect, it, vi } from 'vitest';
import { newHero } from '@/game/data';

const fake = vi.hoisted(() => ({ hero: {} as unknown, rpc: vi.fn(), adopt: vi.fn(), serial: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: fake.rpc } }));
vi.mock('@/game/store', () => ({
  getState: () => ({ heroId: 'character-1', hero: fake.hero }),
  withServerHero: async (action: (id: string) => Promise<unknown>) => { fake.serial(); return action('character-1'); },
  adoptServerSave: fake.adopt,
}));
import { beginScrollBattle, activateScroll } from '@/game/services';

describe('scroll consumption safety', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); fake.hero = { ...newHero('Test', 'warrior'), srv: { buffs: { dmg: 10 } } }; });
  it('adopts the returned save and confirmed kinds after one charge request', async () => {
    const save = { ...newHero('Test', 'warrior'), srv: { buffs: { dmg: 9 } } };
    fake.rpc.mockResolvedValue({ data: { active: ['dmg'], save }, error: null });
    expect(await beginScrollBattle()).toEqual(['dmg']);
    expect(fake.rpc).toHaveBeenCalledExactlyOnceWith('begin_battle', { _hero: 'character-1' });
    expect(fake.serial).toHaveBeenCalledOnce();
    expect(fake.adopt).toHaveBeenCalledWith('character-1', save);
    expect(localStorage.getItem('ef-scroll-battle:character-1')).toBeNull();
  });
  it('does not retry a possibly committed charge after a lost response', async () => {
    fake.rpc.mockResolvedValue({ data: null, error: { message: 'network failure' } });
    await expect(beginScrollBattle()).rejects.toThrow('will not retry');
    await expect(beginScrollBattle()).rejects.toThrow('interrupted');
    expect(fake.rpc).toHaveBeenCalledOnce();
    expect(fake.adopt).not.toHaveBeenCalled();
  });
  it('does not consume charges when no buffs remain', async () => {
    fake.hero = { ...newHero('Test', 'warrior'), srv: { buffs: { dmg: 0 } } };
    expect(await beginScrollBattle()).toEqual([]);
    expect(fake.rpc).not.toHaveBeenCalled();
  });
  it('blocks repeat activation of the same active scroll', async () => {
    await expect(activateScroll('dmg')).rejects.toThrow('already active');
    expect(fake.rpc).not.toHaveBeenCalled();
  });
});