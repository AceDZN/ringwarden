# Ringwarden · שומרי המעגל

**Version 2 rebuild: a short, playable live-defense prototype.** The owner rejected v1's confusing editor flow. The new opening starts in the garden: drag a plant's glowing ring to reach beetles, see hits immediately, and protect a second approach. No forms, numbered site tray, commit step or start-wave ceremony.

The current scope is the approved first-minute proof loop, typically 50–80 seconds with interaction/recovery. It contains two encounters, thirteen scheduled walkers and an optional immediate retry. It is not the old five-wave campaign. Human enjoyment and intuitive first use still need observation.

## Run

Node 22+ recommended.

```sh
npm ci
npm run dev       # http://localhost:5184 — strict port
npm test
npm run build
npm run preview   # http://localhost:4184 — strict port
```

Production output is `dist/`, with a relative Vite base. Models and Heebo font are bundled locally. No backend, API key, authentication, external model/font fetch, analytics or provider is needed at runtime. Do not stop another process if a port is occupied.

## Controls

- **Pointer/touch:** drag a gold grip, ring edge, or plant body outward to grow reach; inward returns materials. Changes apply immediately, including during battle or leak recovery. There is no confirmation button.
- **Keyboard:** Up/Down adjusts radius; Left/Right chooses a plant; A/B chooses it directly. Space pauses/resumes. R restarts the encounter with current radii. Enter activates recovery. F toggles fullscreen; Esc exits. M toggles sound; H opens help.
- The strategic camera is fixed; camera manipulation is not needed to play. Both approaches and the protected core remain visible.
- On a leak, the encounter freezes. Adjust reach if desired, then **נחזור רגע** restarts this encounter with the current paid radii retained. Enemy state, cooldowns and core reset to encounter-start values. Retry evidence is separate.
- Three kills reveal the second approach after a short breath. All ten second-encounter walkers must resolve before victory. Larger radius changes reach, never damage or cooldown.

## Math and scope

One horizontal world unit is one metre. Reach is an analytic ground disk, not a sphere or a decorative mesh bound.

```text
d = 2r
C = 2πr metres
A = πr² square metres
```

Conduit and floor stocks are independent. Live resizing recomputes exact paid costs using `Math.PI`; only display values round. Epsilon is 1e-8 world units. Doubling radius doubles conduit and quadruples floor. Overlapping wards each pay their full disk price. Initial radius 1 is already paid, leaving enough stock to grow to 2. The introductory two-plant encounter also funds both radius 2 disks; scarcity is intentionally deferred while controls are being tested.

[CURRICULUM.md](CURRICULUM.md) identifies the actual Workbook Grade 7 circle prerequisites and Grade 8 context. This prototype does not assess cylinder surface area or prove mathematical learning.

## Design and verification

- [Approved rebuild plan](docs/rebuild/PLAN.md), [identity](GAME_IDENTITY.md).
- [Four generated gameplay targets and exact prompts](docs/rebuild/mockups/README.md). They are design references, not captured gameplay; actual browser comparisons belong in the rebuild review.
- [Asset provenance](ASSETS.md): two game-specific models made through the owner's Chrome Tripo UI, displayed 45 credits each, task IDs, hashes and processing. No new model generation was used for v2.
- [Actual browser first hit](docs/rebuild/captures/action-client-first-hit.png) and [reference comparison](docs/rebuild/VISUAL_REVIEW.md).
- [Rebuild playtest record](docs/rebuild/PLAYTEST.md). The root `PLAYTEST.md` and old `src/game.ts` describe retired v1 evidence.

`npm test` includes 19 v2 rule tests plus 28 legacy/storage checks. Passing legacy tests is not current UX evidence. The v2 browser action-client and supplemental tests verify real input→radius→stock→hit→leak/retry→win flows without injecting victory. They cannot establish fun or intuitive human use.

With the production preview running, `node tests/live-browser.mjs http://localhost:4184` repeats the pointer/touch flow. It uses Playwright Chromium, falling back to installed Chrome if that matching browser is absent. Browser artifacts stay in ignored `output/`.

`render_game_to_text()` reports visible state, exact quantities, renderer/model diagnostics and projected grip positions. `advanceTime(ms)` enters deterministic manual stepping and respects pause; `?test` begins in that mode. It advances normal simulation. Optional local storage retains anonymous action traces and mute preference; malformed data cannot restore or modify a game.

## Vercel

Use the Vite preset, install `npm ci`, build `npm run build`, output `dist`. `vercel.json` records the same configuration. No environment variables are needed. No deployment is requested or performed; the owner will choose a destination later.
