import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Supplemental real pointer/touch/UI checks. The installed web-game action client
// separately verifies the keyboard opening. Only the public normal time hook is used.
const base=process.argv[2]??'http://localhost:4184';
const output=path.resolve('output/live-qa-browser');
await fs.mkdir(output,{recursive:true});
const launchOptions={headless:true,args:['--use-gl=angle','--use-angle=swiftshader']};
if(!existsSync(chromium.executablePath()))launchOptions.channel='chrome';
let browser=await chromium.launch(launchOptions);
const context=await browser.newContext({viewport:{width:1672,height:940},deviceScaleFactor:1});
await context.addInitScript(()=>localStorage.setItem('ringwarden-local-v1','{malformed'));
const page=await context.newPage();
let activePage=page;
const errors=[],records=[];
const s=async(target=page)=>JSON.parse(await target.evaluate(()=>window.render_game_to_text()));
const tick=(ms,target=page)=>target.evaluate(ms=>window.advanceTime(ms),ms);
function track(target){
  target.on('pageerror',e=>errors.push(String(e)));
  target.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  target.on('request',request=>{
    const url=request.url();
    if(/^https?:/.test(url)&&new URL(url).origin!==new URL(base).origin)errors.push(`external runtime request: ${new URL(url).origin}`);
  });
}
track(page);
async function ready(target=page){
  activePage=target;
  await target.bringToFront();
  await target.goto(`${base}/?test`,{waitUntil:'networkidle'});
  // Force an ordinary compositor frame before inspecting asset diagnostics.
  await target.screenshot({animations:'disabled'});
  // A second headless mobile context can defer animation frames until capture.
  // Poll diagnostics on the host timer, then request an ordinary zero-time draw;
  // this does not advance combat or modify the player's plan.
  const deadline=Date.now()+40_000;
  let value;
  while(Date.now()<deadline){
    value=await target.evaluate(()=>typeof window.render_game_to_text==='function'?JSON.parse(window.render_game_to_text()):null);
    if(value?.version===2&&value.renderer?.assets.thorn==='loaded'&&value.renderer?.assets.beetle==='loaded')break;
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.equal(value?.renderer?.assets.thorn,'loaded','thorn asset loads');
  assert.equal(value?.renderer?.assets.beetle,'loaded','beetle asset loads');
  await tick(0,target);
  assert.equal((await s(target)).loaded,true,'ordinary zero-time draw reports readiness');
}
async function save(name,target=page){
  const state=await s(target);records.push({name,state});
  await fs.writeFile(path.join(output,`${name}.json`),JSON.stringify(state,null,2));
  await target.screenshot({path:path.join(output,`${name}.png`),animations:'disabled'});
  return state;
}
async function startDrag(id,target=page){
  const grip=(await s(target)).renderer.grips.find(g=>g.id===id);
  assert.ok(grip,`rendered grip ${id}`);
  assert.ok(grip.dragTarget.width>=44&&grip.dragTarget.height>=44);
  await target.mouse.move(grip.x,grip.y);await target.mouse.down();
  assert.equal((await s(target)).draggingId,id,'real handle hit begins drag');
  return grip;
}
async function grow(id,{release=true,target=page}={}){
  const grip=await startDrag(id,target);
  const end={x:grip.center.x+(grip.x-grip.center.x)*3,y:grip.center.y+(grip.y-grip.center.y)*3};
  await target.mouse.move(end.x,end.y,{steps:12});
  assert.equal((await s(target)).wards.find(w=>w.id===id).r,2,'outward drag reaches affordable cap');
  if(release)await target.mouse.up();
}
async function frameObservation(target=page){
  const intervals=await target.evaluate(async()=>{
    const times=[];let request;
    await new Promise(resolve=>{
      const stop=setTimeout(resolve,2500);
      function frame(t){times.push(t);if(times.length>=31){clearTimeout(stop);resolve();}else request=requestAnimationFrame(frame);}
      request=requestAnimationFrame(frame);
    });
    cancelAnimationFrame(request);
    return times.slice(1).map((t,i)=>t-times[i]);
  });
  const sorted=[...intervals].sort((a,b)=>a-b),state=await s(target);
  return {context:'bounded 2.5-second headless software WebGL observation; manual simulation, background scheduling possible; not native FPS',samples:sorted.length,medianFrameMs:sorted[Math.floor(sorted.length/2)]??null,p95FrameMs:sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]??null,renderer:state.renderer};
}
try{
  let state,performance=null;
  if(!process.env.RINGWARDEN_TOUCH_ONLY){
  await ready();state=await save('00-actionable-opening');
  assert.equal(state.mode,'running');assert.equal(state.time,0);assert.equal(state.muted,false);
  assert.equal(state.wards[0].r,1);assert.equal(state.enemies[0].hp,8);
  assert.ok(state.stocks.conduit>6.28&&state.stocks.floor>9.42);
  assert.equal(await page.locator('input').count(),0,'no radius/diameter form');
  assert.equal(await page.locator('#commit,#site-controls').count(),0,'no setup ceremony');
  assert.equal(await page.locator('#primary').isVisible(),false);

  await grow('A',{release:false});await tick(2650);
  state=await save('01-affordable-drag-first-hit');
  assert.equal(state.mode,'running');assert.equal(state.wards[0].r,2);
  assert.equal(state.enemies[0].hp,6);assert.equal(await page.locator('#cost-readout').innerText(),'C = 4π m · A = 4π m²');assert.equal(state.stocks.conduit,0);assert.equal(state.stocks.floor,0);
  assert.equal(await page.locator('#drag-readout').isVisible(),true);
  await page.mouse.up();
  assert.equal((await s()).draggingId,null);
  assert.equal(await page.locator('#drag-readout').isVisible(),false,'costs leave with pointer release');
  performance=await frameObservation();records.push({name:'frame-observation',...performance});

  // Keyboard equivalent can change paid reach live without resetting the shot clock.
  const shot=(await s()).wards[0].lastShotTime;
  await page.locator('#garden').focus();
  for(let i=0;i<4;i++)await page.keyboard.press('ArrowDown');
  for(let i=0;i<4;i++)await page.keyboard.press('ArrowUp');
  state=await s();assert.equal(state.wards[0].r,2);assert.equal(state.wards[0].lastShotTime,shot);
  assert.equal(state.enemies[0].hp,6);
  await page.locator('#pause').click();
  const paused=await s();assert.equal(paused.mode,'paused');
  await tick(10_000);assert.equal((await s()).time,paused.time);
  await page.keyboard.press('ArrowDown');assert.equal((await s()).wards[0].r,1.75);
  await grow('A');assert.equal((await s()).mode,'paused');
  await save('02-paused-live-control');
  const camera=paused.renderer.camera;
  await page.setViewportSize({width:1200,height:800});
  await page.waitForTimeout(100);
  assert.deepEqual((await s()).renderer.camera.position,camera.position);
  assert.deepEqual((await s()).renderer.camera.target,camera.target);
  assert.equal((await s()).mode,'paused');
  await page.locator('#garden').focus();await page.keyboard.press('f');
  await page.waitForFunction(()=>Boolean(document.fullscreenElement),null,{timeout:5000});
  assert.equal(await page.evaluate(()=>Boolean(document.fullscreenElement)),true);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>document.fullscreenElement?document.exitFullscreen():undefined);
  await page.setViewportSize({width:1672,height:940});
  await page.locator('#pause').click();assert.equal((await s()).mode,'running');
  await page.locator('#help').click();assert.equal((await s()).mode,'paused');
  await page.locator('#close-help').click();assert.equal((await s()).mode,'running');
  assert.equal((await s()).helpUses,1);

  // Blur during a real captured drag releases input and safely pauses combat.
  await startDrag('A');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.equal((await s()).draggingId,null);assert.equal((await s()).mode,'paused');
  await page.mouse.up();await page.locator('#primary').click();
  await tick(13_000);state=await save('03-first-encounter-clear');
  assert.equal(state.mode,'interlude');assert.equal(state.killed,3);assert.equal(state.coreHealth,3);
  await tick(2300);state=await s();assert.equal(state.stage,1);assert.equal(state.mode,'running');
  assert.deepEqual(state.wards.map(w=>w.r),[2,1]);
  assert.deepEqual(state.wards.map(w=>[w.x,w.z]),[[0,0],[0,2.2]]);
  await page.locator('#garden').focus();await page.keyboard.press('b');await page.keyboard.press('ArrowUp');
  assert.equal((await s()).selectedId,'B');assert.equal((await s()).wards[1].r,1.25);
  await tick(7000);state=await save('04-second-approach-live');
  assert.match(await page.locator('#cost-readout').innerText(),/A ≈ 1\.563π m²/,'rounded coefficient is approximate, not exact');
  assert.ok(Math.abs(state.stocks.conduit-1.5*Math.PI)<1e-8);
  assert.ok(Math.abs(state.stocks.floor-2.4375*Math.PI)<1e-8);

  // Deliberately shorten the second defense: real mistake, leak, fix-before-rewind.
  await page.locator('#garden').focus();await page.keyboard.press('ArrowDown');
  assert.equal((await s()).wards[1].r,1);
  await tick(20_000);state=await save('05-second-approach-leak');
  assert.equal(state.mode,'leak');assert.equal(state.coreHealth,2);assert.equal(state.leaks.length,1);
  assert.ok(state.killed>0);const frozenTime=state.time;
  await grow('B');state=await s();assert.equal(state.mode,'leak');assert.equal(state.time,frozenTime);
  assert.equal(state.wards[1].r,2);assert.equal(state.retries,0);
  await save('06-corrected-plan-before-recovery');
  await page.locator('#primary').click();state=await save('07-retained-plan-encounter-restart');
  assert.equal(state.stage,1);assert.equal(state.mode,'running');assert.equal(state.time,0);
  assert.equal(state.coreHealth,3);assert.equal(state.totalKilled,3);assert.equal(state.killed,0);
  assert.equal(state.retries,1);assert.deepEqual(state.wards.map(w=>w.r),[2,2]);
  await tick(60_000);state=await save('08-two-approaches-defended');
  assert.equal(state.mode,'won');assert.equal(state.totalKilled,13);assert.equal(state.leaks.length,0);
  assert.equal(state.pending,0);assert.equal(state.enemies.length,0);

  // Independently exercise the unchanged opening mistake and one-action retained fix.
  await ready();await tick(20_000);state=await save('09-opening-leak');
  assert.equal(state.mode,'leak');assert.equal(state.leaks[0].hp,2);assert.equal(state.coreHealth,2);
  await grow('A');await page.locator('#primary').click();
  assert.equal((await s()).wards[0].r,2);assert.equal((await s()).time,0);assert.equal((await s()).retries,1);
  await tick(2650);state=await save('10-opening-recovery-hit');assert.equal(state.enemies[0].hp,6);

  }

  // Same physical gesture on a touch-enabled mobile viewport; no synthetic win state.
  // Release the software WebGL desktop context before mobile; this keeps the
  // mobile check independent of accumulated headless compositor scheduling.
  await context.close();await browser.close();
  browser=await chromium.launch(launchOptions);
  const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const touch=await mobile.newPage();track(touch);await ready(touch);
  const grip=(await s(touch)).renderer.grips[0],cdp=await mobile.newCDPSession(touch);
  const end={x:grip.center.x+(grip.x-grip.center.x)*3,y:grip.center.y+(grip.y-grip.center.y)*3};
  assert.ok(grip.x>=0&&grip.x<=390&&grip.y>=0&&grip.y<=844);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:grip.x,y:grip.y,id:1,radiusX:8,radiusY:8,force:1}]});
  for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:grip.x+(end.x-grip.x)*i/12,y:grip.y+(end.y-grip.y)*i/12,id:1,radiusX:8,radiusY:8,force:1}]});
  assert.equal((await s(touch)).wards[0].r,2);assert.equal((await s(touch)).draggingId,'A');
  await tick(2650,touch);state=await save('11-touch-first-hit',touch);assert.equal(state.enemies[0].hp,6);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal((await s(touch)).draggingId,null);
  await touch.locator('#pause').tap();assert.equal((await s(touch)).mode,'paused');
  await touch.locator('#mute').tap();assert.equal((await s(touch)).muted,true);
  await touch.locator('#mute').tap();assert.equal((await s(touch)).muted,false);
  await mobile.close();activePage=page;
  assert.deepEqual(errors,[],'no console/page/load errors');
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify({result:'passed',url:base,scope:process.env.RINGWARDEN_TOUCH_ONLY?'touch-only':'desktop-and-touch',viewport:[1672,940],errors,records,performance},null,2));
  console.log(JSON.stringify({result:'passed',output,captures:records.filter(r=>r.state).length,performance}));
}catch(error){
  await activePage.screenshot({path:path.join(output,'failure.png'),animations:'disabled'}).catch(()=>{});
  await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({error:String(error),errors,state:await s(activePage).catch(()=>null),records},null,2));
  throw error;
}finally{await browser.close();}
