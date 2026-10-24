import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EPS, FIXED_DT, WAVES, REMATCH, createGame, cost, selectSite, setRadius,
  setType, cancelPreview, placementIssue, commitWard, sellWard, startWave,
  step, advance, nextWave, togglePause, retryWave, startRematch, useHelp,
  inRange, hasLineOfSight, routeLength, summary, type Game, type PlantType,
} from '../src/game.ts';

type Placement = readonly [string, number, PlantType?];
type Plan = readonly Placement[];
export const WINNING_PLANS: readonly Plan[] = [
  [['A', 2]],
  [['A', 2], ['B', 2]],
  [['A', 1], ['B', 1], ['C', 1], ['D', 1]],
  [['A', 1.5], ['B', 1.5], ['C', 1.5], ['D', 1.5]],
  [['A', .75], ['B', .75], ['C', 1.25], ['D', 1.25]],
];
export const REMATCH_PLAN: Plan = [['F', 1], ['G', 1], ['H', 1], ['I', 1]];
const close = (a: number, b: number, tolerance = EPS) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);

export function place(g: Game, plan: Plan) {
  for (const [id, r, type = 'thorn'] of plan) {
    assert.equal(selectSite(g, id), true, `site ${id} exists`);
    assert.equal(setRadius(g, r), true);
    assert.equal(setType(g, type), true);
    assert.equal(placementIssue(g), '', `legal ${id}, r=${r}: ${g.message}`);
    assert.equal(commitWard(g), true);
  }
}
export function fight(g: Game) {
  assert.equal(startWave(g), true);
  advance(g, 180_000);
  assert.notEqual(g.mode, 'combat', 'all authored spawns resolve within three minutes');
  return g;
}
export function reachWave(index: number) {
  const g = createGame();
  for (let i = 0; i < index; i++) {
    place(g, WINNING_PLANS[i]);
    fight(g);
    assert.equal(g.mode, 'cleared');
    assert.equal(nextWave(g), true);
  }
  return g;
}
export function reachRematch() {
  const g = reachWave(4);
  place(g, WINNING_PLANS[4]);
  fight(g);
  assert.equal(g.mode, 'won');
  assert.equal(startRematch(g), true);
  return g;
}

test('circle costs use exact π, radius units, and independent linear/quadratic scaling', () => {
  for (const r of [.5, .75, 1, 1.38, 2, 2.5, 3]) {
    const c = cost(r), doubled = cost(2 * r);
    close(c.conduit / Math.PI, 2 * r);
    close(c.floor / Math.PI, r ** 2);
    close(doubled.conduit, 2 * c.conduit);
    close(doubled.floor, 4 * c.floor);
    close(c.conduit / (2 * r), Math.PI);
  }
  const large = cost(2), small = cost(1);
  close(large.conduit, 2 * small.conduit);
  close(large.floor, 4 * small.floor);
});

test('selection, preview, cancel and invalid foundations cost nothing', () => {
  const g = createGame(), initial = {...g.stocks};
  assert.equal(selectSite(g, 'missing'), false);
  selectSite(g, 'A');
  for (const invalid of [NaN, Infinity, -Infinity, 0, -2]) assert.equal(setRadius(g, invalid), false);
  assert.deepEqual(g.stocks, initial);
  setRadius(g, 3); // Site supports 2.5 m; clipped circles are rejected.
  assert.match(placementIssue(g), /תשתית/);
  assert.equal(commitWard(g), false);
  assert.deepEqual(g.stocks, initial);
  assert.equal(g.wards.length, 0);
  setRadius(g, .1); // Positive UI input has a bounded minimum.
  assert.equal(g.preview?.r, .5);
  cancelPreview(g);
  assert.equal(g.preview, null);
  assert.deepEqual(g.stocks, initial);
});

