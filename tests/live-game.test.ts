import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIVE_DT, LIVE_EPS, LIVE_STAGES, createLiveGame, resizeWard, selectWard,
  stepLive, advanceLive, toggleLivePause, rewindLive, beginNext, restartLive,
  liveSummary, liveCost, maxAffordableRadius, type LiveGame,
} from '../src/live-game.ts';

const close = (a:number,b:number,tolerance=LIVE_EPS) => assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
function until(g:LiveGame,predicate:()=>boolean,maxSeconds=90) {
  let ticks=0;
  while(!predicate() && ticks<maxSeconds/LIVE_DT) {stepLive(g);ticks++;}
  assert.ok(predicate(),`condition not reached: stage ${g.stage}, ${g.mode}, t=${g.time}`);
  return ticks*LIVE_DT;
}
function openingClear() {
  const g=createLiveGame();
  assert.equal(resizeWard(g,'A',2),true);
  until(g,()=>g.mode!=='running');
  assert.equal(g.mode,'interlude');
  return g;
}
function secondEncounter() {
  const g=openingClear();
  assert.equal(beginNext(g),true);
  assert.equal(g.stage,1);
  return g;
}
function assertAccount(g:LiveGame) {
  const spent=g.wards.reduce((s,w)=>({conduit:s.conduit+2*Math.PI*w.r,floor:s.floor+Math.PI*w.r**2}),{conduit:0,floor:0});
  close(g.stocks.conduit+spent.conduit,g.budget.conduit);
  close(g.stocks.floor+spent.floor,g.budget.floor);
  assert.ok(g.stocks.conduit>=-LIVE_EPS && g.stocks.floor>=-LIVE_EPS);
}
// Isolated budget fixtures test the general math helper. They are not authored
// playable scarcity challenges or successful combat/win witnesses.
function resourceFixture(g:LiveGame,conduit:number,floor:number) {
  g.budget={conduit,floor};
  const spent=g.wards.reduce((s,w)=>({conduit:s.conduit+liveCost(w.r).conduit,floor:s.floor+liveCost(w.r).floor}),{conduit:0,floor:0});
  g.stocks={conduit:conduit-spent.conduit,floor:floor-spent.floor};
}

test('v2 starts running with visible threat, paid r1 and an affordable useful first growth',()=>{
  const g=createLiveGame();
  assert.equal(g.version,2); assert.equal(g.mode,'running'); assert.equal(g.stage,0);
  assert.equal(g.enemies.length,1); assert.equal(g.enemies[0].hp,8);
  assert.equal(g.enemies[0].x,-3.8); assert.equal(g.wards[0].r,1);
  close(g.stocks.conduit,2*Math.PI); close(g.stocks.floor,3*Math.PI);
  close(maxAffordableRadius(g,'A'),2); assertAccount(g);
  advanceLive(g,200); assert.equal(resizeWard(g,'A',2),true);
  close(g.firstActionTime!,.2); close(g.stocks.conduit,0); close(g.stocks.floor,0);
  advanceLive(g,2600);
  assert.equal(g.mode,'running'); assert.equal(g.enemies[0].hp,6);
  assert.ok(g.wards[0].lastShotTime<5);
  assert.equal(g.wards[0].r,2); assertAccount(g);
});

test('costs, diameter and doubling retain exact independent length/area units',()=>{
  for(const r of [.65,.75,1,1.25,1.5,2]) {
    const c=liveCost(r),double=liveCost(2*r);
    close(c.conduit,2*Math.PI*r); close(c.floor,Math.PI*r**2);
    close(double.conduit,2*c.conduit); close(double.floor,4*c.floor);
  }
  const g=createLiveGame();resizeWard(g,'A',1.25);
  const w=liveSummary(g).wards[0];close(w.d,2*w.r);assertAccount(g);
});

