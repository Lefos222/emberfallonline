# Anticheat

The browser saves the hero directly, so the database checks every save a player sends.

## What it catches

| Cheat | Rule |
| --- | --- |
| Battle Rating that the hero's level can't reach (for example 800,000 at level 3) | Battle Rating above `650,000 × level curve × Ascension` |
| Level hacks | Level above 140, below 0, or more than 30 levels in one save |
| Ascension hacks | Ascension before level 140, or more than 30 in one save |
| Gold hacks | More than `100,000 + 40,000 × level` gold in one save, more than four times that in one hour, a negative balance, or over 2,000,000,000 |
| Forged new characters | A new character that isn't fresh (level 0–1, no gold, starter Battle Rating) |
| Diamonds, Lucky Shots, scrolls, VIP | Already server-only: players' saves can't change them (see `srv` in AGENTS.md) |
| Arena rating | Already server-only: only the arena result action can change it |

Rewards paid by the server (auctions, diamond packs, guild rewards, arena) are trusted and never checked.

## What happens to a cheater

1. The save is refused.
2. The character is removed.
3. The player sees a "Cheating detected" warning the next time the hero list loads.
4. The last clean version of the character is kept in `anticheat_quarantine`.

When the migration is first applied, it also scans every existing character and removes the ones that already hold impossible values (`source = 'sweep'`).

## Restoring a character after a false ban

Run in the database (SQL editor or service role):

```sql
-- Find the entry
select id, hero_name, reason, source, created_at from anticheat_quarantine
where restored_at is null order by created_at desc;

-- Put the character back (returns the new hero id; the name gets a suffix if it was taken)
select anticheat_restore('<quarantine id>');
```

`live` entries restore the last clean save from before the cheat. `sweep` entries restore the row exactly as it was found, cheated values included. Fix those values before the player plays again, or the next save is refused.
