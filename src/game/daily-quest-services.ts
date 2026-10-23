import { supabase } from '@/integrations/supabase/client';
import { adoptServerSave, withServerHero } from './store';
import { returnedSave } from './services-contract';
import { dailyQuestSchema } from './daily-quests';
import type { ProfessionId } from './professions';

export async function readDailyQuests(heroId: string) {
  const { data, error } = await supabase.rpc('daily_profession_quests', { _hero: heroId });
  if (error) throw new Error(error.message);
  return dailyQuestSchema.parse(data);
}
export async function claimDailyQuest(profession: ProfessionId) {
  return withServerHero(async id => {
    const { data, error } = await supabase.rpc('claim_daily_profession', { _hero: id, _profession: profession });
    if (error) throw new Error(error.message);
    adoptServerSave(id, returnedSave(data));
  });
}