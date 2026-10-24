# Live-defense rebuild QA

24 October 2026. This record covers the approved version-2 first-minute prototype. The owner's “ok. proceed” authorized the rebuild. The previous five-wave prototype and its 28 tests are legacy evidence; they do not establish that the new interaction is clear or enjoyable.

Status: **19 new public-rule tests pass**. The final production desktop-and-touch supplemental run passes with 12 captures and no console, page, or external-runtime-request errors. Independent native Chrome real-time completion also passes. The lead's final installed action-client run also passes without console errors. No win, enemy HP, kill count, or route was injected.

## Intended opening and outcomes

The encounter starts running with one radius-1 ward, one approaching walker, and no setup ceremony. Initial budget is `4π m` conduit and `4π m²` floor. The existing ward costs `2π m / π m²`, leaving `2π m / 3π m²`; a drag to radius 2 is affordable and spends the remainder. Damage stays 2 per shot, with a one-second cooldown. Radius changes reach, not damage.

The opening has three 8 HP walkers at 0, 5 and 10 seconds, moving at 0.7 m/s on `(-3.8,0) → (5,0)`. Analytically, radius 1 gives about 2.86 seconds in range and at most three shots, so it should leak. Radius 2 gives about 5.71 seconds and enough time for four hits. Fixed-step tests confirm both outcomes; a real drag produces the first 6/8 HP hit by 2.65 seconds.

After all three kills, a 2.2-second interlude automatically reveals the second encounter. The original ward stays at `(0,0)` with its chosen radius, and a second radius-1 ward appears at `(0,2.2)` under `8π m / 8π m²`. With the original radius 2 retained, remaining materials are `2π m / 3π m²`; the new ward can grow to radius 2 without first shrinking a donor. Ten 8 HP walkers alternate approaches every 2.7 seconds at 0.8 m/s. With both wards grown to 2, the successful encounter finishes at about 30.42 seconds; both encounters and the interlude take about 48.2 seconds of simulation without a retry. Physical interaction and retries add time.

## Checkpoint and recovery contract

The recovery action restarts the **current whole encounter with the current plan**. It does not rewind ten seconds. The help text explains that scope.

- The first leak resolves one core hit, records the enemy's route/remaining HP and freezes the encounter immediately. Other enemies cannot continue leaking while the recovery prompt is shown.
- Resizing is permitted while running, paused, or in the leak state. It is blocked during interlude, victory and loss. Radius is bounded to 0.65–2 m and clamped to what both independent stocks can afford.
- One recovery action restores this encounter's start: its core-health snapshot, time, spawn schedule, enemy HP/positions, shot effects and plant cooldowns.
- Recovery preserves the **current valid radii**, including corrections made during the leak prompt. Both remaining stocks are recomputed from the encounter budget and retained full-disk costs; the plan is not charged twice.
- Retries, historical leaks, help, and resize actions remain separate evidence. Encounter outcome counters reset; a revised attempt must not become a first unaided success. Cumulative kills return to the encounter-start baseline before enemies respawn.
- Restarting the whole prototype is separate from encounter recovery and restores the original affordable radius-1 opening.

## Checks and observed results

`npx tsx --test tests/live-game.test.ts`: **19/19 pass**. The tests use public gameplay functions. They cover exact `C = 2πr` and `A = πr²`, diameter/doubling, valid independently binding material fixtures, invalid values and affordable clamping, refunds and repeated resize without drift, preserved cooldown/last-shot time through shrink/regrow, pause, analytic range boundaries, stable targeting, both encounter witnesses, genuine unchanged-radius failure, immediate single-leak freeze, retained-plan recovery, cumulative kill accounting, automatic transition, and fresh restart. A non-default first-ward radius and its original position survive the second approach. The deliberately generous authored encounters do **not** test separate material scarcity as a player challenge.

The installed develop-web-game client uses [live-opening.json](../../tests/actions/live-opening.json): four separate Up key bursts grow the already-paid radius from 1 to 2, with no commit/start action. The lead's final run against the frozen production build reaches the first 6/8 HP hit at 2.65 seconds, zero stocks, and both local GLBs loaded without an errors file. The capture was opened and inspected. An earlier run found two foliage geometry-merge errors; those were fixed and are not final-build failures.

`node tests/live-browser.mjs http://localhost:4184`: **passes** against the final production `index-BfrwKpM6.js` / `index-p70mgI1Z.css` snapshot, with 12 gameplay captures and errors `[]`. It exercises ordinary pointer/touch input and the public normal stepping hook. It covers:

- Real 44-pixel grip hit → held outward drag → paid radius 2 → first 6/8 HP hit → release clears the cost overlay. No radius form, commit, or start ceremony is present.
- Keyboard equivalents preserve the shot clock. Pause freezes combat while both keyboard and pointer resizing still work. Fullscreen, viewport changes and exit preserve the camera pose and paused state. Help pauses/resumes; blur during a captured drag releases input and pauses safely.
- Three kills automatically reveal the second approach with A's radius and position retained. A2/B1.25 has `1.5π m / 2.4375π m²` remaining. The display distinguishes rounded `A ≈ 1.563π m²` from exact `A = 4π m²` at radius 2.
- Deliberately neglected B leaks. A real pointer correction to B2 works **while the leak is frozen**. One visible recovery action retains `[2,2]`, restores core 3 and the encounter clock, resets cumulative kills to 3, and then ordinary combat wins all 13 with no pending or surviving enemies.
- A separate unchanged radius-1 opening leaks with 2 HP remaining. Correcting A during that freeze and recovering retains the radius and produces the expected first hit.
- A 390×844 touch-enabled viewport uses actual touch start/move/end events on the rendered grip, grows to radius 2, produces the 6/8 HP hit at 2.65 seconds, releases capture, and accepts a pause tap and mute toggles. The inspected mobile capture keeps material values/units together and exposes the grip and recovery controls.

The script starts with malformed saved settings to check safe startup, checks both local model loads and rejects external runtime HTTP requests, page errors and console errors. Screenshots and matching state are saved under ignored `output/live-qa-browser/`; selected final copies belong in `docs/rebuild/captures/`.

The headless mobile context deferred normal animation frames even though its timeout capture showed the complete game, `loaded: true`, both models loaded and no errors. The repeatable runner closes the desktop browser and launches a fresh temporary browser for the mobile section, requests an ordinary compositor capture, polls public diagnostics on a host timer, and calls ordinary `advanceTime(0)` for a zero-time draw before asserting readiness. This changes neither combat time nor the plan. Optional headless frame observation is bounded to 2.5 seconds and reports actual sample count or unavailable values. This run returned only four intervals (median 450 ms) under software WebGL and background scheduling; it is not a native FPS benchmark or a claim of smooth rendering. Local Playwright's cached browser was unavailable, so this supplemental runner used installed Chrome in a temporary headless profile, separate from the user's Chrome tabs.

Independent native Chrome play used the base production URL, actual drags and the visible recovery button, with `manualTime: false` throughout. The first small ward leaked; an actual drag during the freeze and one recovery retained A2. Three kills revealed the second approach. Neglected B then leaked; another real drag and recovery retained `[2,2]`, restored core 3 and the encounter kill baseline, and natural real time reached victory at stage-one time `30.4167`, total kills 13, pending 0, enemies 0. **Two retries** accurately record this run. Its final screenshot and state were inspected. This native run preceded only the final text precision/unit-wrap fixes; the final supplemental run checks those fixes.

## Visual review and interpretation limits

The four selected generated mockups and approved plan were inspected before implementation. The actual game preserves the intended actionable opening, sparse material HUD, contextual paid-radius readout, automatic firing, two approaches and visible recovery. The final opening, first-hit, second-approach, leak and victory captures were opened and inspected as actual software evidence, separately from the generated images. The tiled terrace, models and planting are simpler than the rich garden illustrations, so exact visual parity is not established. Generated enemy counts, HP pip segmentation and projected circles are not rules or measurement tools.

| Generated reference | Actual production evidence | Verified state |
| --- | --- | --- |
| [Actionable opening](mockups/00-actionable-opening.png) | [Opening](captures/00-actionable-opening.png) | Radius 1, 8 HP approaching enemy, 6.28 m / 9.42 m² available, one visible grip. |
| [First gesture](mockups/01-first-gesture.png) | [First hit](captures/01-affordable-drag-first-hit.png) | Radius 2, 6/8 HP hit, exact C/A costs, zero stocks. |
| [Second approach](mockups/02-live-defense.png) | [Live defense](captures/04-second-approach-live.png) | A2/B1.25, both approaches, 4.71 m / 7.66 m² remaining, rounded area marked approximate. |
| [Leak/recovery](mockups/03-leak-recovery.png) | [Genuine opening leak](captures/09-opening-leak.png) | Radius 1, 2 HP escaped enemy evidence, core 2/3, visible one-action encounter restart. |
| Outcome beyond the references | [Victory](captures/08-two-approaches-defended.png), [touch first hit](captures/11-touch-first-hit.png) | Normal combat resolves all 13; the same growth gesture works at 390×844. |

A static `[2,2]` plan wins the second encounter without further resizing. The prototype proves immediate agency and a working correction/recovery loop; it does not yet establish sustained active-defense decisions, fun, or learning. Its generous materials intentionally defer scarcity. A fresh human first-minute observation remains necessary: time to first useful action, wrong gestures, zero-resource stalls, explanation of a hit/leak, recovery without developer help, and desire for another skirmish. Do not expand the prototype into a campaign based only on passing automation.
