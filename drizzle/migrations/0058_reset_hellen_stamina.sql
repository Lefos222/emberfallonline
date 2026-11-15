-- Reset Hellen's daily stamina to a full bar and her Stamina Potion drinks to 5/5 for today.
-- Only `used` and `potions` are cleared; the potions she carries (`staminaPotions`) are untouched.
UPDATE public.heroes
SET save = jsonb_set(
      save,
      '{stamina}',
      coalesce(save->'stamina', '{}'::jsonb) || jsonb_build_object('used', 0, 'potions', 0),
      true
    ),
    updated_at = now()
WHERE lower(name) = 'hellen';