test('invalid ids/radii are rejected; positive input clamps to .65–2 without debt',()=>{
  const g=createLiveGame(),initial=structuredClone(g);
  assert.equal(selectWard(g,'missing'),false);
  assert.equal(resizeWard(g,'missing',2),false);
  assert.equal(maxAffordableRadius(g,'missing'),0);
  for(const r of [NaN,Infinity,-Infinity,0,-1]) assert.equal(resizeWard(g,'A',r),false);
  assert.deepEqual(g,initial);
  assert.equal(resizeWard(g,'A',.1),true);close(g.wards[0].r,.65);assertAccount(g);
  assert.equal(resizeWard(g,'A',100),true);close(g.wards[0].r,2);assertAccount(g);
  assert.ok(g.limitReason.length>0);
  assert.equal(resizeWard(g,'A',100),false);assertAccount(g);
});

test('live shrink/refund/regrow transactions have no rounding drift or double charge',()=>{
  const g=createLiveGame();
  for(let i=0;i<600;i++) {
    resizeWard(g,'A',2);assertAccount(g);
    resizeWard(g,'A',.65);assertAccount(g);
    resizeWard(g,'A',1.38);assertAccount(g);
  }
  resizeWard(g,'A',1);
  close(g.stocks.conduit,2*Math.PI);close(g.stocks.floor,3*Math.PI);
  assert.ok(g.events.length<=500);
});

test('conduit-only synthetic budget clamps growth atomically while floor remains',()=>{
  const g=secondEncounter(); resourceFixture(g,5*Math.PI,10*Math.PI);
  close(maxAffordableRadius(g,'A'),1.5);
  assert.equal(resizeWard(g,'A',2),true);
  close(g.wards[0].r,1.5);close(g.stocks.conduit,0);
  assert.ok(g.stocks.floor>0);assert.match(g.limitReason,/צינור/);assertAccount(g);
});

test('floor-only synthetic budget clamps growth atomically while conduit remains',()=>{
  const g=secondEncounter();resourceFixture(g,10*Math.PI,3.25*Math.PI);
  close(maxAffordableRadius(g,'A'),1.5);
  assert.equal(resizeWard(g,'A',2),true);
  close(g.wards[0].r,1.5);close(g.stocks.floor,0);
  assert.ok(g.stocks.conduit>0);assert.match(g.limitReason,/רצפה/);assertAccount(g);
});

test('resizing and selection never reset cooldown/lastShotTime or create free shots',()=>{
  const g=createLiveGame();resizeWard(g,'A',2);
  until(g,()=>g.enemies[0].hp<8);
  const ward=g.wards[0],shotTime=ward.lastShotTime,cooldown=ward.cooldown;
  assert.equal(g.enemies[0].hp,6);
  for(let i=0;i<100;i++){resizeWard(g,'A',1);selectWard(g,'A');resizeWard(g,'A',2);}
  close(ward.cooldown,cooldown);close(ward.lastShotTime,shotTime);
  assert.equal(g.enemies[0].hp,6);
  for(let i=0;i<59;i++)stepLive(g);
  assert.equal(g.enemies[0].hp,6);
  stepLive(g);assert.equal(g.enemies[0].hp,4);close(ward.lastShotTime-shotTime,1);
});

test('pause freezes combat but permits paid resizing; resuming keeps the encounter',()=>{
  const g=createLiveGame();advanceLive(g,1000);assert.equal(toggleLivePause(g),true);
  const time=g.time,enemy=structuredClone(g.enemies),total=g.totalTime;
  assert.equal(resizeWard(g,'A',2),true);assertAccount(g);
  advanceLive(g,100_000);assert.equal(g.time,time);assert.equal(g.totalTime,total);
  assert.deepEqual(g.enemies,enemy);assert.equal(g.wards[0].lastShotTime,-100);
  assert.equal(toggleLivePause(g),true);advanceLive(g,2000);
  assert.equal(g.mode,'running');assert.equal(g.enemies[0].hp,6);
});

