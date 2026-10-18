"""Non-destructive real RPC checks; requires a minted session and completed journey."""
import asyncio,json,os
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':1280,'height':1800})
  page=await context.new_page()
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:minted=json.load(f)
  cookies=minted.get('cookies') or []
  if cookies:await context.add_cookies([{**c,'url':'http://localhost:8080'} for c in cookies])
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[minted['storage_key'],json.dumps(minted['session'])])
  await page.reload();await page.wait_for_timeout(1000)
  result=await page.evaluate('''async()=>{
    const {supabase}=await import('/src/integrations/supabase/client.ts');
    const {data:user}=await supabase.auth.getUser();if(!user.user)throw Error('No session');
    const {data:heroes,error}=await supabase.from('heroes').select('id,save').eq('user_id',user.user.id);
    if(error)throw Error('Character read failed');
    const hero=heroes.find(h=>h.save.srv?.gathering?.history?.length);if(!hero)throw Error('Complete a journey before running these checks');
    const before=hero.save.srv.gathering;const req=before.history[0].request;
    const replay=await Promise.all([supabase.rpc('finish_gathering',{_hero:hero.id,_req:req}),supabase.rpc('finish_gathering',{_hero:hero.id,_req:req})]);
    if(replay.some(r=>r.error||!r.data.repeat))throw Error('Replay not recognized');
    const state=await supabase.rpc('profession_state',{_hero:hero.id});
    if(JSON.stringify(state.data.save.srv.gathering)!==JSON.stringify(before))throw Error('Replay changed progression');
    const foreign=await supabase.rpc('profession_state',{_hero:crypto.randomUUID()});if(!foreign.error)throw Error('Foreign character accepted');
    const invalid=await supabase.rpc('begin_gathering',{_hero:hero.id,_req:crypto.randomUUID(),_profession:null,_area:null});if(!invalid.error)throw Error('Null journey accepted');
    const unknown=await supabase.rpc('finish_gathering',{_hero:hero.id,_req:crypto.randomUUID()});if(!unknown.error)throw Error('Unknown journey accepted');
    return {replay:true,concurrentReplay:true,ownership:true,nullInputs:true,unknownRequest:true};
  }''')
  assert all(result.values());print('PASS: concurrent replay unchanged, ownership rejected, null inputs rejected, unknown finish rejected')
  await browser.close()
asyncio.run(main())
