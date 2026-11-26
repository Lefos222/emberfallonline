import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Battle } from '../game/Battle';
import { Bestiary } from '../game/Bestiary';
import { newHero, stageFoe } from '../game/data';
import { getState, setHero } from '../game/store';
import { rosterProgress } from '../game/bestiary';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

afterEach(() => { setHero(null); vi.useRealTimers(); });

describe('battle discovery reads back through the Bestiary', () => {
  it('opens an enemy encounter and reveals it before any victory', async () => {
    setHero(newHero('Collector', 'warrior'));
    const foe = stageFoe(1);
    const left = { ...foe, name: 'Collector', cls: 'warrior' as const };
    const onEnd = vi.fn();
    const battle = render(<Battle left={left} right={foe} onEnd={onEnd} />);
    expect(getState().hero?.kills?.['encounter:enemy:Goblin%20Brute']).toBe(0);
    expect(onEnd).not.toHaveBeenCalled();
    battle.unmount();
    const hero = getState().hero;
    if (!hero) throw new Error('Missing collector save');
    render(<Bestiary h={hero} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Discovery'), { target: { value: 'seen' } });
    expect(screen.getByRole('heading', { name: 'Goblin Brute' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Goblin Brute' })).toBeInTheDocument();
  });

  it('wins a real auto-battle and reads one recorded defeat back from the save', async () => {
    vi.useFakeTimers();
    setHero(newHero('Collector', 'warrior'));
    const foe = { ...stageFoe(1), hp: 1, def: 0, dodge: 0, atk: 1 };
    const left = { ...foe, name: 'Collector', cls: 'warrior' as const, hp: 1000, atk: 10000, dodge: 100 };
    const onEnd = vi.fn(async () => {});
    const battle = render(<Battle left={left} right={foe} onEnd={onEnd} auto />);
    for (let i = 0; i < 20 && !onEnd.mock.calls.length; i++) {
      await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    }
    expect(onEnd).toHaveBeenCalledExactlyOnceWith(true, expect.objectContaining({ foe: expect.any(Number), hero: expect.any(Number) }));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    const hero = getState().hero;
    if (!hero) throw new Error('Missing collector save');
    expect(rosterProgress(hero, 'encounter:enemy:Goblin%20Brute')).toEqual({ state: 'defeated', count: 1 });
    battle.unmount();
    render(<Bestiary h={hero} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Discovery'), { target: { value: 'defeated' } });
    expect(screen.getByRole('heading', { name: 'Goblin Brute' })).toBeInTheDocument();
    expect(screen.getByText('Defeated · 1 kills')).toBeInTheDocument();
  });
});