test('unchanged r1 leaks once and freezes immediately with an inspectable route/HP',()=>{
  const g=createLiveGame();until(g,()=>g.mode!=='running');
  assert.equal(g.mode,'leak');assert.equal(g.coreHealth,2);assert.equal(g.leaked,1);
  assert.equal(g.killed,0);assert.equal(g.leaks.length,1);assert.equal(g.leaks[0].hp,2);
  assert.equal(g.leaks[0].route,0);
  const frozen={time:g.time,enemies:structuredClone(g.enemies),core:g.coreHealth,spawn:g.spawnIndex,cd:g.wards[0].cooldown};
  advanceLive(g,180_000);
  assert.equal(g.time,frozen.time);assert.deepEqual(g.enemies,frozen.enemies);
  assert.equal(g.coreHealth,frozen.core);assert.equal(g.spawnIndex,frozen.spawn);close(g.wards[0].cooldown,frozen.cd);
});

test('one rewind retains the corrected paid plan and restores the whole encounter',()=>{
  const g=createLiveGame();until(g,()=>g.mode==='leak');
  assert.equal(resizeWard(g,'A',2),true);assertAccount(g);
  const leakEvents=g.events.filter(e=>e.event==='live-leak').length;
  assert.equal(rewindLive(g),true);
  assert.equal(g.mode,'running');assert.equal(g.time,0);assert.equal(g.coreHealth,3);
  assert.equal(g.wards[0].r,2);assert.equal(g.hasGrown,true);
  assert.equal(g.wards[0].cooldown,0);assert.equal(g.wards[0].lastShotTime,-100);
  assert.equal(g.enemies.length,1);assert.equal(g.enemies[0].hp,8);assert.equal(g.enemies[0].x,-3.8);
  assert.equal(g.spawnIndex,1);assert.equal(g.killed,0);assert.equal(g.totalKilled,0);assert.equal(g.leaked,0);
  assert.equal(g.retries,1);assert.equal(g.events.filter(e=>e.event==='live-leak').length,leakEvents);
  assert.match(liveSummary(g).rewindContract,/current encounter/);assertAccount(g);
  until(g,()=>g.mode!=='running');assert.equal(g.mode,'interlude');assert.equal(g.killed,3);
});

test('opening clears only after all scheduled walkers resolve, then breathes and starts stage 2 automatically',()=>{
  const g=openingClear();
  assert.equal(g.killed,3);assert.equal(g.spawnIndex,3);assert.equal(g.enemies.length,0);assert.equal(g.coreHealth,3);
  assert.equal(g.totalKilled,3);const time=g.totalTime;
  assert.equal(resizeWard(g,'A',1),false);assert.equal(rewindLive(g),false);
  advanceLive(g,2000);assert.equal(g.stage,0);assert.equal(g.mode,'interlude');
  advanceLive(g,250);assert.equal(g.stage,1);assert.equal(g.mode,'running');
  assert.ok(g.totalTime>=time+2.2-LIVE_EPS);
  assert.equal(g.wards.length,2);assert.equal(g.wards[0].r,1);assert.equal(g.wards[1].r,1);
  assert.ok(g.enemies.length>=1);assertAccount(g);
});

test('second approach has announced alternating paths and enough material for both r2 wards',()=>{
  const g=secondEncounter();
  assert.deepEqual(g.wards.map(w=>[w.x,w.z]),[[0,-1.65],[0,1.65]]);
  assert.equal(g.paths.length,2);assert.equal(LIVE_STAGES[1].count,10);
  resizeWard(g,'A',2);resizeWard(g,'B',2);
  close(g.stocks.conduit,0);close(g.stocks.floor,0);assertAccount(g);
  // Actual circles overlap by 0.7 m, but each pays its complete disk area.
  assert.ok(Math.abs(g.wards[0].z-g.wards[1].z)<g.wards[0].r+g.wards[1].r);
  advanceLive(g,5500);
  assert.deepEqual(g.enemies.map(e=>e.route),[0,1,0]);
  until(g,()=>g.mode!=='running');assert.equal(g.mode,'won');assert.equal(g.killed,10);
  assert.equal(g.totalKilled,13);assert.equal(g.leaked,0);assert.equal(g.coreHealth,3);
  const time=g.time,total=g.totalKilled,clears=g.events.filter(e=>e.event==='encounter-clear').length;
  advanceLive(g,100_000);
  assert.equal(g.time,time);assert.equal(g.totalKilled,total);
  assert.equal(g.events.filter(e=>e.event==='encounter-clear').length,clears);
  assert.equal(resizeWard(g,'A',1),false);assert.equal(beginNext(g),false);assert.equal(rewindLive(g),false);
});

