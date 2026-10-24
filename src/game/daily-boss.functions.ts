import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { CLASSES, heroSkills, heroStats } from './data';
import { returnedSave } from './services-contract';
import { scrollFighter, isScroll } from './scrolls';
import { dailyBossFoe } from './daily-quests';
import { current, initBattle, formation, playerAct, drinkPotion, enemyAct, type BattleState } from './combat';

export const dailyBossTurn = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ run: z.string().uuid(), version: z.number().int().nonnegative(), request: z.string().uuid(),
    action: z.enum(['resume','skill','potion']), skill: z.string().max(60).optional(), targets: z.array(z.string().max(10)).max(3).default([]),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: run, error } = await context.supabase.from('daily_boss_runs').select('*').eq('id', data.run).single();
    if (error || !run) throw new Error('Daily battle not found');
    const { data: owner } = await context.supabase.from('heroes').select('id').eq('id', run.hero_id).eq('user_id', context.userId).single();
    if (!owner) throw new Error('Character not found');
    if (run.last_request === data.request || run.status !== 'active') {
      if (!run.state) throw new Error('Reopen the daily battle');
      return { state: run.state as unknown as BattleState, version: run.version, events: [] };
    }
    if (run.version !== data.version) throw new Error('Battle changed; reopen to resume');
    const hero = returnedSave(run.snapshot);
    const stats = heroStats(hero);
    const active = Array.isArray(run.active) ? run.active.filter(isScroll) : [];
    let state: BattleState;
    if (run.state) state = structuredClone(run.state) as unknown as BattleState;
    else state = initBattle(scrollFighter({ name: hero.name, img: CLASSES[hero.cls].img, level: hero.level + hero.paragon,
      ...stats, cls: hero.cls, skills: heroSkills(hero), skillLoadout: hero.skillLoadout }, active), formation(dailyBossFoe(hero, run.boss)));
    const events = [] as import('./combat').CEvent[];
    const enemies = () => {
      let guard = 0;
      while (!state.over && current(state)?.side === 'foe' && guard++ < 30) {
        const result = enemyAct(state); if (!result.ok) throw new Error(result.error); events.push(...result.events);
      }
    };
    enemies();
    if (data.action !== 'resume' && !state.over) {
      const result = data.action === 'potion' ? drinkPotion(state) : playerAct(state, data.skill ?? '', data.targets);
      if (!result.ok) throw new Error(result.error);
      events.push(...result.events); enemies();
    }
    // The caller has been verified against the owned run; only this handler resolves combat.
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: committed, error: commitError } = await supabaseAdmin.rpc('daily_boss_commit', {
      _run: run.id, _owner: context.userId, _version: run.version, _request: data.request, _state: state as never,
    });
    if (commitError) throw new Error(commitError.message);
    const value = z.object({ version: z.number(), state: z.unknown() }).parse(committed);
    return { state: value.state as BattleState, version: value.version, events };
  });
