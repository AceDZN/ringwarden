import './style.css';
import { createLiveScene } from './live-scene';
import { createLiveGame, resizeWard, selectWard, stepLive, advanceLive, toggleLivePause, rewindLive, restartLive, liveSummary, liveCost, LIVE_DT } from './live-game';
import { readLocal, writeLocal } from './storage';
import { createSound } from './sound';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const num = (v: number, digits = 2) => Math.abs(v) < 1e-7 ? '0' : Number(v.toFixed(digits)).toString();
const ltr = (s: string) => `<bdi dir="ltr">${s}</bdi>`;
const game = createLiveGame();
const sound = createSound();
let muted = readLocal().muted;
let manualTime = new URLSearchParams(location.search).has('test');
let scene: ReturnType<typeof createLiveScene> | null = null;
let loaded = false, helpPaused = false, keyboardUsed = false, keyboardCostUntil = 0;
let lastEvent: unknown = null, previousKills = 0, previousLeaks = 0, previousShot = -100;
sound.setMuted(muted);

$('app').innerHTML = `
<main id="live-game" data-mode="running">
  <canvas id="garden" tabindex="0" aria-label="הגנו על לב הזרע. גררו את הטבעת עד לחיפושית כדי להרחיב את טווח הצמח. מקשים: חץ למעלה מגדיל, למטה מקטין, ימינה ושמאלה בוחרים צמח."></canvas>
  <div id="webgl-error" hidden role="alert"></div>
  <div class="wordmark" dir="ltr">Ringwarden<span dir="rtl">שומרי המעגל</span></div>
  <div class="materials" aria-label="חומרי הגן">
    <div class="material conduit"><span class="stock-symbol" aria-hidden="true">◎</span><div><span>צינור</span><strong id="conduit" dir="ltr"></strong></div></div>
    <div class="material floor"><span class="stock-symbol" aria-hidden="true">▦</span><div><span>רצפה</span><strong id="floor" dir="ltr"></strong></div></div>
  </div>
  <div class="garden-status"><div class="heart"><span aria-hidden="true">❦</span><strong id="health" dir="ltr"></strong><small>לב הזרע</small></div><button id="pause" class="icon-button" aria-label="השהיה">Ⅱ</button></div>
  <div id="progress" class="encounter-progress"></div>
  <div id="drag-readout" class="drag-readout" hidden><strong id="radius-readout" dir="ltr"></strong><span id="cost-readout"></span><small id="limit-readout"></small></div>
  <section id="prompt" class="prompt" aria-live="polite"><span id="prompt-icon" aria-hidden="true">↗</span><div><h1 id="prompt-title"></h1><p id="prompt-detail"></p></div></section>
  <div id="recovery" class="recovery" hidden><h2 id="recovery-title"></h2><p id="recovery-detail"></p><button id="primary" class="primary"></button></div>
  <div class="quiet-tools"><button id="mute" class="icon-button" aria-label="השתקת קול">♫</button><button id="help" class="icon-button" aria-label="עזרה">?</button></div>
  <span id="keyboard-hint" class="keyboard-hint" hidden>↑↓ טווח · ←→ צמח · רווח השהיה</span>
  <div id="loading" class="loading">הגן מתעורר…</div>
  <dialog id="help-dialog"><button id="close-help" class="close" aria-label="סגירה">×</button><h2>הטבעת היא הטווח</h2><p>גררו את האור החוצה כדי להגיע לחיפושיות. גררו פנימה כדי לקבל את החומרים בחזרה. הצמחים יורים בעצמם.</p><p>הרחבה מגדילה את הטווח בלבד. קוץ גורם <bdi dir="ltr">2</bdi> נזק בכל שנייה; הרחבה אינה מאפסת את זמן הירי.</p><div class="formulas" dir="ltr">d = 2r &nbsp; C = 2πr m &nbsp; A = πr² m²</div><p>מטר בעולם הוא מטר על הקרקע. היקף צורך צינור, שטח עיגול צורך רצפה; החומרים נפרדים. הכפלת רדיוס דורשת פי <bdi dir="ltr">2</bdi> צינור ופי <bdi dir="ltr">4</bdi> רצפה.</p><p>נחזור רגע מתחיל שוב את המפגש הנוכחי עם לב מלא ועם הטווחים שכבר בחרתם. אין צורך לשתול או לאשר שוב.</p><p class="keys">מקלדת: ↑↓ טווח · ←→ בחירת צמח · <bdi dir="ltr">A/B</bdi> צמח · רווח השהיה · <bdi dir="ltr">R</bdi> התחלת המפגש מחדש · <bdi dir="ltr">F</bdi> מסך מלא · <bdi dir="ltr">M</bdi> קול.</p><small>זהו מבחן משחק קצר של שתי גישות. ידע מקדים: היקף ושטח עיגול, כיתה ז׳ ב־Workbook. הנוסחאות מתארות קרקע ומסגרת, לא גליל. רק התצוגה מעוגלת.</small><button id="restart" class="secondary">מהתחלה</button></dialog>
</main>`;