test('neglecting the second approach fails, and retry does not double count prior kills',()=>{
  const g=secondEncounter();resizeWard(g,'A',2);
  until(g,()=>g.mode!=='running');assert.equal(g.mode,'leak');assert.equal(g.leaked,1);
  assert.ok(g.killed>0);assert.ok(g.totalKilled>3);
  resizeWard(g,'B',2);assert.equal(rewindLive(g),true);
  assert.equal(g.stage,1);assert.equal(g.totalKilled,3);assert.equal(g.killed,0);assert.equal(g.coreHealth,3);
  assert.deepEqual(g.wards.map(w=>w.r),[2,2]);assertAccount(g);
  until(g,()=>g.mode!=='running');assert.equal(g.mode,'won');assert.equal(g.totalKilled,13);assert.equal(g.retries,1);
  assert.ok(g.events.some(e=>e.event==='live-leak'));
});

test('range uses the exact horizontal boundary; stable targets prefer progress then ID',()=>{
  const g=createLiveGame();resizeWard(g,'A',2);
  // Isolated combat boundary fixture; not a playable success witness.
  g.enemies[0].distance=1.8-2*LIVE_DT*.7;
  stepLive(g);assert.equal(g.enemies[0].hp,8);
  stepLive(g);assert.equal(g.enemies[0].hp,6);
  const tie=createLiveGame();resizeWard(tie,'A',2);
  tie.enemies[0].distance=2;
  tie.enemies.push({...tie.enemies[0],id:2});
  stepLive(tie);assert.equal(tie.enemies[0].hp,6);assert.equal(tie.enemies[1].hp,8);
});

test('simultaneous arrival fixture still records just the first core hit before freezing',()=>{
  const g=createLiveGame();g.enemies[0].distance=8.799;
  g.enemies.push({...g.enemies[0],id:2});
  stepLive(g);assert.equal(g.mode,'leak');assert.equal(g.coreHealth,2);assert.equal(g.leaked,1);
  advanceLive(g,10_000);assert.equal(g.coreHealth,2);assert.equal(g.leaked,1);
});

test('fixed stepping is deterministic and malformed time inputs cannot alter combat',()=>{
  const a=createLiveGame(),b=createLiveGame();resizeWard(a,'A',2);resizeWard(b,'A',2);
  advanceLive(a,6000);for(let i=0;i<60;i++)advanceLive(b,100);
  close(a.time,b.time);assert.deepEqual(a.enemies,b.enemies);assert.equal(a.killed,b.killed);
  const before=structuredClone(a);
  for(const value of [NaN,Infinity,-Infinity,0,-10])advanceLive(a,value);
  for(const value of [NaN,Infinity,-Infinity,0,-10])stepLive(a,value);
  assert.deepEqual(a,before);
});

test('cosmetic hit/kill effects expire through interlude without advancing the frozen encounter',()=>{
  const g=openingClear();assert.ok(g.effects.length>0);
  const time=g.time;
  advanceLive(g,1000);assert.equal(g.mode,'interlude');assert.equal(g.time,time);
  assert.equal(g.effects.length,0);assert.equal(g.shots.length,0);
});

test('whole-prototype restart returns to the original affordable running opening',()=>{
  const g=secondEncounter();resizeWard(g,'A',2);toggleLivePause(g);
  restartLive(g);
  assert.deepEqual(g,createLiveGame());assertAccount(g);
});
