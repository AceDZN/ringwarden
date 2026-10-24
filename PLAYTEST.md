**Historical v1 record. Current rebuilt prototype verification is in [docs/rebuild/PLAYTEST.md](docs/rebuild/PLAYTEST.md).**

# Independent QA record

Status: **28 independent simulator/storage tests pass**. Browser and visual-target verification remain pending while the UI is integrated. No browser success or enjoyment claim is inferred from simulator results.

## Opening witness to verify

Lane: `(-6, 0)` to `(6, 0)`. Three walkers, each 8 HP and 0.8 m/s, spawn six seconds apart. Thorns hit for 2 damage, are initially ready, and have a one-second cooldown.

| Plan | Conduit / floor | Analytic expectation |
|---|---|---|
| Center radius 2 Thorn | `4π m / 4π m²` | Five seconds within range, enough for four hits per isolated walker. |
| Radius 1 Thorns at `(-1,0)` and `(1,0)` | `4π m / 2π m²` | Two adjacent coverage intervals, allowing a damage handoff. |
| One radius 1 Thorn | `2π m / π m²` | Only 2.5 seconds within range and at most three shots: 6 damage, so an 8 HP walker leaks. |
| All Resin Blooms | Varies | Slowing without damage cannot defeat enemies. |

Both opening success plans and the leaking plan pass through the actual fixed-step simulator. The initially ready shot, one-second cadence, slow expiry, and no-damage all-slow failure are separately tested.

## Observed simulator results

Tests use the public construction and time-step functions. They do not mutate health, spawn resolution, or win state. All winning traces below finish with the seed-heart at 3 and no unresolved enemies. Times exclude untimed planning.

| Wave | Legal winning plan (site / radius in metres) | Result |
|---|---|---|
| 1 | A / 2 | 3 kills, 0 leaks, 19.98 s |
| 2 | A / 2, B / 2 | 8 kills, 0 leaks, 28.98 s |
| 3 | A / 1, B / 1, C / 1, D / 1 | 6 kills, 0 leaks, 37.48 s |
| 4 | A / 1.5, B / 1.5, C / 1.5, D / 1.5 | 14 kills, 0 leaks, 25.48 s |
| 5 | A / 0.75, B / 0.75, C / 1.25, D / 1.25 | 12 kills, 0 leaks, 49.48 s |
| Northern rematch | F / 1, G / 1, H / 1, I / 1 | 10 kills, 0 leaks |

Each plan uses Thorn Crowns. Resin is optional and cannot kill alone. The actual scenario offers several legal successful placements; automation does not assess whether a player discovers them unaided.

Counterexamples are legal placements with a different outcome: wave 1 one radius-1 plant; wave 2 only northern A / 2; wave 3 one E / 2 against 14 HP armor; wave 4 one E / 3 with obstructed coverage; wave 5 only A / 2 and B / 2, ignoring the south. Each exhausts the core through leaks. Site E in wave 4 is at `(0,1)`, outside the radius-0.75 rock. The northern point `(0,-1.5)` is within its radius-3 disk but its shot ray crosses the rock; the southern lane remains visible. The test asserts both range and sight-line facts independently before fighting.

The final plan costs `8π m` conduit and `4.25π m²` floor. It remains affordable under the northern rematch's `10π m / 5π m²`, so replaying that exact old plan is a meaningful combat comparison. It loses with zero kills and three leaks; recovering materials and moving four radius-1 wards north wins. A first abandoned attempt is retained as `abandoned` and cannot be replaced by a later retry win.

Separate tests cover atomic budget rejection for each material, full refund/repeated resize, overlap cost, range boundary and sight lines, deterministic stepping, initially ready cooldown, half-speed capped resin with expiry, no-damage failure, pause construction lock, once-only resolution, retry snapshots and retained evidence, invalid foundations and radii, and malformed/unavailable local storage.

## Runtime asset inspection

Both bundled models independently parse as valid binary glTF 2.0 with one mesh/material each, three embedded images each, and zero external resources. Thorn Crown: 4,124,988 bytes, 85,631 indexed triangles. Ink beetle: 3,902,636 bytes, 89,396 indexed triangles. These are file/geometry observations, not a frame-rate measurement. Runtime loading, orientation, gameplay scale and rendering remain part of the browser check below.

## Required verification

The QA role owns `tests/**`, this record, and `CURRICULUM.md`. The integration lead owns changes to production rules and Git. Domain checks should operate through public construction/combat functions, not insert kills or a winning state.

- Exact costs, doubling, radius/diameter agreement, independent budgets, invalid preview, single charge, overlap, full refund, and rejected unsupported foundations.
- Range boundary, line of sight independent of cost, stable target ordering, cooldown, capped slow and expiry, scheduled spawn/route resolution, once-only death/core damage.
- Each of five waves: explicit successful placement and meaningful failing counterexample.
- Failure and retry restore the start snapshot while preserving retry/help evidence; construction remains disabled in paused combat.
- Changed-layout rematch: unchanged old plan fails; a changed plan wins; first attempt remains identifiable.
- Real browser build → fight → leak → revise → win, pointer and keyboard controls, touch layout, camera preservation, resize, pause, fullscreen, and malformed saved state.
- Run the installed web-game action client and inspect its gameplay screenshots, JSON state, and console errors. Also inspect the production preview in the user's Chrome game tab; the visual contributor alone owns the Tripo tab.

Automated checks cannot prove fun or learning gains. Final observed results and remaining limitations will replace this pending status after implementation is available.

## Reproduction commands

Run from the repository root after the production preview has been built and started on port 4184:

```sh
npm test
node /Users/acedzn/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js --url http://localhost:4184 --actions-file tests/actions/intro-combat.json --iterations 1 --pause-ms 100 --screenshot-dir output/qa-production-client
node tests/browser-qa.mjs http://localhost:4184
```

The installed client performs keyboard selection, four distinct radius increments, planting, starting combat, and time stepping. The supplemental script covers DOM inputs that the client cannot express, full-page screenshots, ground pointer selection, pause/retry, diameter/radius agreement, camera/resize/fullscreen, five waves and rematch, touch input, asset loading, console errors and a labeled headless frame observation. It uses the public time hook to advance combat, never a win-state setter. Outputs go to ignored `output/` folders; representative actual captures can be copied into the final delivery artifacts by the integration lead.

An early development-client run was interrupted by Vite reloading its page while source files changed. That run is not counted as passing. Production verification waits for a frozen build, avoiding a misleading rerun of a changing development page.