test('commit charges once; resize and sale recover complete materials without rounding drift', () => {
  const g = createGame(), initial = {...g.stocks};
  place(g, [['A', 2]]);
  close(g.stocks.conduit, 0); close(g.stocks.floor, 0);
  assert.equal(commitWard(g), true); // Recommit replaces this one site.
  assert.equal(g.wards.length, 1);
  close(g.stocks.conduit, 0); close(g.stocks.floor, 0);
  for (let i = 0; i < 100; i++) {
    setRadius(g, 1); assert.equal(commitWard(g), true);
    setRadius(g, 2); assert.equal(commitWard(g), true);
  }
  setRadius(g, 1); assert.equal(commitWard(g), true);
  close(g.stocks.conduit, 2 * Math.PI); close(g.stocks.floor, 3 * Math.PI);
  assert.equal(sellWard(g, 'A'), true);
  assert.equal(sellWard(g, 'A'), false);
  close(g.stocks.conduit, initial.conduit); close(g.stocks.floor, initial.floor);
});

test('overlapping disks each consume their full area and circumference', () => {
  const g = createGame();
  place(g, [['A', 1], ['B', 1]]); // Centers 1 m apart: genuine overlap.
  close(g.stocks.conduit, 0);
  close(g.stocks.floor, 2 * Math.PI);
  assert.equal(g.wards.length, 2);
  const info = summary(g);
  for (const w of info.wards) close(w.d, 2 * w.r);
});

test('conduit exhaustion rejects atomically even while enough floor remains', () => {
  const g = reachWave(1);
  place(g, [['A', 3]]);
  const before = {stocks: {...g.stocks}, wards: structuredClone(g.wards)};
  selectSite(g, 'B'); setRadius(g, 1.5);
  assert.match(placementIssue(g), /צינור/);
  assert.equal(commitWard(g), false);
  assert.deepEqual(g.stocks, before.stocks);
  assert.deepEqual(g.wards, before.wards);
});

test('floor exhaustion rejects atomically even while enough conduit remains', () => {
  const g = reachWave(2);
  place(g, [['A', 1.5]]);
  const before = {stocks: {...g.stocks}, wards: structuredClone(g.wards)};
  selectSite(g, 'B'); setRadius(g, 1.5);
  assert.match(placementIssue(g), /רצפה/);
  assert.equal(commitWard(g), false);
  assert.deepEqual(g.stocks, before.stocks);
  assert.deepEqual(g.wards, before.wards);
});

test('analytic horizontal range includes its boundary, independently of sight lines', () => {
  const w = {x: 0, z: 0, r: 2};
  assert.equal(inRange(w, {x: 2, z: 0}), true);
  assert.equal(inRange(w, {x: 2 + 2 * EPS, z: 0}), false);
  assert.equal(inRange(w, {x: 1.2, z: 1.6}), true);
  assert.equal(inRange(w, {x: 1.5, z: 1.5}), false);
  const rock = [{x: 0, z: 0, r: .75}];
  assert.equal(hasLineOfSight({x: -2, z: 0}, {x: 2, z: 0}, rock), false);
  assert.equal(hasLineOfSight({x: -2, z: .75}, {x: 2, z: .75}, rock), true);
  assert.equal(hasLineOfSight({x: -2, z: 0}, {x: -1, z: 0}, rock), true);
  close(cost(2).floor, 4 * Math.PI); // An occluded sector has no discounted price.
});

test('initially ready thorn fires at first entry, then respects its one-second cooldown', () => {
  const g = createGame(); place(g, [['A', 1]]); startWave(g);
  for (let i = 0; i < 600 && (!g.enemies.length || g.enemies[0].hp === 8); i++) step(g);
  assert.equal(g.enemies[0]?.hp, 6);
  assert.ok(g.time > 6 && g.time < 6.4);
  for (let i = 0; i < 59; i++) step(g);
  assert.equal(g.enemies[0].hp, 6);
  step(g);
  assert.equal(g.enemies[0].hp, 4);
});

