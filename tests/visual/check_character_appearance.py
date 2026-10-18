"""Run with python3 tests/visual/check_character_appearance.py against the local preview.
Uses isolated copies of game state: no session, cloud mutations or saved-player edits.
Screenshots are written only to /tmp/browser/appearance-regression.
"""
import asyncio
import io
import numpy as np
from PIL import Image
from pathlib import Path
from playwright.async_api import async_playwright

OUTPUT = Path('/tmp/browser/appearance-regression')

async def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 1800})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto('http://localhost:8080/auth', wait_until='networkidle')
        await page.evaluate('''async () => {
          const React = await import('/node_modules/.vite/deps/react.js');
          const DOM = await import('/node_modules/.vite/deps/react-dom_client.js');
          const { CharacterModel } = await import('/src/game/CharacterModel.tsx');
          const { BattleCharacter } = await import('/src/game/BattleArt.tsx');
          const { newHero, makeItem, equipItem, heroStats } = await import('/src/game/data.ts');
          const { recordRoadClear } = await import('/src/game/longroad.ts');
          const { initBattle } = await import('/src/game/combat.ts');
          const cases = [];
          for (const cls of ['warrior', 'mage', 'archer']) for (const gender of ['male', 'female']) {
            const hero = newHero('Visual check', cls);
            const weapon = makeItem(cls, 90, 2, 'weapon'); hero.inventory.push(weapon);
            equipItem(hero, weapon);
            hero.stage = 91; hero.road = { stage: 91, wave: 1, best: 0, cleared: 90 };
            const progressed = recordRoadClear(hero, { mode: 'road', value: 91 });
            if (progressed.cls !== cls || progressed.road.cleared !== 91) throw Error('Progression identity mismatch');
            const unit = initBattle({ ...heroStats(progressed), name: 'Visual check', img: '', level: 90, cls, gender }, []).units[0];
            for (const state of ['creation', 'equipment', 'progression', 'idle', 'swing', 'cast', 'hit', 'block', 'death', 'victory']) {
              const motion = state === 'idle' ? 'anim-idle' : state === 'death' ? 'battle-death' : state === 'victory' ? 'battle-victory' : `anim-${state}`;
              cases.push(React.default.createElement('div', {key: `${cls}-${gender}-${state}`, 'data-case': `${cls}-${gender}-${state}`, className: `battle-unit relative h-48 w-32 ${motion}`},
                ['creation', 'equipment', 'progression'].includes(state)
                  ? React.default.createElement(CharacterModel, {cls, gender, className: 'h-full'})
                  : React.default.createElement(BattleCharacter, {u: unit})));
            }
          }
          const host = document.createElement('div'); host.id = 'appearance-cases';
          host.className = 'fixed inset-0 z-50 grid grid-cols-10 gap-2 overflow-auto bg-background p-4';
          document.body.appendChild(host); DOM.default.createRoot(host).render(React.default.createElement(React.default.Fragment, null, ...cases));
        }''')
        await page.wait_for_timeout(1200)
        await page.add_style_tag(content='#appearance-cases *, #appearance-cases { animation: none !important; transform: none !important; filter: none !important; }')
        for cls in ['warrior', 'mage', 'archer']:
            for gender in ['male', 'female']:
                baseline = None
                for state in ['creation', 'equipment', 'progression', 'idle', 'swing', 'cast', 'hit', 'block', 'death', 'victory']:
                    model = page.locator(f'[data-case="{cls}-{gender}-{state}"] [data-character-model]')
                    assert await model.get_attribute('data-character-model') == f'{cls}-{gender}'
                    image = await model.screenshot(path=str(OUTPUT / f'{cls}-{gender}-{state}.png'))
                    if baseline is None: baseline = image
                    actual = np.array(Image.open(io.BytesIO(image))).astype(float)
                    expected = np.array(Image.open(io.BytesIO(baseline))).astype(float)
                    assert actual.shape == expected.shape, f'Model dimensions changed: {cls}-{gender}-{state}'
                    assert np.abs(actual - expected).mean() < 0.1, f'Appearance changed: {cls}-{gender}-{state}'
        assert not errors, errors
        print('PASS: 60 appearance cases; six identities match across equipment, progression and combat states.')
        print('Motion is disabled for identity comparison; animation choreography requires a separate live check.')
        await browser.close()

asyncio.run(main())