import { supabase } from '@/integrations/supabase/client';
import { adoptServerSave, withServerHero } from './store';
import { returnedSave } from './services-contract';
import { dailyQuestSchema } from './daily-quests';
import { z } from 'zod';

export async function readDailyQuests(heroId: string) {
  const { data, error } = await supabase.rpc('daily_boss_board', { _hero: heroId });
  if (error) throw new Error(error.message);
  return dailyQuestSchema.parse(data);
}
export async function openDailyBoss(boss: number) {
  return withServerHero(async id => {
    const { data, error } = await supabase.rpc('daily_boss_open', { _hero: id, _boss: boss });
    if (error) throw new Error(error.message);
    const run = z.object({ id: z.string().uuid(), version: z.number().int(), boss: z.number().int() }).parse(data);
    adoptServerSave(id, returnedSave(data));
    return run;
  });
}
export async function syncDailyBossSave() {
  // No save flush before reading an already settled battle reward.
  const { getState } = await import('./store');
  const id = getState().heroId;
  if (!id) throw new Error('Select a character first');
  const { data, error } = await supabase.from('heroes').select('save').eq('id', id).single();
  if (error || !data) throw new Error('Reconnect to read your quest reward');
  adoptServerSave(id, returnedSave(data.save));
}