test('resin slows to one half, deals no damage, and expires after coverage', () => {
  const g = createGame(); place(g, [['A', 2, 'resin']]); startWave(g);
  advance(g, 6000);
  const e = g.enemies[0], start = e.distance;
  assert.equal(e.hp, 8);
  assert.ok(e.slowUntil > g.time);
  advance(g, 1000);
  close(e.distance - start, .4, 1e-6);
  // Multiple pulses refresh the same finite timer; speed never compounds below 1/2.
  for (let i = 0; i < 1200 && !(e.x > 2 && e.slowUntil <= g.time); i++) step(g);
  assert.ok(e.x > 2 && e.slowUntil <= g.time);
  const recovered = e.distance;
  advance(g, 500);
  close(e.distance - recovered, .4, 1e-6);
  advance(g, 180_000);
  assert.equal(g.mode, 'lost'); assert.equal(g.killed, 0);
});

test('pause freezes all simulation and does not enable construction', () => {
  const g = createGame(); place(g, [['A', 2]]); startWave(g); advance(g, 7000);
  assert.equal(togglePause(g), true);
  selectSite(g, 'A');
  const before = JSON.stringify({time: g.time, enemies: g.enemies, shots: g.shots, wards: g.wards, stocks: g.stocks});
  assert.equal(setRadius(g, 1), false);
  assert.equal(setType(g, 'resin'), false);
  assert.equal(commitWard(g), false);
  assert.equal(sellWard(g), false);
  advance(g, 50_000);
  assert.equal(JSON.stringify({time: g.time, enemies: g.enemies, shots: g.shots, wards: g.wards, stocks: g.stocks}), before);
  assert.equal(togglePause(g), true);
  advance(g, 180_000);
  assert.equal(g.mode, 'cleared'); assert.equal(g.killed, 3);
});

test('retry restores wave-start core, layout and stocks while preserving separate evidence', () => {
  const g = createGame(); place(g, [['A', 1]]); useHelp(g);
  const initial = {wards: structuredClone(g.wards), stocks: {...g.stocks}, core: g.coreHealth};
  fight(g);
  assert.equal(g.mode, 'lost'); assert.equal(g.leaked, 3);
  const leaks = g.events.filter(e => e.event === 'leak').length;
  assert.equal(retryWave(g), true);
  assert.equal(g.mode, 'build'); assert.equal(g.time, 0);
  assert.equal(g.spawnIndex, 0); assert.equal(g.enemies.length, 0);
  assert.deepEqual(g.wards, initial.wards); assert.deepEqual(g.stocks, initial.stocks);
  assert.equal(g.coreHealth, initial.core); assert.equal(g.retries, 1); assert.equal(g.helpUses, 1);
  assert.equal(g.events.filter(e => e.event === 'leak').length, leaks);
  selectSite(g, 'A'); setRadius(g, 2); assert.equal(commitWard(g), true);
  fight(g); assert.equal(g.mode, 'cleared'); assert.equal(g.killed, 3); assert.equal(g.leaked, 0);
});

test('spawn order, path lengths and fixed stepping are deterministic', () => {
  close(routeLength(WAVES[0].paths[0]), 12);
  assert.deepEqual(WAVES[1].spawns.map(s => s.route), [0,1,0,1,0,1,0,1]);
  const a = createGame(), b = createGame();
  place(a, [['A', 1]]); place(b, [['A', 1]]); startWave(a); startWave(b);
  advance(a, 14_000);
  for (let i = 0; i < 140; i++) advance(b, 100);
  close(a.time, b.time, 1e-6);
  assert.equal(a.killed, b.killed); assert.equal(a.leaked, b.leaked);
  for (let i = 0; i < a.enemies.length; i++) {
    assert.equal(a.enemies[i].id, b.enemies[i].id);
    assert.equal(a.enemies[i].hp, b.enemies[i].hp);
    close(a.enemies[i].distance, b.enemies[i].distance, 1e-6);
  }
});

test('two small opening wards provide a second successful damage handoff at half the floor cost', () => {
  const g = createGame(); place(g, [['B', 1], ['C', 1]]);
  close(g.stocks.floor, 2 * Math.PI); close(g.stocks.conduit, 0);
  fight(g); assert.equal(g.mode, 'cleared'); assert.equal(g.killed, 3); assert.equal(g.leaked, 0);
});

