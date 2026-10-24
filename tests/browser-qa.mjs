import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Supplemental DOM, pointer, resize and touch coverage. The installed web-game
// action client remains the required keyboard choreography smoke check.
const origin = process.argv[2] ?? 'http://localhost:4184';
const output = path.resolve('output/qa-browser');
await fs.mkdir(output, {recursive:true});
const browser = await chromium.launch({headless:true, args:['--use-gl=angle','--use-angle=swiftshader']});
const context = await browser.newContext({viewport:{width:1672,height:940},deviceScaleFactor:1});
await context.addInitScript(() => localStorage.setItem('ringwarden-local-v1', '{malformed'));
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => {if(m.type()==='error') errors.push(m.text());});
const records = [];
let frameObservation = null;
const state = async () => JSON.parse(await page.evaluate(() => window.render_game_to_text()));
const tick = ms => page.evaluate(ms => window.advanceTime(ms), ms);
async function save(name) {
  const current = await state();
  records.push({name,state:current});
  await fs.writeFile(path.join(output, `${name}.json`), JSON.stringify(current,null,2));
  await page.screenshot({path:path.join(output,`${name}.png`)});
  return current;
}
async function build(plan) {
  for(const [site,r,type='thorn'] of plan) {
    await page.locator(`[data-site="${site}"]`).click();
    await page.locator('#radius').fill(String(r));
    await page.locator('#radius').press('Tab');
    if(type==='resin') await page.locator('#resin').click();
    await page.locator('#commit').click();
    const ward=(await state()).wards.find(w=>w.siteId===site);
    assert.equal(ward?.r,r,`committed ${site} radius`);
    assert.equal(ward?.type,type);
  }
}
try {
  await page.goto(`${origin}/?test`, {waitUntil:'networkidle'});
  await page.waitForFunction(() => typeof window.render_game_to_text==='function');
  assert.equal((await state()).mode,'build');
  assert.equal((await state()).muted,false);
  await page.waitForFunction(() => {
    const s=JSON.parse(window.render_game_to_text());
    return s.renderer?.assets.thorn==='loaded' && s.renderer?.assets.beetle==='loaded';
  }, null, {timeout:40_000});
  await save('01-build');

  // Pointer hit on the actual ground site, then a real failure and recovery.
  await page.locator('#garden').click({position:{x:836,y:470}});
  assert.equal((await state()).selectedSite,'A');
  await build([['A',1]]);
  await page.locator('#primary').click(); await tick(60_000);
  assert.equal((await state()).mode,'lost');
  assert.equal((await state()).leaked,3);
  await save('02-leak');
  await page.locator('#primary').click();
  assert.equal((await state()).coreHealth,3);
  await page.locator('[data-site="A"]').click();
  await page.locator('#diameter').fill('4'); await page.locator('#diameter').press('Tab');
  assert.equal((await state()).preview.r,2);
  await page.locator('#commit').click();
  await page.locator('#primary').click(); await tick(5050);
  const combat = await save('03-combat');
  assert.equal(combat.mode,'combat'); assert.equal(combat.enemies[0].hp,6);
  const intervals=await page.evaluate(async()=>{
    const stamps=[]; for(let i=0;i<61;i++) await new Promise(resolve=>requestAnimationFrame(t=>{stamps.push(t);resolve();}));
    return stamps.slice(1).map((t,i)=>t-stamps[i]);
  });
  const sorted=[...intervals].sort((a,b)=>a-b);
  frameObservation={name:'headless-frame-observation',context:'opening combat, manual simulation time, one enemy',medianFrameMs:sorted[30],p95FrameMs:sorted[57],renderer:(await state()).renderer};
  records.push(frameObservation);
  assert.equal(await page.locator('#build-controls').isVisible(),false);
  await page.locator('#pause').click(); const paused=await state();
  await tick(10_000); assert.equal((await state()).time,paused.time);
  await save('04-paused');
  await page.locator('#pause').click(); await tick(60_000);
  assert.equal((await state()).mode,'cleared'); assert.equal((await state()).leaked,0);
  await save('05-recovered');

  // Real camera drag, selection/resize preservation, reset and fullscreen.
  await page.mouse.move(700,500); await page.mouse.down({button:'right'});
  await page.mouse.move(900,570,{steps:12}); await page.mouse.up({button:'right'});
  await page.waitForTimeout(800);
  const camera=(await state()).renderer.camera;
  await page.locator('[data-site="B"]').click();
  await page.waitForTimeout(100);
  const selectedCamera=(await state()).renderer.camera;
  assert.ok(Math.hypot(...camera.position.map((v,i)=>v-selectedCamera.position[i]))<.05);
  await page.setViewportSize({width:1200,height:800});
  await page.waitForTimeout(100);
  assert.equal((await state()).mode,'cleared');
  const resizedCamera=(await state()).renderer.camera;
  assert.ok(Math.hypot(...camera.position.map((v,i)=>v-resizedCamera.position[i]))<.05);
  await page.locator('#camera').click();
  await page.locator('#garden').focus(); await page.keyboard.press('f');
  assert.equal(await page.evaluate(()=>Boolean(document.fullscreenElement)),true);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>document.fullscreenElement ? document.exitFullscreen() : undefined);
  await page.setViewportSize({width:1672,height:940});

  const plans = [
    [['A',2],['B',2]],
    [['A',1],['B',1],['C',1],['D',1]],
    [['A',1.5],['B',1.5],['C',1.5],['D',1.5]],
    [['A',.75],['B',.75],['C',1.25],['D',1.25]],
  ];
  for(let i=0;i<plans.length;i++) {
    await page.locator('#primary').click(); await build(plans[i]);
    await page.locator('#primary').click(); await tick(180_000);
    const s=await save(`0${i+6}-wave-${i+2}`);
    assert.equal(s.mode,i===3?'won':'cleared'); assert.equal(s.leaked,0);
  }
  await page.locator('#primary').click();
  await build(plans[3]); await page.locator('#primary').click(); await tick(180_000);
  assert.equal((await state()).mode,'lost');
  assert.equal((await state()).killed,0);
  const first=(await state()).firstRematch;
  await save('10-old-plan-fails-rematch');
  await page.locator('#primary').click();
  for(const site of ['A','B','C','D']) {
    await page.locator(`[data-site="${site}"]`).click(); await page.locator('#sell').click();
  }
  await build([['F',1],['G',1],['H',1],['I',1]]);
  await page.locator('#primary').click(); await tick(180_000);
  assert.equal((await state()).mode,'won'); assert.equal((await state()).leaked,0);
  assert.deepEqual((await state()).firstRematch,first);
  await save('11-revised-rematch-wins');

  assert.deepEqual(errors,[]);

  const mobile = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const touch = await mobile.newPage();
  await touch.goto(`${origin}/?test`,{waitUntil:'networkidle'});
  await touch.locator('[data-site="A"]').tap();
  await touch.locator('#larger').tap(); await touch.locator('#larger').tap();
  await touch.locator('#larger').tap(); await touch.locator('#larger').tap();
  await touch.locator('#commit').tap(); await touch.locator('#primary').tap();
  await touch.evaluate(()=>window.advanceTime(5050));
  const mobileState=JSON.parse(await touch.evaluate(()=>window.render_game_to_text()));
  assert.equal(mobileState.wards[0].r,2); assert.equal(mobileState.enemies[0].hp,6);
  await touch.screenshot({path:path.join(output,'12-touch-combat.png')});
  await fs.writeFile(path.join(output,'12-touch-combat.json'),JSON.stringify(mobileState,null,2));
  await mobile.close();
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({url:origin,viewport:[1672,940],errors,records},null,2));
  console.log(JSON.stringify({result:'passed',captures:12,output,frameObservation}));
} catch(error) {
  await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
  await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({error:String(error),errors,state:await state().catch(()=>null)},null,2));
  throw error;
} finally { await browser.close(); }