function persist() { writeLocal(muted, game.events); lastEvent = game.events.at(-1); }
function unlock() { sound.unlock(); }
function focusGarden() { $('garden').focus({ preventScroll: true }); }
function resize(id: string, r: number) { resizeWard(game, id, r); refresh(); }
function choose(id: string) { selectWard(game, id); refresh(); }
function drag(id: string | null) { game.draggingId = id; if (id) { unlock(); game.selectedId = id; } refresh(); }
function primaryAction() {
  unlock();
  if (game.mode === 'leak' || game.mode === 'lost') rewindLive(game);
  else if (game.mode === 'paused') toggleLivePause(game);
  else if (game.mode === 'won') restartLive(game);
  refresh(); focusGarden();
}
function refresh() {
  const ui = $('live-game'); ui.dataset.mode = game.mode;
  $('conduit').textContent = `${num(game.stocks.conduit)} m`;
  $('floor').textContent = `${num(game.stocks.floor)} m²`;
  $('conduit').title = `${num(game.stocks.conduit / Math.PI, 4)}π m`;
  $('floor').title = `${num(game.stocks.floor / Math.PI, 4)}π m²`;
  $('health').textContent = `${game.coreHealth} / 3`;
  $('progress').innerHTML = `${game.stage === 0 ? 'שביל ראשון' : 'שני שבילים'} <span>${ltr(`${game.killed} / ${game.stage === 0 ? 3 : 10}`)}</span>`;
  const recovering = ['leak', 'lost', 'won', 'paused'].includes(game.mode);
  $('recovery').hidden = !recovering; $('prompt').hidden = recovering;
  const pause = $<HTMLButtonElement>('pause'); pause.disabled = ['leak', 'lost', 'won', 'interlude'].includes(game.mode);
  pause.textContent = game.mode === 'paused' ? '▷' : 'Ⅱ'; pause.setAttribute('aria-label', game.mode === 'paused' ? 'המשך' : 'השהיה');
  if (game.mode === 'leak' || game.mode === 'lost') {
    $('recovery-title').textContent = 'חיפושית הגיעה ללב';
    $('recovery-detail').textContent = 'אפשר להרחיב עכשיו. הטווח שבחרתם יישמר בניסיון הבא.';
    $('primary').textContent = '↶ נחזור רגע';
  } else if (game.mode === 'paused') {
    $('recovery-title').textContent = 'הגן מחכה לכם';
    $('recovery-detail').textContent = game.pauseReason || 'המשחק מושהה. אפשר לשנות טווחים גם עכשיו.';
    $('primary').textContent = '▷ ממשיכים';
  } else if (game.mode === 'won') {
    $('recovery-title').textContent = 'הלב בטוח!';
    $('recovery-detail').textContent = 'כל 13 החיפושיות נעצרו. הגן פורח מחדש.';
    $('primary').textContent = '↶ עוד סיבוב';
  }
  let title: string, detail: string, icon: string;
  if (game.mode === 'interlude') { title = 'יפה! עוד שביל נפתח'; detail = 'צמח נוסף מצטרף להגנה'; icon = '✦'; }
  else if (!game.hasGrown) { title = game.stage === 0 ? 'גררו את הטבעת עד לחיפושית' : 'הרחיבו גם בשביל השני'; detail = game.stage === 0 ? 'הטבעת צריכה להגיע לחיפושיות' : 'יש מספיק חומרים לשני הצמחים'; icon = '↗'; }
  else if (game.stage === 1 && game.wards.some(w => w.r < 1.24)) { title = 'גם הצמח השני צריך להגיע'; detail = 'גררו את האור שעל הטבעת השנייה'; icon = '↗'; }
  else { title = game.stage === 0 ? 'הקוצים מגינים על הלב' : 'שני השבילים בידיים שלכם'; detail = 'אפשר לשנות טווח גם כשהחיפושיות מתקדמות'; icon = '✦'; }
  $('prompt-title').textContent = title; $('prompt-detail').textContent = detail; $('prompt-icon').textContent = icon;
  $('mute').textContent = muted ? '♩' : '♫'; $('mute').setAttribute('aria-label', muted ? 'הפעלת קול' : 'השתקת קול'); $('mute').setAttribute('aria-pressed', String(muted));
  $('keyboard-hint').hidden = !keyboardUsed;
  const showCost = !!game.draggingId || (performance.now() < keyboardCostUntil && ['running', 'paused', 'leak'].includes(game.mode));
  const ward = game.wards.find(w => w.id === (game.draggingId ?? game.selectedId));
  $('drag-readout').hidden = !showCost || !ward;
  if (showCost && ward) {
    const c = liveCost(ward.r);
    $('radius-readout').textContent = `r = ${num(ward.r)} m`;
    $('cost-readout').innerHTML = `${ltr(`C = ${num(2 * ward.r, 3)}π m`)} · ${ltr(`A = ${num(ward.r * ward.r, 3)}π m²`)}`;
    $('cost-readout').title = `C ≈ ${num(c.conduit)} m; A ≈ ${num(c.floor)} m²`;
    $('limit-readout').textContent = game.limitReason;
    const grip = scene?.getDiagnostics().grips?.find((v: { id: string }) => v.id === ward.id);
    if (grip) { const width = Math.min(310, innerWidth - 24); $('drag-readout').style.left = `${Math.max(12, Math.min(innerWidth - width - 12, grip.x - width / 2))}px`; $('drag-readout').style.top = `${Math.max(100, grip.y - 108)}px`; }
  }
  if (lastEvent !== game.events.at(-1)) persist();
}
$('primary').onclick = primaryAction;
$('pause').onclick = () => { unlock(); toggleLivePause(game); refresh(); focusGarden(); };
$('mute').onclick = () => { unlock(); muted = !muted; sound.setMuted(muted); persist(); refresh(); };
const help = $<HTMLDialogElement>('help-dialog');
function openHelp() { game.helpUses++; game.events.push({ event: 'help', wave: game.stage + 1, rematch: false, time: game.time }); helpPaused = game.mode === 'running'; if (helpPaused) toggleLivePause(game); help.showModal(); refresh(); }
function closeHelp() { help.close(); if (helpPaused && game.mode === 'paused') toggleLivePause(game); helpPaused = false; refresh(); focusGarden(); }
$('help').onclick = openHelp; $('close-help').onclick = closeHelp;
help.addEventListener('cancel', e => { e.preventDefault(); closeHelp(); });
$('restart').onclick = () => { restartLive(game); helpPaused = false; closeHelp(); };
async function fullscreen() { if (document.fullscreenElement) await document.exitFullscreen(); else await $('live-game').requestFullscreen(); }
window.addEventListener('keydown', e => {
  if (help.open || (e.target as HTMLElement).matches('input,textarea,select')) return;
  if ((e.target as HTMLElement).matches('button') && ['Enter', 'Space'].includes(e.code)) return;
  let handled = true; unlock();
  const index = game.wards.findIndex(w => w.id === game.selectedId);
  const ward = game.wards[index < 0 ? 0 : index];
  if (e.code === 'ArrowUp') resize(ward.id, ward.r + .25);
  else if (e.code === 'ArrowDown') resize(ward.id, ward.r - .25);
  else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') choose(game.wards[(index + (e.code === 'ArrowRight' ? 1 : -1) + game.wards.length) % game.wards.length].id);
  else if (e.code === 'KeyA' || e.code === 'Digit1') choose('A');
  else if (e.code === 'KeyB' || e.code === 'Digit2') choose('B');
  else if (e.code === 'Space' && !e.repeat) { if (game.mode === 'running' || game.mode === 'paused') toggleLivePause(game); else primaryAction(); }
  else if (e.code === 'KeyR' && !e.repeat) rewindLive(game);
  else if (e.code === 'Enter' && !e.repeat) primaryAction();
  else if (e.code === 'KeyF' && !e.repeat) void fullscreen();
  else if (e.code === 'KeyM' && !e.repeat) { muted = !muted; sound.setMuted(muted); persist(); }
  else if (e.code === 'KeyH' && !e.repeat) openHelp();
  else handled = false;
  if (handled) { e.preventDefault(); keyboardUsed = true; if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyA','KeyB','Digit1','Digit2'].includes(e.code)) keyboardCostUntil = performance.now() + 2500; refresh(); }
});
function blurPause() { if (game.mode === 'running') { toggleLivePause(game, 'הקרב הושהה כשהחלון איבד מיקוד.'); refresh(); } }
window.addEventListener('blur', blurPause);
document.addEventListener('visibilitychange', () => { if (document.hidden) blurPause(); });
window.addEventListener('resize', () => { scene?.resize(); refresh(); });
document.addEventListener('fullscreenchange', () => { scene?.resize(); refresh(); });
try { scene = createLiveScene($<HTMLCanvasElement>('garden'), choose, resize, drag); }
catch (error) { $('webgl-error').hidden = false; $('webgl-error').textContent = `תלת הממד לא נטען. הפעילו האצת חומרה ורעננו. ${String(error)}`; $('loading').hidden = true; }
let last = performance.now(), accumulator = 0, lastUI = 0;
function draw(dt: number) {
  const diagnostics = scene?.getDiagnostics();
  loaded = !!diagnostics && Object.values(diagnostics.assets ?? {}).every(v => v !== 'loading');
  $('loading').hidden = loaded || !scene;
  if (game.totalKilled > previousKills) sound.play('plant');
  if (game.leaked > previousLeaks) sound.play('leak');
  const shotTime = Math.max(...game.wards.map(w => w.lastShotTime));
  if (shotTime > previousShot) sound.play('shot');
  previousKills = game.totalKilled; previousLeaks = game.leaked; previousShot = shotTime;
  scene?.render(game, dt);
}
function frame(now: number) {
  const elapsed = Math.min(.1, (now - last) / 1000); last = now;
  if (!manualTime && loaded) { accumulator += elapsed; while (accumulator >= LIVE_DT) { stepLive(game, LIVE_DT); accumulator -= LIVE_DT; } }
  draw(elapsed);
  if (now - lastUI > 80) { refresh(); lastUI = now; }
  requestAnimationFrame(frame);
}
window.render_game_to_text = () => JSON.stringify({ ...liveSummary(game), renderer: scene?.getDiagnostics(), muted, loaded, manualTime });
window.advanceTime = (ms: number) => { manualTime = true; advanceLive(game, ms); draw(ms / 1000); refresh(); };
refresh(); requestAnimationFrame(frame);
declare global { interface Window { render_game_to_text: () => string; advanceTime: (ms: number) => void; } }
