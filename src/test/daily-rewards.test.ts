import { describe, expect, it } from 'vitest';
import { dailyLoginItems } from '../game/daily-rewards';
import { readFileSync } from 'node:fs';

describe('daily login item rewards',()=>{
  it('grants real materials, gems and scroll items',()=>{
    expect(dailyLoginItems('warrior',1)).toEqual({mats:{ore:5,fragment:2,starshard:1},gems:{'ruby:1':1},scrolls:{dmg:1}});
    expect(dailyLoginItems('mage',2).gems).toEqual({'amethyst:1':1});
    expect(dailyLoginItems('archer',3).gems).toEqual({'topaz:1':1});
    expect(dailyLoginItems('warrior',2).scrolls).toEqual({def:1});
    expect(dailyLoginItems('warrior',3).scrolls).toEqual({xp:1});
    expect(dailyLoginItems('warrior',4).scrolls).toEqual({dmg:1});
  });
  it('retains online ownership, one daily claim and existing seven-day shot rewards',()=>{
    const sql=readFileSync('drizzle/migrations/0009_daily_login_inventory_items.sql','utf8');
    expect(sql).toContain('public._my_hero(_hero)');
    expect(sql).toContain('ON CONFLICT DO NOTHING RETURNING 1 INTO ok');
    expect(sql).toContain("RAISE EXCEPTION 'Already claimed today'");
    expect(sql).toContain("IF streak%7 = 0 THEN rw := rw || jsonb_build_object('shots',1)");
    expect(sql).toContain('public._apply_reward(h.save,rw)');
    expect(sql).toContain("'ore',5,'fragment',2,'starshard',1");
  });
});