for (let index = 0; index < 5; index++) {
  test(`wave ${index + 1}: authored legal plan resolves all enemies without leaks`, () => {
    const g = reachWave(index); place(g, WINNING_PLANS[index]); fight(g);
    assert.equal(g.mode, index === 4 ? 'won' : 'cleared');
    assert.equal(g.killed, WAVES[index].spawns.length);
    assert.equal(g.spawnIndex, WAVES[index].spawns.length);
    assert.equal(g.enemies.length, 0); assert.equal(g.leaked, 0); assert.equal(g.coreHealth, 3);
    const resultEvents = g.events.filter(e => e.event === 'wave-result').length;
    const killed = g.killed;
    advance(g, 60_000);
    assert.equal(g.killed, killed);
    assert.equal(g.events.filter(e => e.event === 'wave-result').length, resultEvents);
  });
}

const FAILING_PLANS: readonly Plan[] = [
  [['A', 1]], // Too little time on target.
  [['A', 2]], // The southern approach has no defender.
  [['E', 2]], // One full-floor disk cannot deliver seven hits.
  [['E', 3]], // The rock blocks the northern part of a large disk.
  [['A', 2], ['B', 2]], // Central defenses ignore the southern flank.
];
for (let index = 0; index < 5; index++) {
  test(`wave ${index + 1}: meaningful legal counterexample leaks and fails`, () => {
    const g = reachWave(index); place(g, FAILING_PLANS[index]);
    if (index === 3) {
      const ward = g.wards[0];
      assert.equal(inRange(ward, {x:0,z:-1.5}), true, 'north is within the priced disk');
      assert.equal(hasLineOfSight(ward, {x:0,z:-1.5}, g.occluders), false, 'rock blocks north');
      assert.equal(hasLineOfSight(ward, {x:0,z:1.5}, g.occluders), true, 'south remains visible');
    }
    fight(g);
    assert.equal(g.mode, 'lost'); assert.ok(g.leaked >= 3); assert.ok(g.coreHealth <= 0);
    assert.equal(g.leaks.length, g.leaked);
    assert.ok(g.leaks.every(e => e.hp > 0));
    const core = g.coreHealth, leaks = g.leaked;
    advance(g, 180_000);
    assert.equal(g.coreHealth, core); assert.equal(g.leaked, leaks);
  });
}

test('the affordable old final plan fails rematch; a changed north plan wins after recovery', () => {
  const g = reachRematch();
  const old = WINNING_PLANS[4];
  const oldConduit = old.reduce((sum, [,r]) => sum + 2 * Math.PI * r, 0);
  const oldFloor = old.reduce((sum, [,r]) => sum + Math.PI * r ** 2, 0);
  assert.ok(oldConduit < REMATCH.conduit); assert.ok(oldFloor < REMATCH.floor);
  place(g, old); fight(g);
  assert.equal(g.mode, 'lost'); assert.equal(g.killed, 0); assert.equal(g.leaked, 3);
  const first = structuredClone(g.firstRematch);
  assert.equal((first as {result:string}).result, 'lost');
  assert.equal(retryWave(g), true);
  for (const w of [...g.wards]) assert.equal(sellWard(g, w.siteId), true);
  place(g, REMATCH_PLAN); fight(g);
  assert.equal(g.mode, 'won'); assert.equal(g.killed, REMATCH.spawns.length); assert.equal(g.leaked, 0);
  assert.deepEqual(g.firstRematch, first);
});

test('abandoning the first rematch cannot turn a later retry into the first unaided result', () => {
  const g = reachRematch(); place(g, WINNING_PLANS[4]); startWave(g); advance(g, 2000);
  assert.equal(retryWave(g), true);
  assert.ok(g.firstRematch, 'first attempted layout and abandonment must remain recorded');
  assert.equal((g.firstRematch as {result:string}).result, 'abandoned');
});
