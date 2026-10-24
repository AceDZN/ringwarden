/** Ringwarden v2: live, paid ground disks. Decorative meshes never define geometry. */
export const LIVE_EPS = 1e-8;
export const LIVE_DT = 1 / 60;
export type Point = { x: number; z: number };
export type LiveMode = 'running' | 'paused' | 'leak' | 'interlude' | 'won' | 'lost';
export type LiveWard = Point & { id: string; r: number; maxRadius: number; cooldown: number; lastShotTime: number };
export type LiveEnemy = Point & { id: number; hp: number; maxHp: number; speed: number; kind: string; route: number; progress: number; distance: number; heading: number; slowUntil: number; hitAt: number };
export type LiveEvent = { event: string; wave: number; rematch: boolean; time: number; [key: string]: unknown };
export type LiveGame = {
  version: 2; stage: 0 | 1; mode: LiveMode; time: number; totalTime: number;
  core: Point; coreHealth: number; stageStartCore: number; stageStartKills: number;
  wards: LiveWard[]; paths: Point[][]; enemies: LiveEnemy[];
  stocks: { conduit: number; floor: number }; budget: { conduit: number; floor: number };
  shots: { from: Point; to: Point; ttl: number; type: 'thorn'; enemyId: number }[];
  effects: (Point & { kind: 'hit' | 'kill' | 'leak' | 'bloom'; age: number })[];
  leaks: (Point & { hp: number; route: number; id: number })[];
  selectedId: string; draggingId: string | null; limitReason: string; limitTime: number;
  spawnIndex: number; nextEnemyId: number; killed: number; totalKilled: number; leaked: number;
  interludeTime: number; retries: number; helpUses: number; hasGrown: boolean;
  firstActionTime: number | null; events: LiveEvent[]; pauseReason: string;
};
const point = (x: number, z: number): Point => ({ x, z });
export const LIVE_STAGES = [
  { count: 3, gap: 5, hp: 8, speed: .7, paths: [[point(-3.8, 0), point(5, 0)]], wards: [{ id: 'A', x: 0, z: 0 }], budget: { conduit: 4 * Math.PI, floor: 4 * Math.PI } },
  { count: 10, gap: 2.7, hp: 8, speed: .8, paths: [[point(-4.5, -1.65), point(2.8, -1.65), point(5, 0)], [point(-4.5, 1.65), point(2.8, 1.65), point(5, 0)]], wards: [{ id: 'A', x: 0, z: -1.65 }, { id: 'B', x: 0, z: 1.65 }], budget: { conduit: 8 * Math.PI, floor: 8 * Math.PI } },
] as const;
export const liveCost = (r: number) => ({ conduit: 2 * Math.PI * r, floor: Math.PI * r * r });
function event(g: LiveGame, name: string, data: Record<string, unknown> = {}) {
  g.events.push({ event: name, wave: g.stage + 1, rematch: false, time: g.time, ...data });
  if (g.events.length > 500) g.events.shift();
}
function account(g: LiveGame) {
  const spent = g.wards.reduce((s, w) => { const c = liveCost(w.r); return { conduit: s.conduit + c.conduit, floor: s.floor + c.floor }; }, { conduit: 0, floor: 0 });
  g.stocks = { conduit: Math.max(0, g.budget.conduit - spent.conduit), floor: Math.max(0, g.budget.floor - spent.floor) };
}
function spawnDue(g: LiveGame) {
  const stage = LIVE_STAGES[g.stage];
  while (g.spawnIndex < stage.count && g.spawnIndex * stage.gap <= g.time + LIVE_EPS) {
    const route = g.spawnIndex % stage.paths.length;
    const p = g.paths[route][0];
    g.enemies.push({ ...p, id: g.nextEnemyId++, hp: stage.hp, maxHp: stage.hp, speed: stage.speed, kind: 'walker', route, progress: 0, distance: 0, heading: Math.PI / 2, slowUntil: 0, hitAt: -100 });
    g.spawnIndex++;
  }
}
function setupStage(g: LiveGame) {
  const stage = LIVE_STAGES[g.stage];
  g.time = 0; g.mode = 'running'; g.stageStartCore = g.coreHealth; g.stageStartKills = g.totalKilled;
  g.paths = stage.paths.map(p => p.map(v => ({ ...v })));
  g.wards = stage.wards.map(w => ({ ...w, r: 1, maxRadius: 2, cooldown: 0, lastShotTime: -100 }));
  g.budget = { ...stage.budget }; account(g);
  g.enemies = []; g.shots = []; g.effects = []; g.leaks = [];
  g.spawnIndex = 0; g.killed = 0; g.leaked = 0; g.interludeTime = 0;
  g.selectedId = 'A'; g.draggingId = null; g.limitReason = ''; g.limitTime = 0;
  g.hasGrown = false; g.pauseReason = '';
  spawnDue(g);
}
export function createLiveGame(): LiveGame {
  const g: LiveGame = { version: 2, stage: 0, mode: 'running', time: 0, totalTime: 0, core: point(5, 0), coreHealth: 3, stageStartCore: 3, stageStartKills: 0, wards: [], paths: [], enemies: [], stocks: { conduit: 0, floor: 0 }, budget: { conduit: 0, floor: 0 }, shots: [], effects: [], leaks: [], selectedId: 'A', draggingId: null, limitReason: '', limitTime: 0, spawnIndex: 0, nextEnemyId: 1, killed: 0, totalKilled: 0, leaked: 0, interludeTime: 0, retries: 0, helpUses: 0, hasGrown: false, firstActionTime: null, events: [], pauseReason: '' };
  setupStage(g); event(g, 'live-garden-start'); return g;
}
export function selectWard(g: LiveGame, id: string) {
  if (!g.wards.some(w => w.id === id)) return false;
  g.selectedId = id; return true;
}
export function maxAffordableRadius(g: LiveGame, id: string) {
  const ward = g.wards.find(w => w.id === id);
  if (!ward) return 0;
  const others = g.wards.filter(w => w.id !== id).reduce((s, w) => { const c = liveCost(w.r); return { conduit: s.conduit + c.conduit, floor: s.floor + c.floor }; }, { conduit: 0, floor: 0 });
  return Math.min(ward.maxRadius, (g.budget.conduit - others.conduit) / (2 * Math.PI), Math.sqrt(Math.max(0, (g.budget.floor - others.floor) / Math.PI)));
}
export function resizeWard(g: LiveGame, id: string, requested: number) {
  if (!['running', 'paused', 'leak'].includes(g.mode) || !Number.isFinite(requested) || requested <= 0) return false;
  const ward = g.wards.find(w => w.id === id);
  if (!ward) return false;
  const max = maxAffordableRadius(g, id);
  const r = Math.min(max, Math.max(.65, requested));
  if (requested > max + LIVE_EPS) {
    const own = liveCost(ward.r), availableC = g.stocks.conduit + own.conduit, availableA = g.stocks.floor + own.floor;
    g.limitReason = max >= ward.maxRadius - LIVE_EPS ? 'זה הטווח המרבי של הצמח' : availableC / (2 * Math.PI) <= Math.sqrt(availableA / Math.PI) ? 'הצינור נגמר' : 'הרצפה נגמרה';
    g.limitTime = 1.3;
  } else { g.limitReason = ''; g.limitTime = 0; }
  g.selectedId = id;
  if (Math.abs(ward.r - r) <= LIVE_EPS) return false;
  const previous = ward.r;
  ward.r = r; account(g); // Deliberately retain cooldown and lastShotTime.
  g.hasGrown ||= r > 1.04;
  if (g.firstActionTime === null) g.firstActionTime = g.totalTime;
  event(g, 'live-resize', { id, from: previous, r, d: 2 * r, cost: liveCost(r), remaining: { ...g.stocks } });
  return true;
}
export function toggleLivePause(g: LiveGame, reason = '') {
  if (g.mode === 'running') { g.mode = 'paused'; g.pauseReason = reason; g.draggingId = null; return true; }
  if (g.mode === 'paused') { g.mode = 'running'; g.pauseReason = ''; return true; }
  return false;
}
export function beginNext(g: LiveGame) {
  if (g.mode !== 'interlude' || g.stage !== 0) return false;
  g.stage = 1; setupStage(g); event(g, 'second-approach'); return true;
}
/** Rewind = restart this encounter, keeping current paid radii. No setup is repeated. */
export function rewindLive(g: LiveGame) {
  if (!['leak', 'paused', 'running', 'lost'].includes(g.mode)) return false;
  const radii = new Map(g.wards.map(w => [w.id, w.r]));
  const snapshotCore = g.stageStartCore;
  const previousTime = g.time, previousLeaks = g.leaked, attemptKilled = g.killed;
  g.totalKilled = g.stageStartKills;
  g.coreHealth = snapshotCore;
  setupStage(g);
  for (const ward of g.wards) ward.r = radii.get(ward.id) ?? 1;
  account(g); g.hasGrown = g.wards.some(w => w.r > 1.04); g.retries++;
  event(g, 'encounter-rewind', { previousTime, previousLeaks, attemptKilled, retainedRadii: Object.fromEntries(radii), retry: g.retries });
  return true;
}
export function restartLive(g: LiveGame) { Object.assign(g, createLiveGame()); }
function pathLength(path: Point[]) { let sum = 0; for (let i = 1; i < path.length; i++) sum += Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z); return sum; }
function positionOnPath(path: Point[], d: number) {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], length = Math.hypot(b.x - a.x, b.z - a.z);
    if (d <= length) return { x: a.x + (b.x - a.x) * d / length, z: a.z + (b.z - a.z) * d / length, heading: Math.atan2(b.x - a.x, b.z - a.z) };
    d -= length;
  }
  return { ...path[path.length - 1], heading: 0 };
}
export function stepLive(g: LiveGame, dt = LIVE_DT) {
  if (!Number.isFinite(dt) || dt <= 0) return;
  dt = Math.min(dt, LIVE_DT);
  if (['running', 'interlude', 'won'].includes(g.mode)) {
    g.effects = g.effects.filter(e => (e.age += dt) < .8);
    g.shots = g.shots.filter(s => (s.ttl -= dt) > 0);
  }
  if (g.mode === 'interlude') {
    g.interludeTime += dt; g.totalTime += dt;
    if (g.interludeTime >= 2.2) beginNext(g);
    return;
  }
  if (g.mode !== 'running') return;
  g.time += dt; g.totalTime += dt;
  g.limitTime = Math.max(0, g.limitTime - dt); if (!g.limitTime) g.limitReason = '';
  spawnDue(g);
  for (const enemy of g.enemies) {
    enemy.distance += enemy.speed * dt;
    enemy.progress = enemy.distance / pathLength(g.paths[enemy.route]);
    Object.assign(enemy, positionOnPath(g.paths[enemy.route], enemy.distance));
  }
  for (const ward of g.wards) {
    ward.cooldown = Math.max(0, ward.cooldown - dt);
    if (ward.cooldown > LIVE_EPS) continue;
    const enemy = g.enemies.filter(e => e.hp > 0 && e.progress < 1 && Math.hypot(e.x - ward.x, e.z - ward.z) <= ward.r + LIVE_EPS).sort((a, b) => b.progress - a.progress || a.id - b.id)[0];
    if (!enemy) continue;
    enemy.hp -= 2; enemy.hitAt = g.time; ward.cooldown = 1; ward.lastShotTime = g.time;
    g.shots.push({ from: point(ward.x, ward.z), to: point(enemy.x, enemy.z), ttl: .16, type: 'thorn', enemyId: enemy.id });
    g.effects.push({ x: enemy.x, z: enemy.z, kind: 'hit', age: 0 });
  }
  const alive: LiveEnemy[] = [];
  let breached = false;
  for (const enemy of g.enemies) {
    if (enemy.hp <= 0) {
      g.killed++; g.totalKilled++;
      g.effects.push({ x: enemy.x, z: enemy.z, kind: 'kill', age: 0 });
      continue;
    }
    if (enemy.progress >= 1 && !breached) {
      breached = true;
      g.coreHealth = Math.max(0, g.coreHealth - 1); g.leaked++; g.leaks.push({ x: enemy.x, z: enemy.z, hp: enemy.hp, route: enemy.route, id: enemy.id });
      g.effects.push({ x: enemy.x, z: enemy.z, kind: 'leak', age: 0 });
      event(g, 'live-leak', { enemyId: enemy.id, hp: enemy.hp, route: enemy.route, coreHealth: g.coreHealth });
    } else alive.push(enemy);
  }
  g.enemies = alive;
  if (g.leaked) { g.mode = g.coreHealth > 0 ? 'leak' : 'lost'; g.draggingId = null; return; }
  const stage = LIVE_STAGES[g.stage];
  if (g.spawnIndex === stage.count && g.enemies.length === 0) {
    event(g, 'encounter-clear', { killed: g.killed, coreHealth: g.coreHealth, retries: g.retries });
    g.effects.push(...g.wards.map(w => ({ x: w.x, z: w.z, kind: 'bloom' as const, age: 0 })));
    g.mode = g.stage === 0 ? 'interlude' : 'won'; g.draggingId = null;
  }
}
export function advanceLive(g: LiveGame, ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return;
  let remaining = Math.min(ms / 1000, 300);
  while (remaining > LIVE_EPS) { stepLive(g, Math.min(LIVE_DT, remaining)); remaining -= LIVE_DT; }
}
export function liveSummary(g: LiveGame) {
  const stage = LIVE_STAGES[g.stage];
  return { coordinateSystem: 'x right, z depth, y up; one ground unit = one metre; analytic horizontal disks', version: g.version, mode: g.mode, stage: g.stage, encounter: g.stage + 1, time: g.time, totalTime: g.totalTime, coreHealth: g.coreHealth, core: g.core, budget: g.budget, stocks: g.stocks, wards: g.wards.map(w => ({ ...w, d: 2 * w.r, cost: liveCost(w.r), maxAffordableRadius: maxAffordableRadius(g, w.id), damage: 2, cooldownSeconds: 1 })), enemies: g.enemies, paths: g.paths, shots: g.shots, leaks: g.leaks, killed: g.killed, totalKilled: g.totalKilled, pending: stage.count - g.spawnIndex, scheduled: stage.count, selectedId: g.selectedId, draggingId: g.draggingId, limitReason: g.limitReason, retries: g.retries, helpUses: g.helpUses, firstActionTime: g.firstActionTime, rewindContract: 'Restart current encounter at t=0 with stage-start core, reset enemies/spawns/HP/cooldowns, retain current paid radii and recompute both stocks; preserve retry evidence.' };
}
