import './style.css';
import {createScene} from './scene';
import {createGame,selectSite,setRadius,setType,commitWard,sellWard,startWave,togglePause,retryWave,nextWave,startRematch,cancelPreview,currentWave,placementIssue,cost,step,advance,summary,useHelp,FIXED_DT,type Game} from './game';
import {readLocal,writeLocal} from './storage';
import {createSound} from './sound';
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const n=(v:number,d=2)=>Math.abs(v)<1e-7?'0':Number(v.toFixed(d)).toString();
const ltr=(s:string)=>`<bdi dir="ltr">${s}</bdi>`;
const formula=(v:number,unit:string)=>ltr(`${n(v/Math.PI,4)}π ${unit} ≈ ${n(v)} ${unit}`);
let game:Game=createGame(),manualTime=new URLSearchParams(location.search).has('test'),muted=readLocal().muted;
let scene:ReturnType<typeof createScene>|null=null;
let helpPaused=false,siteKey='',lastPersist=0,lastUI=0;
const sound=createSound();sound.setMuted(muted);
$('app').innerHTML=`
<main id="game-shell">
 <canvas id="garden" tabindex="0" aria-label="גן ההגנה בתלת ממד. בחרו אתר במספרים או בלחיצה; גרירה ימנית מסובבת מצלמה"></canvas>
 <div id="webgl-error" hidden role="alert"></div>
 <div class="brand"><strong dir="ltr">RINGWARDEN</strong><span>שומרי המעגל</span></div>
 <aside class="hud" aria-label="מצב הגן">
  <div class="top-status"><div><span id="wave-label"></span><strong id="wave-name"></strong></div><div class="core"><span>לב הזרע</span><strong id="health"></strong><div class="health-track"><i id="health-fill"></i></div></div></div>
  <div class="stocks"><div><span>◯ צינור · היקף</span><strong id="conduit" dir="ltr"></strong></div><div><span>▧ רצפה · שטח</span><strong id="floor" dir="ltr"></strong></div></div>
  <section class="inspector" aria-label="הגנה נבחרת">
   <div class="inspector-heading"><h1 id="selection-title">שתלו הגנה</h1><span id="plant-count" dir="ltr"></span></div>
   <p id="choose-hint">בחרו אתר עגול בגן או מספר למטה.</p>
   <div id="selected-info" hidden><p id="plant-description"></p><div id="math-cost" class="math-cost"></div>
    <div id="build-controls">
     <div class="plant-types" role="group" aria-label="סוג צמח"><button id="thorn" type="button">✦ כתר קוצים</button><button id="resin" type="button">❧ פריחת שרף</button></div>
     <div class="size-fields"><label>רדיוס <span dir="ltr">r · m</span><input id="radius" type="number" min="0.5" max="3.5" step="0.25" value="1" dir="ltr"/></label><label>קוטר <span dir="ltr">d · m</span><input id="diameter" type="number" min="1" max="7" step="0.5" value="2" dir="ltr"/></label></div>
     <div class="radius-slider"><button id="smaller" aria-label="הקטנת רדיוס">−</button><input id="radius-range" aria-label="רדיוס במטרים" type="range" min="0.5" max="3.5" step="0.25" value="1"/><button id="larger" aria-label="הגדלת רדיוס">+</button></div>
     <p id="placement-issue" class="issue" aria-live="polite"></p>
     <div class="build-actions"><button id="commit" class="accent">שתילה</button><button id="sell">פירוק ↶</button><button id="cancel" aria-label="ביטול תצוגה מקדימה">✕</button></div>
    </div>
    <p id="combat-lock" hidden>הבנייה נעולה עד תום הגל</p>
   </div>
  </section>
  <div id="site-controls" aria-label="בחירת אתר"></div>
  <div class="battle-actions"><button id="primary" class="accent">תחילת הגל ▷</button><button id="pause" hidden>השהיה Ⅱ</button><button id="retry" hidden>ניסיון חוזר ↶</button></div>
  <p id="combat-count" class="combat-count"></p>
 </aside>
 <section id="wave-note" class="wave-note" aria-label="הוראות הגל"><span class="eyebrow" id="phase-label">זמן לתכנן</span><p id="message" aria-live="polite"></p><small id="route-rule"></small><div id="leak-report" hidden></div></section>
 <nav class="utility" aria-label="כלים"><button id="help">? עזרה</button><button id="camera">↺ מצלמה</button><button id="fullscreen">⛶ מסך מלא</button><button id="mute"></button></nav>
 <div class="camera-hint">סיבוב: גרירה ימנית / שתי אצבעות · זום: גלגלת / צביטה</div>
 <dialog id="help-dialog"><button id="close-help" class="dialog-close" aria-label="סגירת עזרה">✕</button><span class="eyebrow">איך שומרים על הגן</span><h2>שני חומרים. מעגל אחד.</h2><p>כל יחידת קרקע היא מטר. הטווח הוא עיגול אופקי; גובה הצמח אינו משנה את הטווח או את המחיר.</p><div class="help-formulas" dir="ltr">d = 2r<br/>C = 2πr m<br/>A = πr² m²</div><p>הכפלת רדיוס: פי 2 צינור ופי 4 רצפה. כל מעגל משלם את מלוא שטחו, גם בחפיפה. קו הצינור אינו קיר. סלעים חוסמים ירי אך אינם מוזילים את השטח.</p><p><strong>כתר קוצים:</strong> 2 נזק בכל שנייה, מוכן לירי בכניסה לטווח. <strong>פריחת שרף:</strong> חצי מהירות למשך 1.5 שניות, רענון עד לתוקף זה ללא הכפלה נוספת; ללא נזק. העדפה לאויב המתקדם ביותר ואז לפי סדר הכניסה.</p><p>בין גלים אפשר לפרק או לשנות ולקבל את כל החומרים בחזרה. בזמן קרב ובהשהיה הבנייה נעולה. ניסיון חוזר משחזר את תחילת הגל ופותח שוב תכנון.</p><p class="keys">מקשים: <bdi dir="ltr">1–9</bdi> אתר · חצים ימינה/שמאלה רדיוס · למעלה/למטה אתר · <bdi dir="ltr">Enter</bdi> שתילה · רווח תחילת גל/השהיה · <bdi dir="ltr">R</bdi> ניסיון חוזר · <bdi dir="ltr">Esc</bdi> ביטול · <bdi dir="ltr">F</bdi> מסך מלא · <bdi dir="ltr">Home</bdi> מצלמה</p><small>היקף ושטח: ידע מקדים מכיתה ז׳ ב־Workbook. הפרק מתרגל מעגלים; גובה וקירות גליל אינם נמדדים כאן. π מחושב בדיוק המחשב; רק התצוגה מעוגלת.</small><button id="download-trace">שמירת תיעוד הניסיון</button><button id="new-garden">גן חדש</button></dialog>
</main>`;
function unlock(){sound.unlock();}
function act(fn:()=>unknown){unlock();fn();refresh();}
function choose(id:string){selectSite(game,id);refresh();}
function setR(r:number){if(!setRadius(game,r)&&game.mode==='build'&&game.preview){game.message='הזינו רדיוס חיובי במטרים.';$<HTMLInputElement>('radius').value=n(game.preview.r);$<HTMLInputElement>('diameter').value=n(game.preview.r*2);}refresh();}
function persist(){writeLocal(muted,game.events);lastPersist=game.events.length;}
function refresh(){const w=currentWave(game),build=game.mode==='build';$('game-shell').dataset.mode=game.mode;$('wave-label').innerHTML=game.rematch?'משחק חוזר':`גל ${ltr(`${game.wave+1} / 5`)}`;$('wave-name').textContent=w.name;$('health').innerHTML=`♥ ${ltr(`${Math.max(0,game.coreHealth)} / 3`)}`;$('health-fill').style.width=`${Math.max(0,game.coreHealth)/3*100}%`;$('conduit').textContent=`${n(game.stocks.conduit)} m`;$('floor').textContent=`${n(game.stocks.floor)} m²`;$('conduit').title=`${n(game.stocks.conduit/Math.PI,4)}π m`;$('floor').title=`${n(game.stocks.floor/Math.PI,4)}π m²`;
 const ward=game.wards.find(a=>a.siteId===game.selectedSite),preview=build?game.preview:null,selected=preview??ward;
 $('choose-hint').textContent=build?'בחרו אתר עגול בגן או מספר למטה.':'בחרו צמח קיים כדי לבדוק טווח ועלות.';$('choose-hint').hidden=!!selected;$('selected-info').hidden=!selected;$('build-controls').hidden=!build;$('combat-lock').hidden=build;$('selection-title').textContent=selected?`${selected.type==='thorn'?'כתר קוצים':'פריחת שרף'} · אתר ${game.sites.findIndex(s=>s.id===game.selectedSite)+1}`:build?'שתלו הגנה':'הגנות הגן';$('plant-count').textContent=`${game.wards.length}/${w.maxPlants}`;
 if(selected){const c=cost(selected.r);$('plant-description').textContent=selected.type==='thorn'?'פגיעה יחידה · 2 נזק / שנייה':'האטה בלבד · 50% מהירות';$('math-cost').innerHTML=`<div>${ltr(`r = ${n(selected.r)} m`)}<small>${ltr(`d = ${n(2*selected.r)} m`)}</small></div><div><span>◯</span> ${ltr(`C = ${n(2*selected.r,4)}π m`)}<small>${ltr(`≈ ${n(c.conduit)} m`)}</small></div><div><span>▧</span> ${ltr(`A = ${n(selected.r**2,4)}π m²`)}<small>${ltr(`≈ ${n(c.floor)} m²`)}</small></div>`;
 for(const [id,val]of [['radius',selected.r],['diameter',selected.r*2],['radius-range',selected.r]] as const){const el=$<HTMLInputElement>(id);if(document.activeElement!==el)el.value=n(val);}
 $('thorn').setAttribute('aria-pressed',String(selected.type==='thorn'));$('resin').setAttribute('aria-pressed',String(selected.type==='resin'));const issue=placementIssue(game);$('placement-issue').textContent=build?issue:'';$<HTMLButtonElement>('commit').disabled=!!issue;$('commit').textContent=ward?'עדכון הצמח':'שתילה';$<HTMLButtonElement>('sell').disabled=!ward;
 }
 const key=game.rematch+':'+game.wave;if(key!==siteKey){siteKey=key;$('site-controls').innerHTML=game.sites.map((s,i)=>`<button type="button" data-site="${s.id}" aria-label="אתר ${i+1}" title="אתר ${i+1} · רדיוס מרבי ${s.maxRadius} מטר">${i+1}</button>`).join('');$('site-controls').querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>act(()=>{choose(b.dataset.site!);$('garden').focus();}));}
 $('site-controls').querySelectorAll<HTMLButtonElement>('button').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.site===game.selectedSite));b.classList.toggle('planted',game.wards.some(a=>a.siteId===b.dataset.site));});
 const primary=$<HTMLButtonElement>('primary');primary.hidden=['combat','paused'].includes(game.mode);primary.textContent=game.mode==='lost'?'תכנון מחדש ↶':game.mode==='won'?(game.rematch?'גן חדש ↶':'אתגר הגישה הצפונית ▷'):game.mode==='cleared'?'לגל הבא ▷':'תחילת הגל ▷';$('pause').hidden=!['combat','paused'].includes(game.mode);$('pause').textContent=game.mode==='paused'?'המשך ▷':'השהיה Ⅱ';$('retry').hidden=!game.waveStart||game.mode==='build';$('message').textContent=game.message;$('phase-label').textContent=({build:'זמן לתכנן · ללא הגבלת זמן',combat:'הגן נלחם',paused:'המשחק מושהה',cleared:'הגל הושלם',lost:'פריצה לגן',won:'הגן שרד'} as const)[game.mode];$('route-rule').textContent=w.rule;$('combat-count').textContent=build?`כל רדיוס משנה טווח בלבד · עד ${w.maxPlants} צמחים`:`הוכרעו ${game.killed} · פרצו ${game.leaked} · נותרו ${w.spawns.length-game.spawnIndex+game.enemies.length}`;$('leak-report').hidden=!game.leaks.length;$('leak-report').textContent=game.leaks.length?`פריצות: ${game.leaks.map(e=>`חיפושית ${e.id} — ${n(e.hp)} חיים נשארו`).join(' · ')}`:'';$('mute').textContent=muted?'♩ קול כבוי':'♫ קול פעיל';$('mute').setAttribute('aria-pressed',String(muted));if(lastPersist!==game.events.length)persist();
}
$('radius').addEventListener('change',e=>act(()=>setR(Number((e.target as HTMLInputElement).value))));$('diameter').addEventListener('change',e=>act(()=>setR(Number((e.target as HTMLInputElement).value)/2)));$('radius-range').addEventListener('input',e=>setR(Number((e.target as HTMLInputElement).value)));
$('smaller').onclick=()=>act(()=>setR((game.preview?.r??1)-.25));$('larger').onclick=()=>act(()=>setR((game.preview?.r??1)+.25));$('thorn').onclick=()=>act(()=>setType(game,'thorn'));$('resin').onclick=()=>act(()=>setType(game,'resin'));$('commit').onclick=()=>act(()=>{if(commitWard(game))sound.play('plant');$('garden').focus();});$('sell').onclick=()=>act(()=>sellWard(game));$('cancel').onclick=()=>act(()=>cancelPreview(game));
function primary(){if(game.mode==='build')startWave(game);else if(game.mode==='cleared')nextWave(game);else if(game.mode==='lost')retryWave(game);else if(game.mode==='won'){if(game.rematch){game=createGame();siteKey='';}else startRematch(game);}refresh();}
$('primary').onclick=()=>act(()=>{primary();$('garden').focus();});$('pause').onclick=()=>act(()=>{togglePause(game);$('garden').focus();});$('retry').onclick=()=>act(()=>{retryWave(game);$('garden').focus();});$('camera').onclick=()=>scene?.resetCamera();
async function fullscreen(){if(document.fullscreenElement)await document.exitFullscreen();else await $('game-shell').requestFullscreen();}
$('fullscreen').onclick=()=>void fullscreen();$('mute').onclick=()=>act(()=>{muted=!muted;sound.setMuted(muted);persist();});
const help=$<HTMLDialogElement>('help-dialog');function openHelp(){useHelp(game);helpPaused=game.mode==='combat';if(helpPaused)togglePause(game);help.showModal();refresh();}function closeHelp(){help.close();if(helpPaused&&game.mode==='paused')togglePause(game);helpPaused=false;refresh();}
$('help').onclick=()=>act(openHelp);$('close-help').onclick=closeHelp;help.addEventListener('cancel',e=>{e.preventDefault();closeHelp();});$('new-garden').onclick=()=>{game=createGame();siteKey='';helpPaused=false;closeHelp();};$('download-trace').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,events:game.events,firstRematch:game.firstRematch},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ringwarden-attempt.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
window.addEventListener('keydown',e=>{if(help.open)return;if((e.target as HTMLElement).matches('input,select,textarea')&&e.code!=='Escape')return;if((e.target as HTMLElement).matches('button')&&['Enter','Space'].includes(e.code))return;if(e.repeat&&['Space','KeyR','Enter'].includes(e.code))return;let handled=true;unlock();if(/^Digit[1-9]$/.test(e.code)){const s=game.sites[Number(e.code.slice(-1))-1];if(s)choose(s.id);}else if(e.code==='ArrowRight')setR((game.preview?.r??1)+.25);else if(e.code==='ArrowLeft')setR((game.preview?.r??1)-.25);else if(e.code==='ArrowUp'||e.code==='ArrowDown'){const i=game.sites.findIndex(s=>s.id===game.selectedSite);choose(game.sites[i<0?0:(i+(e.code==='ArrowUp'?1:-1)+game.sites.length)%game.sites.length].id);}else if(e.code==='Enter'){if(game.mode==='build'){if(commitWard(game))sound.play('plant');}}else if(e.code==='Escape')cancelPreview(game);else if(e.code==='Space'){if(game.mode==='combat'||game.mode==='paused')togglePause(game);else primary();}else if(e.code==='KeyR')retryWave(game);else if(e.code==='KeyF')void fullscreen();else if(e.code==='KeyH')openHelp();else if(e.code==='Home')scene?.resetCamera();else handled=false;if(handled){e.preventDefault();refresh();}});
function blurPause(){if(game.mode==='combat'){togglePause(game);game.message='הקרב הושהה כשהחלון איבד מיקוד. לחצו המשך.';refresh();}}
window.addEventListener('blur',blurPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)blurPause();});window.addEventListener('resize',()=>scene?.resize());document.addEventListener('fullscreenchange',()=>scene?.resize());
try{scene=createScene($<HTMLCanvasElement>('garden'),id=>choose(id),r=>setR(r));}catch(error){$('webgl-error').hidden=false;$('webgl-error').textContent='תלת הממד לא נטען. הפעילו האצת חומרה בדפדפן ורעננו את הדף. '+String(error);}
let last=performance.now(),accumulator=0,lastKills=0,lastLeaks=0;
function draw(dt:number){if(game.killed>lastKills)sound.play('shot');if(game.leaked>lastLeaks)sound.play('leak');lastKills=game.killed;lastLeaks=game.leaked;scene?.render({...game,placementValid:!placementIssue(game)},dt);}
function frame(now:number){const elapsed=Math.min(.1,(now-last)/1000);last=now;if(!manualTime){accumulator+=elapsed;while(accumulator>=FIXED_DT){step(game,FIXED_DT);accumulator-=FIXED_DT;}}draw(elapsed);if(now-lastUI>100){refresh();lastUI=now;}requestAnimationFrame(frame);}
window.render_game_to_text=()=>JSON.stringify({...summary(game),renderer:scene?.getDiagnostics(),muted,manualTime});
window.advanceTime=(ms:number)=>{manualTime=true;advance(game,ms);refresh();draw(ms/1000);};
refresh();requestAnimationFrame(frame);
declare global{interface Window{render_game_to_text:()=>string;advanceTime:(ms:number)=>void;}}
