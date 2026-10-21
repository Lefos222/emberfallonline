import { supabase } from '@/integrations/supabase/client';
import { adoptServerSave, withServerHero } from './store';
import { requestKey, returnedSave } from './services-contract';
import { guildStateSchema } from './guild-events';

export async function loadGuildEvents(heroId: string) {
  const { data, error } = await supabase.rpc('guild_supply_state', { _hero: heroId });
  if (error) throw new Error(error.message);
  return guildStateSchema.parse(data);
}
export async function contributeGuildSupply(event: string, resource: string, quantity: number) {
  return withServerHero(async id => {
    const operation = `guild-supply:${event}:${resource}:${quantity}`;
    const req = requestKey(localStorage, id, operation, () => crypto.randomUUID());
    const { data, error } = await supabase.rpc('guild_supply_contribute', { _hero: id, _event: event, _resource: resource, _quantity: quantity, _req: req });
    if (error) throw new Error(error.message);
    adoptServerSave(id, returnedSave(data));
    localStorage.removeItem(`ef-pending:${id}:${operation}`);
  });
}
export async function claimGuildEvent(event: string) {
  return withServerHero(async id => {
    const { data, error } = await supabase.rpc('guild_supply_claim', { _hero: id, _event: event });
    if (error) throw new Error(error.message);
    adoptServerSave(id, returnedSave(data));
  });
}