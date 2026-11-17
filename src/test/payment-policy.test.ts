import {describe,it,expect,vi} from 'vitest';
import {DIAMOND_PACKS,GOLD_PACKS,BOOST_PRICES,VIP_PLANS} from '@/game/economy';
import {SERVICE_PRICES} from '@/game/economy-services';
import {MOUNTS} from '@/game/mounts';
import {WHEEL_PRICE} from '@/game/wheel';
import {applyCardPurchase,applyDiamondSpend} from '@/game/premium-ledger';
import {newHero} from '@/game/data';
describe('November premium rules',()=>{
 it('raises costs by 10% rounded up, without reducing purchased Diamonds',()=>{
  expect(DIAMOND_PACKS.map(p=>p.diamonds+p.bonus)).toEqual([1200,2700,4400,7800,17000]);
  expect(DIAMOND_PACKS.map(p=>p.priceCents)).toEqual([1209,2419,3629,6049,12099]);
  expect(GOLD_PACKS.map(p=>p.diamonds)).toEqual([61,267,908,2420]);
  expect(VIP_PLANS.map(p=>p.diamonds)).toEqual([142,351,714]);
  expect(BOOST_PRICES).toEqual({xp_surge:165,shard_cache:220,trial_reset:55,stamina_refill:88});
  expect(SERVICE_PRICES).toEqual({gender_card:550,name_card:770,shop_refresh:55,arena_duel:55,black_market_refresh:55});
  expect(MOUNTS.filter(m=>m.diamonds).map(m=>m.diamonds)).toEqual([330,660,990,1430,2200]);
  expect(WHEEL_PRICE).toBe(110);
 });
 it('expires after exactly 30 days and preserves paid time and higher tier',()=>{
  const now=Date.UTC(2026,10,17);
  const first=applyCardPurchase(newHero('Buyer','warrior'),{ref:'first',kind:'vip',vipLevel:3},now);
  expect(Date.parse(first.srv?.premium?.vip?.until ?? '')).toBe(now+30*86400000);
  const second=applyCardPurchase(first,{ref:'second',kind:'vip',vipLevel:1},now+86400000);
  expect(second.srv?.premium?.vip?.level).toBe(3);
  expect(Date.parse(second.srv?.premium?.vip?.until ?? '')).toBe(now+60*86400000);
 });
 it('does not give expired VIP discounts',()=>{
  const h=newHero('Buyer','warrior');h.srv={premium:{balance:100,vip:{level:3,until:'2020-01-01T00:00:00Z'}}};
  expect(applyDiamondSpend(h,{kind:'chest',itemId:'gold'},'request').srv?.premium?.balance).toBe(27);
 });
});
