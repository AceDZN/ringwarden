# Ringwarden · שומרי המעגל

**Prototype v1 is frozen for a gameflow redesign after owner feedback.** The controls were not intuitive and the experience was not accepted. See [the rebuild plan](docs/rebuild/PLAN.md). The commands and mechanics below describe the preserved first prototype, not a completed rebuild.

A real Three.js botanical tower defense for Hebrew-speaking learners. Place and resize circular wards, spend **conduit length and floor area separately**, defend the seed-heart, inspect leaks and rebuild. Five authored waves lead to a changed northern approach with a different binding resource. No avatar or delivery loop.

Build phases are untimed. Battles can pause and retry freely. A typical deliberate playthrough is intended to take about 5–10 minutes including construction and the rematch; human play duration and enjoyment have not been measured.

## Run locally

Node.js 22+ recommended.

```sh
npm ci
npm run dev       # http://localhost:5184 (strict port)
npm test
npm run build
npm run preview   # http://localhost:4184 (strict port)
```

The production output is `dist/`. Everything runs locally after loading: bundled font/models, no backend, API key, authentication, analytics or provider requests. Vite uses a relative base. If an assigned port is occupied, choose and document a free alternate; do not stop another process.

## Play

Select a numbered ground site or its matching button. Set radius or diameter, choose Thorn Crown (2 damage each second) or Resin Bloom (half speed for1.5s, no damage), then plant. Start the wave deliberately. Complete five waves with the three-hit seed-heart intact. Between waves the new garden recovers materials; retry restores the actual wave-start layout and stocks so it can be revised. Preview, cancel and rejected construction cost nothing. Building stays locked during combat and pause.

- Pointer/touch: select a site, drag the radius handle or use size fields/± controls. Right drag or two fingers orbit; wheel/pinch zoom. Camera reset is available.
- Keyboard:1–9 selects; Up/Down changes site; Left/Right changes radius; Enter plants; Space starts/pauses; R retries; H help; Home resets camera; F fullscreen; Esc exits fullscreen/cancels preview. Standard focused form controls keep their normal keys.
- Mute and reduced-motion support are available. Losing browser focus pauses battle.

## Mathematics

One ground unit is one metre. Reach is an exact horizontal disk, independent of decorative 3D meshes:

```text
d = 2r
C = 2πr metres
A = πr² square metres
```

`Math.PI` is authoritative; only display values round. Numeric epsilon is1e-8 world units. Doubling radius doubles boundary stock and quadruples floor cost. Overlapping wards each pay their full disk price. Rocks affect line of sight without changing the paid area. Plant height adds no hidden cost. The slice covers Grade7 circle prerequisites applied to Grade8 context, not complete cylinder surface area. See [CURRICULUM.md](CURRICULUM.md).

## Evidence and design

- [GAME_IDENTITY.md](GAME_IDENTITY.md): loop, portfolio distinction and image-derived camera/HUD/asset breakdown.
- [Generated gameplay target](docs/visual-targets/gameplay-v2.png): design reference, **not a captured game**. Exact prompts and provenance are in the same folder.
- [ASSETS.md](ASSETS.md): Chrome Tripo tasks, displayed costs, local GLB provenance, license notes and processing.
- [PLAYTEST.md](PLAYTEST.md): independent numerical and browser evidence; automated checks do not prove fun or learning gains.
- [progress.md](progress.md): implementation checkpoints and remaining work.

`render_game_to_text()` reports visible state, geometry, stocks, enemies, leaks and renderer diagnostics. `advanceTime(ms)` enters deterministic manual stepping and respects pause; `?test` starts in that mode. It does not set a win state. Optional local browser storage keeps anonymous action traces and mute preference; malformed data cannot restore or modify a game. Help can export the local trace. First rematch outcomes remain separate from retries, including abandoned attempts.

## Static Vercel readiness

Import this public repository, choose **Vite**, use install command `npm ci`, build command `npm run build`, output directory `dist`. No environment variables are needed. `vercel.json` records the same configuration. No deployment has been requested or performed; the owner will choose the destination later.
